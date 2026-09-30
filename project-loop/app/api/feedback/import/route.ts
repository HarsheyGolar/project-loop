import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { analyzeFeedback, generateEmbedding } from "@/lib/ai";
import { normalizeTheme } from "@/lib/themes";
import { requireWorkspaceUser } from "@/lib/rbac";

export const dynamic = "force-dynamic";
// Classifying many rows takes time; give the function room on Vercel.
export const maxDuration = 60;

const MAX_ROWS = 50;
const CONCURRENCY = 4;
const MAX_FILE_BYTES = 1_000_000;

const rowSchema = z.object({
  content: z.string().trim().min(1).max(10000),
  channel: z.string().trim().max(100).optional(),
  customerLabel: z.string().trim().max(200).optional(),
  createdAt: z.date().optional(),
});

// Small RFC 4180 style parser: handles quoted fields, commas inside quotes,
// escaped quotes ("") and CRLF line endings.
function parseCsv(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushRow = () => {
    row.push(field);
    field = "";
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
    row = [];
  };

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];

    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      pushRow();
    } else {
      field += ch;
    }
  }

  pushRow();
  return rows;
}

export async function POST(request: Request) {
  try {
    const ctx = await requireWorkspaceUser(["ADMIN", "ANALYST"]);
    if ("error" in ctx) return ctx.error;

    const userId = ctx.user.id;
    const workspaceId = ctx.user.workspace.id;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json(
        { error: "Only CSV files are allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "CSV file is too large (max 1 MB)." },
        { status: 400 },
      );
    }

    const table = parseCsv(await file.text());

    if (table.length < 2) {
      return NextResponse.json(
        { error: "CSV must contain a header and at least one row." },
        { status: 400 },
      );
    }

    const headers = table[0].map((header) => header.trim().toLowerCase());
    const col = (...names: string[]) =>
      headers.findIndex((header) => names.includes(header));

    const contentIndex = col("content", "feedback", "text");
    const channelIndex = col("channel", "source");
    const customerIndex = col("customer_label", "customer");
    const createdAtIndex = col("created_at", "date");

    if (contentIndex === -1) {
      return NextResponse.json(
        { error: "CSV must contain a content, feedback, or text column." },
        { status: 400 },
      );
    }

    const dataRows = table.slice(1);

    if (dataRows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_ROWS} feedback rows allowed per import.` },
        { status: 400 },
      );
    }

    const valid: z.infer<typeof rowSchema>[] = [];
    let failed = 0;

    for (const cells of dataRows) {
      const rawDate = createdAtIndex >= 0 ? cells[createdAtIndex]?.trim() : "";
      const parsedDate = rawDate ? new Date(rawDate) : undefined;

      const parsed = rowSchema.safeParse({
        content: cells[contentIndex] ?? "",
        channel: channelIndex >= 0 ? cells[channelIndex] || undefined : undefined,
        customerLabel:
          customerIndex >= 0 ? cells[customerIndex] || undefined : undefined,
        createdAt:
          parsedDate && !Number.isNaN(parsedDate.getTime())
            ? parsedDate
            : undefined,
      });

      if (parsed.success) valid.push(parsed.data);
      else failed += 1;
    }

    const imported: unknown[] = [];
    let unclassified = 0;

    async function importRow(row: z.infer<typeof rowSchema>) {
      const metadata =
        row.channel || row.customerLabel
          ? { channel: row.channel, customerLabel: row.customerLabel }
          : undefined;

      let created;

      try {
        created = await db.feedback.create({
          data: {
            content: row.content,
            source: "CSV",
            workspaceId,
            createdById: userId,
            status: "NEW",
            metadata,
            ...(row.createdAt ? { createdAt: row.createdAt } : {}),
          },
        });
      } catch (error) {
        console.error("CSV row insert failed:", error);
        failed += 1;
        return;
      }

      try {
        const [analysis, embedding] = await Promise.all([
          analyzeFeedback(row.content),
          generateEmbedding(row.content, "RETRIEVAL_DOCUMENT"),
        ]);

        created = await db.feedback.update({
          where: { id: created.id },
          data: {
            sentiment: analysis.sentiment,
            sentimentScore: analysis.sentimentScore,
            summary: analysis.summary,
            theme: normalizeTheme(analysis.theme) ?? analysis.theme,
            category: analysis.category,
            embedding,
          },
        });
      } catch (error) {
        console.error("CSV row classification failed:", error);
        unclassified += 1;
      }

      imported.push(created);
    }

    // Small batches keep the AI provider within rate limits.
    for (let i = 0; i < valid.length; i += CONCURRENCY) {
      await Promise.all(valid.slice(i, i + CONCURRENCY).map(importRow));
    }

    return NextResponse.json({
      message: "CSV import finished",
      imported: imported.length,
      failed,
      unclassified,
      feedback: imported,
    });
  } catch (error) {
    console.error("POST /api/feedback/import error:", error);
    return NextResponse.json({ error: "Failed to import CSV" }, { status: 500 });
  }
}