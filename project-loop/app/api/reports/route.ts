import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateVocReport } from "@/lib/ai";

export const dynamic = "force-dynamic";

const reportSchema = z.object({
    days: z.enum(["7", "30", "90", "all"]).default("30"),
});

export async function GET() {
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
                role: true,
            },
        });

        if (!membership) {
            return NextResponse.json(
                { error: "Workspace not found" },
                { status: 404 }
            );
        }

        if (membership.role === "VIEWER") {
            return NextResponse.json(
                { error: "Viewers cannot generate reports" },
                { status: 403 }
            );
        }

        const reports = await db.vocReport.findMany({
            where: {
                workspaceId: membership.workspaceId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ reports });
    } catch (error) {
        console.error("GET /api/reports error:", error);

        return NextResponse.json(
            { error: "Failed to fetch reports" },
            { status: 500 }
        );
    }
}

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

        const parsed = reportSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid report period" },
                { status: 400 }
            );
        }

        const now = new Date();

        let periodStart = new Date(0);

        if (parsed.data.days !== "all") {
            periodStart = new Date(now);

            periodStart.setDate(
                periodStart.getDate() - Number(parsed.data.days)
            );
        }

        const feedback = await db.feedback.findMany({
            where: {
                workspaceId: membership.workspaceId,
                createdAt: {
                    gte: periodStart,
                    lte: now,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 200,
            select: {
                content: true,
                sentiment: true,
                theme: true,
                category: true,
                summary: true,
                createdAt: true,
            },
        });

        if (feedback.length === 0) {
            return NextResponse.json(
                { error: "No feedback available for this period." },
                { status: 400 }
            );
        }

        const context = feedback
            .map(
                (item, index) => `
FEEDBACK ${index + 1}
Content: ${item.content}
Sentiment: ${item.sentiment ?? "unknown"}
Theme: ${item.theme ?? "unknown"}
Category: ${item.category ?? "unknown"}
Summary: ${item.summary ?? "unknown"}
`
            )
            .join("\n");

        const report = await generateVocReport(context);

        const savedReport = await db.vocReport.create({
            data: {
                workspaceId: membership.workspaceId,
                title: `Voice of Customer Report - ${now.toLocaleDateString()}`,
                periodStart,
                periodEnd: now,
                executiveSummary: report.executiveSummary,
                themeSummary: report.themeSummary,
                sentimentSummary: report.sentimentSummary,
                keyQuotes: report.keyQuotes,
                recommendedActions: report.recommendedActions,
            },
        });

        return NextResponse.json(
            {
                message: "Report generated successfully",
                report: savedReport,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/reports error:", error);

        return NextResponse.json(
            { error: "Failed to generate report" },
            { status: 500 }
        );
    }
}