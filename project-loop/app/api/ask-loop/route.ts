import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { askLoop } from "@/lib/ask-loop";

export const dynamic = "force-dynamic";

const askSchema = z.object({
  question: z.string().trim().min(3).max(2000),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const membership = await db.workspaceMember.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        workspaceId: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const body: unknown = await request.json();

    const parsed = askSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid question" },
        { status: 400 }
      );
    }

    const result = await askLoop(
      membership.workspaceId,
      parsed.data.question
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/ask-loop error:", error);

    return NextResponse.json(
      { error: "Failed to answer question" },
      { status: 500 }
    );
  }
}