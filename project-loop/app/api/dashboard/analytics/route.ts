import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { normalizeTheme } from "@/lib/themes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Channel =
    | "MANUAL"
    | "CSV"
    | "API"
    | "OTHER";

type Sentiment =
    | "positive"
    | "neutral"
    | "negative";

type AnalyticsRow = {
    createdAt: Date;
    sentiment: string | null;
    theme: string | null;
    source: Channel;
    sentimentScore: number | null;
};

function parseDateInput(
    value: string | null,
    endOfDay: boolean,
): Date | null {
    if (!value) {
        return null;
    }

    const iso = endOfDay
        ? `${value}T23:59:59.999Z`
        : `${value}T00:00:00.000Z`;
    const date = new Date(iso);

    return Number.isNaN(date.getTime())
        ? null
        : date;
}

function formatDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function formatDateLabel(dateKey: string): string {
    const date = new Date(`${dateKey}T00:00:00.000Z`);

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
    }).format(date);
}

function formatPeriodLabel(
    from: Date,
    to: Date,
): string {
    const formatter = new Intl.DateTimeFormat(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
        },
    );

    return `${formatter.format(from)} - ${formatter.format(to)}`;
}

function buildRange(
    searchParams: URLSearchParams,
): {
    from: Date;
    to: Date;
} | {
    error: string;
} {
    const customFrom =
        searchParams.get("from");
    const customTo =
        searchParams.get("to");

    if (customFrom || customTo) {
        if (!customFrom || !customTo) {
            return {
                error:
                    "Both from and to dates are required.",
            };
        }

        const from = parseDateInput(
            customFrom,
            false,
        );
        const to = parseDateInput(
            customTo,
            true,
        );

        if (!from || !to) {
            return {
                error: "Invalid date range.",
            };
        }

        if (from > to) {
            return {
                error:
                    "From date must be on or before the to date.",
            };
        }

        return { from, to };
    }

    const requestedDays =
        Number(searchParams.get("days") ?? "30");

    if (![7, 30, 90].includes(requestedDays)) {
        return {
            error:
                "Days must be 7, 30, or 90.",
        };
    }

    const to = new Date();
    to.setUTCHours(
        23,
        59,
        59,
        999,
    );

    const from = new Date(to);
    from.setUTCDate(
        from.getUTCDate() -
        requestedDays +
        1,
    );
    from.setUTCHours(
        0,
        0,
        0,
        0,
    );

    return { from, to };
}

export async function GET(
    request: Request,
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Workspace not found" },
                { status: 404 },
            );
        }

        const url = new URL(
            request.url,
        );
        const range =
            buildRange(url.searchParams);

        if ("error" in range) {
            return NextResponse.json(
                { error: range.error },
                { status: 400 },
            );
        }

        const channel =
            url.searchParams.get("channel") as
            | Channel
            | null;
        const sentiment =
            url.searchParams.get("sentiment") as
            | Sentiment
            | null;
        const theme =
            url.searchParams.get("theme");

        const validChannels: Channel[] = [
            "MANUAL",
            "CSV",
            "API",
            "OTHER",
        ];

        const validSentiments: Sentiment[] = [
            "positive",
            "neutral",
            "negative",
        ];

        if (
            channel &&
            !validChannels.includes(channel)
        ) {
            return NextResponse.json(
                { error: "Invalid channel filter." },
                { status: 400 },
            );
        }

        if (
            sentiment &&
            !validSentiments.includes(sentiment)
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid sentiment filter.",
                },
                { status: 400 },
            );
        }

        const rows =
            (await db.feedback.findMany({
                where: {
                    workspaceId:
                        user.workspace.id,
                    createdAt: {
                        gte: range.from,
                        lte: range.to,
                    },
                },
                select: {
                    createdAt: true,
                    sentiment: true,
                    theme: true,
                    source: true,
                    sentimentScore: true,
                },
            })) as AnalyticsRow[];

        const availableThemes = Array.from(
            new Set(
                rows
                    .map((row) => normalizeTheme(row.theme))
                    .filter(
                        (value): value is string =>
                            Boolean(value),
                    ),
            ),
        ).sort((a, b) => a.localeCompare(b));

        const filteredRows =
            rows.filter((row) => {
                if (
                    channel &&
                    row.source !== channel
                ) {
                    return false;
                }

                if (
                    sentiment &&
                    row.sentiment !== sentiment
                ) {
                    return false;
                }

                if (
                    theme &&
                    row.theme !== theme
                ) {
                    return false;
                }

                return true;
            });

        const summary = {
            total: filteredRows.length,
            positive: 0,
            neutral: 0,
            negative: 0,
            averageSentimentScore:
                null as number | null,
        };

        let scoreTotal = 0;
        let scoreCount = 0;

        const seriesMap = new Map<
            string,
            {
                date: string;
                label: string;
                total: number;
                positive: number;
                neutral: number;
                negative: number;
            }
        >();

        const cursor = new Date(
            range.from,
        );

        while (cursor <= range.to) {
            const key =
                formatDateKey(cursor);

            seriesMap.set(key, {
                date: key,
                label:
                    formatDateLabel(key),
                total: 0,
                positive: 0,
                neutral: 0,
                negative: 0,
            });

            cursor.setUTCDate(
                cursor.getUTCDate() + 1,
            );
        }

        const themeCounts = new Map<
            string,
            number
        >();

        for (const row of filteredRows) {
            const sentimentValue =
                row.sentiment ===
                    "positive" ||
                    row.sentiment ===
                    "neutral" ||
                    row.sentiment ===
                    "negative"
                    ? row.sentiment
                    : null;

            if (sentimentValue) {
                summary[sentimentValue] +=
                    1;

                const bucket =
                    seriesMap.get(
                        formatDateKey(
                            row.createdAt,
                        ),
                    );

                if (bucket) {
                    bucket[
                        sentimentValue
                    ] += 1;
                }
            }

            const bucket =
                seriesMap.get(
                    formatDateKey(
                        row.createdAt,
                    ),
                );

            if (bucket) {
                bucket.total += 1;
            }

            if (
                typeof row.sentimentScore ===
                "number" &&
                Number.isFinite(
                    row.sentimentScore,
                )
            ) {
                scoreTotal +=
                    row.sentimentScore;
                scoreCount += 1;
            }

            const normalizedTheme = normalizeTheme(row.theme);

            if (normalizedTheme) {
                themeCounts.set(
                    normalizedTheme,
                    (themeCounts.get(normalizedTheme) ?? 0) + 1,
                );
            }
        }

        if (scoreCount > 0) {
            summary.averageSentimentScore =
                Number(
                    (
                        scoreTotal /
                        scoreCount
                    ).toFixed(3),
                );
        }

        const themes = Array.from(
            themeCounts.entries(),
        )
            .map(
                ([
                    themeName,
                    count,
                ]) => ({
                    theme: themeName,
                    count,
                }),
            )
            .sort(
                (a, b) =>
                    b.count - a.count ||
                    a.theme.localeCompare(
                        b.theme,
                    ),
            )
            .slice(0, 8);

        return NextResponse.json(
            {
                period: {
                    from:
                        formatDateKey(
                            range.from,
                        ),
                    to:
                        formatDateKey(
                            range.to,
                        ),
                    label:
                        formatPeriodLabel(
                            range.from,
                            range.to,
                        ),
                },
                summary,
                series: Array.from(
                    seriesMap.values(),
                ),
                sentiment: [
                    {
                        sentiment: "positive",
                        count: summary.positive,
                        percentage: summary.total
                            ? Math.round(
                                (summary.positive /
                                    summary.total) *
                                100,
                            )
                            : 0,
                    },
                    {
                        sentiment: "neutral",
                        count: summary.neutral,
                        percentage: summary.total
                            ? Math.round(
                                (summary.neutral /
                                    summary.total) *
                                100,
                            )
                            : 0,
                    },
                    {
                        sentiment: "negative",
                        count: summary.negative,
                        percentage: summary.total
                            ? Math.round(
                                (summary.negative /
                                    summary.total) *
                                100,
                            )
                            : 0,
                    },
                ],
                themes,
                filters: {
                    themes:
                        availableThemes,
                },
            },
            {
                status: 200,
                headers: {
                    "Cache-Control":
                        "private, no-store",
                },
            },
        );
    } catch (error) {
        console.error(
            "GET /api/dashboard/analytics error:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Failed to load dashboard analytics.",
            },
            { status: 500 },
        );
    }
}
