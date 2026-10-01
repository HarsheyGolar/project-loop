import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { analyzeFeedback, generateEmbedding } from "@/lib/ai";
import { normalizeTheme } from "@/lib/themes";
import { requireWorkspaceUser } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const schema = z.object({ id: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const ctx = await requireWorkspaceUser(["ADMIN", "ANALYST"]);
    if ("error" in ctx) return ctx.error;

    const parsed = schema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid feedback ID" }, { status: 400 });
    }

    const existing = await db.feedback.findFirst({
      where: { id: parsed.data.id, workspaceId: ctx.user.workspace.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    let analysis;
    let embedding;

    try {
      [analysis, embedding] = await Promise.all([
        analyzeFeedback(existing.content),
        generateEmbedding(existing.content, "RETRIEVAL_DOCUMENT"),
      ]);
    } catch (aiError) {
      console.error("Re-classification AI error:", aiError);
      return NextResponse.json(
        { error: "AI classification failed. Please try again." },
        { status: 502 },
      );
    }

    const feedback = await db.feedback.update({
      where: { id: existing.id },
      data: {
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore,
        summary: analysis.summary,
        theme: normalizeTheme(analysis.theme) ?? analysis.theme,
        category: analysis.category,
        embedding,
      },
    });

    return NextResponse.json({
      message: "Feedback re-classified successfully",
      feedback,
    });
  } catch (error) {
    console.error("POST /api/feedback/reclassify error:", error);
    return NextResponse.json(
      { error: "Failed to re-classify feedback" },
      { status: 500 },
    );
  }
}