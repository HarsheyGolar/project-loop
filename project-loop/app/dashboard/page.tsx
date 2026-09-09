export default function DashboardPage() {
    return (
        <main className="min-h-screen p-8">
            <h1 className="text-3xl font-bold">Project LOOP Dashboard</h1>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded -x1 border p-5">
                    <p className="text-sm text-gray-500">Total Feedback</p>
                    <p className="mt-2 text-2xl font-bold">0</p>
                </div>

                <div className="rounded-x1 border p-5">
                    <p className="text-sm text-gray-500">Positive Feedback</p>
                    <p className="mt-2 text-2xl font-bold">0</p>
                </div>

                <div className="rounded-x1 border p-5">
                    <p className="text-sm text-gray-500">Negative Feedback</p>
                    <p className="mt-2 text-2xl font-bold">0</p>
                </div>

                <div className="rounded-x1 border p-5">
                    <p className="text-sm text-gray-500">Top Themes</p>
                    <p className="mt-2 text-2xl font-bold">0</p>
                </div>
            </div>

            <div className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Recent Feedback</h2>
                <p className="mt-2 text-gray-500">
                    Feedback data will appear here.
                </p>
            </div>
        </main>
    )
}