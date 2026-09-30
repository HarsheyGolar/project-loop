"use client";

import { useState } from "react";
import Link from "next/link";

type Source = {
    id: string;
    content: string;
    sentiment: string | null;
    theme: string | null;
    category: string | null;
    score: number;
};

type AskResult = {
    question: string;
    answer: string;
    sources: Source[];
};

export default function AskLoopPage() {
    const [question, setQuestion] = useState("");
    const [result, setResult] = useState<AskResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleAsk() {
        if (!question.trim()) {
            setError("Please enter a question.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await fetch("/api/ask-loop", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    question,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error ?? "Failed to get an answer.");
                return;
            }

            setResult(data);
        } catch {
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen p-8">
            <div className="mx-auto max-w-4xl">
                <Link
                    href="/dashboard"
                    className="text-sm text-gray-400 hover:text-white"
                >
                    ← Back to Dashboard
                </Link>

                <h1 className="mt-6 text-3xl font-bold">
                    Ask LOOP
                </h1>

                <p className="mt-2 text-gray-400">
                    Ask questions about what your customers are saying.
                </p>

                <div className="mt-8 rounded-xl border p-6">
                    <textarea
                        value={question}
                        onChange={(event) =>
                            setQuestion(event.target.value)
                        }
                        placeholder="What are customers complaining about?"
                        className="min-h-32 w-full rounded-lg border p-4 outline-none"
                    />

                    <button
                        type="button"
                        onClick={handleAsk}
                        disabled={loading}
                        className="mt-4 rounded-lg bg-white px-5 py-3 font-medium text-black disabled:opacity-50"
                    >
                        {loading ? "Thinking..." : "Ask LOOP"}
                    </button>

                    {error && (
                        <p className="mt-4 text-sm text-red-400">
                            {error}
                        </p>
                    )}
                </div>

                {result && (
                    <>
                        <div className="mt-8 rounded-xl border p-6">
                            <h2 className="text-xl font-semibold">
                                LOOP Answer
                            </h2>

                            <p className="mt-4 whitespace-pre-wrap text-gray-300">
                                {result.answer}
                            </p>
                        </div>

                        <div className="mt-8 rounded-xl border p-6">
                            <h2 className="text-xl font-semibold">
                                Supporting Feedback
                            </h2>

                            <div className="mt-4 space-y-4">
                                {result.sources.map((source) => (
                                    <div
                                        key={source.id}
                                        className="rounded-lg border p-4"
                                    >
                                        <p className="font-medium">
                                            {source.content}
                                        </p>

                                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                                            <span>
                                                {source.sentiment ?? "unknown"}
                                            </span>

                                            <span>
                                                {source.theme ?? "unknown"}
                                            </span>

                                            <span>
                                                {source.category ?? "unknown"}
                                            </span>

                                            <span>
                                                relevance: {source.score}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}