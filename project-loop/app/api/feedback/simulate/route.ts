import { NextResponse } from "next/server";
import { requireWorkspaceUser } from "@/lib/rbac";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Sample = {
    content: string;
    channel: string;
    sentiment: string;
    sentimentScore: number;
    theme: string;
    category: string;
    summary: string;
};

const SAMPLES: Sample[] = [
    { content: "Onboarding took forever — I couldn't figure out how to invite my team.", channel: "SUPPORT", sentiment: "NEG", sentimentScore: -0.7, theme: "Onboarding", category: "UX", summary: "Slow onboarding experience" },
    { content: "The new dashboard is gorgeous and finally fast. Huge improvement.", channel: "APP_STORE", sentiment: "POS", sentimentScore: 0.8, theme: "Dashboard", category: "Performance", summary: "Likes new dashboard" },
    { content: "It does the job, but the mobile experience needs work.", channel: "NPS", sentiment: "NEU", sentimentScore: 0, theme: "Mobile", category: "UX", summary: "Mobile UX needs improvement" },
    { content: "Prospect wants SSO before they'll sign — third time this month.", channel: "SALES", sentiment: "NEG", sentimentScore: -0.6, theme: "SSO", category: "Security", summary: "SSO blocking deals" },
    { content: "Love the new export feature, saved me an hour today.", channel: "COMMUNITY", sentiment: "POS", sentimentScore: 0.9, theme: "Export", category: "Feature", summary: "Export feature loved" },
    { content: "Billing page keeps timing out when I try to download an invoice.", channel: "SUPPORT", sentiment: "NEG", sentimentScore: -0.8, theme: "Billing", category: "Bug", summary: "Billing page timeout" },
    { content: "The reports are painfully slow with more than 1000 rows.", channel: "SUPPORT", sentiment: "NEG", sentimentScore: -0.7, theme: "Reports", category: "Performance", summary: "Report performance issue" },
    { content: "Excellent customer support — got a reply in 5 minutes.", channel: "NPS", sentiment: "POS", sentimentScore: 0.9, theme: "Support", category: "Service", summary: "Fast support response" },
    { content: "Wish there was a dark mode option.", channel: "APP_STORE", sentiment: "NEU", sentimentScore: 0, theme: "Theming", category: "Feature", summary: "Dark mode requested" },
    { content: "Integration with Slack would save us so much time.", channel: "COMMUNITY", sentiment: "NEU", sentimentScore: 0.1, theme: "Integrations", category: "Feature", summary: "Slack integration request" },
    { content: "Cannot export PDF — button does nothing on Safari.", channel: "SUPPORT", sentiment: "NEG", sentimentScore: -0.8, theme: "Export", category: "Bug", summary: "PDF export broken on Safari" },
    { content: "Search is fast and accurate now. Really nice.", channel: "NPS", sentiment: "POS", sentimentScore: 0.7, theme: "Search", category: "Performance", summary: "Search improved" },
    { content: "Pricing page is confusing. Took me 10 minutes to find the plan I wanted.", channel: "SALES", sentiment: "NEG", sentimentScore: -0.6, theme: "Pricing", category: "UX", summary: "Pricing page confusing" },
    { content: "The AI insights are surprisingly accurate. Great addition.", channel: "COMMUNITY", sentiment: "POS", sentimentScore: 0.8, theme: "AI", category: "Feature", summary: "AI insights appreciated" },
    { content: "Notifications are too noisy. Need better controls.", channel: "APP_STORE", sentiment: "NEG", sentimentScore: -0.5, theme: "Notifications", category: "UX", summary: "Notification noise" },
];

export async function POST() {
    const ctx = await requireWorkspaceUser(["ADMIN", "ANALYST"]);

    if ("error" in ctx) {
        return ctx.error;
    }

    const user = ctx.user;
    const workspaceId = user.workspace.id;
    const createdById = user.id;

    const results = await Promise.allSettled(
        SAMPLES.map((sample) =>
            db.feedback.create({
                data: {
                    workspaceId,
                    createdById,
                    content: sample.content,
                    source: "API",
                    sentiment: sample.sentiment,
                    sentimentScore: sample.sentimentScore,
                    theme: sample.theme,
                    category: sample.category,
                    summary: sample.summary,
                    status: "NEW",
                    metadata: { channel: sample.channel },
                },
            })
        )
    );

    const imported = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - imported;

    return NextResponse.json(
        {
            message: "Simulated channel feedback loaded",
            imported,
            failed,
            unclassified: 0,
        },
        { status: 201 }
    );
}