"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FeedbackItemProps = {
  id: string;
  content: string;
  source: string;
  sentiment: string | null;
  theme: string | null;
};

export default function FeedbackItem({
  id,
  content,
  source,
  sentiment,
  theme,
}: FeedbackItemProps) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    if (!editedContent.trim()) {
      setMessage("Feedback cannot be empty.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/feedback", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          content: editedContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "Failed to update feedback.");
        return;
      }

      setIsEditing(false);
      setMessage("Updated successfully.");

      router.refresh();
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this feedback?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/feedback", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "Failed to delete feedback.");
        return;
      }

      router.refresh();
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border p-4">
      {isEditing ? (
        <div>
          <textarea
            value={editedContent}
            onChange={(event) => setEditedContent(event.target.value)}
            className="min-h-24 w-full rounded-lg border p-3 outline-none"
          />

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={() => {
                setEditedContent(content);
                setIsEditing(false);
                setMessage("");
              }}
              disabled={loading}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="font-medium">{content}</p>

          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
            <span>{source}</span>

            {sentiment && <span>{sentiment}</span>}

            {theme && <span>{theme}</span>}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="rounded-lg border px-4 py-2 text-sm text-red-600"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </>
      )}

      {message && (
        <p className="mt-3 text-sm text-gray-500">
          {message}
        </p>
      )}
    </div>
  );
}