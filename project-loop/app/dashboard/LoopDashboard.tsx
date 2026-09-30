// "use client";

// import { useEffect, useState } from "react";
// import {
//     Activity,
//     ArrowUpRight,
//     BarChart3,
//     Bell,
//     Bot,
//     CalendarDays,
//     ChevronDown,
//     ChevronRight,
//     CircleHelp,
//     Clock3,
//     Download,
//     FileText,
//     Filter,
//     LayoutDashboard,
//     LifeBuoy,
//     Menu,
//     MessageSquareText,
//     MoreHorizontal,
//     Moon,
//     Plus,
//     Search,
//     Settings,
//     SlidersHorizontal,
//     Sparkles,
//     Sun,
//     Tag,
//     Users,
//     X,
// } from "lucide-react";

// type View =
//     | "Overview"
//     | "Feedback"
//     | "Analytics"
//     | "AI Insights"
//     | "Ask LOOP"
//     | "Reports"
//     | "Team"
//     | "Settings";

// type Source = "MANUAL" | "CSV" | "API" | "OTHER";
// type Sentiment = "positive" | "neutral" | "negative";
// type Status = "NEW" | "REVIEWED" | "ACTIONED";

// type Feedback = {
//     id: string;
//     content: string;
//     source: Source;
//     sentiment: Sentiment | null;
//     sentimentScore: number | null;
//     summary: string | null;
//     theme: string | null;
//     category: string | null;
//     status: Status | string;
//     createdAt: string;
// };

// type FeedbackResponse = {
//     feedback: Feedback[];
//     pagination: {
//         page: number;
//         pageSize: number;
//         total: number;
//         totalPages: number;
//         hasNext: boolean;
//         hasPrevious: boolean;
//     };
//     counts: {
//         ALL: number;
//         NEW: number;
//         REVIEWED: number;
//         ACTIONED: number;
//     };
//     filters: {
//         themes: string[];
//     };
// };

// type AnalyticsSeriesItem = {
//     date: string;
//     label: string;
//     total: number;
//     positive: number;
//     neutral: number;
//     negative: number;
// };

// type AnalyticsResponse = {
//     period: {
//         from: string;
//         to: string;
//         label: string;
//     };
//     summary: {
//         total: number;
//         positive: number;
//         neutral: number;
//         negative: number;
//         averageSentimentScore: number | null;
//     };
//     series: AnalyticsSeriesItem[];
//     sentiment: Array<{
//         sentiment: Sentiment;
//         count: number;
//         percentage: number;
//     }>;
//     themes: Array<{
//         theme: string;
//         count: number;
//     }>;
//     filters: {
//         themes: string[];
//     };
// };

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

// type AskSource = {
//     id?: string;
//     content?: string;
//     summary?: string | null;
//     theme?: string | null;
//     sentiment?: string | null;
//     similarity?: number | null;
// };

// type Props = {
//     userName: string;
//     workspaceName: string;
// };

// const navItems: { label: View; icon: typeof LayoutDashboard }[] = [
//     { label: "Overview", icon: LayoutDashboard },
//     { label: "Feedback", icon: MessageSquareText },
//     { label: "Analytics", icon: BarChart3 },
//     { label: "AI Insights", icon: Sparkles },
//     { label: "Ask LOOP", icon: Bot },
//     { label: "Reports", icon: FileText },
// ];

// const sourceOptions: Array<{ value: Source | ""; label: string }> = [
//     { value: "", label: "All channels" },
//     { value: "MANUAL", label: "Manual" },
//     { value: "CSV", label: "CSV" },
//     { value: "API", label: "API" },
//     { value: "OTHER", label: "Other" },
// ];

// const sentimentOptions: Array<{
//     value: Sentiment | "";
//     label: string;
// }> = [
//         { value: "", label: "All sentiment" },
//         { value: "positive", label: "Positive" },
//         { value: "neutral", label: "Neutral" },
//         { value: "negative", label: "Negative" },
//     ];

// function formatSource(source: Source): string {
//     return source === "MANUAL"
//         ? "Manual"
//         : source === "CSV"
//             ? "CSV"
//             : source === "API"
//                 ? "API"
//                 : "Other";
// }

// function formatSentiment(value: string | null): string {
//     if (!value) return "Unclassified";

//     return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
// }

// function sentimentTone(value: string | null): string {
//     return value === "positive"
//         ? "mint"
//         : value === "negative"
//             ? "coral"
//             : value === "neutral"
//                 ? "yellow"
//                 : "blue";
// }

// function initials(name: string): string {
//     return (
//         name
//             .split(/\s+/)
//             .filter(Boolean)
//             .slice(0, 2)
//             .map((part) => part[0]?.toUpperCase() ?? "")
//             .join("") || "LO"
//     );
// }

// function relativeTime(value: string): string {
//     const created = new Date(value).getTime();

//     if (!Number.isFinite(created)) return "Unknown time";

//     const seconds = Math.max(
//         0,
//         Math.floor((Date.now() - created) / 1000),
//     );

//     if (seconds < 60) return `${seconds}s ago`;

//     const minutes = Math.floor(seconds / 60);

//     if (minutes < 60) return `${minutes}m ago`;

//     const hours = Math.floor(minutes / 60);

//     if (hours < 24) return `${hours}h ago`;

//     const days = Math.floor(hours / 24);

//     return `${days}d ago`;
// }

// function formatDate(value: string): string {
//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) return "Unknown date";

//     return new Intl.DateTimeFormat("en-IN", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//     }).format(date);
// }

// function formatScore(value: number | null): string {
//     if (value === null || !Number.isFinite(value)) return "—";

//     return value.toFixed(2);
// }

// function normalizeReport(value: unknown): Report | null {
//     if (!value || typeof value !== "object") return null;

//     const item = value as Record<string, unknown>;

//     if (
//         typeof item.id !== "string" ||
//         typeof item.title !== "string"
//     ) {
//         return null;
//     }

//     return {
//         id: item.id,
//         title: item.title,
//         periodStart:
//             typeof item.periodStart === "string"
//                 ? item.periodStart
//                 : "",
//         periodEnd:
//             typeof item.periodEnd === "string"
//                 ? item.periodEnd
//                 : "",
//         executiveSummary:
//             typeof item.executiveSummary === "string"
//                 ? item.executiveSummary
//                 : "",
//         themeSummary:
//             typeof item.themeSummary === "string"
//                 ? item.themeSummary
//                 : "",
//         sentimentSummary:
//             typeof item.sentimentSummary === "string"
//                 ? item.sentimentSummary
//                 : "",
//         keyQuotes: Array.isArray(item.keyQuotes)
//             ? item.keyQuotes.filter(
//                 (q): q is string => typeof q === "string",
//             )
//             : [],
//         recommendedActions:
//             typeof item.recommendedActions === "string"
//                 ? item.recommendedActions
//                 : "",
//         createdAt:
//             typeof item.createdAt === "string"
//                 ? item.createdAt
//                 : "",
//     };
// }

// export default function LoopDashboard({
//     userName,
//     workspaceName,
// }: Props) {
//     const [activeView, setActiveView] =
//         useState<View>("Overview");

//     const [isSidebarOpen, setSidebarOpen] = useState(false);
//     const [query, setQuery] = useState("");
//     const [showComposer, setShowComposer] = useState(false);
//     const [isDarkMode, setDarkMode] = useState(false);

//     useEffect(() => {
//         const savedTheme =
//             window.localStorage.getItem("loop-theme");

//         if (savedTheme === "dark") {
//             setDarkMode(true);
//         }
//     }, []);

//     useEffect(() => {
//         window.localStorage.setItem(
//             "loop-theme",
//             isDarkMode ? "dark" : "light",
//         );
//     }, [isDarkMode]);

//     useEffect(() => {
//         if (!showComposer) return;

//         const handleKeyDown = (event: KeyboardEvent) => {
//             if (event.key === "Escape") {
//                 setShowComposer(false);
//             }
//         };

//         window.addEventListener(
//             "keydown",
//             handleKeyDown,
//         );

//         return () => {
//             window.removeEventListener(
//                 "keydown",
//                 handleKeyDown,
//             );
//         };
//     }, [showComposer]);

//     const pageCopy: Record<View, [string, string]> = {
//         Overview: [
//             `Good to see you, ${userName}.`,
//             "Monitor customer voice, spot emerging themes, and turn feedback into actions from one workspace.",
//         ],
//         Feedback: [
//             "Feedback inbox",
//             "Review, route, and resolve the conversations that matter most.",
//         ],
//         Analytics: [
//             "Analytics studio",
//             "Spot the movements behind your customer experience metrics.",
//         ],
//         "AI Insights": [
//             "AI insights",
//             "Patterns and shifts surfaced from the feedback your workspace has collected.",
//         ],
//         "Ask LOOP": [
//             "Ask LOOP",
//             "Your customer intelligence copilot, grounded in real feedback.",
//         ],
//         Reports: [
//             "Voice of Customer",
//             "Turn the signal into a report your whole team can act on.",
//         ],
//         Team: [
//             "Team",
//             "Manage workspace members and their access.",
//         ],
//         Settings: [
//             "Settings",
//             "Keep your workspace preferences and notifications in order.",
//         ],
//     };

//     return (
//         <div
//             className={`app-shell ${isDarkMode
//                     ? "theme-night"
//                     : "theme-day"
//                 }`}
//         >
//             <aside
//                 className={`sidebar ${isSidebarOpen ? "is-open" : ""
//                     }`}
//             >
//                 <div className="brand">
//                     <span className="brand-mark">l</span>
//                     <span>loop</span>
//                 </div>

//                 <div className="workspace-switcher">
//                     <span className="workspace-avatar">
//                         {workspaceName
//                             .slice(0, 1)
//                             .toUpperCase()}
//                     </span>

//                     <span className="workspace-name">
//                         {workspaceName}
//                     </span>

//                     <ChevronDown size={14} />
//                 </div>

//                 <p className="nav-label">Workspace</p>

//                 <nav>
//                     {navItems.map(
//                         ({ label, icon: Icon }) => (
//                             <button
//                                 key={label}
//                                 className={`nav-item ${activeView === label
//                                         ? "active"
//                                         : ""
//                                     }`}
//                                 onClick={() => {
//                                     setActiveView(label);
//                                     setSidebarOpen(false);
//                                 }}
//                             >
//                                 <Icon size={18} />
//                                 <span>{label}</span>

//                                 {label === "AI Insights" && (
//                                     <span className="new-dot" />
//                                 )}
//                             </button>
//                         ),
//                     )}
//                 </nav>

//                 <p className="nav-label nav-label-spaced">
//                     Manage
//                 </p>

//                 <button
//                     className={`nav-item ${activeView === "Team"
//                             ? "active"
//                             : ""
//                         }`}
//                     onClick={() => {
//                         setActiveView("Team");
//                         setSidebarOpen(false);
//                     }}
//                 >
//                     <Users size={18} />
//                     <span>Team</span>
//                 </button>

//                 <button
//                     className={`nav-item ${activeView === "Settings"
//                             ? "active"
//                             : ""
//                         }`}
//                     onClick={() => {
//                         setActiveView("Settings");
//                         setSidebarOpen(false);
//                     }}
//                 >
//                     <Settings size={18} />
//                     <span>Settings</span>
//                 </button>

//                 <div className="sidebar-footer">
//                     <div className="upgrade">
//                         <Sparkles size={17} />

//                         <div>
//                             <strong>LOOP workspace</strong>
//                             <span>
//                                 Customer intelligence
//                             </span>
//                         </div>

//                         <ChevronRight size={15} />
//                     </div>

//                     <div className="profile">
//                         <span className="profile-avatar">
//                             {initials(userName)}
//                         </span>

//                         <div>
//                             <strong>{userName}</strong>
//                             <span>
//                                 Authenticated workspace
//                             </span>
//                         </div>

//                         <button
//                             className="icon-button"
//                             aria-label="Open profile menu"
//                         >
//                             <MoreHorizontal size={17} />
//                         </button>
//                     </div>
//                 </div>
//             </aside>

//             {isSidebarOpen && (
//                 <button
//                     className="drawer-backdrop"
//                     aria-label="Close navigation"
//                     onClick={() =>
//                         setSidebarOpen(false)
//                     }
//                 />
//             )}

//             <main className="main-content">
//                 <header className="topbar">
//                     <button
//                         className="mobile-menu icon-button"
//                         onClick={() =>
//                             setSidebarOpen(!isSidebarOpen)
//                         }
//                         aria-label="Open navigation"
//                     >
//                         <Menu size={20} />
//                     </button>

//                     <div className="breadcrumbs">
//                         <span>{workspaceName}</span>
//                         <ChevronRight size={14} />
//                         <strong>{activeView}</strong>
//                     </div>

//                     <div className="top-actions">
//                         <div className="global-search">
//                             <Search size={17} />

//                             <input
//                                 value={query}
//                                 onChange={(event) =>
//                                     setQuery(
//                                         event.target.value,
//                                     )
//                                 }
//                                 placeholder="Search anything"
//                                 aria-label="Search anything"
//                             />

//                             <kbd>⌘ K</kbd>
//                         </div>

//                         <button
//                             className="icon-button theme-toggle"
//                             onClick={() =>
//                                 setDarkMode(
//                                     (current) =>
//                                         !current,
//                                 )
//                             }
//                             aria-label={
//                                 isDarkMode
//                                     ? "Switch to day view"
//                                     : "Switch to night view"
//                             }
//                             title={
//                                 isDarkMode
//                                     ? "Switch to day view"
//                                     : "Switch to night view"
//                             }
//                         >
//                             {isDarkMode ? (
//                                 <Sun size={18} />
//                             ) : (
//                                 <Moon size={18} />
//                             )}
//                         </button>

//                         <button
//                             className="icon-button notification-button"
//                             aria-label="Notifications"
//                         >
//                             <Bell size={18} />
//                             <span />
//                         </button>

//                         <button
//                             className="help-button"
//                             aria-label="Open help"
//                         >
//                             <CircleHelp size={17} />
//                             Help
//                         </button>
//                     </div>
//                 </header>

//                 <div className="page-container">
//                     <section className="page-heading">
//                         <div>
//                             <p className="eyebrow">
//                                 {activeView === "Overview"
//                                     ? "LIVE CUSTOMER INTELLIGENCE"
//                                     : "CUSTOMER INTELLIGENCE"}
//                             </p>

//                             <h1>
//                                 {pageCopy[activeView][0]}
//                             </h1>

//                             <p>
//                                 {pageCopy[activeView][1]}
//                             </p>
//                         </div>

//                         <div className="heading-actions">
//                             {activeView === "Reports" && (
//                                 <button
//                                     className="button secondary"
//                                     onClick={() =>
//                                         window.scrollTo({
//                                             top: document
//                                                 .body
//                                                 .scrollHeight,
//                                             behavior:
//                                                 "smooth",
//                                         })
//                                     }
//                                 >
//                                     <Download size={16} />
//                                     Saved reports
//                                 </button>
//                             )}

//                             {![
//                                 "Team",
//                                 "Settings",
//                             ].includes(activeView) && (
//                                     <button
//                                         className="button primary"
//                                         onClick={() =>
//                                             setShowComposer(
//                                                 true,
//                                             )
//                                         }
//                                     >
//                                         <Plus size={17} />
//                                         Add feedback
//                                     </button>
//                                 )}
//                         </div>
//                     </section>

//                     {activeView === "Overview" && (
//                         <OverviewView
//                             workspaceName={
//                                 workspaceName
//                             }
//                             onViewFeedback={() =>
//                                 setActiveView(
//                                     "Feedback",
//                                 )
//                             }
//                         />
//                     )}

//                     {activeView === "Feedback" && (
//                         <FeedbackView
//                             workspaceName={
//                                 workspaceName
//                             }
//                         />
//                     )}

//                     {activeView === "Analytics" && (
//                         <AnalyticsView />
//                     )}

//                     {activeView === "AI Insights" && (
//                         <InsightsView
//                             workspaceName={
//                                 workspaceName
//                             }
//                         />
//                     )}

//                     {activeView === "Ask LOOP" && (
//                         <AskView />
//                     )}

//                     {activeView === "Reports" && (
//                         <ReportsView
//                             workspaceName={
//                                 workspaceName
//                             }
//                         />
//                     )}

//                     {activeView === "Team" && (
//                         <TeamView />
//                     )}

//                     {activeView === "Settings" && (
//                         <SettingsView
//                             workspaceName={
//                                 workspaceName
//                             }
//                         />
//                     )}
//                 </div>
//             </main>

//             {showComposer && (
//                 <FeedbackComposer
//                     onClose={() =>
//                         setShowComposer(false)
//                     }
//                 />
//             )}
//         </div>
//     );
// }

// function OverviewView({
//     workspaceName,
//     onViewFeedback,
// }: {
//     workspaceName: string;
//     onViewFeedback: () => void;
// }) {
//     const [analytics, setAnalytics] =
//         useState<AnalyticsResponse | null>(null);

//     const [recent, setRecent] = useState<Feedback[]>(
//         [],
//     );

//     const [newCount, setNewCount] = useState(0);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     // FIX: these states belong to OverviewView
//     const [days, setDays] = useState("30");
//     const [
//         periodMenu,
//         setPeriodMenu,
//     ] = useState<
//         "sentiment" | "issues" | null
//     >(null);

//     useEffect(() => {
//         const controller =
//             new AbortController();

//         async function load() {
//             setLoading(true);
//             setError("");

//             try {
//                 const [
//                     analyticsResponse,
//                     feedbackResponse,
//                 ] = await Promise.all([
//                     fetch(
//                         `/api/dashboard/analytics?days=${days}`,
//                         {
//                             cache: "no-store",
//                             signal:
//                                 controller.signal,
//                         },
//                     ),
//                     fetch(
//                         "/api/feedback?page=1&pageSize=3",
//                         {
//                             cache: "no-store",
//                             signal:
//                                 controller.signal,
//                         },
//                     ),
//                 ]);

//                 const analyticsJson =
//                     (await analyticsResponse.json()) as
//                     | AnalyticsResponse
//                     | { error?: string };

//                 const feedbackJson =
//                     (await feedbackResponse.json()) as
//                     | FeedbackResponse
//                     | { error?: string };

//                 if (!analyticsResponse.ok) {
//                     throw new Error(
//                         "error" in analyticsJson &&
//                             analyticsJson.error
//                             ? analyticsJson.error
//                             : "Failed to load analytics",
//                     );
//                 }

//                 if (!feedbackResponse.ok) {
//                     throw new Error(
//                         "error" in feedbackJson &&
//                             feedbackJson.error
//                             ? feedbackJson.error
//                             : "Failed to load feedback",
//                     );
//                 }

//                 setAnalytics(
//                     analyticsJson as AnalyticsResponse,
//                 );

//                 const result =
//                     feedbackJson as FeedbackResponse;

//                 setRecent(result.feedback);
//                 setNewCount(result.counts.NEW);
//             } catch (fetchError) {
//                 if (
//                     fetchError instanceof
//                     DOMException &&
//                     fetchError.name === "AbortError"
//                 ) {
//                     return;
//                 }

//                 setError(
//                     fetchError instanceof Error
//                         ? fetchError.message
//                         : "Failed to load overview",
//                 );
//             } finally {
//                 setLoading(false);
//             }
//         }

//         void load();

//         return () => controller.abort();
//     }, [days]);

//     if (loading) {
//         return (
//             <div className="content-grid">
//                 <div className="panel">
//                     <PanelHead
//                         title="Loading workspace intelligence"
//                         meta=""
//                     />

//                     <div className="empty-state">
//                         Loading real feedback and
//                         analytics…
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     if (error || !analytics) {
//         return (
//             <div className="content-grid">
//                 <div className="panel">
//                     <PanelHead
//                         title="Overview unavailable"
//                         meta=""
//                     />

//                     <div className="empty-state">
//                         <strong>
//                             {error ||
//                                 "No analytics data available."}
//                         </strong>

//                         <span>
//                             Check the backend session and
//                             try again.
//                         </span>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     const {
//         summary,
//         sentiment,
//         series,
//         themes,
//     } = analytics;

//     const positivePct = summary.total
//         ? Math.round(
//             (summary.positive /
//                 summary.total) *
//             100,
//         )
//         : 0;

//     const negativePct = summary.total
//         ? Math.round(
//             (summary.negative /
//                 summary.total) *
//             100,
//         )
//         : 0;

//     const neutralPct = Math.max(
//         0,
//         100 -
//         positivePct -
//         negativePct,
//     );

//     const periodNote =
//         days === "7"
//             ? "In the last 7 days"
//             : days === "90"
//                 ? "In the last 90 days"
//                 : "In the last 30 days";

//     const handlePeriodChange = (
//         value: string,
//     ) => {
//         setDays(value);
//         setPeriodMenu(null);
//     };

//     return (
//         <div className="content-grid">
//             <div className="metrics-row">
//                 <Metric
//                     label="Total feedback"
//                     value={summary.total.toLocaleString()}
//                     change={`${summary.total}`}
//                     icon={
//                         <MessageSquareText size={18} />
//                     }
//                     tone="coral"
//                     note={periodNote}
//                 />

//                 <Metric
//                     label="Positive feedback"
//                     value={summary.positive.toLocaleString()}
//                     change={`${positivePct}%`}
//                     icon={<Activity size={18} />}
//                     tone="mint"
//                     note="Share of feedback"
//                 />

//                 <Metric
//                     label="Negative feedback"
//                     value={summary.negative.toLocaleString()}
//                     change={`${negativePct}%`}
//                     icon={<BarChart3 size={18} />}
//                     tone="blue"
//                     note="Share of feedback"
//                 />

//                 <Metric
//                     label="New feedback"
//                     value={newCount.toLocaleString()}
//                     change={`${newCount}`}
//                     icon={<LifeBuoy size={18} />}
//                     tone="yellow"
//                     note="Needs review"
//                 />
//             </div>

//             <div className="dashboard-columns">
//                 <div className="panel trend-panel">
//                     <PanelHead
//                         title="Feedback volume"
//                         meta={analytics.period.label}
//                     />

//                     <div className="chart-legend">
//                         <span>
//                             <i className="legend-dot total-dot" />
//                             Total
//                         </span>

//                         <span>
//                             <i className="legend-dot positive-dot" />
//                             Positive
//                         </span>

//                         <span>
//                             <i className="legend-dot neutral-dot" />
//                             Neutral
//                         </span>

//                         <span>
//                             <i className="legend-dot negative-dot" />
//                             Negative
//                         </span>

//                         <span className="chart-total">
//                             {summary.total.toLocaleString()}{" "}
//                             <small>total</small>
//                         </span>
//                     </div>

//                     <DynamicLineChart
//                         series={series}
//                     />
//                 </div>

//                 <div className="panel sentiment-panel">
//                     <PanelHead
//                         title="Sentiment"
//                         meta="Current period"
//                         onClick={() =>
//                             setPeriodMenu(
//                                 (current) =>
//                                     current ===
//                                         "sentiment"
//                                         ? null
//                                         : "sentiment",
//                             )
//                         }
//                     />

//                     {periodMenu === "sentiment" && (
//                         <PeriodMenu
//                             days={days}
//                             onChange={
//                                 handlePeriodChange
//                             }
//                         />
//                     )}

//                     <div className="donut-wrap">
//                         <div
//                             className="donut"
//                             style={{
//                                 background:
//                                     `conic-gradient(#338f63 0 ${positivePct}%, #d9ddda ${positivePct}% ${positivePct + neutralPct}%, #ef765f ${positivePct + neutralPct}% 100%)`,
//                             }}
//                         >
//                             <div>
//                                 <strong>
//                                     {summary.averageSentimentScore ===
//                                         null
//                                         ? "—"
//                                         : summary.averageSentimentScore.toFixed(
//                                             2,
//                                         )}
//                                 </strong>

//                                 <span>
//                                     avg. score
//                                 </span>
//                             </div>
//                         </div>

//                         <div className="sentiment-list">
//                             {sentiment.map(
//                                 (item) => (
//                                     <span
//                                         key={
//                                             item.sentiment
//                                         }
//                                     >
//                                         <i
//                                             className={`legend-dot ${item.sentiment ===
//                                                     "positive"
//                                                     ? "green-dot"
//                                                     : item.sentiment ===
//                                                         "negative"
//                                                         ? "coral-dot"
//                                                         : "gray-dot"
//                                                 }`}
//                                         />

//                                         {formatSentiment(
//                                             item.sentiment,
//                                         )}

//                                         <b>
//                                             {
//                                                 item.percentage
//                                             }
//                                             %
//                                         </b>
//                                     </span>
//                                 ),
//                             )}
//                         </div>
//                     </div>

//                     <div className="sentiment-foot">
//                         <span>
//                             <ArrowUpRight size={15} />
//                             Data from your workspace
//                         </span>

//                         <button
//                             onClick={
//                                 onViewFeedback
//                             }
//                         >
//                             View feedback
//                             <ChevronRight size={14} />
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             <div className="dashboard-columns lower">
//                 <div className="panel">
//                     <PanelHead
//                         title="Top customer issues"
//                         meta="Current period"
//                         onClick={() =>
//                             setPeriodMenu(
//                                 (current) =>
//                                     current ===
//                                         "issues"
//                                         ? null
//                                         : "issues",
//                             )
//                         }
//                     />

//                     {periodMenu === "issues" && (
//                         <PeriodMenu
//                             days={days}
//                             onChange={
//                                 handlePeriodChange
//                             }
//                         />
//                     )}

//                     <div className="topic-list">
//                         {themes.length ? (
//                             themes
//                                 .slice(0, 4)
//                                 .map(
//                                     (
//                                         topic,
//                                         index,
//                                     ) => (
//                                         <div
//                                             className="topic-row"
//                                             key={
//                                                 topic.theme
//                                             }
//                                         >
//                                             <span
//                                                 className={`topic-number ${[
//                                                         "coral",
//                                                         "yellow",
//                                                         "blue",
//                                                         "mint",
//                                                     ][index]
//                                                     }`}
//                                             >
//                                                 0
//                                                 {index +
//                                                     1}
//                                             </span>

//                                             <div className="topic-main">
//                                                 <div>
//                                                     <strong>
//                                                         {
//                                                             topic.theme
//                                                         }
//                                                     </strong>

//                                                     <span>
//                                                         {
//                                                             topic.count
//                                                         }{" "}
//                                                         mentions
//                                                     </span>
//                                                 </div>

//                                                 <div className="topic-bar">
//                                                     <i
//                                                         style={{
//                                                             width: `${Math.min(
//                                                                 Math.max(
//                                                                     topic.count /
//                                                                     Math.max(
//                                                                         themes[0]
//                                                                             ?.count ??
//                                                                         1,
//                                                                         1,
//                                                                     ),
//                                                                     0,
//                                                                 ) *
//                                                                 96,
//                                                                 96,
//                                                             )
//                                                                 }%`,
//                                                         }}
//                                                     />
//                                                 </div>
//                                             </div>

//                                             <span className="change up">
//                                                 {summary.total
//                                                     ? `${Math.round(
//                                                         (topic.count /
//                                                             summary.total) *
//                                                         100,
//                                                     )}%`
//                                                     : "0%"}
//                                             </span>
//                                         </div>
//                                     ),
//                                 )
//                         ) : (
//                             <div className="empty-state">
//                                 No themes have been
//                                 classified yet.
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 <div className="panel recent-panel">
//                     <PanelHead
//                         title="Recent feedback"
//                         meta="View all"
//                         onClick={
//                             onViewFeedback
//                         }
//                     />

//                     <div className="feedback-list">
//                         {recent.length ? (
//                             recent.map(
//                                 (item) => (
//                                     <FeedbackItem
//                                         key={item.id}
//                                         item={item}
//                                         workspaceName={
//                                             workspaceName
//                                         }
//                                     />
//                                 ),
//                             )
//                         ) : (
//                             <div className="empty-state">
//                                 No feedback found yet.
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// function PeriodMenu({
//     days,
//     onChange,
// }: {
//     days: string;
//     onChange: (value: string) => void;
// }) {
//     return (
//         <div
//             style={{
//                 display: "flex",
//                 gap: 6,
//                 flexWrap: "wrap",
//                 margin: "-4px 0 12px",
//             }}
//         >
//             {[
//                 ["7", "Last 7 days"],
//                 ["30", "Last 30 days"],
//                 ["90", "Last 90 days"],
//             ].map(([value, label]) => (
//                 <button
//                     key={value}
//                     type="button"
//                     className={`button ${days === value
//                             ? "primary"
//                             : "secondary"
//                         }`}
//                     onClick={() => onChange(value)}
//                 >
//                     <CalendarDays size={14} />
//                     {label}
//                 </button>
//             ))}
//         </div>
//     );
// }

// function DynamicLineChart({
//     series,
// }: {
//     series: AnalyticsSeriesItem[];
// }) {
//     if (!series.length) {
//         return (
//             <div className="empty-state">
//                 No time-series feedback data yet.
//             </div>
//         );
//     }

//     const max = Math.max(
//         ...series.map(
//             (point) => point.total,
//         ),
//         1,
//     );

//     const points = series
//         .map((point, index) => {
//             const x =
//                 series.length === 1
//                     ? 0
//                     : (index /
//                         (series.length - 1)) *
//                     650;

//             const y =
//                 180 -
//                 (point.total / max) *
//                 150;

//             return `${x.toFixed(
//                 1,
//             )} ${y.toFixed(1)}`;
//         })
//         .join(" L ");

//     const positivePoints = series
//         .map((point, index) => {
//             const x =
//                 series.length === 1
//                     ? 0
//                     : (index /
//                         (series.length - 1)) *
//                     650;

//             const y =
//                 180 -
//                 (point.positive / max) *
//                 150;

//             return `${x.toFixed(
//                 1,
//             )} ${y.toFixed(1)}`;
//         })
//         .join(" L ");

//     const neutralPoints = series
//         .map((point, index) => {
//             const x =
//                 series.length === 1
//                     ? 0
//                     : (index /
//                         (series.length - 1)) *
//                     650;

//             const y =
//                 180 -
//                 (point.neutral / max) *
//                 150;

//             return `${x.toFixed(
//                 1,
//             )} ${y.toFixed(1)}`;
//         })
//         .join(" L ");

//     const negativePoints = series
//         .map((point, index) => {
//             const x =
//                 series.length === 1
//                     ? 0
//                     : (index /
//                         (series.length - 1)) *
//                     650;

//             const y =
//                 180 -
//                 (point.negative / max) *
//                 150;

//             return `${x.toFixed(
//                 1,
//             )} ${y.toFixed(1)}`;
//         })
//         .join(" L ");

//     const area =
//         `M ${points} L 650 200 L 0 200 Z`;

//     return (
//         <div className="line-chart">
//             <div className="y-labels">
//                 <span>{max}</span>
//                 <span>
//                     {Math.round(max * 0.75)}
//                 </span>
//                 <span>
//                     {Math.round(max * 0.5)}
//                 </span>
//                 <span>
//                     {Math.round(max * 0.25)}
//                 </span>
//                 <span>0</span>
//             </div>

//             <div className="chart-area">
//                 <div className="grid-lines">
//                     <i />
//                     <i />
//                     <i />
//                     <i />
//                     <i />
//                 </div>

//                 <svg
//                     viewBox="0 0 650 200"
//                     preserveAspectRatio="none"
//                     aria-label="Feedback trend"
//                 >
//                     <path
//                         className="line-fill"
//                         d={area}
//                     />

//                     <path
//                         className="positive-line"
//                         d={`M ${positivePoints}`}
//                     />

//                     <path
//                         className="neutral-line"
//                         d={`M ${neutralPoints}`}
//                     />

//                     <path
//                         className="negative-line"
//                         d={`M ${negativePoints}`}
//                     />

//                     <path
//                         className="total-line"
//                         d={`M ${points}`}
//                     />
//                 </svg>

//                 <div className="x-labels">
//                     {series
//                         .filter(
//                             (_, index) =>
//                                 index %
//                                 Math.max(
//                                     1,
//                                     Math.ceil(
//                                         series.length /
//                                         5,
//                                     ),
//                                 ) ===
//                                 0 ||
//                                 index ===
//                                 series.length -
//                                 1,
//                         )
//                         .slice(0, 6)
//                         .map((point) => (
//                             <span
//                                 key={point.date}
//                             >
//                                 {point.label}
//                             </span>
//                         ))}
//                 </div>
//             </div>
//         </div>
//     );
// }

// function Metric({
//     label,
//     value,
//     change,
//     icon,
//     tone,
//     note,
// }: {
//     label: string;
//     value: string;
//     change: string;
//     icon: React.ReactNode;
//     tone: string;
//     note: string;
// }) {
//     return (
//         <div className="metric-card">
//             <div
//                 className={`metric-icon ${tone}`}
//             >
//                 {icon}
//             </div>

//             <span className="metric-label">
//                 {label}
//             </span>

//             <strong className="metric-value">
//                 {value}
//             </strong>

//             <span className="metric-change up">
//                 {change} <small>{note}</small>
//             </span>
//         </div>
//     );
// }

// function PanelHead({
//     title,
//     meta,
//     onClick,
// }: {
//     title: string;
//     meta: string;
//     onClick?: () => void;
// }) {
//     return (
//         <div className="panel-head">
//             <h2>{title}</h2>

//             {meta ? (
//                 onClick ? (
//                     <button
//                         type="button"
//                         onClick={onClick}
//                     >
//                         {meta}
//                         <ChevronRight size={14} />
//                     </button>
//                 ) : (
//                     <span className="panel-meta">
//                         {meta}
//                     </span>
//                 )
//             ) : (
//                 <span />
//             )}
//         </div>
//     );
// }

// function FeedbackItem({
//     item,
//     workspaceName,
// }: {
//     item: Feedback;
//     workspaceName: string;
// }) {
//     const displayText =
//         item.summary?.trim() ||
//         item.content;

//     return (
//         <div className="feedback-item">
//             <span
//                 className={`person-avatar ${sentimentTone(
//                     item.sentiment,
//                 )}`}
//             >
//                 {initials("Customer")}
//             </span>

//             <div className="feedback-copy">
//                 <div>
//                     <strong>Customer</strong>

//                     <span>
//                         {workspaceName} ·{" "}
//                         {relativeTime(
//                             item.createdAt,
//                         )}
//                     </span>
//                 </div>

//                 <p>{displayText}</p>

//                 <div className="feedback-meta">
//                     <span
//                         className={`sentiment-pill ${(
//                             item.sentiment ??
//                             "neutral"
//                         ).toLowerCase()}`}
//                     >
//                         {formatSentiment(
//                             item.sentiment,
//                         )}
//                     </span>

//                     <span className="source-pill">
//                         {formatSource(
//                             item.source,
//                         )}
//                     </span>

//                     {item.theme && (
//                         <span className="tag-pill">
//                             <Tag size={12} />
//                             {item.theme}
//                         </span>
//                     )}
//                 </div>
//             </div>

//             <button
//                 className="more-button"
//                 aria-label="More actions"
//             >
//                 <MoreHorizontal size={17} />
//             </button>
//         </div>
//     );
// }

// function FeedbackView({
//     workspaceName,
// }: {
//     workspaceName: string;
// }) {
//     const [feedback, setFeedback] =
//         useState<Feedback[]>([]);

//     const [pagination, setPagination] =
//         useState<
//             FeedbackResponse["pagination"] | null
//         >(null);

//     const [counts, setCounts] =
//         useState<
//             FeedbackResponse["counts"]
//         >({
//             ALL: 0,
//             NEW: 0,
//             REVIEWED: 0,
//             ACTIONED: 0,
//         });

//     const [themes, setThemes] =
//         useState<string[]>([]);

//     const [search, setSearch] =
//         useState("");

//     const [source, setSource] =
//         useState<Source | "">("");

//     const [sentiment, setSentiment] =
//         useState<Sentiment | "">("");

//     const [theme, setTheme] =
//         useState("");

//     const [status, setStatus] =
//         useState<"" | Status>("");

//     const [page, setPage] =
//         useState(1);

//     const [showFilters, setShowFilters] =
//         useState(false);

//     const [loading, setLoading] =
//         useState(true);

//     const [error, setError] =
//         useState("");

//     // Removed incorrect unused Overview-only period state here.

//     const [message, setMessage] =
//         useState("");

//     const [mutating, setMutating] =
//         useState("");

//     useEffect(() => {
//         const controller =
//             new AbortController();

//         const timer = window.setTimeout(
//             async () => {
//                 setLoading(true);
//                 setError("");

//                 try {
//                     const params =
//                         new URLSearchParams({
//                             page: String(page),
//                             pageSize: "20",
//                         });

//                     if (search.trim()) {
//                         params.set(
//                             "q",
//                             search.trim(),
//                         );
//                     }

//                     if (source) {
//                         params.set(
//                             "source",
//                             source,
//                         );
//                     }

//                     if (sentiment) {
//                         params.set(
//                             "sentiment",
//                             sentiment,
//                         );
//                     }

//                     if (theme) {
//                         params.set(
//                             "theme",
//                             theme,
//                         );
//                     }

//                     if (status) {
//                         params.set(
//                             "status",
//                             status,
//                         );
//                     }

//                     const response =
//                         await fetch(
//                             `/api/feedback?${params.toString()}`,
//                             {
//                                 cache: "no-store",
//                                 signal:
//                                     controller.signal,
//                             },
//                         );

//                     const data =
//                         (await response.json()) as
//                         | FeedbackResponse
//                         | {
//                             error?: string;
//                         };

//                     if (!response.ok) {
//                         throw new Error(
//                             "error" in data &&
//                                 data.error
//                                 ? data.error
//                                 : "Failed to load feedback",
//                         );
//                     }

//                     const result =
//                         data as FeedbackResponse;

//                     setFeedback(
//                         result.feedback,
//                     );

//                     setPagination(
//                         result.pagination,
//                     );

//                     setCounts(
//                         result.counts,
//                     );

//                     setThemes(
//                         result.filters
//                             .themes,
//                     );
//                 } catch (
//                 fetchError
//                 ) {
//                     if (
//                         fetchError instanceof
//                         DOMException &&
//                         fetchError.name ===
//                         "AbortError"
//                     ) {
//                         return;
//                     }

//                     setError(
//                         fetchError instanceof
//                             Error
//                             ? fetchError.message
//                             : "Failed to load feedback",
//                     );
//                 } finally {
//                     setLoading(false);
//                 }
//             },
//             250,
//         );

//         return () => {
//             window.clearTimeout(timer);
//             controller.abort();
//         };
//     }, [
//         page,
//         search,
//         source,
//         sentiment,
//         theme,
//         status,
//     ]);

//     async function updateStatus(
//         id: string,
//         nextStatus: Status,
//     ) {
//         setMutating(id);
//         setError("");
//         setMessage("");

//         try {
//             const response =
//                 await fetch(
//                     "/api/feedback",
//                     {
//                         method: "PATCH",
//                         headers: {
//                             "Content-Type":
//                                 "application/json",
//                         },
//                         body: JSON.stringify({
//                             id,
//                             status: nextStatus,
//                         }),
//                     },
//                 );

//             const data =
//                 (await response.json()) as {
//                     feedback?: Feedback;
//                     error?: string;
//                 };

//             if (!response.ok) {
//                 throw new Error(
//                     data.error ??
//                     "Failed to update status",
//                 );
//             }

//             if (data.feedback) {
//                 setFeedback(
//                     (current) =>
//                         current.map(
//                             (item) =>
//                                 item.id === id
//                                     ? data.feedback!
//                                     : item,
//                         ),
//                 );
//             }

//             setMessage(
//                 "Feedback status updated.",
//             );

//             window.setTimeout(
//                 () => setMessage(""),
//                 2200,
//             );
//         } catch (
//         mutationError
//         ) {
//             setError(
//                 mutationError instanceof
//                     Error
//                     ? mutationError.message
//                     : "Failed to update status",
//             );
//         } finally {
//             setMutating("");
//         }
//     }

//     function clearFilters() {
//         setSearch("");
//         setSource("");
//         setSentiment("");
//         setTheme("");
//         setStatus("");
//         setPage(1);
//     }

//     const hasFilters =
//         Boolean(
//             search ||
//             source ||
//             sentiment ||
//             theme ||
//             status,
//         );

//     return (
//         <div className="content-grid">
//             <div className="feedback-toolbar">
//                 <div className="inbox-tabs">
//                     {(
//                         [
//                             "",
//                             "NEW",
//                             "REVIEWED",
//                             "ACTIONED",
//                         ] as const
//                     ).map((value) => {
//                         const label =
//                             value === ""
//                                 ? "All feedback"
//                                 : value ===
//                                     "NEW"
//                                     ? "New"
//                                     : value ===
//                                         "REVIEWED"
//                                         ? "Reviewed"
//                                         : "Actioned";

//                         const count =
//                             value === ""
//                                 ? counts.ALL
//                                 : counts[value];

//                         return (
//                             <button
//                                 key={
//                                     value ||
//                                     "all"
//                                 }
//                                 className={
//                                     status ===
//                                         value
//                                         ? "selected"
//                                         : ""
//                                 }
//                                 onClick={() => {
//                                     setStatus(
//                                         value,
//                                     );
//                                     setPage(1);
//                                 }}
//                             >
//                                 {label}{" "}
//                                 <span>
//                                     {count}
//                                 </span>
//                             </button>
//                         );
//                     })}
//                 </div>

//                 <div className="filter-actions">
//                     <div className="table-search">
//                         <Search size={16} />

//                         <input
//                             value={search}
//                             onChange={(event) => {
//                                 setSearch(
//                                     event.target
//                                         .value,
//                                 );
//                                 setPage(1);
//                             }}
//                             placeholder="Search feedback"
//                             aria-label="Search feedback"
//                         />
//                     </div>

//                     <button
//                         className={`button secondary ${showFilters
//                                 ? "is-active"
//                                 : ""
//                             }`}
//                         onClick={() =>
//                             setShowFilters(
//                                 (current) =>
//                                     !current,
//                             )
//                         }
//                         aria-expanded={
//                             showFilters
//                         }
//                     >
//                         <Filter size={15} />
//                         Filters
//                     </button>

//                     <button
//                         className="icon-button"
//                         aria-label="Open feedback display settings"
//                     >
//                         <SlidersHorizontal
//                             size={17}
//                         />
//                     </button>

//                     {showFilters && (
//                         <select
//                             className="filter-select"
//                             value={sentiment}
//                             onChange={(
//                                 event,
//                             ) => {
//                                 setSentiment(
//                                     event.target
//                                         .value as
//                                     | Sentiment
//                                     | "",
//                                 );
//                                 setPage(1);
//                             }}
//                             aria-label="Filter by sentiment"
//                         >
//                             {sentimentOptions.map(
//                                 (option) => (
//                                     <option
//                                         key={
//                                             option.value
//                                         }
//                                         value={
//                                             option.value
//                                         }
//                                     >
//                                         {
//                                             option.label
//                                         }
//                                     </option>
//                                 ),
//                             )}
//                         </select>
//                     )}

//                     {showFilters && (
//                         <select
//                             className="filter-select"
//                             value={source}
//                             onChange={(
//                                 event,
//                             ) => {
//                                 setSource(
//                                     event.target
//                                         .value as
//                                     | Source
//                                     | "",
//                                 );
//                                 setPage(1);
//                             }}
//                             aria-label="Filter by source"
//                         >
//                             {sourceOptions.map(
//                                 (option) => (
//                                     <option
//                                         key={
//                                             option.value
//                                         }
//                                         value={
//                                             option.value
//                                         }
//                                     >
//                                         {
//                                             option.label
//                                         }
//                                     </option>
//                                 ),
//                             )}
//                         </select>
//                     )}

//                     {showFilters && (
//                         <select
//                             className="filter-select"
//                             value={theme}
//                             onChange={(
//                                 event,
//                             ) => {
//                                 setTheme(
//                                     event.target
//                                         .value,
//                                 );
//                                 setPage(1);
//                             }}
//                             aria-label="Filter by theme"
//                         >
//                             <option value="">
//                                 All themes
//                             </option>

//                             {themes.map(
//                                 (item) => (
//                                     <option
//                                         key={
//                                             item
//                                         }
//                                         value={
//                                             item
//                                         }
//                                     >
//                                         {item}
//                                     </option>
//                                 ),
//                             )}
//                         </select>
//                     )}

//                     {hasFilters && (
//                         <button
//                             className="text-button"
//                             onClick={
//                                 clearFilters
//                             }
//                         >
//                             Clear
//                         </button>
//                     )}
//                 </div>
//             </div>

//             {(error || message) && (
//                 <div
//                     className="insight-banner"
//                     role={
//                         error
//                             ? "alert"
//                             : "status"
//                     }
//                 >
//                     <div>
//                         <p className="eyebrow">
//                             {error
//                                 ? "ERROR"
//                                 : "UPDATED"}
//                         </p>

//                         <p>
//                             {error ||
//                                 message}
//                         </p>
//                     </div>
//                 </div>
//             )}

//             <div className="panel feedback-table">
//                 <div className="table-head">
//                     <span>Customer</span>
//                     <span>Feedback</span>
//                     <span>Sentiment</span>
//                     <span>Source</span>
//                     <span>Updated</span>
//                     <span>Status</span>
//                     <span />
//                 </div>

//                 {loading ? (
//                     <div className="empty-state">
//                         <RefreshIcon />
//                         Loading feedback…
//                     </div>
//                 ) : feedback.length ? (
//                     feedback.map(
//                         (item) => (
//                             <div
//                                 className="table-row"
//                                 key={item.id}
//                             >
//                                 <div className="customer-cell">
//                                     <span
//                                         className={`person-avatar small ${sentimentTone(
//                                             item.sentiment,
//                                         )}`}
//                                     >
//                                         CU
//                                     </span>

//                                     <div>
//                                         <strong>
//                                             Customer
//                                         </strong>
//                                         <span>
//                                             {
//                                                 workspaceName
//                                             }
//                                         </span>
//                                     </div>
//                                 </div>

//                                 <p>
//                                     {item.summary?.trim() ||
//                                         item.content}
//                                 </p>

//                                 <span
//                                     className={`sentiment-pill ${(
//                                         item.sentiment ??
//                                         "neutral"
//                                     ).toLowerCase()}`}
//                                 >
//                                     {formatSentiment(
//                                         item.sentiment,
//                                     )}
//                                 </span>

//                                 <span className="source-pill">
//                                     {formatSource(
//                                         item.source,
//                                     )}
//                                 </span>

//                                 <span className="updated-cell">
//                                     <Clock3
//                                         size={14}
//                                     />
//                                     {relativeTime(
//                                         item.createdAt,
//                                     )}
//                                 </span>

//                                 <select
//                                     aria-label={`Status for feedback ${item.id}`}
//                                     value={
//                                         item.status
//                                     }
//                                     disabled={
//                                         mutating ===
//                                         item.id
//                                     }
//                                     onChange={(
//                                         event,
//                                     ) =>
//                                         updateStatus(
//                                             item.id,
//                                             event.target
//                                                 .value as Status,
//                                         )
//                                     }
//                                 >
//                                     <option value="NEW">
//                                         New
//                                     </option>
//                                     <option value="REVIEWED">
//                                         Reviewed
//                                     </option>
//                                     <option value="ACTIONED">
//                                         Actioned
//                                     </option>
//                                 </select>

//                                 <button
//                                     className="more-button"
//                                     aria-label={`More actions for feedback ${item.id}`}
//                                 >
//                                     <MoreHorizontal
//                                         size={17}
//                                     />
//                                 </button>
//                             </div>
//                         ),
//                     )
//                 ) : (
//                     <div className="empty-state">
//                         <Search size={22} />
//                         <strong>
//                             No feedback matches
//                         </strong>
//                         <span>
//                             Try a different search
//                             or filter.
//                         </span>
//                     </div>
//                 )}
//             </div>

//             {pagination && (
//                 <div className="sentiment-foot">
//                     <span>
//                         {pagination.total.toLocaleString()}{" "}
//                         feedback items
//                     </span>

//                     <div
//                         style={{
//                             display:
//                                 "flex",
//                             gap: 8,
//                         }}
//                     >
//                         <button
//                             className="icon-button"
//                             disabled={
//                                 !pagination.hasPrevious ||
//                                 loading
//                             }
//                             onClick={() =>
//                                 setPage(
//                                     (value) =>
//                                         Math.max(
//                                             1,
//                                             value -
//                                             1,
//                                         ),
//                                 )
//                             }
//                             aria-label="Previous page"
//                         >
//                             <ChevronLeftIcon />
//                         </button>

//                         <span
//                             style={{
//                                 alignSelf:
//                                     "center",
//                                 fontSize: 10,
//                             }}
//                         >
//                             Page{" "}
//                             {pagination.page} of{" "}
//                             {
//                                 pagination.totalPages
//                             }
//                         </span>

//                         <button
//                             className="icon-button"
//                             disabled={
//                                 !pagination.hasNext ||
//                                 loading
//                             }
//                             onClick={() =>
//                                 setPage(
//                                     (value) =>
//                                         value +
//                                         1,
//                                 )
//                             }
//                             aria-label="Next page"
//                         >
//                             <ChevronRight
//                                 size={17}
//                             />
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// function RefreshIcon() {
//     return <Clock3 size={20} />;
// }

// function ChevronLeftIcon() {
//     return (
//         <ChevronRight
//             size={17}
//             style={{
//                 transform:
//                     "rotate(180deg)",
//             }}
//         />
//     );
// }

// function AnalyticsView() {
//     const [analytics, setAnalytics] =
//         useState<AnalyticsResponse | null>(null);

//     const [loading, setLoading] =
//         useState(true);

//     const [days, setDays] =
//         useState("90");

//     useEffect(() => {
//         const controller =
//             new AbortController();

//         async function load() {
//             setLoading(true);

//             try {
//                 const response =
//                     await fetch(
//                         `/api/dashboard/analytics?days=${days}`,
//                         {
//                             cache: "no-store",
//                             signal:
//                                 controller.signal,
//                         },
//                     );

//                 if (!response.ok) {
//                     throw new Error(
//                         "Failed to load analytics",
//                     );
//                 }

//                 setAnalytics(
//                     (await response.json()) as AnalyticsResponse,
//                 );
//             } catch (error) {
//                 if (
//                     error instanceof
//                     DOMException &&
//                     error.name ===
//                     "AbortError"
//                 ) {
//                     return;
//                 }

//                 setAnalytics(null);
//             } finally {
//                 setLoading(false);
//             }
//         }

//         void load();

//         return () =>
//             controller.abort();
//     }, [days]);

//     if (loading) {
//         return (
//             <div className="content-grid">
//                 <div className="panel">
//                     <div className="empty-state">
//                         Loading analytics…
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     if (!analytics) {
//         return (
//             <div className="content-grid">
//                 <div className="panel">
//                     <div className="empty-state">
//                         Analytics are unavailable
//                         right now.
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     const s = analytics.summary;
//     const topTheme =
//         analytics.themes[0];

//     return (
//         <div className="content-grid">
//             <div className="metrics-row">
//                 <Metric
//                     label="Avg. sentiment"
//                     value={formatScore(
//                         s.averageSentimentScore,
//                     )}
//                     change={`${s.total}`}
//                     icon={
//                         <Sparkles size={18} />
//                     }
//                     tone="coral"
//                     note="Feedback items"
//                 />

//                 <Metric
//                     label="Topics detected"
//                     value={String(
//                         analytics.themes.length,
//                     )}
//                     change={`${topTheme?.count ?? 0}`}
//                     icon={<Tag size={18} />}
//                     tone="blue"
//                     note="Top theme mentions"
//                 />

//                 <Metric
//                     label="Positive"
//                     value={String(
//                         s.positive,
//                     )}
//                     change={
//                         s.total
//                             ? `${Math.round(
//                                 (s.positive /
//                                     s.total) *
//                                 100,
//                             )}%`
//                             : "0%"
//                     }
//                     icon={
//                         <Activity size={18} />
//                     }
//                     tone="mint"
//                     note="Share of feedback"
//                 />

//                 <Metric
//                     label="Negative"
//                     value={String(
//                         s.negative,
//                     )}
//                     change={
//                         s.total
//                             ? `${Math.round(
//                                 (s.negative /
//                                     s.total) *
//                                 100,
//                             )}%`
//                             : "0%"
//                     }
//                     icon={
//                         <LifeBuoy size={18} />
//                     }
//                     tone="yellow"
//                     note="Share of feedback"
//                 />
//             </div>

//             <div className="analytics-split">
//                 <div className="panel large-chart">
//                     <PanelHead
//                         title="Feedback over time"
//                         meta={
//                             analytics
//                                 .period
//                                 .label
//                         }
//                     />

//                     <DynamicLineChart
//                         series={
//                             analytics.series
//                         }
//                     />
//                 </div>

//                 <div className="panel source-panel">
//                     <PanelHead
//                         title="Top customer themes"
//                         meta="Current period"
//                     />

//                     <div className="source-bars">
//                         {analytics.themes
//                             .slice(0, 5)
//                             .map((item) => (
//                                 <div
//                                     key={
//                                         item.theme
//                                     }
//                                 >
//                                     <span>
//                                         {
//                                             item.theme
//                                         }
//                                     </span>

//                                     <b>
//                                         {
//                                             item.count
//                                         }
//                                     </b>

//                                     <i>
//                                         <em
//                                             style={{
//                                                 width: `${analytics
//                                                         .themes[0]
//                                                         ? Math.round(
//                                                             (item.count /
//                                                                 analytics
//                                                                     .themes[0]
//                                                                     .count) *
//                                                             100,
//                                                         )
//                                                         : 0
//                                                     }%`,
//                                             }}
//                                         />
//                                     </i>
//                                 </div>
//                             ))}
//                     </div>

//                     <button className="text-button">
//                         {
//                             analytics
//                                 .themes
//                                 .length
//                         }{" "}
//                         themes detected{" "}
//                         <ArrowUpRight
//                             size={14}
//                         />
//                     </button>
//                 </div>
//             </div>

//             <div className="panel">
//                 <PanelHead
//                     title="Date range"
//                     meta="Change"
//                 />

//                 <div
//                     style={{
//                         display: "flex",
//                         flexWrap:
//                             "wrap",
//                         gap: 8,
//                     }}
//                 >
//                     {["7", "30", "90"].map(
//                         (option) => (
//                             <button
//                                 key={
//                                     option
//                                 }
//                                 className={`button ${days ===
//                                         option
//                                         ? "primary"
//                                         : "secondary"
//                                     }`}
//                                 onClick={() =>
//                                     setDays(
//                                         option,
//                                     )
//                                 }
//                             >
//                                 <CalendarDays
//                                     size={15}
//                                 />
//                                 Last{" "}
//                                 {option}{" "}
//                                 days
//                             </button>
//                         ),
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

// function InsightsView({
//     workspaceName,
// }: {
//     workspaceName: string;
// }) {
//     const [report, setReport] =
//         useState<Report | null>(null);

//     const [loading, setLoading] =
//         useState(true);

//     useEffect(() => {
//         const controller =
//             new AbortController();

//         async function load() {
//             try {
//                 const response =
//                     await fetch(
//                         "/api/reports",
//                         {
//                             cache: "no-store",
//                             signal:
//                                 controller.signal,
//                         },
//                     );

//                 if (!response.ok) return;

//                 const data =
//                     (await response.json()) as {
//                         reports?: unknown;
//                     };

//                 const reports =
//                     Array.isArray(
//                         data.reports,
//                     )
//                         ? data.reports
//                             .map(normalizeReport)
//                             .filter(
//                                 (
//                                     value,
//                                 ): value is Report =>
//                                     Boolean(
//                                         value,
//                                     ),
//                             )
//                         : [];

//                 setReport(
//                     reports[0] ?? null,
//                 );
//             } finally {
//                 setLoading(false);
//             }
//         }

//         void load();

//         return () =>
//             controller.abort();
//     }, []);

//     return (
//         <div className="insights-layout">
//             <div className="insights-main">
//                 <div className="insight-banner">
//                     <div className="sparkle-orbit">
//                         <Sparkles size={21} />
//                     </div>

//                     <div>
//                         <p className="eyebrow">
//                             LOOP INTELLIGENCE
//                         </p>

//                         <h2>
//                             {report
//                                 ? report.title
//                                 : "Workspace intelligence"}
//                         </h2>

//                         <p>
//                             {loading
//                                 ? "Loading the latest AI-generated signal…"
//                                 : report
//                                     ? report.executiveSummary
//                                     : `Generate a Voice-of-Customer report to surface grounded AI insights for ${workspaceName}.`}
//                         </p>
//                     </div>
//                 </div>

//                 {report ? (
//                     <div className="insight-cards">
//                         <InsightCard
//                             number="01"
//                             title="Key themes"
//                             body={
//                                 report.themeSummary
//                             }
//                             label="Theme signal"
//                             tone="blue"
//                         />

//                         <InsightCard
//                             number="02"
//                             title="Sentiment movement"
//                             body={
//                                 report.sentimentSummary
//                             }
//                             label="Sentiment signal"
//                             tone="mint"
//                         />

//                         <InsightCard
//                             number="03"
//                             title="Recommended actions"
//                             body={
//                                 report.recommendedActions
//                             }
//                             label="Action signal"
//                             tone="coral"
//                         />
//                     </div>
//                 ) : (
//                     <div className="panel">
//                         <div className="empty-state">
//                             No saved AI report yet.
//                             Open Reports and
//                             generate one from your
//                             live feedback.
//                         </div>
//                     </div>
//                 )}
//             </div>

//             <aside className="panel recommendations">
//                 <PanelHead
//                     title="Customer voice"
//                     meta={
//                         report
//                             ? `${report.keyQuotes.length} quotes`
//                             : "No report"
//                     }
//                 />

//                 {report?.keyQuotes
//                     .slice(0, 3)
//                     .map((quote) => (
//                         <div
//                             className="recommendation"
//                             key={quote}
//                         >
//                             <span className="rec-icon coral">
//                                 <MessageSquareText
//                                     size={16}
//                                 />
//                             </span>

//                             <div>
//                                 <strong>
//                                     Customer
//                                     quote
//                                 </strong>

//                                 <p>
//                                     {quote}
//                                 </p>
//                             </div>
//                         </div>
//                     ))}
//             </aside>
//         </div>
//     );
// }

// function InsightCard({
//     number,
//     title,
//     body,
//     label,
//     tone,
// }: {
//     number: string;
//     title: string;
//     body: string;
//     label: string;
//     tone: string;
// }) {
//     return (
//         <article className="insight-card">
//             <div
//                 className={`insight-number ${tone}`}
//             >
//                 {number}
//             </div>

//             <div>
//                 <span
//                     className={`insight-label ${tone}`}
//                 >
//                     {label}
//                 </span>

//                 <h3>{title}</h3>

//                 <p>{body}</p>
//             </div>
//         </article>
//     );
// }

// function AskView() {
//     const [input, setInput] =
//         useState("");

//     const [questions, setQuestions] =
//         useState<string[]>([]);

//     const [status, setStatus] =
//         useState<
//             "idle" | "pending" | "error"
//         >("idle");

//     const [answer, setAnswer] =
//         useState("");

//     const [sources, setSources] =
//         useState<AskSource[]>([]);

//     async function sendQuestion(
//         question = input,
//     ) {
//         const trimmed =
//             question.trim();

//         if (
//             !trimmed ||
//             status === "pending"
//         ) {
//             return;
//         }

//         setInput("");
//         setStatus("pending");
//         setAnswer("");
//         setSources([]);

//         setQuestions(
//             (current) =>
//                 [
//                     trimmed,
//                     ...current.filter(
//                         (item) =>
//                             item !==
//                             trimmed,
//                     ),
//                 ].slice(0, 5),
//         );

//         try {
//             const response =
//                 await fetch(
//                     "/api/ask-loop",
//                     {
//                         method: "POST",
//                         headers: {
//                             "Content-Type":
//                                 "application/json",
//                         },
//                         body: JSON.stringify({
//                             question:
//                                 trimmed,
//                         }),
//                     },
//                 );

//             const data =
//                 (await response.json()) as {
//                     answer?: string;
//                     sources?: AskSource[];
//                     error?: string;
//                 };

//             if (!response.ok) {
//                 throw new Error(
//                     data.error ??
//                     "LOOP could not answer that question.",
//                 );
//             }

//             setAnswer(
//                 data.answer ??
//                 "LOOP returned no answer.",
//             );

//             setSources(
//                 Array.isArray(
//                     data.sources,
//                 )
//                     ? data.sources
//                     : [],
//             );

//             setStatus("idle");
//         } catch (error) {
//             setStatus("error");

//             setAnswer(
//                 error instanceof Error
//                     ? error.message
//                     : "LOOP could not answer that question.",
//             );
//         }
//     }

//     return (
//         <div className="ask-layout">
//             <div className="panel chat-panel">
//                 <div className="chat-head">
//                     <div className="ask-avatar">
//                         <Bot size={20} />
//                     </div>

//                     <div>
//                         <strong>
//                             LOOP assistant
//                         </strong>

//                         <span>
//                             <i /> Grounded in your
//                             feedback
//                         </span>
//                     </div>

//                     <button
//                         className="icon-button"
//                         aria-label="Open LOOP options"
//                     >
//                         <MoreHorizontal
//                             size={18}
//                         />
//                     </button>
//                 </div>

//                 <div className="chat-messages">
//                     <div className="assistant-message">
//                         <span className="ask-avatar small">
//                             <Bot size={16} />
//                         </span>

//                         <div>
//                             <p>
//                                 {answer ||
//                                     "Hi. Ask me about patterns, themes, sentiment, or what customers are saying in your workspace."}
//                             </p>

//                             <span>
//                                 {status ===
//                                     "pending"
//                                     ? "Thinking…"
//                                     : "Grounded response"}
//                             </span>
//                         </div>
//                     </div>

//                     {status ===
//                         "pending" && (
//                             <div
//                                 className="chat-status"
//                                 aria-live="polite"
//                             >
//                                 <span className="loading-dot" />
//                                 LOOP is thinking…
//                             </div>
//                         )}

//                     {status ===
//                         "error" && (
//                             <div
//                                 className="chat-status error"
//                                 role="alert"
//                             >
//                                 {answer}
//                             </div>
//                         )}

//                     <div className="question-chips">
//                         {[
//                             "What are customers asking for most?",
//                             "Summarize support complaints",
//                             "Which themes are growing?",
//                         ].map(
//                             (prompt) => (
//                                 <button
//                                     key={
//                                         prompt
//                                     }
//                                     onClick={() =>
//                                         void sendQuestion(
//                                             prompt,
//                                         )
//                                     }
//                                     disabled={
//                                         status ===
//                                         "pending"
//                                     }
//                                 >
//                                     {prompt}
//                                 </button>
//                             ),
//                         )}
//                     </div>

//                     {sources.length >
//                         0 && (
//                             <div className="source-list">
//                                 {sources
//                                     .slice(0, 5)
//                                     .map(
//                                         (
//                                             source,
//                                             index,
//                                         ) => (
//                                             <div
//                                                 className="suggested"
//                                                 key={
//                                                     source.id ??
//                                                     `${index}-${source.content ?? "source"}`
//                                                 }
//                                             >
//                                                 <Tag
//                                                     size={
//                                                         15
//                                                     }
//                                                 />

//                                                 <div>
//                                                     <strong>
//                                                         Source{" "}
//                                                         {
//                                                             index +
//                                                             1
//                                                         }

//                                                         {source.similarity !==
//                                                             null &&
//                                                             source.similarity !==
//                                                             undefined
//                                                             ? ` · ${(source.similarity * 100).toFixed(0)}% match`
//                                                             : ""}
//                                                     </strong>

//                                                     <p>
//                                                         {source.summary ||
//                                                             source.content ||
//                                                             "Relevant customer feedback"}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         ),
//                                     )}
//                             </div>
//                         )}
//                 </div>

//                 <form
//                     className="chat-input"
//                     onSubmit={(event) => {
//                         event.preventDefault();
//                         void sendQuestion();
//                     }}
//                 >
//                     <input
//                         value={input}
//                         onChange={(event) =>
//                             setInput(
//                                 event.target.value,
//                             )
//                         }
//                         placeholder="Ask LOOP anything about your customers…"
//                         aria-label="Ask LOOP a question"
//                     />

//                     <button
//                         className="send-button"
//                         type="submit"
//                         disabled={
//                             !input.trim() ||
//                             status ===
//                             "pending"
//                         }
//                         aria-label="Send question"
//                     >
//                         <ArrowUpRight
//                             size={18}
//                         />
//                     </button>
//                 </form>
//             </div>

//             <aside className="panel history-panel">
//                 <PanelHead
//                     title="Recent questions"
//                     meta={
//                         questions.length
//                             ? "Clear"
//                             : ""
//                     }
//                     onClick={() =>
//                         setQuestions([])
//                     }
//                 />

//                 {questions.length ? (
//                     questions
//                         .slice(0, 5)
//                         .map((question) => (
//                             <button
//                                 className="history-item"
//                                 key={
//                                     question
//                                 }
//                                 onClick={() => {
//                                     setInput(
//                                         question,
//                                     );
//                                     void sendQuestion(
//                                         question,
//                                     );
//                                 }}
//                             >
//                                 <Clock3 size={16} />
//                                 <span>
//                                     {
//                                         question
//                                     }
//                                 </span>
//                                 <ChevronRight
//                                     size={15}
//                                 />
//                             </button>
//                         ))
//                 ) : (
//                     <div className="empty-history">
//                         No recent questions yet.
//                     </div>
//                 )}

//                 <div className="suggested">
//                     <Sparkles size={17} />
//                     <strong>
//                         Suggested prompt
//                     </strong>
//                     <p>
//                         “What should our product
//                         team prioritize next?”
//                     </p>
//                 </div>
//             </aside>
//         </div>
//     );
// }

// function ReportsView({
//     workspaceName,
// }: {
//     workspaceName: string;
// }) {
//     const [days, setDays] =
//         useState("30");

//     const [reports, setReports] =
//         useState<Report[]>([]);

//     const [loading, setLoading] =
//         useState(true);

//     const [message, setMessage] =
//         useState("");

//     const [generating, setGenerating] =
//         useState(false);

//     async function loadReports() {
//         setLoading(true);

//         try {
//             const response =
//                 await fetch(
//                     "/api/reports",
//                     {
//                         cache: "no-store",
//                     },
//                 );

//             const data =
//                 (await response.json()) as {
//                     reports?: unknown;
//                     error?: string;
//                 };

//             if (!response.ok) {
//                 throw new Error(
//                     data.error ??
//                     "Failed to load reports",
//                 );
//             }

//             const values =
//                 Array.isArray(
//                     data.reports,
//                 )
//                     ? data.reports
//                         .map(
//                             normalizeReport,
//                         )
//                         .filter(
//                             (
//                                 value,
//                             ): value is Report =>
//                                 Boolean(
//                                     value,
//                                 ),
//                         )
//                     : [];

//             setReports(values);
//         } catch (error) {
//             setMessage(
//                 error instanceof Error
//                     ? error.message
//                     : "Failed to load reports",
//             );
//         } finally {
//             setLoading(false);
//         }
//     }

//     useEffect(() => {
//         void loadReports();
//     }, []);

//     async function generateReport() {
//         setGenerating(true);
//         setMessage(
//             "Generating Voice-of-Customer report…",
//         );

//         try {
//             const response =
//                 await fetch(
//                     "/api/reports",
//                     {
//                         method: "POST",
//                         headers: {
//                             "Content-Type":
//                                 "application/json",
//                         },
//                         body: JSON.stringify({
//                             days,
//                         }),
//                     },
//                 );

//             const data =
//                 (await response.json()) as {
//                     error?: string;
//                 };

//             if (!response.ok) {
//                 throw new Error(
//                     data.error ??
//                     "Failed to generate report",
//                 );
//             }

//             setMessage(
//                 "Report generated successfully.",
//             );

//             await loadReports();
//         } catch (error) {
//             setMessage(
//                 error instanceof Error
//                     ? error.message
//                     : "Failed to generate report",
//             );
//         } finally {
//             setGenerating(false);
//         }
//     }

//     const latest = reports[0];

//     return (
//         <div className="report-layout">
//             <div className="report-preview panel">
//                 <div className="report-cover">
//                     <div className="report-brand">
//                         <span className="brand-mark">
//                             l
//                         </span>{" "}
//                         loop
//                     </div>

//                     <p className="eyebrow">
//                         VOICE OF CUSTOMER
//                     </p>

//                     <h2>
//                         {latest ? (
//                             <>
//                                 {
//                                     latest.title.split(
//                                         "|",
//                                     )[0]
//                                 }

//                                 <br />

//                                 <em>
//                                     {latest.periodStart &&
//                                         latest.periodEnd
//                                         ? `${formatDate(
//                                             latest.periodStart,
//                                         )} – ${formatDate(
//                                             latest.periodEnd,
//                                         )}`
//                                         : "Latest report"}
//                                 </em>
//                             </>
//                         ) : (
//                             <>
//                                 Customer pulse
//                                 <br />
//                                 <em>
//                                     {
//                                         workspaceName
//                                     }
//                                 </em>
//                             </>
//                         )}
//                     </h2>

//                     <p className="report-intro">
//                         {latest?.executiveSummary ||
//                             "Generate a grounded AI report from your live customer feedback."}
//                     </p>

//                     <div className="cover-stats">
//                         <span>
//                             <strong>
//                                 {
//                                     reports.length
//                                 }
//                             </strong>{" "}
//                             saved reports
//                         </span>

//                         <span>
//                             <strong>
//                                 {
//                                     latest
//                                         ?.keyQuotes
//                                         .length ??
//                                     0
//                                 }
//                             </strong>{" "}
//                             quotes
//                         </span>

//                         <span>
//                             <strong>
//                                 {latest
//                                     ? formatDate(
//                                         latest.createdAt,
//                                     )
//                                     : "—"}
//                             </strong>{" "}
//                             generated
//                         </span>
//                     </div>

//                     <div className="report-footer">
//                         <span>
//                             Prepared for{" "}
//                             {
//                                 workspaceName
//                             }
//                         </span>

//                         <span>
//                             {latest
//                                 ? formatDate(
//                                     latest.createdAt,
//                                 )
//                                 : "—"}
//                         </span>
//                     </div>
//                 </div>
//             </div>

//             <aside className="report-controls">
//                 <div className="panel">
//                     <PanelHead
//                         title="Report settings"
//                         meta={
//                             generating
//                                 ? "Generating"
//                                 : "Ready"
//                         }
//                     />

//                     <label>
//                         Report period

//                         <select
//                             value={days}
//                             onChange={(
//                                 event,
//                             ) =>
//                                 setDays(
//                                     event.target
//                                         .value,
//                                 )
//                             }
//                         >
//                             <option value="7">
//                                 Last 7 days
//                             </option>

//                             <option value="30">
//                                 Last 30 days
//                             </option>

//                             <option value="90">
//                                 Last 90 days
//                             </option>

//                             <option value="all">
//                                 All feedback
//                             </option>
//                         </select>
//                     </label>

//                     <button
//                         className="button primary full"
//                         onClick={() =>
//                             void generateReport()
//                         }
//                         disabled={generating}
//                     >
//                         {generating
//                             ? "Generating…"
//                             : "Generate VoC report"}
//                     </button>

//                     {latest && (
//                         <button
//                             className="button secondary full"
//                             onClick={() => {
//                                 window.location.href =
//                                     `/api/reports/${latest.id}/pdf`;
//                             }}
//                         >
//                             <Download size={16} />
//                             Download latest PDF
//                         </button>
//                     )}

//                     {message && (
//                         <p
//                             className="report-status"
//                             role="status"
//                         >
//                             {message}
//                         </p>
//                     )}
//                 </div>

//                 <div className="report-note">
//                     <Sparkles size={17} />

//                     <div>
//                         <strong>
//                             {loading
//                                 ? "Loading saved reports"
//                                 : latest
//                                     ? "AI report ready"
//                                     : "No saved report yet"}
//                         </strong>

//                         <p>
//                             {latest
//                                 ? `Generated ${formatDate(
//                                     latest.createdAt,
//                                 )} from the latest feedback.`
//                                 : "Generate a report to create grounded customer intelligence."}
//                         </p>
//                     </div>
//                 </div>
//             </aside>

//             {reports.length > 0 && (
//                 <div
//                     className="panel"
//                     style={{
//                         gridColumn: "1 / -1",
//                     }}
//                 >
//                     <PanelHead
//                         title="Saved reports"
//                         meta={`${reports.length} reports`}
//                     />

//                     <div className="feedback-list">
//                         {reports.map(
//                             (report) => (
//                                 <article
//                                     className="feedback-item"
//                                     key={
//                                         report.id
//                                     }
//                                 >
//                                     <span className="person-avatar mint">
//                                         <FileText
//                                             size={
//                                                 17
//                                             }
//                                         />
//                                     </span>

//                                     <div className="feedback-copy">
//                                         <div>
//                                             <strong>
//                                                 {
//                                                     report.title
//                                                 }
//                                             </strong>

//                                             <span>
//                                                 {formatDate(
//                                                     report.createdAt,
//                                                 )}
//                                             </span>
//                                         </div>

//                                         <p>
//                                             {
//                                                 report.executiveSummary
//                                             }
//                                         </p>

//                                         <div className="feedback-meta">
//                                             <span className="source-pill">
//                                                 {formatDate(
//                                                     report.periodStart,
//                                                 )}{" "}
//                                                 –{" "}
//                                                 {formatDate(
//                                                     report.periodEnd,
//                                                 )}
//                                             </span>

//                                             <button
//                                                 className="text-button"
//                                                 onClick={() => {
//                                                     window.location.href =
//                                                         `/api/reports/${report.id}/pdf`;
//                                                 }}
//                                             >
//                                                 Download PDF{" "}
//                                                 <Download
//                                                     size={
//                                                         13
//                                                     }
//                                                 />
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </article>
//                             ),
//                         )}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// function TeamView() {
//     return (
//         <div className="panel management-panel">
//             <PanelHead
//                 title="Workspace members"
//                 meta="Backend endpoint pending"
//             />

//             <div className="empty-state">
//                 <Users size={22} />

//                 <strong>
//                     Team management is not
//                     connected yet.
//                 </strong>

//                 <span>
//                     The current backend schema supports
//                     workspace membership, but this
//                     frontend has no team API endpoint to
//                     consume yet.
//                 </span>
//             </div>
//         </div>
//     );
// }

// function SettingsView({
//     workspaceName,
// }: {
//     workspaceName: string;
// }) {
//     return (
//         <div className="panel management-panel settings-panel">
//             <PanelHead
//                 title="Workspace settings"
//                 meta="Backend endpoint pending"
//             />

//             <label>
//                 Workspace name

//                 <input
//                     value={workspaceName}
//                     readOnly
//                 />
//             </label>

//             <label>
//                 Weekly digest

//                 <select
//                     defaultValue="Monday morning"
//                     disabled
//                 >
//                     <option>
//                         Monday morning
//                     </option>

//                     <option>
//                         Friday afternoon
//                     </option>

//                     <option>
//                         Off
//                     </option>
//                 </select>
//             </label>

//             <label className="setting-toggle">
//                 <span>
//                     <strong>
//                         Email notifications
//                     </strong>

//                     <small>
//                         Receive updates when
//                         settings persistence is
//                         available.
//                     </small>
//                 </span>

//                 <input
//                     type="checkbox"
//                     defaultChecked
//                     disabled
//                 />
//             </label>

//             <button
//                 className="button secondary"
//                 disabled
//             >
//                 Save settings
//             </button>
//         </div>
//     );
// }

// function FeedbackComposer({
//     onClose,
// }: {
//     onClose: () => void;
// }) {
//     const [content, setContent] =
//         useState("");

//     const [source, setSource] =
//         useState<Source>("MANUAL");

//     const [loading, setLoading] =
//         useState(false);

//     const [error, setError] =
//         useState("");

//     const [message, setMessage] =
//         useState("");

//     async function submit() {
//         if (!content.trim()) {
//             setError(
//                 "Please enter feedback content.",
//             );
//             return;
//         }

//         setLoading(true);
//         setError("");
//         setMessage("");

//         try {
//             const response =
//                 await fetch(
//                     "/api/feedback",
//                     {
//                         method: "POST",
//                         headers: {
//                             "Content-Type":
//                                 "application/json",
//                         },
//                         body: JSON.stringify({
//                             content:
//                                 content.trim(),
//                             source,
//                         }),
//                     },
//                 );

//             const data =
//                 (await response.json()) as {
//                     error?: string;
//                     message?: string;
//                 };

//             if (!response.ok) {
//                 throw new Error(
//                     data.error ??
//                     "Failed to create feedback",
//                 );
//             }

//             setMessage(
//                 data.message ??
//                 "Feedback created successfully.",
//             );

//             window.setTimeout(
//                 onClose,
//                 600,
//             );
//         } catch (submitError) {
//             setError(
//                 submitError instanceof
//                     Error
//                     ? submitError.message
//                     : "Failed to create feedback",
//             );
//         } finally {
//             setLoading(false);
//         }
//     }

//     return (
//         <div
//             className="modal-backdrop"
//             onClick={onClose}
//         >
//             <div
//                 className="composer"
//                 role="dialog"
//                 aria-modal="true"
//                 aria-labelledby="feedback-dialog-title"
//                 onClick={(event) =>
//                     event.stopPropagation()
//                 }
//             >
//                 <div className="composer-head">
//                     <div>
//                         <p className="eyebrow">
//                             NEW ENTRY
//                         </p>

//                         <h2 id="feedback-dialog-title">
//                             Add customer feedback
//                         </h2>
//                     </div>

//                     <button
//                         className="icon-button"
//                         onClick={onClose}
//                         aria-label="Close"
//                     >
//                         <X size={18} />
//                     </button>
//                 </div>

//                 <label>
//                     Feedback

//                     <textarea
//                         value={content}
//                         onChange={(event) =>
//                             setContent(
//                                 event.target
//                                     .value,
//                             )
//                         }
//                         placeholder="Paste or write the customer message…"
//                         autoFocus
//                     />
//                 </label>

//                 <div className="composer-row">
//                     <label>
//                         Source

//                         <select
//                             value={source}
//                             onChange={(
//                                 event,
//                             ) =>
//                                 setSource(
//                                     event.target
//                                         .value as Source,
//                                 )
//                             }
//                         >
//                             <option value="MANUAL">
//                                 Manual
//                             </option>

//                             <option value="CSV">
//                                 CSV
//                             </option>

//                             <option value="API">
//                                 API
//                             </option>

//                             <option value="OTHER">
//                                 Other
//                             </option>
//                         </select>
//                     </label>

//                     <label>
//                         AI classification

//                         <span
//                             style={{
//                                 color: "var(--muted)",
//                                 fontSize: 10,
//                                 paddingTop: 9,
//                             }}
//                         >
//                             Run on ingestion
//                         </span>
//                     </label>
//                 </div>

//                 {error && (
//                     <p
//                         className="report-status"
//                         role="alert"
//                     >
//                         {error}
//                     </p>
//                 )}

//                 {message && (
//                     <p
//                         className="report-status"
//                         role="status"
//                     >
//                         {message}
//                     </p>
//                 )}

//                 <button
//                     className="button primary full"
//                     onClick={() =>
//                         void submit()
//                     }
//                     disabled={loading}
//                 >
//                     {loading
//                         ? "Analyzing…"
//                         : "Save feedback"}
//                 </button>
//             </div>
//         </div>
//     );
// }

"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
    Activity,
    ArrowUpRight,
    BarChart3,
    Bell,
    Bot,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    CircleHelp,
    Clock3,
    Download,
    FileText,
    Filter,
    LayoutDashboard,
    LifeBuoy,
    LogOut,
    Menu,
    MessageSquareText,
    MoreHorizontal,
    Moon,
    Plus,
    Search,
    Settings,
    SlidersHorizontal,
    Sparkles,
    Sun,
    Tag,
    Users,
    X,
} from "lucide-react";

type View =
    | "Overview"
    | "Feedback"
    | "Analytics"
    | "AI Insights"
    | "Ask LOOP"
    | "Reports"
    | "Team"
    | "Settings";

type Source = "MANUAL" | "CSV" | "API" | "OTHER";
type Sentiment = "positive" | "neutral" | "negative";
type Status = "NEW" | "REVIEWED" | "ACTIONED";

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

type FeedbackResponse = {
    feedback: Feedback[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
    counts: {
        ALL: number;
        NEW: number;
        REVIEWED: number;
        ACTIONED: number;
    };
    filters: {
        themes: string[];
    };
};

type AnalyticsSeriesItem = {
    date: string;
    label: string;
    total: number;
    positive: number;
    neutral: number;
    negative: number;
};

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
    series: AnalyticsSeriesItem[];
    sentiment: Array<{
        sentiment: Sentiment;
        count: number;
        percentage: number;
    }>;
    themes: Array<{
        theme: string;
        count: number;
    }>;
    filters: {
        themes: string[];
    };
};

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

type AskSource = {
    id?: string;
    content?: string;
    summary?: string | null;
    theme?: string | null;
    sentiment?: string | null;
    similarity?: number | null;
};

type Props = {
    userName: string;
    userRole: string;
    workspaceName: string;
};

const navItems: { label: View; icon: typeof LayoutDashboard }[] = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Feedback", icon: MessageSquareText },
    { label: "Analytics", icon: BarChart3 },
    { label: "AI Insights", icon: Sparkles },
    { label: "Ask LOOP", icon: Bot },
    { label: "Reports", icon: FileText },
];

const sourceOptions: Array<{ value: Source | ""; label: string }> = [
    { value: "", label: "All channels" },
    { value: "MANUAL", label: "Manual" },
    { value: "CSV", label: "CSV" },
    { value: "API", label: "API" },
    { value: "OTHER", label: "Other" },
];

const sentimentOptions: Array<{
    value: Sentiment | "";
    label: string;
}> = [
        { value: "", label: "All sentiment" },
        { value: "positive", label: "Positive" },
        { value: "neutral", label: "Neutral" },
        { value: "negative", label: "Negative" },
    ];

function formatSource(source: Source): string {
    return source === "MANUAL"
        ? "Manual"
        : source === "CSV"
            ? "CSV"
            : source === "API"
                ? "API"
                : "Other";
}

function formatSentiment(value: string | null): string {
    if (!value) return "Unclassified";

    return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function sentimentTone(value: string | null): string {
    return value === "positive"
        ? "mint"
        : value === "negative"
            ? "coral"
            : value === "neutral"
                ? "yellow"
                : "blue";
}

function initials(name: string): string {
    return (
        name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .join("") || "LO"
    );
}

function relativeTime(value: string): string {
    const created = new Date(value).getTime();

    if (!Number.isFinite(created)) return "Unknown time";

    const seconds = Math.max(
        0,
        Math.floor((Date.now() - created) / 1000),
    );

    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);

    return `${days}d ago`;
}

function formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Unknown date";

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

function formatScore(value: number | null): string {
    if (value === null || !Number.isFinite(value)) return "—";

    return value.toFixed(2);
}

function normalizeReport(value: unknown): Report | null {
    if (!value || typeof value !== "object") return null;

    const item = value as Record<string, unknown>;

    if (
        typeof item.id !== "string" ||
        typeof item.title !== "string"
    ) {
        return null;
    }

    return {
        id: item.id,
        title: item.title,
        periodStart:
            typeof item.periodStart === "string"
                ? item.periodStart
                : "",
        periodEnd:
            typeof item.periodEnd === "string"
                ? item.periodEnd
                : "",
        executiveSummary:
            typeof item.executiveSummary === "string"
                ? item.executiveSummary
                : "",
        themeSummary:
            typeof item.themeSummary === "string"
                ? item.themeSummary
                : "",
        sentimentSummary:
            typeof item.sentimentSummary === "string"
                ? item.sentimentSummary
                : "",
        keyQuotes: Array.isArray(item.keyQuotes)
            ? item.keyQuotes.filter(
                (q): q is string => typeof q === "string",
            )
            : [],
        recommendedActions:
            typeof item.recommendedActions === "string"
                ? item.recommendedActions
                : "",
        createdAt:
            typeof item.createdAt === "string"
                ? item.createdAt
                : "",
    };
}

export default function LoopDashboard({
    userName,
    userRole,
    workspaceName,
}: Props) {
    const [activeView, setActiveView] =
        useState<View>("Overview");

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [showComposer, setShowComposer] = useState(false);
    const [isDarkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const savedTheme =
            window.localStorage.getItem("loop-theme");

        if (savedTheme === "dark") {
            setDarkMode(true);
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem(
            "loop-theme",
            isDarkMode ? "dark" : "light",
        );
    }, [isDarkMode]);

    useEffect(() => {
        if (!showComposer) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setShowComposer(false);
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [showComposer]);

    const pageCopy: Record<View, [string, string]> = {
        Overview: [
            `Good to see you, ${userName}.`,
            "Monitor customer voice, spot emerging themes, and turn feedback into actions from one workspace.",
        ],
        Feedback: [
            "Feedback inbox",
            "Review, route, and resolve the conversations that matter most.",
        ],
        Analytics: [
            "Analytics studio",
            "Spot the movements behind your customer experience metrics.",
        ],
        "AI Insights": [
            "AI insights",
            "Patterns and shifts surfaced from the feedback your workspace has collected.",
        ],
        "Ask LOOP": [
            "Ask LOOP",
            "Your customer intelligence copilot, grounded in real feedback.",
        ],
        Reports: [
            "Voice of Customer",
            "Turn the signal into a report your whole team can act on.",
        ],
        Team: [
            "Team",
            "Manage workspace members and their access.",
        ],
        Settings: [
            "Settings",
            "Keep your workspace preferences and notifications in order.",
        ],
    };

    return (
        <div
            className={`app-shell ${isDarkMode
                ? "theme-night"
                : "theme-day"
                }`}
        >
            <aside
                className={`sidebar ${isSidebarOpen ? "is-open" : ""
                    }`}
            >
                <div className="brand">
                    <span className="brand-mark">l</span>
                    <span>loop</span>
                </div>

                <div className="workspace-switcher">
                    <span className="workspace-avatar">
                        {workspaceName
                            .slice(0, 1)
                            .toUpperCase()}
                    </span>

                    <span className="workspace-name">
                        {workspaceName}
                    </span>

                    <ChevronDown size={14} />
                </div>

                <p className="nav-label">Workspace</p>

                <nav>
                    {navItems.map(
                        ({ label, icon: Icon }) => (
                            <button
                                key={label}
                                className={`nav-item ${activeView === label
                                    ? "active"
                                    : ""
                                    }`}
                                onClick={() => {
                                    setActiveView(label);
                                    setSidebarOpen(false);
                                }}
                            >
                                <Icon size={18} />
                                <span>{label}</span>

                                {label === "AI Insights" && (
                                    <span className="new-dot" />
                                )}
                            </button>
                        ),
                    )}
                </nav>

                <p className="nav-label nav-label-spaced">
                    Manage
                </p>

                <button
                    className={`nav-item ${activeView === "Team"
                        ? "active"
                        : ""
                        }`}
                    onClick={() => {
                        setActiveView("Team");
                        setSidebarOpen(false);
                    }}
                >
                    <Users size={18} />
                    <span>Team</span>
                </button>

                <button
                    className={`nav-item ${activeView === "Settings"
                        ? "active"
                        : ""
                        }`}
                    onClick={() => {
                        setActiveView("Settings");
                        setSidebarOpen(false);
                    }}
                >
                    <Settings size={18} />
                    <span>Settings</span>
                </button>

                <div className="sidebar-footer">
                    <div className="upgrade">
                        <Sparkles size={17} />

                        <div>
                            <strong>LOOP workspace</strong>
                            <span>
                                Customer intelligence
                            </span>
                        </div>

                        <ChevronRight size={15} />
                    </div>

                    <div className="profile">
                        <span className="profile-avatar">
                            {initials(userName)}
                        </span>

                        <div>
                            <strong>{userName}</strong>
                            <span>
                                {userRole.charAt(0) +
                                    userRole.slice(1).toLowerCase()}
                            </span>
                        </div>

                        <button
                            className="icon-button"
                            aria-label="Sign out"
                            title="Sign out"
                            onClick={() =>
                                signOut({
                                    callbackUrl: "/auth/login",
                                })
                            }
                        >
                            <LogOut size={17} />
                        </button>
                    </div>
                </div>
            </aside>

            {isSidebarOpen && (
                <button
                    className="drawer-backdrop"
                    aria-label="Close navigation"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />
            )}

            <main className="main-content">
                <header className="topbar">
                    <button
                        className="mobile-menu icon-button"
                        onClick={() =>
                            setSidebarOpen(!isSidebarOpen)
                        }
                        aria-label="Open navigation"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="breadcrumbs">
                        <span>{workspaceName}</span>
                        <ChevronRight size={14} />
                        <strong>{activeView}</strong>
                    </div>

                    <div className="top-actions">
                        <div className="global-search">
                            <Search size={17} />

                            <input
                                value={query}
                                onChange={(event) =>
                                    setQuery(
                                        event.target.value,
                                    )
                                }
                                placeholder="Search anything"
                                aria-label="Search anything"
                            />

                            <kbd>⌘ K</kbd>
                        </div>

                        <button
                            className="icon-button theme-toggle"
                            onClick={() =>
                                setDarkMode(
                                    (current) =>
                                        !current,
                                )
                            }
                            aria-label={
                                isDarkMode
                                    ? "Switch to day view"
                                    : "Switch to night view"
                            }
                            title={
                                isDarkMode
                                    ? "Switch to day view"
                                    : "Switch to night view"
                            }
                        >
                            {isDarkMode ? (
                                <Sun size={18} />
                            ) : (
                                <Moon size={18} />
                            )}
                        </button>

                        <button
                            className="icon-button notification-button"
                            aria-label="Notifications"
                        >
                            <Bell size={18} />
                            <span />
                        </button>

                        <button
                            className="help-button"
                            aria-label="Open help"
                        >
                            <CircleHelp size={17} />
                            Help
                        </button>
                    </div>
                </header>

                <div className="page-container">
                    <section className="page-heading">
                        <div>
                            <p className="eyebrow">
                                {activeView === "Overview"
                                    ? "LIVE CUSTOMER INTELLIGENCE"
                                    : "CUSTOMER INTELLIGENCE"}
                            </p>

                            <h1>
                                {pageCopy[activeView][0]}
                            </h1>

                            <p>
                                {pageCopy[activeView][1]}
                            </p>
                        </div>

                        <div className="heading-actions">
                            {activeView === "Reports" && (
                                <button
                                    className="button secondary"
                                    onClick={() =>
                                        window.scrollTo({
                                            top: document
                                                .body
                                                .scrollHeight,
                                            behavior:
                                                "smooth",
                                        })
                                    }
                                >
                                    <Download size={16} />
                                    Saved reports
                                </button>
                            )}

                            {![
                                "Team",
                                "Settings",
                            ].includes(activeView) && (
                                    <button
                                        className="button primary"
                                        onClick={() =>
                                            setShowComposer(
                                                true,
                                            )
                                        }
                                    >
                                        <Plus size={17} />
                                        Add feedback
                                    </button>
                                )}
                        </div>
                    </section>

                    {activeView === "Overview" && (
                        <OverviewView
                            workspaceName={
                                workspaceName
                            }
                            onViewFeedback={() =>
                                setActiveView(
                                    "Feedback",
                                )
                            }
                        />
                    )}

                    {activeView === "Feedback" && (
                        <FeedbackView
                            workspaceName={
                                workspaceName
                            }
                        />
                    )}

                    {activeView === "Analytics" && (
                        <AnalyticsView />
                    )}

                    {activeView === "AI Insights" && (
                        <InsightsView
                            workspaceName={
                                workspaceName
                            }
                        />
                    )}

                    {activeView === "Ask LOOP" && (
                        <AskView />
                    )}

                    {activeView === "Reports" && (
                        <ReportsView
                            workspaceName={
                                workspaceName
                            }
                        />
                    )}

                    {activeView === "Team" && (
                        <TeamView />
                    )}

                    {activeView === "Settings" && (
                        <SettingsView
                            workspaceName={
                                workspaceName
                            }
                        />
                    )}
                </div>
            </main>

            {showComposer && (
                <FeedbackComposer
                    onClose={() =>
                        setShowComposer(false)
                    }
                />
            )}
        </div>
    );
}

function OverviewView({
    workspaceName,
    onViewFeedback,
}: {
    workspaceName: string;
    onViewFeedback: () => void;
}) {
    const [analytics, setAnalytics] =
        useState<AnalyticsResponse | null>(null);

    const [recent, setRecent] = useState<Feedback[]>(
        [],
    );

    const [newCount, setNewCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // FIX: these states belong to OverviewView
    const [days, setDays] = useState("30");
    const [
        periodMenu,
        setPeriodMenu,
    ] = useState<
        "sentiment" | "issues" | null
    >(null);

    useEffect(() => {
        const controller =
            new AbortController();

        async function load() {
            setLoading(true);
            setError("");

            try {
                const [
                    analyticsResponse,
                    feedbackResponse,
                ] = await Promise.all([
                    fetch(
                        `/api/dashboard/analytics?days=${days}`,
                        {
                            cache: "no-store",
                            signal:
                                controller.signal,
                        },
                    ),
                    fetch(
                        "/api/feedback?page=1&pageSize=3",
                        {
                            cache: "no-store",
                            signal:
                                controller.signal,
                        },
                    ),
                ]);

                const analyticsJson =
                    (await analyticsResponse.json()) as
                    | AnalyticsResponse
                    | { error?: string };

                const feedbackJson =
                    (await feedbackResponse.json()) as
                    | FeedbackResponse
                    | { error?: string };

                if (!analyticsResponse.ok) {
                    throw new Error(
                        "error" in analyticsJson &&
                            analyticsJson.error
                            ? analyticsJson.error
                            : "Failed to load analytics",
                    );
                }

                if (!feedbackResponse.ok) {
                    throw new Error(
                        "error" in feedbackJson &&
                            feedbackJson.error
                            ? feedbackJson.error
                            : "Failed to load feedback",
                    );
                }

                setAnalytics(
                    analyticsJson as AnalyticsResponse,
                );

                const result =
                    feedbackJson as FeedbackResponse;

                setRecent(result.feedback);
                setNewCount(result.counts.NEW);
            } catch (fetchError) {
                if (
                    fetchError instanceof
                    DOMException &&
                    fetchError.name === "AbortError"
                ) {
                    return;
                }

                setError(
                    fetchError instanceof Error
                        ? fetchError.message
                        : "Failed to load overview",
                );
            } finally {
                setLoading(false);
            }
        }

        void load();

        return () => controller.abort();
    }, [days]);

    if (loading) {
        return (
            <div className="content-grid">
                <div className="panel">
                    <PanelHead
                        title="Loading workspace intelligence"
                        meta=""
                    />

                    <div className="empty-state">
                        Loading real feedback and
                        analytics…
                    </div>
                </div>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="content-grid">
                <div className="panel">
                    <PanelHead
                        title="Overview unavailable"
                        meta=""
                    />

                    <div className="empty-state">
                        <strong>
                            {error ||
                                "No analytics data available."}
                        </strong>

                        <span>
                            Check the backend session and
                            try again.
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    const {
        summary,
        sentiment,
        series,
        themes,
    } = analytics;

    const positivePct = summary.total
        ? Math.round(
            (summary.positive /
                summary.total) *
            100,
        )
        : 0;

    const negativePct = summary.total
        ? Math.round(
            (summary.negative /
                summary.total) *
            100,
        )
        : 0;

    const neutralPct = Math.max(
        0,
        100 -
        positivePct -
        negativePct,
    );

    const periodNote =
        days === "7"
            ? "In the last 7 days"
            : days === "90"
                ? "In the last 90 days"
                : "In the last 30 days";

    const handlePeriodChange = (
        value: string,
    ) => {
        setDays(value);
        setPeriodMenu(null);
    };

    return (
        <div className="content-grid">
            <div className="metrics-row">
                <Metric
                    label="Total feedback"
                    value={summary.total.toLocaleString()}
                    change={`${summary.total}`}
                    icon={
                        <MessageSquareText size={18} />
                    }
                    tone="coral"
                    note={periodNote}
                />

                <Metric
                    label="Positive feedback"
                    value={summary.positive.toLocaleString()}
                    change={`${positivePct}%`}
                    icon={<Activity size={18} />}
                    tone="mint"
                    note="Share of feedback"
                />

                <Metric
                    label="Negative feedback"
                    value={summary.negative.toLocaleString()}
                    change={`${negativePct}%`}
                    icon={<BarChart3 size={18} />}
                    tone="blue"
                    note="Share of feedback"
                />

                <Metric
                    label="New feedback"
                    value={newCount.toLocaleString()}
                    change={`${newCount}`}
                    icon={<LifeBuoy size={18} />}
                    tone="yellow"
                    note="Needs review"
                />
            </div>

            <div className="dashboard-columns">
                <div className="panel trend-panel">
                    <PanelHead
                        title="Feedback volume"
                        meta={analytics.period.label}
                    />

                    <div className="chart-legend">
                        <span>
                            <i className="legend-dot total-dot" />
                            Total
                        </span>

                        <span>
                            <i className="legend-dot positive-dot" />
                            Positive
                        </span>

                        <span>
                            <i className="legend-dot neutral-dot" />
                            Neutral
                        </span>

                        <span>
                            <i className="legend-dot negative-dot" />
                            Negative
                        </span>

                        <span className="chart-total">
                            {summary.total.toLocaleString()}{" "}
                            <small>total</small>
                        </span>
                    </div>

                    <DynamicLineChart
                        series={series}
                    />
                </div>

                <div className="panel sentiment-panel">
                    <PanelHead
                        title="Sentiment"
                        meta="Current period"
                        onClick={() =>
                            setPeriodMenu(
                                (current) =>
                                    current ===
                                        "sentiment"
                                        ? null
                                        : "sentiment",
                            )
                        }
                    />

                    {periodMenu === "sentiment" && (
                        <PeriodMenu
                            days={days}
                            onChange={
                                handlePeriodChange
                            }
                        />
                    )}

                    <div className="donut-wrap">
                        <div
                            className="donut"
                            style={{
                                background:
                                    `conic-gradient(#338f63 0 ${positivePct}%, #d9ddda ${positivePct}% ${positivePct + neutralPct}%, #ef765f ${positivePct + neutralPct}% 100%)`,
                            }}
                        >
                            <div>
                                <strong>
                                    {summary.averageSentimentScore ===
                                        null
                                        ? "—"
                                        : summary.averageSentimentScore.toFixed(
                                            2,
                                        )}
                                </strong>

                                <span>
                                    avg. score
                                </span>
                            </div>
                        </div>

                        <div className="sentiment-list">
                            {sentiment.map(
                                (item) => (
                                    <span
                                        key={
                                            item.sentiment
                                        }
                                    >
                                        <i
                                            className={`legend-dot ${item.sentiment ===
                                                "positive"
                                                ? "green-dot"
                                                : item.sentiment ===
                                                    "negative"
                                                    ? "coral-dot"
                                                    : "gray-dot"
                                                }`}
                                        />

                                        {formatSentiment(
                                            item.sentiment,
                                        )}

                                        <b>
                                            {
                                                item.percentage
                                            }
                                            %
                                        </b>
                                    </span>
                                ),
                            )}
                        </div>
                    </div>

                    <div className="sentiment-foot">
                        <span>
                            <ArrowUpRight size={15} />
                            Data from your workspace
                        </span>

                        <button
                            onClick={
                                onViewFeedback
                            }
                        >
                            View feedback
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="dashboard-columns lower">
                <div className="panel">
                    <PanelHead
                        title="Top customer issues"
                        meta="Current period"
                        onClick={() =>
                            setPeriodMenu(
                                (current) =>
                                    current ===
                                        "issues"
                                        ? null
                                        : "issues",
                            )
                        }
                    />

                    {periodMenu === "issues" && (
                        <PeriodMenu
                            days={days}
                            onChange={
                                handlePeriodChange
                            }
                        />
                    )}

                    <div className="topic-list">
                        {themes.length ? (
                            themes
                                .slice(0, 4)
                                .map(
                                    (
                                        topic,
                                        index,
                                    ) => (
                                        <div
                                            className="topic-row"
                                            key={
                                                topic.theme
                                            }
                                        >
                                            <span
                                                className={`topic-number ${[
                                                    "coral",
                                                    "yellow",
                                                    "blue",
                                                    "mint",
                                                ][index]
                                                    }`}
                                            >
                                                0
                                                {index +
                                                    1}
                                            </span>

                                            <div className="topic-main">
                                                <div>
                                                    <strong>
                                                        {
                                                            topic.theme
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            topic.count
                                                        }{" "}
                                                        mentions
                                                    </span>
                                                </div>

                                                <div className="topic-bar">
                                                    <i
                                                        style={{
                                                            width: `${Math.min(
                                                                Math.max(
                                                                    topic.count /
                                                                    Math.max(
                                                                        themes[0]
                                                                            ?.count ??
                                                                        1,
                                                                        1,
                                                                    ),
                                                                    0,
                                                                ) *
                                                                96,
                                                                96,
                                                            )
                                                                }%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <span className="change up">
                                                {summary.total
                                                    ? `${Math.round(
                                                        (topic.count /
                                                            summary.total) *
                                                        100,
                                                    )}%`
                                                    : "0%"}
                                            </span>
                                        </div>
                                    ),
                                )
                        ) : (
                            <div className="empty-state">
                                No themes have been
                                classified yet.
                            </div>
                        )}
                    </div>
                </div>

                <div className="panel recent-panel">
                    <PanelHead
                        title="Recent feedback"
                        meta="View all"
                        onClick={
                            onViewFeedback
                        }
                    />

                    <div className="feedback-list">
                        {recent.length ? (
                            recent.map(
                                (item) => (
                                    <FeedbackItem
                                        key={item.id}
                                        item={item}
                                        workspaceName={
                                            workspaceName
                                        }
                                    />
                                ),
                            )
                        ) : (
                            <div className="empty-state">
                                No feedback found yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PeriodMenu({
    days,
    onChange,
}: {
    days: string;
    onChange: (value: string) => void;
}) {
    return (
        <div
            style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                margin: "-4px 0 12px",
            }}
        >
            {[
                ["7", "Last 7 days"],
                ["30", "Last 30 days"],
                ["90", "Last 90 days"],
            ].map(([value, label]) => (
                <button
                    key={value}
                    type="button"
                    className={`button ${days === value
                        ? "primary"
                        : "secondary"
                        }`}
                    onClick={() => onChange(value)}
                >
                    <CalendarDays size={14} />
                    {label}
                </button>
            ))}
        </div>
    );
}

function DynamicLineChart({
    series,
}: {
    series: AnalyticsSeriesItem[];
}) {
    if (!series.length) {
        return (
            <div className="empty-state">
                No time-series feedback data yet.
            </div>
        );
    }

    const max = Math.max(
        ...series.map(
            (point) => point.total,
        ),
        1,
    );

    const points = series
        .map((point, index) => {
            const x =
                series.length === 1
                    ? 0
                    : (index /
                        (series.length - 1)) *
                    650;

            const y =
                180 -
                (point.total / max) *
                150;

            return `${x.toFixed(
                1,
            )} ${y.toFixed(1)}`;
        })
        .join(" L ");

    const positivePoints = series
        .map((point, index) => {
            const x =
                series.length === 1
                    ? 0
                    : (index /
                        (series.length - 1)) *
                    650;

            const y =
                180 -
                (point.positive / max) *
                150;

            return `${x.toFixed(
                1,
            )} ${y.toFixed(1)}`;
        })
        .join(" L ");

    const neutralPoints = series
        .map((point, index) => {
            const x =
                series.length === 1
                    ? 0
                    : (index /
                        (series.length - 1)) *
                    650;

            const y =
                180 -
                (point.neutral / max) *
                150;

            return `${x.toFixed(
                1,
            )} ${y.toFixed(1)}`;
        })
        .join(" L ");

    const negativePoints = series
        .map((point, index) => {
            const x =
                series.length === 1
                    ? 0
                    : (index /
                        (series.length - 1)) *
                    650;

            const y =
                180 -
                (point.negative / max) *
                150;

            return `${x.toFixed(
                1,
            )} ${y.toFixed(1)}`;
        })
        .join(" L ");

    const area =
        `M ${points} L 650 200 L 0 200 Z`;

    return (
        <div className="line-chart">
            <div className="y-labels">
                <span>{max}</span>
                <span>
                    {Math.round(max * 0.75)}
                </span>
                <span>
                    {Math.round(max * 0.5)}
                </span>
                <span>
                    {Math.round(max * 0.25)}
                </span>
                <span>0</span>
            </div>

            <div className="chart-area">
                <div className="grid-lines">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                </div>

                <svg
                    viewBox="0 0 650 200"
                    preserveAspectRatio="none"
                    aria-label="Feedback trend"
                >
                    <path
                        className="line-fill"
                        d={area}
                    />

                    <path
                        className="positive-line"
                        d={`M ${positivePoints}`}
                    />

                    <path
                        className="neutral-line"
                        d={`M ${neutralPoints}`}
                    />

                    <path
                        className="negative-line"
                        d={`M ${negativePoints}`}
                    />

                    <path
                        className="total-line"
                        d={`M ${points}`}
                    />
                </svg>

                <div className="x-labels">
                    {series
                        .filter(
                            (_, index) =>
                                index %
                                Math.max(
                                    1,
                                    Math.ceil(
                                        series.length /
                                        5,
                                    ),
                                ) ===
                                0 ||
                                index ===
                                series.length -
                                1,
                        )
                        .slice(0, 6)
                        .map((point) => (
                            <span
                                key={point.date}
                            >
                                {point.label}
                            </span>
                        ))}
                </div>
            </div>
        </div>
    );
}

function Metric({
    label,
    value,
    change,
    icon,
    tone,
    note,
}: {
    label: string;
    value: string;
    change: string;
    icon: React.ReactNode;
    tone: string;
    note: string;
}) {
    return (
        <div className="metric-card">
            <div
                className={`metric-icon ${tone}`}
            >
                {icon}
            </div>

            <span className="metric-label">
                {label}
            </span>

            <strong className="metric-value">
                {value}
            </strong>

            <span className="metric-change up">
                {change} <small>{note}</small>
            </span>
        </div>
    );
}

function PanelHead({
    title,
    meta,
    onClick,
}: {
    title: string;
    meta: string;
    onClick?: () => void;
}) {
    return (
        <div className="panel-head">
            <h2>{title}</h2>

            {meta ? (
                onClick ? (
                    <button
                        type="button"
                        onClick={onClick}
                    >
                        {meta}
                        <ChevronRight size={14} />
                    </button>
                ) : (
                    <span className="panel-meta">
                        {meta}
                    </span>
                )
            ) : (
                <span />
            )}
        </div>
    );
}

function FeedbackItem({
    item,
    workspaceName,
}: {
    item: Feedback;
    workspaceName: string;
}) {
    const displayText =
        item.summary?.trim() ||
        item.content;

    return (
        <div className="feedback-item">
            <span
                className={`person-avatar ${sentimentTone(
                    item.sentiment,
                )}`}
            >
                {initials("Customer")}
            </span>

            <div className="feedback-copy">
                <div>
                    <strong>Customer</strong>

                    <span>
                        {workspaceName} ·{" "}
                        {relativeTime(
                            item.createdAt,
                        )}
                    </span>
                </div>

                <p>{displayText}</p>

                <div className="feedback-meta">
                    <span
                        className={`sentiment-pill ${(
                            item.sentiment ??
                            "neutral"
                        ).toLowerCase()}`}
                    >
                        {formatSentiment(
                            item.sentiment,
                        )}
                    </span>

                    <span className="source-pill">
                        {formatSource(
                            item.source,
                        )}
                    </span>

                    {item.theme && (
                        <span className="tag-pill">
                            <Tag size={12} />
                            {item.theme}
                        </span>
                    )}
                </div>
            </div>

            <button
                className="more-button"
                aria-label="More actions"
            >
                <MoreHorizontal size={17} />
            </button>
        </div>
    );
}

function FeedbackView({
    workspaceName,
}: {
    workspaceName: string;
}) {
    const [feedback, setFeedback] =
        useState<Feedback[]>([]);

    const [pagination, setPagination] =
        useState<
            FeedbackResponse["pagination"] | null
        >(null);

    const [counts, setCounts] =
        useState<
            FeedbackResponse["counts"]
        >({
            ALL: 0,
            NEW: 0,
            REVIEWED: 0,
            ACTIONED: 0,
        });

    const [themes, setThemes] =
        useState<string[]>([]);

    const [search, setSearch] =
        useState("");

    const [source, setSource] =
        useState<Source | "">("");

    const [sentiment, setSentiment] =
        useState<Sentiment | "">("");

    const [theme, setTheme] =
        useState("");

    const [status, setStatus] =
        useState<"" | Status>("");

    const [page, setPage] =
        useState(1);

    const [showFilters, setShowFilters] =
        useState(false);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    // Removed incorrect unused Overview-only period state here.

    const [message, setMessage] =
        useState("");

    const [mutating, setMutating] =
        useState("");

    useEffect(() => {
        const controller =
            new AbortController();

        const timer = window.setTimeout(
            async () => {
                setLoading(true);
                setError("");

                try {
                    const params =
                        new URLSearchParams({
                            page: String(page),
                            pageSize: "20",
                        });

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

                    const response =
                        await fetch(
                            `/api/feedback?${params.toString()}`,
                            {
                                cache: "no-store",
                                signal:
                                    controller.signal,
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
                        result.filters
                            .themes,
                    );
                } catch (
                fetchError
                ) {
                    if (
                        fetchError instanceof
                        DOMException &&
                        fetchError.name ===
                        "AbortError"
                    ) {
                        return;
                    }

                    setError(
                        fetchError instanceof
                            Error
                            ? fetchError.message
                            : "Failed to load feedback",
                    );
                } finally {
                    setLoading(false);
                }
            },
            250,
        );

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [
        page,
        search,
        source,
        sentiment,
        theme,
        status,
    ]);

    async function updateStatus(
        id: string,
        nextStatus: Status,
    ) {
        setMutating(id);
        setError("");
        setMessage("");

        try {
            const response =
                await fetch(
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
                (await response.json()) as {
                    feedback?: Feedback;
                    error?: string;
                };

            if (!response.ok) {
                throw new Error(
                    data.error ??
                    "Failed to update status",
                );
            }

            if (data.feedback) {
                setFeedback(
                    (current) =>
                        current.map(
                            (item) =>
                                item.id === id
                                    ? data.feedback!
                                    : item,
                        ),
                );
            }

            setMessage(
                "Feedback status updated.",
            );

            window.setTimeout(
                () => setMessage(""),
                2200,
            );
        } catch (
        mutationError
        ) {
            setError(
                mutationError instanceof
                    Error
                    ? mutationError.message
                    : "Failed to update status",
            );
        } finally {
            setMutating("");
        }
    }

    function clearFilters() {
        setSearch("");
        setSource("");
        setSentiment("");
        setTheme("");
        setStatus("");
        setPage(1);
    }

    const hasFilters =
        Boolean(
            search ||
            source ||
            sentiment ||
            theme ||
            status,
        );

    return (
        <div className="content-grid">
            <div className="feedback-toolbar">
                <div className="inbox-tabs">
                    {(
                        [
                            "",
                            "NEW",
                            "REVIEWED",
                            "ACTIONED",
                        ] as const
                    ).map((value) => {
                        const label =
                            value === ""
                                ? "All feedback"
                                : value ===
                                    "NEW"
                                    ? "New"
                                    : value ===
                                        "REVIEWED"
                                        ? "Reviewed"
                                        : "Actioned";

                        const count =
                            value === ""
                                ? counts.ALL
                                : counts[value];

                        return (
                            <button
                                key={
                                    value ||
                                    "all"
                                }
                                className={
                                    status ===
                                        value
                                        ? "selected"
                                        : ""
                                }
                                onClick={() => {
                                    setStatus(
                                        value,
                                    );
                                    setPage(1);
                                }}
                            >
                                {label}{" "}
                                <span>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="filter-actions">
                    <div className="table-search">
                        <Search size={16} />

                        <input
                            value={search}
                            onChange={(event) => {
                                setSearch(
                                    event.target
                                        .value,
                                );
                                setPage(1);
                            }}
                            placeholder="Search feedback"
                            aria-label="Search feedback"
                        />
                    </div>

                    <button
                        className={`button secondary ${showFilters
                            ? "is-active"
                            : ""
                            }`}
                        onClick={() =>
                            setShowFilters(
                                (current) =>
                                    !current,
                            )
                        }
                        aria-expanded={
                            showFilters
                        }
                    >
                        <Filter size={15} />
                        Filters
                    </button>

                    <button
                        className="icon-button"
                        aria-label="Open feedback display settings"
                    >
                        <SlidersHorizontal
                            size={17}
                        />
                    </button>

                    {showFilters && (
                        <select
                            className="filter-select"
                            value={sentiment}
                            onChange={(
                                event,
                            ) => {
                                setSentiment(
                                    event.target
                                        .value as
                                    | Sentiment
                                    | "",
                                );
                                setPage(1);
                            }}
                            aria-label="Filter by sentiment"
                        >
                            {sentimentOptions.map(
                                (option) => (
                                    <option
                                        key={
                                            option.value
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
                    )}

                    {showFilters && (
                        <select
                            className="filter-select"
                            value={source}
                            onChange={(
                                event,
                            ) => {
                                setSource(
                                    event.target
                                        .value as
                                    | Source
                                    | "",
                                );
                                setPage(1);
                            }}
                            aria-label="Filter by source"
                        >
                            {sourceOptions.map(
                                (option) => (
                                    <option
                                        key={
                                            option.value
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
                    )}

                    {showFilters && (
                        <select
                            className="filter-select"
                            value={theme}
                            onChange={(
                                event,
                            ) => {
                                setTheme(
                                    event.target
                                        .value,
                                );
                                setPage(1);
                            }}
                            aria-label="Filter by theme"
                        >
                            <option value="">
                                All themes
                            </option>

                            {themes.map(
                                (item) => (
                                    <option
                                        key={
                                            item
                                        }
                                        value={
                                            item
                                        }
                                    >
                                        {item}
                                    </option>
                                ),
                            )}
                        </select>
                    )}

                    {hasFilters && (
                        <button
                            className="text-button"
                            onClick={
                                clearFilters
                            }
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {(error || message) && (
                <div
                    className="insight-banner"
                    role={
                        error
                            ? "alert"
                            : "status"
                    }
                >
                    <div>
                        <p className="eyebrow">
                            {error
                                ? "ERROR"
                                : "UPDATED"}
                        </p>

                        <p>
                            {error ||
                                message}
                        </p>
                    </div>
                </div>
            )}

            <div className="panel feedback-table">
                <div className="table-head">
                    <span>Customer</span>
                    <span>Feedback</span>
                    <span>Sentiment</span>
                    <span>Source</span>
                    <span>Updated</span>
                    <span>Status</span>
                    <span />
                </div>

                {loading ? (
                    <div className="empty-state">
                        <RefreshIcon />
                        Loading feedback…
                    </div>
                ) : feedback.length ? (
                    feedback.map(
                        (item) => (
                            <div
                                className="table-row"
                                key={item.id}
                            >
                                <div className="customer-cell">
                                    <span
                                        className={`person-avatar small ${sentimentTone(
                                            item.sentiment,
                                        )}`}
                                    >
                                        CU
                                    </span>

                                    <div>
                                        <strong>
                                            Customer
                                        </strong>
                                        <span>
                                            {
                                                workspaceName
                                            }
                                        </span>
                                    </div>
                                </div>

                                <p>
                                    {item.summary?.trim() ||
                                        item.content}
                                </p>

                                <span
                                    className={`sentiment-pill ${(
                                        item.sentiment ??
                                        "neutral"
                                    ).toLowerCase()}`}
                                >
                                    {formatSentiment(
                                        item.sentiment,
                                    )}
                                </span>

                                <span className="source-pill">
                                    {formatSource(
                                        item.source,
                                    )}
                                </span>

                                <span className="updated-cell">
                                    <Clock3
                                        size={14}
                                    />
                                    {relativeTime(
                                        item.createdAt,
                                    )}
                                </span>

                                <select
                                    aria-label={`Status for feedback ${item.id}`}
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
                                            event.target
                                                .value as Status,
                                        )
                                    }
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

                                <button
                                    className="more-button"
                                    aria-label={`More actions for feedback ${item.id}`}
                                >
                                    <MoreHorizontal
                                        size={17}
                                    />
                                </button>
                            </div>
                        ),
                    )
                ) : (
                    <div className="empty-state">
                        <Search size={22} />
                        <strong>
                            No feedback matches
                        </strong>
                        <span>
                            Try a different search
                            or filter.
                        </span>
                    </div>
                )}
            </div>

            {pagination && (
                <div className="sentiment-foot">
                    <span>
                        {pagination.total.toLocaleString()}{" "}
                        feedback items
                    </span>

                    <div
                        style={{
                            display:
                                "flex",
                            gap: 8,
                        }}
                    >
                        <button
                            className="icon-button"
                            disabled={
                                !pagination.hasPrevious ||
                                loading
                            }
                            onClick={() =>
                                setPage(
                                    (value) =>
                                        Math.max(
                                            1,
                                            value -
                                            1,
                                        ),
                                )
                            }
                            aria-label="Previous page"
                        >
                            <ChevronLeftIcon />
                        </button>

                        <span
                            style={{
                                alignSelf:
                                    "center",
                                fontSize: 10,
                            }}
                        >
                            Page{" "}
                            {pagination.page} of{" "}
                            {
                                pagination.totalPages
                            }
                        </span>

                        <button
                            className="icon-button"
                            disabled={
                                !pagination.hasNext ||
                                loading
                            }
                            onClick={() =>
                                setPage(
                                    (value) =>
                                        value +
                                        1,
                                )
                            }
                            aria-label="Next page"
                        >
                            <ChevronRight
                                size={17}
                            />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function RefreshIcon() {
    return <Clock3 size={20} />;
}

function ChevronLeftIcon() {
    return (
        <ChevronRight
            size={17}
            style={{
                transform:
                    "rotate(180deg)",
            }}
        />
    );
}

function AnalyticsView() {
    const [analytics, setAnalytics] =
        useState<AnalyticsResponse | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [days, setDays] =
        useState("90");

    useEffect(() => {
        const controller =
            new AbortController();

        async function load() {
            setLoading(true);

            try {
                const response =
                    await fetch(
                        `/api/dashboard/analytics?days=${days}`,
                        {
                            cache: "no-store",
                            signal:
                                controller.signal,
                        },
                    );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load analytics",
                    );
                }

                setAnalytics(
                    (await response.json()) as AnalyticsResponse,
                );
            } catch (error) {
                if (
                    error instanceof
                    DOMException &&
                    error.name ===
                    "AbortError"
                ) {
                    return;
                }

                setAnalytics(null);
            } finally {
                setLoading(false);
            }
        }

        void load();

        return () =>
            controller.abort();
    }, [days]);

    if (loading) {
        return (
            <div className="content-grid">
                <div className="panel">
                    <div className="empty-state">
                        Loading analytics…
                    </div>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="content-grid">
                <div className="panel">
                    <div className="empty-state">
                        Analytics are unavailable
                        right now.
                    </div>
                </div>
            </div>
        );
    }

    const s = analytics.summary;
    const topTheme =
        analytics.themes[0];

    return (
        <div className="content-grid">
            <div className="metrics-row">
                <Metric
                    label="Avg. sentiment"
                    value={formatScore(
                        s.averageSentimentScore,
                    )}
                    change={`${s.total}`}
                    icon={
                        <Sparkles size={18} />
                    }
                    tone="coral"
                    note="Feedback items"
                />

                <Metric
                    label="Topics detected"
                    value={String(
                        analytics.themes.length,
                    )}
                    change={`${topTheme?.count ?? 0}`}
                    icon={<Tag size={18} />}
                    tone="blue"
                    note="Top theme mentions"
                />

                <Metric
                    label="Positive"
                    value={String(
                        s.positive,
                    )}
                    change={
                        s.total
                            ? `${Math.round(
                                (s.positive /
                                    s.total) *
                                100,
                            )}%`
                            : "0%"
                    }
                    icon={
                        <Activity size={18} />
                    }
                    tone="mint"
                    note="Share of feedback"
                />

                <Metric
                    label="Negative"
                    value={String(
                        s.negative,
                    )}
                    change={
                        s.total
                            ? `${Math.round(
                                (s.negative /
                                    s.total) *
                                100,
                            )}%`
                            : "0%"
                    }
                    icon={
                        <LifeBuoy size={18} />
                    }
                    tone="yellow"
                    note="Share of feedback"
                />
            </div>

            <div className="analytics-split">
                <div className="panel large-chart">
                    <PanelHead
                        title="Feedback over time"
                        meta={
                            analytics
                                .period
                                .label
                        }
                    />

                    <DynamicLineChart
                        series={
                            analytics.series
                        }
                    />
                </div>

                <div className="panel source-panel">
                    <PanelHead
                        title="Top customer themes"
                        meta="Current period"
                    />

                    <div className="source-bars">
                        {analytics.themes
                            .slice(0, 5)
                            .map((item) => (
                                <div
                                    key={
                                        item.theme
                                    }
                                >
                                    <span>
                                        {
                                            item.theme
                                        }
                                    </span>

                                    <b>
                                        {
                                            item.count
                                        }
                                    </b>

                                    <i>
                                        <em
                                            style={{
                                                width: `${analytics
                                                    .themes[0]
                                                    ? Math.round(
                                                        (item.count /
                                                            analytics
                                                                .themes[0]
                                                                .count) *
                                                        100,
                                                    )
                                                    : 0
                                                    }%`,
                                            }}
                                        />
                                    </i>
                                </div>
                            ))}
                    </div>

                    <button className="text-button">
                        {
                            analytics
                                .themes
                                .length
                        }{" "}
                        themes detected{" "}
                        <ArrowUpRight
                            size={14}
                        />
                    </button>
                </div>
            </div>

            <div className="panel">
                <PanelHead
                    title="Date range"
                    meta="Change"
                />

                <div
                    style={{
                        display: "flex",
                        flexWrap:
                            "wrap",
                        gap: 8,
                    }}
                >
                    {["7", "30", "90"].map(
                        (option) => (
                            <button
                                key={
                                    option
                                }
                                className={`button ${days ===
                                    option
                                    ? "primary"
                                    : "secondary"
                                    }`}
                                onClick={() =>
                                    setDays(
                                        option,
                                    )
                                }
                            >
                                <CalendarDays
                                    size={15}
                                />
                                Last{" "}
                                {option}{" "}
                                days
                            </button>
                        ),
                    )}
                </div>
            </div>
        </div>
    );
}

function InsightsView({
    workspaceName,
}: {
    workspaceName: string;
}) {
    const [report, setReport] =
        useState<Report | null>(null);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        const controller =
            new AbortController();

        async function load() {
            try {
                const response =
                    await fetch(
                        "/api/reports",
                        {
                            cache: "no-store",
                            signal:
                                controller.signal,
                        },
                    );

                if (!response.ok) return;

                const data =
                    (await response.json()) as {
                        reports?: unknown;
                    };

                const reports =
                    Array.isArray(
                        data.reports,
                    )
                        ? data.reports
                            .map(normalizeReport)
                            .filter(
                                (
                                    value,
                                ): value is Report =>
                                    Boolean(
                                        value,
                                    ),
                            )
                        : [];

                setReport(
                    reports[0] ?? null,
                );
            } finally {
                setLoading(false);
            }
        }

        void load();

        return () =>
            controller.abort();
    }, []);

    return (
        <div className="insights-layout">
            <div className="insights-main">
                <div className="insight-banner">
                    <div className="sparkle-orbit">
                        <Sparkles size={21} />
                    </div>

                    <div>
                        <p className="eyebrow">
                            LOOP INTELLIGENCE
                        </p>

                        <h2>
                            {report
                                ? report.title
                                : "Workspace intelligence"}
                        </h2>

                        <p>
                            {loading
                                ? "Loading the latest AI-generated signal…"
                                : report
                                    ? report.executiveSummary
                                    : `Generate a Voice-of-Customer report to surface grounded AI insights for ${workspaceName}.`}
                        </p>
                    </div>
                </div>

                {report ? (
                    <div className="insight-cards">
                        <InsightCard
                            number="01"
                            title="Key themes"
                            body={
                                report.themeSummary
                            }
                            label="Theme signal"
                            tone="blue"
                        />

                        <InsightCard
                            number="02"
                            title="Sentiment movement"
                            body={
                                report.sentimentSummary
                            }
                            label="Sentiment signal"
                            tone="mint"
                        />

                        <InsightCard
                            number="03"
                            title="Recommended actions"
                            body={
                                report.recommendedActions
                            }
                            label="Action signal"
                            tone="coral"
                        />
                    </div>
                ) : (
                    <div className="panel">
                        <div className="empty-state">
                            No saved AI report yet.
                            Open Reports and
                            generate one from your
                            live feedback.
                        </div>
                    </div>
                )}

                <ThemeSpikesPanel />
            </div>

            <aside className="panel recommendations">
                <PanelHead
                    title="Customer voice"
                    meta={
                        report
                            ? `${report.keyQuotes.length} quotes`
                            : "No report"
                    }
                />

                {report?.keyQuotes
                    .slice(0, 3)
                    .map((quote) => (
                        <div
                            className="recommendation"
                            key={quote}
                        >
                            <span className="rec-icon coral">
                                <MessageSquareText
                                    size={16}
                                />
                            </span>

                            <div>
                                <strong>
                                    Customer
                                    quote
                                </strong>

                                <p>
                                    {quote}
                                </p>
                            </div>
                        </div>
                    ))}
            </aside>
        </div>
    );
}

type ThemeSpike = {
    theme: string;
    current: number;
    previous: number;
    changePct: number;
    isSpiking: boolean;
};

function ThemeSpikesPanel() {
    const [spikes, setSpikes] = useState<ThemeSpike[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            try {
                const response = await fetch("/api/themes/trends", {
                    cache: "no-store",
                    signal: controller.signal,
                });
                if (!response.ok) return;

                const data = (await response.json()) as { spikes?: ThemeSpike[] };
                setSpikes(data.spikes ?? []);
            } catch {
                // aborted or network error: keep empty state
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        void load();
        return () => controller.abort();
    }, []);

    return (
        <div className="panel">
            <PanelHead title="Trending themes" meta="Last 7 days vs previous 7" />

            {loading ? (
                <div className="empty-state">Loading trends…</div>
            ) : spikes.length === 0 ? (
                <div className="empty-state">Not enough recent feedback yet.</div>
            ) : (
                <div className="topic-list">
                    {spikes.slice(0, 6).map((item, index) => (
                        <div className="topic-row" key={item.theme}>
                            <span className="topic-number coral">0{index + 1}</span>

                            <div className="topic-main">
                                <div>
                                    <strong>{item.theme}</strong>
                                    <span>
                                        {item.current} this week · {item.previous} before
                                    </span>
                                </div>
                            </div>

                            <span className={`change ${item.changePct >= 0 ? "up" : "down"}`}>
                                {item.isSpiking ? "Spiking " : ""}
                                {item.changePct >= 0 ? "+" : ""}
                                {item.changePct}%
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function InsightCard({
    number,
    title,
    body,
    label,
    tone,
}: {
    number: string;
    title: string;
    body: string;
    label: string;
    tone: string;
}) {
    return (
        <article className="insight-card">
            <div
                className={`insight-number ${tone}`}
            >
                {number}
            </div>

            <div>
                <span
                    className={`insight-label ${tone}`}
                >
                    {label}
                </span>

                <h3>{title}</h3>

                <p>{body}</p>
            </div>
        </article>
    );
}

function AskView() {
    const [input, setInput] =
        useState("");

    const [questions, setQuestions] =
        useState<string[]>([]);

    const [status, setStatus] =
        useState<
            "idle" | "pending" | "error"
        >("idle");

    const [answer, setAnswer] =
        useState("");

    const [sources, setSources] =
        useState<AskSource[]>([]);

    async function sendQuestion(
        question = input,
    ) {
        const trimmed =
            question.trim();

        if (
            !trimmed ||
            status === "pending"
        ) {
            return;
        }

        setInput("");
        setStatus("pending");
        setAnswer("");
        setSources([]);

        setQuestions(
            (current) =>
                [
                    trimmed,
                    ...current.filter(
                        (item) =>
                            item !==
                            trimmed,
                    ),
                ].slice(0, 5),
        );

        try {
            const response =
                await fetch(
                    "/api/ask-loop",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            question:
                                trimmed,
                        }),
                    },
                );

            const data =
                (await response.json()) as {
                    answer?: string;
                    sources?: AskSource[];
                    error?: string;
                };

            if (!response.ok) {
                throw new Error(
                    data.error ??
                    "LOOP could not answer that question.",
                );
            }

            setAnswer(
                (data.answer ?? "LOOP returned no answer.").replace(/\*\*/g, ""),
            );

            setSources(
                Array.isArray(
                    data.sources,
                )
                    ? data.sources
                    : [],
            );

            setStatus("idle");
        } catch (error) {
            setStatus("error");

            setAnswer(
                error instanceof Error
                    ? error.message
                    : "LOOP could not answer that question.",
            );
        }
    }

    return (
        <div className="ask-layout">
            <div className="panel chat-panel">
                <div className="chat-head">
                    <div className="ask-avatar">
                        <Bot size={20} />
                    </div>

                    <div>
                        <strong>
                            LOOP assistant
                        </strong>

                        <span>
                            <i /> Grounded in your
                            feedback
                        </span>
                    </div>

                    <button
                        className="icon-button"
                        aria-label="Open LOOP options"
                    >
                        <MoreHorizontal
                            size={18}
                        />
                    </button>
                </div>

                <div className="chat-messages">
                    <div className="assistant-message">
                        <span className="ask-avatar small">
                            <Bot size={16} />
                        </span>

                        <div>
                            <p>
                                {answer ||
                                    "Hi. Ask me about patterns, themes, sentiment, or what customers are saying in your workspace."}
                            </p>

                            <span>
                                {status ===
                                    "pending"
                                    ? "Thinking…"
                                    : "Grounded response"}
                            </span>
                        </div>
                    </div>

                    {status ===
                        "pending" && (
                            <div
                                className="chat-status"
                                aria-live="polite"
                            >
                                <span className="loading-dot" />
                                LOOP is thinking…
                            </div>
                        )}

                    {status ===
                        "error" && (
                            <div
                                className="chat-status error"
                                role="alert"
                            >
                                {answer}
                            </div>
                        )}

                    <div className="question-chips">
                        {[
                            "What are customers asking for most?",
                            "Summarize support complaints",
                            "Which themes are growing?",
                        ].map(
                            (prompt) => (
                                <button
                                    key={
                                        prompt
                                    }
                                    onClick={() =>
                                        void sendQuestion(
                                            prompt,
                                        )
                                    }
                                    disabled={
                                        status ===
                                        "pending"
                                    }
                                >
                                    {prompt}
                                </button>
                            ),
                        )}
                    </div>

                    {sources.length >
                        0 && (
                            <div className="source-list">
                                {sources
                                    .slice(0, 5)
                                    .map(
                                        (
                                            source,
                                            index,
                                        ) => (
                                            <div
                                                className="suggested"
                                                key={
                                                    source.id ??
                                                    `${index}-${source.content ?? "source"}`
                                                }
                                            >
                                                <Tag
                                                    size={
                                                        15
                                                    }
                                                />

                                                <div>
                                                    <strong>
                                                        Source{" "}
                                                        {
                                                            index +
                                                            1
                                                        }

                                                        {source.similarity !==
                                                            null &&
                                                            source.similarity !==
                                                            undefined
                                                            ? ` · ${(source.similarity * 100).toFixed(0)}% match`
                                                            : ""}
                                                    </strong>

                                                    <p>
                                                        {source.summary ||
                                                            source.content ||
                                                            "Relevant customer feedback"}
                                                    </p>
                                                </div>
                                            </div>
                                        ),
                                    )}
                            </div>
                        )}
                </div>

                <form
                    className="chat-input"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void sendQuestion();
                    }}
                >
                    <input
                        value={input}
                        onChange={(event) =>
                            setInput(
                                event.target.value,
                            )
                        }
                        placeholder="Ask LOOP anything about your customers…"
                        aria-label="Ask LOOP a question"
                    />

                    <button
                        className="send-button"
                        type="submit"
                        disabled={
                            !input.trim() ||
                            status ===
                            "pending"
                        }
                        aria-label="Send question"
                    >
                        <ArrowUpRight
                            size={18}
                        />
                    </button>
                </form>
            </div>

            <aside className="panel history-panel">
                <PanelHead
                    title="Recent questions"
                    meta={
                        questions.length
                            ? "Clear"
                            : ""
                    }
                    onClick={() =>
                        setQuestions([])
                    }
                />

                {questions.length ? (
                    questions
                        .slice(0, 5)
                        .map((question) => (
                            <button
                                className="history-item"
                                key={
                                    question
                                }
                                onClick={() => {
                                    setInput(
                                        question,
                                    );
                                    void sendQuestion(
                                        question,
                                    );
                                }}
                            >
                                <Clock3 size={16} />
                                <span>
                                    {
                                        question
                                    }
                                </span>
                                <ChevronRight
                                    size={15}
                                />
                            </button>
                        ))
                ) : (
                    <div className="empty-history">
                        No recent questions yet.
                    </div>
                )}

                <div className="suggested">
                    <Sparkles size={17} />
                    <strong>
                        Suggested prompt
                    </strong>
                    <p>
                        “What should our product
                        team prioritize next?”
                    </p>
                </div>
            </aside>
        </div>
    );
}

function ReportsView({
    workspaceName,
}: {
    workspaceName: string;
}) {
    const [days, setDays] =
        useState("30");

    const [reports, setReports] =
        useState<Report[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [message, setMessage] =
        useState("");

    const [generating, setGenerating] =
        useState(false);

    async function loadReports() {
        setLoading(true);

        try {
            const response =
                await fetch(
                    "/api/reports",
                    {
                        cache: "no-store",
                    },
                );

            const data =
                (await response.json()) as {
                    reports?: unknown;
                    error?: string;
                };

            if (!response.ok) {
                throw new Error(
                    data.error ??
                    "Failed to load reports",
                );
            }

            const values =
                Array.isArray(
                    data.reports,
                )
                    ? data.reports
                        .map(
                            normalizeReport,
                        )
                        .filter(
                            (
                                value,
                            ): value is Report =>
                                Boolean(
                                    value,
                                ),
                        )
                    : [];

            setReports(values);
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Failed to load reports",
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadReports();
    }, []);

    async function generateReport() {
        setGenerating(true);
        setMessage(
            "Generating Voice-of-Customer report…",
        );

        try {
            const response =
                await fetch(
                    "/api/reports",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            days,
                        }),
                    },
                );

            const data =
                (await response.json()) as {
                    error?: string;
                };

            if (!response.ok) {
                throw new Error(
                    data.error ??
                    "Failed to generate report",
                );
            }

            setMessage(
                "Report generated successfully.",
            );

            await loadReports();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Failed to generate report",
            );
        } finally {
            setGenerating(false);
        }
    }

    const latest = reports[0];

    return (
        <div className="report-layout">
            <div className="report-preview panel">
                <div className="report-cover">
                    <div className="report-brand">
                        <span className="brand-mark">
                            l
                        </span>{" "}
                        loop
                    </div>

                    <p className="eyebrow">
                        VOICE OF CUSTOMER
                    </p>

                    <h2>
                        {latest ? (
                            <>
                                {
                                    latest.title.split(
                                        "|",
                                    )[0]
                                }

                                <br />

                                <em>
                                    {latest.periodStart &&
                                        latest.periodEnd
                                        ? `${formatDate(
                                            latest.periodStart,
                                        )} – ${formatDate(
                                            latest.periodEnd,
                                        )}`
                                        : "Latest report"}
                                </em>
                            </>
                        ) : (
                            <>
                                Customer pulse
                                <br />
                                <em>
                                    {
                                        workspaceName
                                    }
                                </em>
                            </>
                        )}
                    </h2>

                    <p className="report-intro">
                        {latest?.executiveSummary ||
                            "Generate a grounded AI report from your live customer feedback."}
                    </p>

                    <div className="cover-stats">
                        <span>
                            <strong>
                                {
                                    reports.length
                                }
                            </strong>{" "}
                            saved reports
                        </span>

                        <span>
                            <strong>
                                {
                                    latest
                                        ?.keyQuotes
                                        .length ??
                                    0
                                }
                            </strong>{" "}
                            quotes
                        </span>

                        <span>
                            <strong>
                                {latest
                                    ? formatDate(
                                        latest.createdAt,
                                    )
                                    : "—"}
                            </strong>{" "}
                            generated
                        </span>
                    </div>

                    <div className="report-footer">
                        <span>
                            Prepared for{" "}
                            {
                                workspaceName
                            }
                        </span>

                        <span>
                            {latest
                                ? formatDate(
                                    latest.createdAt,
                                )
                                : "—"}
                        </span>
                    </div>
                </div>
            </div>

            <aside className="report-controls">
                <div className="panel">
                    <PanelHead
                        title="Report settings"
                        meta={
                            generating
                                ? "Generating"
                                : "Ready"
                        }
                    />

                    <label>
                        Report period

                        <select
                            value={days}
                            onChange={(
                                event,
                            ) =>
                                setDays(
                                    event.target
                                        .value,
                                )
                            }
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
                    </label>

                    <button
                        className="button primary full"
                        onClick={() =>
                            void generateReport()
                        }
                        disabled={generating}
                    >
                        {generating
                            ? "Generating…"
                            : "Generate VoC report"}
                    </button>

                    {latest && (
                        <button
                            className="button secondary full"
                            onClick={() => {
                                window.location.href =
                                    `/api/reports/${latest.id}/pdf`;
                            }}
                        >
                            <Download size={16} />
                            Download latest PDF
                        </button>
                    )}

                    {message && (
                        <p
                            className="report-status"
                            role="status"
                        >
                            {message}
                        </p>
                    )}
                </div>

                <div className="report-note">
                    <Sparkles size={17} />

                    <div>
                        <strong>
                            {loading
                                ? "Loading saved reports"
                                : latest
                                    ? "AI report ready"
                                    : "No saved report yet"}
                        </strong>

                        <p>
                            {latest
                                ? `Generated ${formatDate(
                                    latest.createdAt,
                                )} from the latest feedback.`
                                : "Generate a report to create grounded customer intelligence."}
                        </p>
                    </div>
                </div>
            </aside>

            {reports.length > 0 && (
                <div
                    className="panel"
                    style={{
                        gridColumn: "1 / -1",
                    }}
                >
                    <PanelHead
                        title="Saved reports"
                        meta={`${reports.length} reports`}
                    />

                    <div className="feedback-list">
                        {reports.map(
                            (report) => (
                                <article
                                    className="feedback-item"
                                    key={
                                        report.id
                                    }
                                >
                                    <span className="person-avatar mint">
                                        <FileText
                                            size={
                                                17
                                            }
                                        />
                                    </span>

                                    <div className="feedback-copy">
                                        <div>
                                            <strong>
                                                {
                                                    report.title
                                                }
                                            </strong>

                                            <span>
                                                {formatDate(
                                                    report.createdAt,
                                                )}
                                            </span>
                                        </div>

                                        <p>
                                            {
                                                report.executiveSummary
                                            }
                                        </p>

                                        <div className="feedback-meta">
                                            <span className="source-pill">
                                                {formatDate(
                                                    report.periodStart,
                                                )}{" "}
                                                –{" "}
                                                {formatDate(
                                                    report.periodEnd,
                                                )}
                                            </span>

                                            <button
                                                className="text-button"
                                                onClick={() => {
                                                    window.location.href =
                                                        `/api/reports/${report.id}/pdf`;
                                                }}
                                            >
                                                Download PDF{" "}
                                                <Download
                                                    size={
                                                        13
                                                    }
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ),
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

type Member = {
    id: string;
    role: "ADMIN" | "ANALYST" | "VIEWER";
    user: { id: string; name: string | null; email: string };
};

function TeamView() {
    const [members, setMembers] = useState<Member[]>([]);
    const [currentRole, setCurrentRole] = useState("VIEWER");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "VIEWER",
    });

    const isAdmin = currentRole === "ADMIN";

    async function load() {
        try {
            const response = await fetch("/api/team", { cache: "no-store" });
            if (!response.ok) return;

            const data = (await response.json()) as {
                members: Member[];
                currentRole: string;
            };

            setMembers(data.members);
            setCurrentRole(data.currentRole);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
    }, []);

    async function changeRole(memberId: string, role: string) {
        setMessage(null);

        const response = await fetch("/api/team", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memberId, role }),
        });

        if (!response.ok) {
            const data = (await response.json()) as { error?: string };
            setMessage(data.error ?? "Could not update role.");
        }

        await load();
    }

    async function invite(event: React.FormEvent) {
        event.preventDefault();
        setMessage(null);

        const response = await fetch("/api/team", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
            setMessage(data.error ?? "Could not add member.");
            return;
        }

        setForm({ name: "", email: "", password: "", role: "VIEWER" });
        setMessage("Member added.");
        await load();
    }

    return (
        <div className="panel management-panel">
            <PanelHead
                title="Workspace members"
                meta={`${members.length} members`}
            />

            {loading ? (
                <div className="empty-state">Loading members…</div>
            ) : (
                members.map((member) => (
                    <div className="member-row" key={member.id}>
                        <span className="person-avatar coral">
                            {initials(member.user.name ?? member.user.email)}
                        </span>

                        <div>
                            <strong>{member.user.name ?? member.user.email}</strong>
                            <span>{member.user.email}</span>
                        </div>

                        {isAdmin ? (
                            <select
                                value={member.role}
                                onChange={(event) =>
                                    void changeRole(member.id, event.target.value)
                                }
                                aria-label={`Role for ${member.user.email}`}
                            >
                                <option value="ADMIN">Admin</option>
                                <option value="ANALYST">Analyst</option>
                                <option value="VIEWER">Viewer</option>
                            </select>
                        ) : (
                            <b>
                                {member.role.charAt(0) +
                                    member.role.slice(1).toLowerCase()}
                            </b>
                        )}
                    </div>
                ))
            )}

            {message && <p role="status">{message}</p>}

            {isAdmin && (
                <form onSubmit={invite} className="settings-panel">
                    <label>
                        Full name
                        <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </label>
                    <label>
                        Email
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </label>
                    <label>
                        Temporary password
                        <input
                            type="password"
                            minLength={8}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </label>
                    <label>
                        Role
                        <select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                        >
                            <option value="ADMIN">Admin</option>
                            <option value="ANALYST">Analyst</option>
                            <option value="VIEWER">Viewer</option>
                        </select>
                    </label>
                    <button className="button primary" type="submit">
                        Add member
                    </button>
                </form>
            )}
        </div>
    );
}

function SettingsView({
    workspaceName,
}: {
    workspaceName: string;
}) {
    return (
        <div className="panel management-panel settings-panel">
            <PanelHead
                title="Workspace settings"
                meta="Backend endpoint pending"
            />

            <label>
                Workspace name

                <input
                    value={workspaceName}
                    readOnly
                />
            </label>

            <label>
                Weekly digest

                <select
                    defaultValue="Monday morning"
                    disabled
                >
                    <option>
                        Monday morning
                    </option>

                    <option>
                        Friday afternoon
                    </option>

                    <option>
                        Off
                    </option>
                </select>
            </label>

            <label className="setting-toggle">
                <span>
                    <strong>
                        Email notifications
                    </strong>

                    <small>
                        Receive updates when
                        settings persistence is
                        available.
                    </small>
                </span>

                <input
                    type="checkbox"
                    defaultChecked
                    disabled
                />
            </label>

            <button
                className="button secondary"
                disabled
            >
                Save settings
            </button>
        </div>
    );
}

function FeedbackComposer({
    onClose,
}: {
    onClose: () => void;
}) {
    const [content, setContent] =
        useState("");

    const [source, setSource] =
        useState<Source>("MANUAL");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    async function submit() {
        if (!content.trim()) {
            setError(
                "Please enter feedback content.",
            );
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response =
                await fetch(
                    "/api/feedback",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            content:
                                content.trim(),
                            source,
                        }),
                    },
                );

            const data =
                (await response.json()) as {
                    error?: string;
                    message?: string;
                };

            if (!response.ok) {
                throw new Error(
                    data.error ??
                    "Failed to create feedback",
                );
            }

            setMessage(
                data.message ??
                "Feedback created successfully.",
            );

            window.setTimeout(
                onClose,
                600,
            );
        } catch (submitError) {
            setError(
                submitError instanceof
                    Error
                    ? submitError.message
                    : "Failed to create feedback",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="modal-backdrop"
            onClick={onClose}
        >
            <div
                className="composer"
                role="dialog"
                aria-modal="true"
                aria-labelledby="feedback-dialog-title"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <div className="composer-head">
                    <div>
                        <p className="eyebrow">
                            NEW ENTRY
                        </p>

                        <h2 id="feedback-dialog-title">
                            Add customer feedback
                        </h2>
                    </div>

                    <button
                        className="icon-button"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                <label>
                    Feedback

                    <textarea
                        value={content}
                        onChange={(event) =>
                            setContent(
                                event.target
                                    .value,
                            )
                        }
                        placeholder="Paste or write the customer message…"
                        autoFocus
                    />
                </label>

                <div className="composer-row">
                    <label>
                        Source

                        <select
                            value={source}
                            onChange={(
                                event,
                            ) =>
                                setSource(
                                    event.target
                                        .value as Source,
                                )
                            }
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

                    <label>
                        AI classification

                        <span
                            style={{
                                color: "var(--muted)",
                                fontSize: 10,
                                paddingTop: 9,
                            }}
                        >
                            Run on ingestion
                        </span>
                    </label>
                </div>

                {error && (
                    <p
                        className="report-status"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                {message && (
                    <p
                        className="report-status"
                        role="status"
                    >
                        {message}
                    </p>
                )}

                <button
                    className="button primary full"
                    onClick={() =>
                        void submit()
                    }
                    disabled={loading}
                >
                    {loading
                        ? "Analyzing…"
                        : "Save feedback"}
                </button>
            </div>
        </div>
    );
}