// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";

// type Report = {
//     id: string;
//     title: string;
//     periodStart: string;
//     periodEnd: string;
//     executiveSummary: string;
//     themeSummary: string;
//     sentimentSummary: string;
//     keyQuotes: string[];
//     recommendedActions: string;
//     createdAt: string;
// };

// export default function ReportsPage() {
//     const [days, setDays] = useState("30");
//     const [reports, setReports] = useState<Report[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [message, setMessage] = useState("");

//     async function loadReports() {
//         const response = await fetch("/api/reports");
//         const data = await response.json();

//         if (response.ok) {
//             setReports(data.reports);
//         }
//     }

//     useEffect(() => {
//         loadReports();
//     }, []);

//     async function generateReport() {
//         setLoading(true);
//         setMessage("Generating Voice-of-Customer report...");

//         try {
//             const response = await fetch("/api/reports", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     days,
//                 }),
//             });

//             const data = await response.json();

//             if (!response.ok) {
//                 setMessage(data.error ?? "Failed to generate report.");
//                 return;
//             }

//             setMessage("Report generated successfully.");
//             await loadReports();
//         } catch {
//             setMessage("Something went wrong.");
//         } finally {
//             setLoading(false);
//         }
//     }

//     return (
//         <main className="min-h-screen p-8">
//             <div className="mx-auto max-w-5xl">
//                 <Link
//                     href="/dashboard"
//                     className="text-sm text-gray-400"
//                 >
//                     ← Back to Dashboard
//                 </Link>

//                 <h1 className="mt-6 text-3xl font-bold">
//                     Voice of Customer Reports
//                 </h1>

//                 <p className="mt-2 text-gray-400">
//                     Generate AI-powered summaries from customer feedback.
//                 </p>

//                 <div className="mt-8 rounded-xl border p-6">
//                     <h2 className="text-xl font-semibold">
//                         Generate Report
//                     </h2>

//                     <select
//                         value={days}
//                         onChange={(event) =>
//                             setDays(event.target.value)
//                         }
//                         className="mt-4 rounded-lg border p-3"
//                     >
//                         <option value="7">
//                             Last 7 days
//                         </option>
//                         <option value="30">
//                             Last 30 days
//                         </option>
//                         <option value="90">
//                             Last 90 days
//                         </option>
//                         <option value="all">
//                             All feedback
//                         </option>
//                     </select>

//                     <br />

//                     <button
//                         type="button"
//                         onClick={generateReport}
//                         disabled={loading}
//                         className="mt-4 rounded-lg bg-white px-5 py-3 font-medium text-black disabled:opacity-50"
//                     >
//                         {loading
//                             ? "Generating..."
//                             : "Generate VoC Report"}
//                     </button>

//                     {message && (
//                         <p className="mt-4 text-sm text-gray-400">
//                             {message}
//                         </p>
//                     )}
//                 </div>

//                 <div className="mt-8 space-y-6">
//                     {reports.map((report) => (
//                         <article
//                             key={report.id}
//                             className="rounded-xl border p-6"
//                         >
//                             <h2 className="text-xl font-semibold">
//                                 {report.title}
//                             </h2>

//                             <p className="mt-2 text-sm text-gray-500">
//                                 Created{" "}
//                                 {new Date(
//                                     report.createdAt
//                                 ).toLocaleString()}
//                             </p>

//                             <button
//                                 type="button"
//                                 onClick={() => window.print()}
//                                 className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium"
//                             >
//                                 Export / Save as PDF
//                             </button>

//                             <section className="mt-6">
//                                 <h3 className="font-semibold">
//                                     Executive Summary
//                                 </h3>

//                                 <p className="mt-2 text-gray-300">
//                                     {report.executiveSummary}
//                                 </p>
//                             </section>

//                             <section className="mt-6">
//                                 <h3 className="font-semibold">
//                                     Themes
//                                 </h3>

//                                 <p className="mt-2 text-gray-300">
//                                     {report.themeSummary}
//                                 </p>
//                             </section>

//                             <section className="mt-6">
//                                 <h3 className="font-semibold">
//                                     Sentiment
//                                 </h3>

//                                 <p className="mt-2 text-gray-300">
//                                     {report.sentimentSummary}
//                                 </p>
//                             </section>

//                             <section className="mt-6">
//                                 <h3 className="font-semibold">
//                                     Key Customer Quotes
//                                 </h3>

//                                 <div className="mt-3 space-y-2">
//                                     {report.keyQuotes.map(
//                                         (quote, index) => (
//                                             <p
//                                                 key={index}
//                                                 className="rounded-lg border p-3 text-gray-300"
//                                             >
//                                                 &ldquo;{quote}&rdquo;
//                                             </p>
//                                         )
//                                     )}
//                                 </div>
//                             </section>

//                             <section className="mt-6">
//                                 <h3 className="font-semibold">
//                                     Recommended Actions
//                                 </h3>

//                                 <p className="mt-2 whitespace-pre-wrap text-gray-300">
//                                     {report.recommendedActions}
//                                 </p>
//                             </section>
//                         </article>
//                     ))}
//                 </div>
//             </div>
//         </main>
//     );
// }

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Report = {
    id: string;
    title: string;
    periodStart: string;
    periodEnd: string;
    executiveSummary: string;
    themeSummary: string;
    sentimentSummary: string;
    keyQuotes: string[];
    recommendedActions: string;
    createdAt: string;
};

export default function ReportsPage() {
    const [days, setDays] = useState("30");
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function loadReports() {
        try {
            const response = await fetch("/api/reports");
            const data = await response.json();

            if (response.ok) {
                setReports(data.reports);
            }
        } catch {
            setMessage("Failed to load reports.");
        }
    }

    useEffect(() => {
        loadReports();
    }, []);

    async function generateReport() {
        setLoading(true);
        setMessage("Generating Voice-of-Customer report...");

        try {
            const response = await fetch("/api/reports", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    days,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.error ?? "Failed to generate report."
                );
                return;
            }

            setMessage("Report generated successfully.");
            await loadReports();
        } catch {
            setMessage("Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    async function exportReportPdf(reportId: string) {
        try {
            setMessage("Generating PDF...");

            const response = await fetch(
                `/api/reports/${reportId}/pdf`
            );

            if (!response.ok) {
                setMessage("Failed to generate PDF.");
                return;
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download = "Project-LOOP-VoC-Report.pdf";

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

            setMessage("PDF downloaded successfully.");
        } catch {
            setMessage(
                "Something went wrong while exporting PDF."
            );
        }
    }

    return (
        <main className="min-h-screen bg-[#0b0f0e] px-6 py-10 text-white md:px-10">
            <div className="mx-auto max-w-5xl">
                <div className="no-print mb-8">
                    <Link
                        href="/dashboard"
                        className="text-sm text-gray-400 transition hover:text-white"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

                <header className="report-cover rounded-3xl border border-[#29352f] bg-linear-to-br from-[#17231e] via-[#101714] to-[#0b0f0e] p-8 shadow-2xl md:p-12">
                    <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="mb-5 inline-flex rounded-full border border-[#3b6b56] bg-[#16291f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8fe0b0]">
                                Project LOOP
                            </div>

                            <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
                                Voice of Customer
                                <span className="block text-[#8fe0b0]">
                                    Intelligence Report
                                </span>
                            </h1>

                            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-400 md:text-lg">
                                AI-generated customer intelligence from
                                your feedback data.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#29352f] bg-[#111916] p-5 md:min-w-52">
                            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                                Report date
                            </p>
                            <p className="mt-2 text-lg font-semibold">
                                {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </header>

                <section className="no-print mt-6 rounded-2xl border border-[#29352f] bg-[#111916] p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-white">
                                Generate Report
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Choose the feedback period for the report.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <select
                                value={days}
                                onChange={(event) =>
                                    setDays(event.target.value)
                                }
                                className="rounded-xl border border-[#344239] bg-[#0b0f0e] px-4 py-3 text-sm text-white outline-none"
                            >
                                <option value="7">
                                    Last 7 days
                                </option>
                                <option value="30">
                                    Last 30 days
                                </option>
                                <option value="90">
                                    Last 90 days
                                </option>
                                <option value="all">
                                    All feedback
                                </option>
                            </select>

                            <button
                                type="button"
                                onClick={generateReport}
                                disabled={loading}
                                className="rounded-xl bg-[#8fe0b0] px-5 py-3 text-sm font-bold text-[#07100b] transition hover:bg-[#a7e9c1] disabled:opacity-50"
                            >
                                {loading
                                    ? "Generating..."
                                    : "Generate VoC Report"}
                            </button>
                        </div>
                    </div>

                    {message && (
                        <p className="mt-4 text-sm text-gray-400">
                            {message}
                        </p>
                    )}
                </section>

                <div className="mt-8 space-y-8">
                    {reports.map((report) => (
                        <article
                            key={report.id}
                            className="voc-report overflow-hidden rounded-3xl border border-[#29352f] bg-[#101614] shadow-2xl"
                        >
                            <div className="border-b border-[#29352f] bg-gradient-to-r from-[#173025] to-[#111916] p-8 md:p-10">
                                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8fe0b0]">
                                            Saved report
                                        </p>

                                        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                                            {report.title}
                                        </h2>
                                    </div>

                                    <div className="rounded-2xl border border-[#385244] bg-[#0d1511] px-5 py-4">
                                        <p className="text-xs uppercase tracking-wider text-gray-500">
                                            Generated
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-gray-200">
                                            {new Date(
                                                report.createdAt
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8 p-8 md:p-10">
                                <section className="report-section rounded-2xl border border-[#31443a] bg-[#152019] p-6">
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#8fe0b0]" />
                                        <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[#8fe0b0]">
                                            Executive Summary
                                        </h3>
                                    </div>

                                    <p className="text-base leading-8 text-gray-200">
                                        {report.executiveSummary}
                                    </p>
                                </section>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <section className="report-section rounded-2xl border border-[#303a55] bg-[#111925] p-6">
                                        <div className="mb-4 flex items-center gap-3">
                                            <span className="h-2.5 w-2.5 rounded-full bg-[#7ea8ff]" />
                                            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[#9dbbff]">
                                                Key Themes
                                            </h3>
                                        </div>

                                        <p className="leading-7 text-gray-300">
                                            {report.themeSummary}
                                        </p>
                                    </section>

                                    <section className="report-section rounded-2xl border border-[#493f27] bg-[#1b1911] p-6">
                                        <div className="mb-4 flex items-center gap-3">
                                            <span className="h-2.5 w-2.5 rounded-full bg-[#f3c969]" />
                                            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[#f3d98d]">
                                                Sentiment
                                            </h3>
                                        </div>

                                        <p className="leading-7 text-gray-300">
                                            {report.sentimentSummary}
                                        </p>
                                    </section>
                                </div>

                                <section className="report-section">
                                    <div className="mb-5 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="h-2.5 w-2.5 rounded-full bg-[#c694ff]" />
                                            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[#d0adff]">
                                                Customer Voice
                                            </h3>
                                        </div>

                                        <span className="rounded-full bg-[#241936] px-3 py-1 text-xs text-[#d0adff]">
                                            {report.keyQuotes.length} quotes
                                        </span>
                                    </div>

                                    <div className="grid gap-4">
                                        {report.keyQuotes.map(
                                            (quote, index) => (
                                                <blockquote
                                                    key={index}
                                                    className="quote-card rounded-2xl border border-[#3b3150] bg-[#17131e] p-5"
                                                >
                                                    <p className="text-base leading-7 text-gray-200">
                                                        &ldquo;
                                                        {quote}
                                                        &rdquo;
                                                    </p>

                                                    <p className="mt-3 text-xs uppercase tracking-[0.14em] text-gray-500">
                                                        Customer quote
                                                    </p>
                                                </blockquote>
                                            )
                                        )}
                                    </div>
                                </section>

                                <section className="report-section rounded-2xl border border-[#513631] bg-[#211512] p-6">
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff9b7f]" />
                                        <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[#ffb19a]">
                                            Recommended Actions
                                        </h3>
                                    </div>

                                    <p className="whitespace-pre-wrap leading-8 text-gray-200">
                                        {report.recommendedActions}
                                    </p>
                                </section>

                                <div className="flex items-center justify-between border-t border-[#29352f] pt-6">
                                    <p className="text-xs text-gray-600">
                                        Project LOOP - Voice of Customer
                                        Intelligence
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => exportReportPdf(report.id)}
                                        className="no-print rounded-xl border border-[#425147] px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-[#17211d]"
                                    >
                                        Export PDF
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </main>
    );
}