"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Inbox,
    Plus,
    RefreshCw,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";

type Source =
    | "MANUAL"
    | "CSV"
    | "API"
    | "OTHER";

type Sentiment =
    | "positive"
    | "neutral"
    | "negative";

type Status =
    | "NEW"
    | "REVIEWED"
    | "ACTIONED";

type Feedback = {
    id: string;
    content: string;
    source: Source;
    sentiment: Sentiment | null;
    sentimentScore: number | null;
    summary: string | null;
    theme: string | null;
    category: string | null;
    status: Status | string;
    createdAt: string;
};

type Pagination = {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
};

type Counts = {
    ALL: number;
    NEW: number;
    REVIEWED: number;
    ACTIONED: number;
};

type FeedbackResponse = {
    feedback: Feedback[];
    pagination: Pagination;
    counts: Counts;
    filters: {
        themes: string[];
    };
};

const sourceOptions: Array<{
    value: Source | "";
    label: string;
}> = [
    {
        value: "",
        label: "All channels",
    },
    {
        value: "MANUAL",
        label: "Manual",
    },
    {
        value: "CSV",
        label: "CSV",
    },
    {
        value: "API",
        label: "API",
    },
    {
        value: "OTHER",
        label: "Other",
    },
];

const sentimentOptions: Array<{
    value: Sentiment | "";
    label: string;
}> = [
    {
        value: "",
        label: "All sentiment",
    },
    {
        value: "positive",
        label: "Positive",
    },
    {
        value: "neutral",
        label: "Neutral",
    },
    {
        value: "negative",
        label: "Negative",
    },
];

const statusTabs: Array<{
    value: "" | Status;
    label: string;
}> = [
    {
        value: "",
        label: "All",
    },
    {
        value: "NEW",
        label: "New",
    },
    {
        value: "REVIEWED",
        label: "Reviewed",
    },
    {
        value: "ACTIONED",
        label: "Actioned",
    },
];

function formatSource(source: Source): string {
    switch (source) {
        case "MANUAL":
            return "Manual";
        case "CSV":
            return "CSV";
        case "API":
            return "API";
        case "OTHER":
            return "Other";
    }
}

function formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Unknown date";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

function sentimentClasses(
    sentiment: Sentiment | null,
): string {
    switch (sentiment) {
        case "positive":
            return "border-[#bfe4cf] bg-[#eef8f2] text-[#28744f]";
        case "negative":
            return "border-[#f0c6ba] bg-[#fff2ee] text-[#b14f3d]";
        case "neutral":
            return "border-[#d9dfdc] bg-[#f4f6f4] text-[#626b67]";
        default:
            return "border-[#e4e7e3] bg-white text-[#8a918e]";
    }
}

function statusClasses(status: string): string {
    switch (status) {
        case "NEW":
            return "border-[#f2dba2] bg-[#fff8df] text-[#8a6a18]";
        case "REVIEWED":
            return "border-[#c8dce8] bg-[#eef6fa] text-[#3d718d]";
        case "ACTIONED":
            return "border-[#bfe4cf] bg-[#eef8f2] text-[#28744f]";
        default:
            return "border-[#e4e7e3] bg-white text-[#6f7774]";
    }
}

export default function InboxPage() {
    const [feedback, setFeedback] = useState<
        Feedback[]
    >([]);
    const [pagination, setPagination] =
        useState<Pagination | null>(null);

    const [counts, setCounts] = useState<Counts>({
        ALL: 0,
        NEW: 0,
        REVIEWED: 0,
        ACTIONED: 0,
    });

    const [themes, setThemes] = useState<string[]>(
        [],
    );

    const [search, setSearch] = useState("");
    const [source, setSource] = useState<
        Source | ""
    >("");
    const [sentiment, setSentiment] = useState<
        Sentiment | ""
    >("");
    const [theme, setTheme] = useState("");
    const [status, setStatus] = useState<
        "" | Status
    >("");

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [mutating, setMutating] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [showFilters, setShowFilters] =
        useState(false);

    const [showComposer, setShowComposer] =
        useState(false);

    const [composerContent, setComposerContent] =
        useState("");

    const [composerSource, setComposerSource] =
        useState<Source>("MANUAL");

    const [composerLoading, setComposerLoading] =
        useState(false);

    const hasFilters = useMemo(() => {
        return Boolean(
            search ||
                source ||
                sentiment ||
                theme ||
                from ||
                to,
        );
    }, [
        search,
        source,
        sentiment,
        theme,
        from,
        to,
    ]);

    useEffect(() => {
        const controller =
            new AbortController();

        const timer = window.setTimeout(
            async () => {
                setLoading(true);
                setError("");

                try {
                    const params =
                        new URLSearchParams();

                    params.set(
                        "page",
                        String(page),
                    );
                    params.set(
                        "pageSize",
                        "20",
                    );

                    if (search.trim()) {
                        params.set(
                            "q",
                            search.trim(),
                        );
                    }

                    if (source) {
                        params.set(
                            "source",
                            source,
                        );
                    }

                    if (sentiment) {
                        params.set(
                            "sentiment",
                            sentiment,
                        );
                    }

                    if (theme) {
                        params.set(
                            "theme",
                            theme,
                        );
                    }

                    if (status) {
                        params.set(
                            "status",
                            status,
                        );
                    }

                    if (from) {
                        params.set(
                            "from",
                            from,
                        );
                    }

                    if (to) {
                        params.set(
                            "to",
                            to,
                        );
                    }

                    const response =
                        await fetch(
                            `/api/feedback?${params.toString()}`,
                            {
                                signal:
                                    controller.signal,
                                cache: "no-store",
                            },
                        );

                    const data =
                        (await response.json()) as
                            | FeedbackResponse
                            | {
                                  error?: string;
                              };

                    if (!response.ok) {
                        throw new Error(
                            "error" in data &&
                                data.error
                                ? data.error
                                : "Failed to load feedback",
                        );
                    }

                    const result =
                        data as FeedbackResponse;

                    setFeedback(
                        result.feedback,
                    );
                    setPagination(
                        result.pagination,
                    );
                    setCounts(
                        result.counts,
                    );
                    setThemes(
                        result.filters.themes,
                    );
                } catch (fetchError) {
                    if (
                        fetchError instanceof DOMException &&
                        fetchError.name ===
                            "AbortError"
                    ) {
                        return;
                    }

                    setError(
                        fetchError instanceof Error
                            ? fetchError.message
                            : "Failed to load feedback",
                    );
                } finally {
                    setLoading(false);
                }
            },
            300,
        );

        return () =>
            window.clearTimeout(timer);
    }, [
        page,
        search,
        source,
        sentiment,
        theme,
        status,
        from,
        to,
    ]);

    function updateFilter(
        callback: () => void,
    ) {
        setPage(1);
        callback();
    }

    function clearFilters() {
        setSearch("");
        setSource("");
        setSentiment("");
        setTheme("");
        setFrom("");
        setTo("");
        setPage(1);
    }

    async function updateStatus(
        id: string,
        nextStatus: Status,
    ) {
        setMutating(id);
        setError("");
        setMessage("");

        try {
            const response = await fetch(
                "/api/feedback",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        id,
                        status: nextStatus,
                    }),
                },
            );

            const data =
                (await response.json()) as
                    | {
                          feedback?: Feedback;
                          error?: string;
                          message?: string;
                      };

            if (!response.ok) {
                throw new Error(
                    data.error ??
                        "Failed to update status",
                );
            }

            if (data.feedback) {
                setFeedback((current) =>
                    current.map((item) =>
                        item.id === id
                            ? data.feedback!
                            : item,
                    ),
                );
            }

            setMessage(
                "Feedback status updated.",
            );

            window.setTimeout(() => {
                setMessage("");
            }, 2200);
        } catch (updateError) {
            setError(
                updateError instanceof Error
                    ? updateError.message
                    : "Failed to update status",
            );
        } finally {
            setMutating("");
        }
    }

    async function createFeedback(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!composerContent.trim()) {
            setError(
                "Please enter feedback content.",
            );
            return;
        }

        setComposerLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(
                "/api/feedback",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        content:
                            composerContent.trim(),
                        source: composerSource,
                    }),
                },
            );

            const data =
                (await response.json()) as {
                    error?: string;
                    feedback?: Feedback;
                    message?: string;
                };

            if (!response.ok) {
                throw new Error(
                    data.error ??
                        "Failed to create feedback",
                );
            }

            setComposerContent("");
            setComposerSource("MANUAL");
            setShowComposer(false);

            setMessage(
                data.message ??
                    "Feedback created successfully.",
            );

            setPage(1);

            window.setTimeout(() => {
                setMessage("");
            }, 3200);
        } catch (createError) {
            setError(
                createError instanceof Error
                    ? createError.message
                    : "Failed to create feedback",
            );
        } finally {
            setComposerLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#f6f7f4] px-4 py-6 text-[#252b2b] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#78807d] transition hover:text-[#252b2b]"
                    >
                        <ArrowLeft
                            size={16}
                        />
                        Back to Dashboard
                    </Link>

                    <button
                        type="button"
                        onClick={() =>
                            setShowComposer(true)
                        }
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#ef765f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#ef765f]/40"
                    >
                        <Plus size={16} />
                        Add feedback
                    </button>
                </div>

                <header className="mb-6">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fce6df] text-[#ef765f]">
                            <Inbox size={20} />
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ef765f]">
                                Customer Voice
                            </p>

                            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                                Feedback Inbox
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#78807d]">
                                Search, filter and triage
                                customer feedback across
                                your workspace.
                            </p>
                        </div>
                    </div>
                </header>

                {message ? (
                    <div
                        className="mb-5 rounded-xl border border-[#bfe4cf] bg-[#eef8f2] px-4 py-3 text-sm font-medium text-[#28744f]"
                        role="status"
                    >
                        {message}
                    </div>
                ) : null}

                {error ? (
                    <div
                        className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-[#f0c6ba] bg-[#fff2ee] px-4 py-3 text-sm text-[#9b4a3c]"
                        role="alert"
                    >
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                            aria-label="Dismiss error"
                            className="rounded-lg p-1 transition hover:bg-black/5"
                        >
                            <X size={15} />
                        </button>
                    </div>
                ) : null}

                <section className="overflow-hidden rounded-2xl border border-[#e6e9e4] bg-white shadow-[0_10px_35px_rgba(37,43,43,0.04)]">
                    <div className="border-b border-[#e6e9e4] px-4 pt-4 sm:px-5">
                        <div className="flex gap-1 overflow-x-auto">
                            {statusTabs.map((tab) => {
                                const count =
                                    tab.value === ""
                                        ? counts.ALL
                                        : counts[
                                              tab.value
                                          ];

                                const active =
                                    status ===
                                    tab.value;

                                return (
                                    <button
                                        key={
                                            tab.value ||
                                            "all"
                                        }
                                        type="button"
                                        onClick={() =>
                                            updateFilter(
                                                () =>
                                                    setStatus(
                                                        tab.value,
                                                    ),
                                            )
                                        }
                                        className={`flex shrink-0 items-center gap-2 border-b-2 px-3 pb-3 pt-1 text-sm font-semibold transition ${
                                            active
                                                ? "border-[#ef765f] text-[#252b2b]"
                                                : "border-transparent text-[#78807d] hover:text-[#252b2b]"
                                        }`}
                                    >
                                        {tab.label}

                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[11px] ${
                                                active
                                                    ? "bg-[#fce6df] text-[#b14f3d]"
                                                    : "bg-[#f1f3f0] text-[#78807d]"
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="border-b border-[#e6e9e4] p-4 sm:p-5">
                        <div className="flex flex-col gap-3 lg:flex-row">
                            <label className="relative flex-1">
                                <span className="sr-only">
                                    Search feedback
                                </span>

                                <Search
                                    size={17}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa19e]"
                                />

                                <input
                                    type="search"
                                    value={
                                        search
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        updateFilter(
                                            () =>
                                                setSearch(
                                                    event
                                                        .target
                                                        .value,
                                                ),
                                        )
                                    }
                                    placeholder="Search feedback..."
                                    className="h-11 w-full rounded-xl border border-[#e0e4df] bg-[#fbfcfa] pl-10 pr-4 text-sm outline-none transition placeholder:text-[#9aa19e] focus:border-[#ef765f] focus:ring-2 focus:ring-[#ef765f]/10"
                                />
                            </label>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowFilters(
                                        (value) =>
                                            !value,
                                    )
                                }
                                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
                                    showFilters ||
                                    hasFilters
                                        ? "border-[#ef765f] bg-[#fff7f4] text-[#b14f3d]"
                                        : "border-[#e0e4df] bg-white text-[#58605d] hover:bg-[#fafbf9]"
                                }`}
                            >
                                <SlidersHorizontal
                                    size={16}
                                />
                                Filters
                            </button>
                        </div>

                        {showFilters ? (
                            <div className="mt-4 grid gap-3 border-t border-[#eef0ed] pt-4 sm:grid-cols-2 lg:grid-cols-4">
                                <label className="text-xs font-semibold text-[#6f7774]">
                                    Channel
                                    <select
                                        value={
                                            source
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            updateFilter(
                                                () =>
                                                    setSource(
                                                        event
                                                            .target
                                                            .value as
                                                            | Source
                                                            | "",
                                                    ),
                                            )
                                        }
                                        className="mt-2 h-10 w-full rounded-xl border border-[#e0e4df] bg-white px-3 text-sm font-medium text-[#252b2b] outline-none focus:border-[#ef765f]"
                                    >
                                        {sourceOptions.map(
                                            (
                                                option,
                                            ) => (
                                                <option
                                                    key={
                                                        option.value ||
                                                        "all"
                                                    }
                                                    value={
                                                        option.value
                                                    }
                                                >
                                                    {
                                                        option.label
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </label>

                                <label className="text-xs font-semibold text-[#6f7774]">
                                    Sentiment
                                    <select
                                        value={
                                            sentiment
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            updateFilter(
                                                () =>
                                                    setSentiment(
                                                        event
                                                            .target
                                                            .value as
                                                            | Sentiment
                                                            | "",
                                                    ),
                                            )
                                        }
                                        className="mt-2 h-10 w-full rounded-xl border border-[#e0e4df] bg-white px-3 text-sm font-medium text-[#252b2b] outline-none focus:border-[#ef765f]"
                                    >
                                        {sentimentOptions.map(
                                            (
                                                option,
                                            ) => (
                                                <option
                                                    key={
                                                        option.value ||
                                                        "all"
                                                    }
                                                    value={
                                                        option.value
                                                    }
                                                >
                                                    {
                                                        option.label
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </label>

                                <label className="text-xs font-semibold text-[#6f7774]">
                                    Theme
                                    <select
                                        value={
                                            theme
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            updateFilter(
                                                () =>
                                                    setTheme(
                                                        event
                                                            .target
                                                            .value,
                                                    ),
                                            )
                                        }
                                        className="mt-2 h-10 w-full rounded-xl border border-[#e0e4df] bg-white px-3 text-sm font-medium text-[#252b2b] outline-none focus:border-[#ef765f]"
                                    >
                                        <option value="">
                                            All themes
                                        </option>

                                        {themes.map(
                                            (
                                                item,
                                            ) => (
                                                <option
                                                    key={
                                                        item
                                                    }
                                                    value={
                                                        item
                                                    }
                                                >
                                                    {
                                                        item
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </label>

                                <label className="text-xs font-semibold text-[#6f7774]">
                                    Status
                                    <select
                                        value={
                                            status
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            updateFilter(
                                                () =>
                                                    setStatus(
                                                        event
                                                            .target
                                                            .value as
                                                            | Status
                                                            | "",
                                                    ),
                                            )
                                        }
                                        className="mt-2 h-10 w-full rounded-xl border border-[#e0e4df] bg-white px-3 text-sm font-medium text-[#252b2b] outline-none focus:border-[#ef765f]"
                                    >
                                        <option value="">
                                            All status
                                        </option>
                                        <option value="NEW">
                                            New
                                        </option>
                                        <option value="REVIEWED">
                                            Reviewed
                                        </option>
                                        <option value="ACTIONED">
                                            Actioned
                                        </option>
                                    </select>
                                </label>

                                <label className="text-xs font-semibold text-[#6f7774]">
                                    From
                                    <input
                                        type="date"
                                        value={
                                            from
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            updateFilter(
                                                () =>
                                                    setFrom(
                                                        event
                                                            .target
                                                            .value,
                                                    ),
                                            )
                                        }
                                        className="mt-2 h-10 w-full rounded-xl border border-[#e0e4df] bg-white px-3 text-sm font-medium text-[#252b2b] outline-none focus:border-[#ef765f]"
                                    />
                                </label>

                                <label className="text-xs font-semibold text-[#6f7774]">
                                    To
                                    <input
                                        type="date"
                                        value={to}
                                        onChange={(
                                            event,
                                        ) =>
                                            updateFilter(
                                                () =>
                                                    setTo(
                                                        event
                                                            .target
                                                            .value,
                                                    ),
                                            )
                                        }
                                        className="mt-2 h-10 w-full rounded-xl border border-[#e0e4df] bg-white px-3 text-sm font-medium text-[#252b2b] outline-none focus:border-[#ef765f]"
                                    />
                                </label>

                                <div className="flex items-end sm:col-span-2 lg:col-span-2">
                                    <button
                                        type="button"
                                        onClick={
                                            clearFilters
                                        }
                                        disabled={
                                            !hasFilters
                                        }
                                        className="h-10 rounded-xl border border-[#e0e4df] bg-white px-4 text-sm font-semibold text-[#66706c] transition hover:bg-[#fafbf9] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Clear filters
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="hidden md:block">
                        <div className="grid grid-cols-[minmax(0,2.6fr)_120px_130px_150px_150px] gap-4 border-b border-[#e6e9e4] bg-[#fafbf8] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#818985]">
                            <div>Feedback</div>
                            <div>Channel</div>
                            <div>Sentiment</div>
                            <div>Theme</div>
                            <div>Status</div>
                        </div>

                        {loading ? (
                            <div className="space-y-0">
                                {Array.from({
                                    length: 6,
                                }).map(
                                    (_, index) => (
                                        <div
                                            key={
                                                index
                                            }
                                            className="grid animate-pulse grid-cols-[minmax(0,2.6fr)_120px_130px_150px_150px] gap-4 border-b border-[#eef0ed] px-5 py-5"
                                        >
                                            <div>
                                                <div className="h-4 w-4/5 rounded bg-[#edf0ec]" />
                                                <div className="mt-2 h-3 w-2/5 rounded bg-[#edf0ec]" />
                                            </div>

                                            <div className="h-6 w-16 rounded-full bg-[#edf0ec]" />

                                            <div className="h-6 w-20 rounded-full bg-[#edf0ec]" />

                                            <div className="h-6 w-24 rounded-full bg-[#edf0ec]" />

                                            <div className="h-8 w-28 rounded-lg bg-[#edf0ec]" />
                                        </div>
                                    ),
                                )}
                            </div>
                        ) : feedback.length === 0 ? (
                            <div className="px-6 py-20 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2f4f1] text-[#8b928f]">
                                    <Search
                                        size={21}
                                    />
                                </div>

                                <h2 className="mt-4 text-base font-bold">
                                    No feedback found
                                </h2>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#78807d]">
                                    Try changing your
                                    search or filters,
                                    or add a new feedback
                                    item.
                                </p>
                            </div>
                        ) : (
                            feedback.map(
                                (item) => (
                                    <article
                                        key={
                                            item.id
                                        }
                                        className="grid grid-cols-[minmax(0,2.6fr)_120px_130px_150px_150px] gap-4 border-b border-[#eef0ed] px-5 py-5 transition hover:bg-[#fcfdfb]"
                                    >
                                        <div className="min-w-0">
                                            <p className="line-clamp-2 text-sm font-semibold leading-6 text-[#252b2b]">
                                                {
                                                    item.content
                                                }
                                            </p>

                                            {item.summary ? (
                                                <p className="mt-1 line-clamp-1 text-xs leading-5 text-[#8a918e]">
                                                    {
                                                        item.summary
                                                    }
                                                </p>
                                            ) : null}

                                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#89908d]">
                                                <span>
                                                    {formatDate(
                                                        item.createdAt,
                                                    )}
                                                </span>

                                                {item.category ? (
                                                    <>
                                                        <span>
                                                            ·
                                                        </span>
                                                        <span>
                                                            {
                                                                item.category
                                                            }
                                                        </span>
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <span className="rounded-full border border-[#e1e5e1] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#69716d]">
                                                {formatSource(
                                                    item.source,
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-start">
                                            <span
                                                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${sentimentClasses(
                                                    item.sentiment,
                                                )}`}
                                            >
                                                {
                                                    item.sentiment ??
                                                        "Pending"
                                                }
                                            </span>
                                        </div>

                                        <div className="flex items-start">
                                            {item.theme ? (
                                                <span className="max-w-full truncate rounded-full bg-[#f5f7f4] px-2.5 py-1 text-[11px] font-semibold text-[#5e6763]">
                                                    {
                                                        item.theme
                                                    }
                                                </span>
                                            ) : (
                                                <span className="text-xs text-[#9aa19e]">
                                                    Unclassified
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-start">
                                            <select
                                                aria-label={`Status for feedback: ${item.content.slice(
                                                    0,
                                                    50,
                                                )}`}
                                                value={
                                                    item.status
                                                }
                                                disabled={
                                                    mutating ===
                                                    item.id
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    updateStatus(
                                                        item.id,
                                                        event
                                                            .target
                                                            .value as Status,
                                                    )
                                                }
                                                className={`h-9 rounded-lg border px-2.5 text-xs font-semibold outline-none transition focus:border-[#ef765f] disabled:opacity-50 ${statusClasses(
                                                    item.status,
                                                )}`}
                                            >
                                                <option value="NEW">
                                                    New
                                                </option>
                                                <option value="REVIEWED">
                                                    Reviewed
                                                </option>
                                                <option value="ACTIONED">
                                                    Actioned
                                                </option>
                                            </select>
                                        </div>
                                    </article>
                                ),
                            )
                        )}
                    </div>

                    <div className="md:hidden">
                        {loading ? (
                            <div className="space-y-3 p-4">
                                {Array.from({
                                    length: 5,
                                }).map(
                                    (_, index) => (
                                        <div
                                            key={
                                                index
                                            }
                                            className="animate-pulse rounded-2xl border border-[#eef0ed] p-4"
                                        >
                                            <div className="h-4 w-11/12 rounded bg-[#edf0ec]" />
                                            <div className="mt-2 h-4 w-4/5 rounded bg-[#edf0ec]" />
                                            <div className="mt-4 h-6 w-20 rounded-full bg-[#edf0ec]" />
                                        </div>
                                    ),
                                )}
                            </div>
                        ) : feedback.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2f4f1] text-[#8b928f]">
                                    <Search
                                        size={21}
                                    />
                                </div>

                                <h2 className="mt-4 text-base font-bold">
                                    No feedback found
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-[#78807d]">
                                    Try a different
                                    search or filter.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 p-4">
                                {feedback.map(
                                    (item) => (
                                        <article
                                            key={
                                                item.id
                                            }
                                            className="rounded-2xl border border-[#e6e9e4] bg-white p-4"
                                        >
                                            <div className="flex flex-wrap gap-2">
                                                <span className="rounded-full border border-[#e1e5e1] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#69716d]">
                                                    {formatSource(
                                                        item.source,
                                                    )}
                                                </span>

                                                <span
                                                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${sentimentClasses(
                                                        item.sentiment,
                                                    )}`}
                                                >
                                                    {
                                                        item.sentiment ??
                                                            "Pending"
                                                    }
                                                </span>
                                            </div>

                                            <p className="mt-3 text-sm font-semibold leading-6 text-[#252b2b]">
                                                {
                                                    item.content
                                                }
                                            </p>

                                            {item.summary ? (
                                                <p className="mt-2 text-xs leading-5 text-[#78807d]">
                                                    {
                                                        item.summary
                                                    }
                                                </p>
                                            ) : null}

                                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                                {item.theme ? (
                                                    <span className="rounded-full bg-[#f5f7f4] px-2.5 py-1 text-[11px] font-semibold text-[#5e6763]">
                                                        {
                                                            item.theme
                                                        }
                                                    </span>
                                                ) : null}

                                                {item.category ? (
                                                    <span className="rounded-full bg-[#eef6fa] px-2.5 py-1 text-[11px] font-semibold text-[#3d718d]">
                                                        {
                                                            item.category
                                                        }
                                                    </span>
                                                ) : null}

                                                <span className="text-[11px] text-[#9aa19e]">
                                                    {formatDate(
                                                        item.createdAt,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="mt-4 border-t border-[#eef0ed] pt-4">
                                                <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#818985]">
                                                    Status
                                                    <select
                                                        value={
                                                            item.status
                                                        }
                                                        disabled={
                                                            mutating ===
                                                            item.id
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            updateStatus(
                                                                item.id,
                                                                event
                                                                    .target
                                                                    .value as Status,
                                                            )
                                                        }
                                                        className={`mt-2 h-10 w-full rounded-xl border px-3 text-sm font-semibold outline-none focus:border-[#ef765f] disabled:opacity-50 ${statusClasses(
                                                            item.status,
                                                        )}`}
                                                    >
                                                        <option value="NEW">
                                                            New
                                                        </option>
                                                        <option value="REVIEWED">
                                                            Reviewed
                                                        </option>
                                                        <option value="ACTIONED">
                                                            Actioned
                                                        </option>
                                                    </select>
                                                </label>
                                            </div>
                                        </article>
                                    ),
                                )}
                            </div>
                        )}
                    </div>

                    {pagination &&
                    !loading &&
                    pagination.total > 0 ? (
                        <footer className="flex flex-col gap-3 border-t border-[#e6e9e4] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                            <p className="text-xs text-[#78807d]">
                                Showing{" "}
                                <span className="font-semibold text-[#4f5753]">
                                    {(pagination.page -
                                        1) *
                                        pagination.pageSize +
                                        1}
                                </span>{" "}
                                to{" "}
                                <span className="font-semibold text-[#4f5753]">
                                    {Math.min(
                                        pagination.page *
                                            pagination.pageSize,
                                        pagination.total,
                                    )}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-[#4f5753]">
                                    {pagination.total}
                                </span>{" "}
                                feedback items
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setPage(
                                            (
                                                current,
                                            ) =>
                                                Math.max(
                                                    1,
                                                    current -
                                                        1,
                                                ),
                                        )
                                    }
                                    disabled={
                                        !pagination.hasPrevious
                                    }
                                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#e0e4df] bg-white px-3 text-xs font-semibold text-[#66706c] transition hover:bg-[#fafbf9] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft
                                        size={15}
                                    />
                                    Previous
                                </button>

                                <span className="min-w-20 text-center text-xs font-semibold text-[#616965]">
                                    Page{" "}
                                    {
                                        pagination.page
                                    }{" "}
                                    /{" "}
                                    {
                                        pagination.totalPages
                                    }
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPage(
                                            (
                                                current,
                                            ) =>
                                                pagination.hasNext
                                                    ? current +
                                                      1
                                                    : current,
                                        )
                                    }
                                    disabled={
                                        !pagination.hasNext
                                    }
                                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#e0e4df] bg-white px-3 text-xs font-semibold text-[#66706c] transition hover:bg-[#fafbf9] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                    <ChevronRight
                                        size={15}
                                    />
                                </button>
                            </div>
                        </footer>
                    ) : null}
                </section>
            </div>

            {showComposer ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#252b2b]/30 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="add-feedback-title"
                    onMouseDown={(
                        event,
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setShowComposer(
                                false,
                            );
                        }
                    }}
                >
                    <form
                        onSubmit={
                            createFeedback
                        }
                        className="w-full max-w-xl rounded-2xl border border-[#e6e9e4] bg-white p-5 shadow-2xl sm:p-6"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ef765f]">
                                    Customer Voice
                                </p>

                                <h2
                                    id="add-feedback-title"
                                    className="mt-1 text-xl font-bold"
                                >
                                    Add feedback
                                </h2>

                                <p className="mt-1 text-sm text-[#78807d]">
                                    New feedback will be
                                    classified by AI after
                                    ingestion.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowComposer(
                                        false,
                                    )
                                }
                                aria-label="Close add feedback"
                                className="rounded-lg p-2 text-[#7d8581] transition hover:bg-[#f3f4f2] hover:text-[#252b2b]"
                            >
                                <X
                                    size={18}
                                />
                            </button>
                        </div>

                        <div className="mt-6">
                            <label className="text-sm font-semibold text-[#3f4743]">
                                Feedback
                                <textarea
                                    value={
                                        composerContent
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setComposerContent(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    required
                                    maxLength={
                                        10000
                                    }
                                    rows={7}
                                    placeholder="What did the customer say?"
                                    className="mt-2 w-full resize-none rounded-xl border border-[#dfe4df] bg-[#fbfcfa] px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-[#a0a7a4] focus:border-[#ef765f] focus:ring-2 focus:ring-[#ef765f]/10"
                                />
                            </label>

                            <div className="mt-1 text-right text-[11px] text-[#929995]">
                                {
                                    composerContent.length
                                }{" "}
                                / 10,000
                            </div>
                        </div>

                        <label className="mt-5 block text-sm font-semibold text-[#3f4743]">
                            Channel
                            <select
                                value={
                                    composerSource
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setComposerSource(
                                        event
                                            .target
                                            .value as Source,
                                    )
                                }
                                className="mt-2 h-11 w-full rounded-xl border border-[#dfe4df] bg-white px-3 text-sm font-medium outline-none focus:border-[#ef765f]"
                            >
                                <option value="MANUAL">
                                    Manual
                                </option>
                                <option value="CSV">
                                    CSV
                                </option>
                                <option value="API">
                                    API
                                </option>
                                <option value="OTHER">
                                    Other
                                </option>
                            </select>
                        </label>

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowComposer(
                                        false,
                                    )
                                }
                                className="h-10 rounded-xl border border-[#e0e4df] bg-white px-4 text-sm font-semibold text-[#67706c] transition hover:bg-[#fafbf9]"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    composerLoading
                                }
                                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#ef765f] px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {composerLoading ? (
                                    <>
                                        <RefreshCw
                                            size={
                                                15
                                            }
                                            className="animate-spin"
                                        />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Plus
                                            size={
                                                15
                                            }
                                        />
                                        Save feedback
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}
        </main>
    );
}