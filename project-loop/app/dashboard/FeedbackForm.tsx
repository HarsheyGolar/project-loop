"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FeedbackForm() {
    const router = useRouter();

    const [content, setContent] = useState("");
    const [source, setSource] = useState("MANUAL");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!content.trim()) {
            setMessage("Please enter feedback.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content,
                    source,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.error ?? "Failed to create feedback.");
                return;
            }

            setContent("");
            setSource("MANUAL");
            setMessage(data.message ?? "Feedback created successfully.");

            router.refresh();
        } catch {
            setMessage("Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-xl border p-6"
        >
            <h2 className="text-xl font-semibold">
                Add Feedback
            </h2>

            <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Enter customer feedback..."
                className="mt-4 min-h-32 w-full rounded-lg border p-3 outline-none"
            />

            <select
                value={source}
                onChange={(event) => setSource(event.target.value)}
                className="mt-4 rounded-lg border p-3"
            >
                <option value="MANUAL">Manual</option>
                <option value="CSV">CSV</option>
                <option value="API">API</option>
                <option value="OTHER">Other</option>
            </select>

            <button
                type="submit"
                disabled={loading}
                className="mt-4 rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
            >
                {loading ? "Analyzing..." : "Add Feedback"}
            </button>

            {message && (
                <p className="mt-3 text-sm text-gray-500">
                    {message}
                </p>
            )}
        </form>
    );
}