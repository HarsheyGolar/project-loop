 "use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    CalendarDays,
    Check,
    ChevronDown,
    Filter,
    MessageSquareText,
    Minus,
    RefreshCw,
    RotateCcw,
    Smile,
    Sparkles,
    TrendingUp,
} from "lucide-react";

type Channel = "" | "MANUAL" | "CSV" | "API" | "OTHER";
type Sentiment = "" | "positive" | "neutral" | "negative";
type Preset = "7" | "30" | "90" | "custom";

type AnalyticsResponse = {
    period: {
        from: string;
        to: string;
        label: string;
    };
    summary: {
        total: number;
        positive: number;
        neutral: number;
        negative: number;
        averageSentimentScore: number | null;
    };
    series: Array<{
        date: string;
        label: string;
        total: number;
        positive: number;
        neutral: number;
        negative: number;
    }>;
    sentiment: Array<{
        name: "Positive" | "Neutral" | "Negative";
        value: number;
    }>;
    themes: Array<{
        theme: string;
        count: number;
    }>;
    filters: {
        themes: string[];
    };
};

const channelOptions: Array<{
    value: Channel;
    label: string;
}> = [
    { value: "", label: "All channels" },
    { value: "MANUAL", label: "Manual" },
    { value: "CSV", label: "CSV import" },
    { value: "API", label: "API" },
    { value: "OTHER", label: "Other" },
];

const sentimentOptions: Array<{
    value: Sentiment;
    label: string;
}> = [
    { value: "", label: "All sentiment" },
    { value: "positive", label: "Positive" },
    { value: "neutral", label: "Neutral" },
    { value: "negative", label: "Negative" },
];

const presetOptions: Array<{
    value: Preset;
    label: string;
}> = [
    { value: "7", label: "7 days" },
    { value: "30", label: "30 days" },
    { value: "90", label: "90 days" },
    { value: "custom", label: "Custom" },
];

const pieColors: Record<
    "Positive" | "Neutral" | "Negative",
    string
> = {
    Positive: "#338f63",
    Neutral: "#a4ada8",
    Negative: "#ef765f",
};

function formatScore(value: number | null): string {
    if (value === null || !Number.isFinite(value)) {
        return "—";
    }

    return value.toFixed(2);
}

function formatCompactNumber(value: number): string {
    return new Intl.NumberFormat("en-IN").format(value);
}

function formatDateInput(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function FilterSelect<T extends string>({
    value,
    onChange,
    options,
    label,
}: {
    value: T;
    onChange: (value: T) => void;
    options: Array<{ value: T; label: string }>;
    label: string;
}) {
    return (
        <label className="relative block min-w-0">
            <span className="sr-only">{label}</span>
            <select
                value={value}
                onChange={(event) =>
                    onChange(event.target.value as T)
                }
                className="h-10 w-full appearance-none rounded-xl border border-[#e1e5e1] bg-white px-3 pr-9 text-xs font-semibold text-[#5f6864] outline-none transition focus:border-[#ef765f] sm:min-w-36"
            >
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

            <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#909793]"
            />
        </label>
    );
}

function StatCard({
    label,
    value,
    detail,
    icon,
    accentClass,
}: {
    label: string;
    value: string;
    detail: string;
    icon: ReactNode;
    accentClass: string;
}) {
    return (
        <div className="rounded-2xl border border-[#e6e9e4] bg-white p-5 shadow-[0_8px_28px_rgba(37,43,43,0.045)]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#858d89]">
                        {label}
                    </p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-[#252b2b]">
                        {value}
                    </p>
                    <p className="mt-1 text-xs text-[#89908d]">
                        {detail}
                    </p>
                </div>
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentClass}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function ChartCard({
    eyebrow,
    title,
    description,
    children,
    className = "",
}: {
    eyebrow: string;
    title: string;
    description: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={`rounded-2xl border border-[#e6e9e4] bg-white p-5 shadow-[0_8px_28px_rgba(37,43,43,0.045)] sm:p-6 ${className}`}
        >
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ef765f]">
                    {eyebrow}
                </p>
                <h3 className="mt-1 text-lg font-bold">
                    {title}
                </h3>
                <p className="mt-1 text-sm text-[#78807d]">
                    {description}
                </p>
            </div>

            <div className="mt-5">{children}</div>
        </section>
    );
}

function EmptyChartState({
    message,
}: {
    message: string;
}) {
    return (
        <div className="flex h-[290px] flex-col items-center justify-center rounded-xl bg-[#fafbf8] text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f7f4] text-[#9aa19e]">
                <MessageSquareText size={18} />
            </div>
            <p className="mt-3 text-sm font-semibold text-[#626b67]">
                No data in this view
            </p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-[#929995]">
                {message}
            </p>
        </div>
    );
}

export default function DashboardAnalytics() {
    const [preset, setPreset] = useState<Preset>("30");
    const [channel, setChannel] = useState<Channel>("");
    const [sentiment, setSentiment] =
        useState<Sentiment>("");
    const [theme, setTheme] = useState("");
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");

    const [data, setData] =
        useState<AnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const queryKey = useMemo(
        () =>
            JSON.stringify({
                preset,
                channel,
                sentiment,
                theme,
                customFrom,
                customTo,
            }),
        [
            preset,
            channel,
            sentiment,
            theme,
            customFrom,
            customTo,
        ],
    );

    useEffect(() => {
        if (
            preset === "custom" &&
            (!customFrom || !customTo)
        ) {
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        let active = true;

        async function loadAnalytics() {
            if (active) {
                setError("");
                if (data) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }
            }

            try {
                const params = new URLSearchParams();

                if (preset === "custom") {
                    params.set("from", customFrom);
                    params.set("to", customTo);
                } else {
                    params.set("days", preset);
                }

                if (channel) {
                    params.set("channel", channel);
                }

                if (sentiment) {
                    params.set("sentiment", sentiment);
                }

                if (theme) {
                    params.set("theme", theme);
                }

                const response = await fetch(
                    `/api/dashboard/analytics?${params.toString()}`,
                    {
                        cache: "no-store",
                        signal: controller.signal,
                    },
                );

                const result =
                    (await response.json()) as
                        | AnalyticsResponse
                        | { error?: string };

                if (!response.ok) {
                    throw new Error(
                        "error" in result && result.error
                            ? result.error
                            : "Failed to load dashboard analytics",
                    );
                }

                if (active) {
                    setData(result as AnalyticsResponse);
                }
            } catch (loadError) {
                if (
                    loadError instanceof DOMException &&
                    loadError.name === "AbortError"
                ) {
                    return;
                }

                if (active) {
                    setError(
                        loadError instanceof Error
                            ? loadError.message
                            : "Failed to load dashboard analytics",
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        }

        void loadAnalytics();

        return () => {
            active = false;
            controller.abort();
        };
    }, [
        queryKey,
        preset,
        channel,
        sentiment,
        theme,
        customFrom,
        customTo,
    ]);

    const hasFilters = Boolean(
        channel || sentiment || theme,
    );

    function resetFilters() {
        setChannel("");
        setSentiment("");
        setTheme("");
        setPreset("30");
        setCustomFrom("");
        setCustomTo("");
    }

    function applyCustomTodayRange() {
        const today = new Date();
        const start = new Date(today);
        start.setDate(start.getDate() - 29);

        setCustomFrom(formatDateInput(start));
        setCustomTo(formatDateInput(today));
    }

    if (
        preset === "custom" &&
        (!customFrom || !customTo)
    ) {
        return (
            <section className="space-y-5">
                <div className="rounded-2xl border border-[#e6e9e4] bg-white p-5 shadow-[0_8px_28px_rgba(37,43,43,0.045)] sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ef765f]">
                                Analytics
                            </p>
                            <h2 className="mt-1 text-xl font-bold">
                                Customer feedback overview
                            </h2>
                            <p className="mt-1 text-sm text-[#78807d]">
                                Choose a reporting period and filters to
                                explore customer signals.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={applyCustomTodayRange}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#252b2b] px-4 text-xs font-semibold text-white transition hover:opacity-90"
                        >
                            <CalendarDays size={14} />
                            Use last 30 days
                        </button>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[150px_1fr_1fr]">
                        <select
                            value={preset}
                            onChange={(event) =>
                                setPreset(
                                    event.target.value as Preset,
                                )
                            }
                            className="h-10 rounded-xl border border-[#e1e5e1] bg-white px-3 text-xs font-semibold text-[#5f6864] outline-none focus:border-[#ef765f]"
                        >
                            {presetOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <input
                            type="date"
                            value={customFrom}
                            onChange={(event) =>
                                setCustomFrom(event.target.value)
                            }
                            className="h-10 rounded-xl border border-[#e1e5e1] bg-white px-3 text-xs font-semibold text-[#5f6864] outline-none focus:border-[#ef765f]"
                        />

                        <input
                            type="date"
                            value={customTo}
                            onChange={(event) =>
                                setCustomTo(event.target.value)
                            }
                            className="h-10 rounded-xl border border-[#e1e5e1] bg-white px-3 text-xs font-semibold text-[#5f6864] outline-none focus:border-[#ef765f]"
                        />
                    </div>
                </div>
            </section>
        );
    }

    const total =
        data?.summary.total ?? 0;
    const positive =
        data?.summary.positive ?? 0;
    const neutral =
        data?.summary.neutral ?? 0;
    const negative =
        data?.summary.negative ?? 0;

    const positiveShare =
        total > 0
            ? Math.round((positive / total) * 100)
            : 0;

    const negativeShare =
        total > 0
            ? Math.round((negative / total) * 100)
            : 0;

    const chartData = data?.series ?? [];
    const sentimentData = data?.sentiment ?? [];
    const themeData = data?.themes ?? [];

    return (
        <section className="space-y-5">
            <div className="rounded-2xl border border-[#e6e9e4] bg-white p-5 shadow-[0_8px_28px_rgba(37,43,43,0.045)] sm:p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ef765f]">
                                Analytics
                            </p>
                            {refreshing ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f7f4] px-2.5 py-1 text-[10px] font-semibold text-[#808884]">
                                    <RefreshCw
                                        size={11}
                                        className="animate-spin"
                                    />
                                    Updating
                                </span>
                            ) : null}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-3">
                            <h2 className="text-xl font-bold">
                                Customer feedback overview
                            </h2>
                            {data ? (
                                <span className="rounded-full bg-[#f5f7f4] px-3 py-1 text-[11px] font-semibold text-[#6b746f]">
                                    {data.period.label}
                                </span>
                            ) : null}
                        </div>

                        <p className="mt-1 text-sm text-[#78807d]">
                            Volume, sentiment, and the themes customers are
                            talking about most.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <FilterSelect
                            label="Reporting period"
                            value={preset}
                            onChange={(value) =>
                                setPreset(value)
                            }
                            options={presetOptions}
                        />

                        <FilterSelect
                            label="Channel"
                            value={channel}
                            onChange={(value) =>
                                setChannel(value)
                            }
                            options={channelOptions}
                        />

                        <FilterSelect
                            label="Sentiment"
                            value={sentiment}
                            onChange={(value) =>
                                setSentiment(value)
                            }
                            options={sentimentOptions}
                        />

                        <button
                            type="button"
                            onClick={resetFilters}
                            disabled={!hasFilters && preset === "30"}
                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e0e4df] bg-white px-3 text-xs font-semibold text-[#69716d] transition hover:bg-[#fafbf8] disabled:cursor-not-allowed disabled:opacity-35"
                        >
                            <RotateCcw size={13} />
                            Reset
                        </button>
                    </div>
                </div>

                {preset === "custom" ? (
                    <div className="mt-4 grid gap-3 rounded-xl border border-[#edf0ec] bg-[#fafbf8] p-3 sm:grid-cols-2">
                        <label className="text-xs font-semibold text-[#6b746f]">
                            From
                            <input
                                type="date"
                                value={customFrom}
                                onChange={(event) =>
                                    setCustomFrom(
                                        event.target.value,
                                    )
                                }
                                className="mt-1 h-10 w-full rounded-lg border border-[#e1e5e1] bg-white px-3 text-xs font-semibold text-[#5f6864] outline-none focus:border-[#ef765f]"
                            />
                        </label>
                        <label className="text-xs font-semibold text-[#6b746f]">
                            To
                            <input
                                type="date"
                                value={customTo}
                                onChange={(event) =>
                                    setCustomTo(
                                        event.target.value,
                                    )
                                }
                                className="mt-1 h-10 w-full rounded-lg border border-[#e1e5e1] bg-white px-3 text-xs font-semibold text-[#5f6864] outline-none focus:border-[#ef765f]"
                            />
                        </label>
                    </div>
                ) : null}

                {theme ? (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#dfe5e0] bg-[#fafbf8] px-3 py-1.5 text-[11px] font-semibold text-[#67706b]">
                        <Filter size={11} />
                        Theme: {theme}
                        <button
                            type="button"
                            onClick={() => setTheme("")}
                            className="ml-1 rounded-full p-0.5 text-[#8a918e] transition hover:bg-white hover:text-[#252b2b]"
                            aria-label="Clear theme filter"
                        >
                            <Minus size={10} />
                        </button>
                    </div>
                ) : null}
            </div>

            {error ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-[#f0c6ba] bg-[#fff2ee] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-[#9b4a3c]">
                            Analytics could not be loaded.
                        </p>
                        <p className="mt-1 text-xs text-[#b36b5e]">
                            {error}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setPreset((current) =>
                                current === "30"
                                    ? "7"
                                    : current,
                            );
                        }}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#edc5ba] bg-white px-3 text-xs font-semibold text-[#925145]"
                    >
                        <RefreshCw size={13} />
                        Retry
                    </button>
                </div>
            ) : null}

            {loading && !data ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map(
                        (_, index) => (
                            <div
                                key={index}
                                className="h-32 animate-pulse rounded-2xl border border-[#e6e9e4] bg-white"
                            />
                        ),
                    )}
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Total feedback"
                        value={formatCompactNumber(
                            total,
                        )}
                        detail="Customer signals in range"
                        icon={
                            <MessageSquareText
                                size={18}
                            />
                        }
                        accentClass="bg-[#fce6df] text-[#ef765f]"
                    />

                    <StatCard
                        label="Positive"
                        value={`${formatCompactNumber(
                            positive,
                        )}`}
                        detail={`${positiveShare}% of feedback`}
                        icon={
                            <Smile size={18} />
                        }
                        accentClass="bg-[#eef8f2] text-[#338f63]"
                    />

                    <StatCard
                        label="Neutral"
                        value={`${formatCompactNumber(
                            neutral,
                        )}`}
                        detail="Informational / mixed signals"
                        icon={
                            <Minus size={18} />
                        }
                        accentClass="bg-[#f4f6f4] text-[#77807b]"
                    />

                    <StatCard
                        label="Negative"
                        value={`${formatCompactNumber(
                            negative,
                        )}`}
                        detail={`${negativeShare}% of feedback`}
                        icon={
                            <TrendingUp
                                size={18}
                            />
                        }
                        accentClass="bg-[#fff2ee] text-[#b14f3d]"
                    />
                </div>
            )}

            <div className="grid gap-5 xl:grid-cols-[1.55fr_0.85fr]">
                <ChartCard
                    eyebrow="Signal volume"
                    title="Feedback volume over time"
                    description="Daily feedback volume, split by sentiment."
                >
                    {chartData.length === 0 ? (
                        <EmptyChartState message="Try widening the reporting period or clearing one of the filters." />
                    ) : (
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <AreaChart
                                    data={chartData}
                                    margin={{
                                        top: 10,
                                        right: 6,
                                        left: -18,
                                        bottom: 2,
                                    }}
                                >
                                    <defs>
                                        <linearGradient
                                            id="loopPositive"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#338f63"
                                                stopOpacity={0.18}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#338f63"
                                                stopOpacity={0.01}
                                            />
                                        </linearGradient>
                                        <linearGradient
                                            id="loopNegative"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#ef765f"
                                                stopOpacity={0.16}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#ef765f"
                                                stopOpacity={0.01}
                                            />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid
                                        vertical={false}
                                        stroke="#eef0ed"
                                    />
                                    <XAxis
                                        dataKey="label"
                                        tick={{
                                            fill: "#8a918e",
                                            fontSize: 10,
                                        }}
                                        tickLine={false}
                                        axisLine={false}
                                        minTickGap={24}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{
                                            fill: "#8a918e",
                                            fontSize: 10,
                                        }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: 12,
                                            border: "1px solid #e6e9e4",
                                            boxShadow:
                                                "0 12px 30px rgba(37,43,43,0.10)",
                                            fontSize: 12,
                                        }}
                                    />

                                    <Area
                                        type="monotone"
                                        dataKey="positive"
                                        stroke="#338f63"
                                        strokeWidth={2.25}
                                        fill="url(#loopPositive)"
                                        stackId="sentiment"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="neutral"
                                        stroke="#a4ada8"
                                        strokeWidth={1.8}
                                        fill="transparent"
                                        stackId="sentiment"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="negative"
                                        stroke="#ef765f"
                                        strokeWidth={2.25}
                                        fill="url(#loopNegative)"
                                        stackId="sentiment"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </ChartCard>

                <ChartCard
                    eyebrow="Sentiment mix"
                    title="Sentiment breakdown"
                    description="How customer feedback is distributed."
                >
                    {sentimentData.length === 0 ||
                    total === 0 ? (
                        <EmptyChartState message="There is no classified feedback in the selected view." />
                    ) : (
                        <div className="h-[320px]">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <PieChart>
                                    <Pie
                                        data={sentimentData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="46%"
                                        innerRadius={72}
                                        outerRadius={104}
                                        paddingAngle={3}
                                        stroke="#ffffff"
                                        strokeWidth={3}
                                    >
                                        {sentimentData.map(
                                            (item) => (
                                                <Cell
                                                    key={item.name}
                                                    fill={
                                                        pieColors[
                                                            item
                                                                .name
                                                        ]
                                                    }
                                                />
                                            ),
                                        )}
                                    </Pie>

                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: 12,
                                            border: "1px solid #e6e9e4",
                                            boxShadow:
                                                "0 12px 30px rgba(37,43,43,0.10)",
                                            fontSize: 12,
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="-mt-2 grid grid-cols-3 gap-2">
                                {sentimentData.map(
                                    (item) => {
                                        const share =
                                            total > 0
                                                ? Math.round(
                                                      (item.value /
                                                          total) *
                                                          100,
                                                  )
                                                : 0;

                                        return (
                                            <div
                                                key={item.name}
                                                className="rounded-xl bg-[#fafbf8] px-3 py-2.5"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className="h-2 w-2 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                pieColors[
                                                                    item
                                                                        .name
                                                                ],
                                                        }}
                                                    />
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#7b847f]">
                                                        {
                                                            item.name
                                                        }
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm font-bold text-[#303735]">
                                                    {item.value}
                                                </p>
                                                <p className="text-[10px] text-[#939a97]">
                                                    {share}%
                                                </p>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        </div>
                    )}
                </ChartCard>
            </div>

            <ChartCard
                eyebrow="Theme intelligence"
                title="Top customer themes"
                description="The most frequent themes in the selected reporting period."
            >
                {themeData.length === 0 ? (
                    <EmptyChartState message="Themes will appear once feedback has been classified by the AI layer." />
                ) : (
                    <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
                        <div className="h-[360px] min-w-0">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <BarChart
                                    data={themeData}
                                    layout="vertical"
                                    margin={{
                                        top: 4,
                                        right: 10,
                                        left: 8,
                                        bottom: 4,
                                    }}
                                >
                                    <CartesianGrid
                                        horizontal={false}
                                        stroke="#eef0ed"
                                    />
                                    <XAxis
                                        type="number"
                                        allowDecimals={false}
                                        tick={{
                                            fill: "#8a918e",
                                            fontSize: 10,
                                        }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="theme"
                                        width={150}
                                        tick={{
                                            fill: "#59615e",
                                            fontSize: 11,
                                        }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{
                                            fill: "#fafbf8",
                                        }}
                                        contentStyle={{
                                            borderRadius: 12,
                                            border: "1px solid #e6e9e4",
                                            boxShadow:
                                                "0 12px 30px rgba(37,43,43,0.10)",
                                            fontSize: 12,
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#ef765f"
                                        radius={[
                                            0,
                                            7,
                                            7,
                                            0,
                                        ]}
                                        barSize={22}
                                        onClick={(entry) => {
                                            if (
                                                entry &&
                                                typeof entry ===
                                                    "object" &&
                                                "theme" in
                                                    entry &&
                                                typeof entry.theme ===
                                                    "string"
                                            ) {
                                                setTheme(
                                                    entry.theme,
                                                );
                                            }
                                        }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="rounded-2xl bg-[#fafbf8] p-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fce6df] text-[#ef765f]">
                                    <Sparkles size={16} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#858d89]">
                                        Explore
                                    </p>
                                    <p className="text-sm font-bold text-[#39413e]">
                                        Drill into a theme
                                    </p>
                                </div>
                            </div>

                            <p className="mt-3 text-xs leading-5 text-[#818985]">
                                Select a bar to apply that theme as a
                                dashboard filter and inspect its signal
                                across the charts.
                            </p>

                            {theme ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setTheme("")
                                    }
                                    className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#dfe5e0] bg-white text-xs font-semibold text-[#68706c] transition hover:bg-[#f5f7f4]"
                                >
                                    <Check size={13} />
                                    Viewing: {theme}
                                </button>
                            ) : (
                                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9aa19e]">
                                    Click any bar to filter
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </ChartCard>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#e6e9e4] bg-[#fffdf9] p-5 shadow-[0_8px_28px_rgba(37,43,43,0.035)]">
                    <div className="flex items-center gap-2 text-[#6d7571]">
                        <TrendingUp size={15} />
                        <p className="text-xs font-bold uppercase tracking-[0.12em]">
                            Sentiment score
                        </p>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-[#252b2b]">
                        {formatScore(
                            data?.summary
                                .averageSentimentScore ??
                                null,
                        )}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#8a918e]">
                        Average model sentiment score for the current filtered
                        view.
                    </p>
                </div>

                <div className="rounded-2xl border border-[#dfe9e2] bg-[#f6fbf7] p-5 shadow-[0_8px_28px_rgba(37,43,43,0.035)]">
                    <div className="flex items-center gap-2 text-[#4b6d59]">
                        <Filter size={15} />
                        <p className="text-xs font-bold uppercase tracking-[0.12em]">
                            Active view
                        </p>
                    </div>

                    <p className="mt-2 text-sm font-bold text-[#304239]">
                        {data?.period.label ??
                            "Loading period"}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#728078]">
                        {hasFilters
                            ? "Charts reflect the filters currently applied."
                            : "Charts reflect all available feedback in this period."}
                    </p>
                </div>
            </div>
        </section>
    );
}
