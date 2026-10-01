"use client";

import { useState } from "react";
import Link from "next/link";

export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [simulating, setSimulating] = useState(false);

    async function handleSimulate() {
    setSimulating(true);
    setMessage("Loading simulated support tickets...");
    try {
        const response = await fetch("/api/feedback/simulate", { method: "POST" });
        const data = await response.json();
        if (!response.ok) {
            setMessage(data.error ?? "Simulation failed.");
            return;
        }
        setMessage(
            `Simulated: Imported: ${data.imported ?? 0} | Failed: ${data.failed ?? 0} | Unclassified: ${data.unclassified ?? 0}`
        );
    } catch {
        setMessage("Something went wrong during simulation.");
    } finally {
        setSimulating(false);
    }
}

    async function handleImport() {
        if (!file) {
            setMessage("Please select a CSV file.");
            return;
        }

        setLoading(true);
        setMessage("Importing CSV and analyzing feedback...");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/feedback/import", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.error ?? "Import failed.");
                return;
            }

            setMessage(
                `Imported: ${data.imported ?? 0} | Failed: ${data.failed ?? 0} | Unclassified: ${data.unclassified ?? 0}`
            );

        } catch {
            setMessage("Something went wrong during import.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen p-8">
            <div className="mx-auto max-w-3xl">
                <Link
                    href="/dashboard"
                    className="text-sm text-gray-400 hover:text-white"
                >
                    ← Back to Dashboard
                </Link>

                <h1 className="mt-6 text-3xl font-bold">
                    Import Feedback CSV
                </h1>

                <p className="mt-2 text-gray-400">
                    Upload customer feedback in CSV format.
                    LOOP will automatically analyze each feedback
                    using Gemini.
                </p>

                <div className="mt-8 rounded-xl border p-6">
                    <label className="block text-sm font-medium">
                        CSV File
                    </label>

                    <input
                        type="file"
                        accept=".csv,text/csv"
                        onChange={(event) =>
                            setFile(event.target.files?.[0] ?? null)
                        }
                        className="mt-3 block w-full rounded-lg border p-3"
                    />

                    <div className="mt-6 rounded-lg border p-4 text-sm text-gray-400">
                        <p className="font-medium text-white">
                            Expected CSV format:
                        </p>

                        <pre className="mt-3 overflow-auto">
                            {`content,source
"The mobile app crashes when I upload a photo.",CSV
"The checkout process is confusing.",CSV
"I love the new dashboard.",CSV`}
                        </pre>
                    </div>

                    <button
                        type="button"
                        onClick={handleImport}
                        disabled={!file || loading}
                        className="mt-6 rounded-lg bg-white px-5 py-3 font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Importing..." : "Import CSV"}
                    </button>

                    <button
                        type="button"
                        onClick={handleSimulate}
                        disabled={simulating}
                        className="mt-3 rounded-lg border border-white/20 px-5 py-3 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {simulating ? "Loading..." : "Load Simulated Support Tickets"}
                    </button>

                    {message && (
                        <p className="mt-5 text-sm text-gray-300">
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}