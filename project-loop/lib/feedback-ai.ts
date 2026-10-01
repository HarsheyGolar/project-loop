import { db } from "@/lib/db";
import { analyzeFeedback } from "@/lib/ai";

type ClassifyFeedbackInput = {
  feedbackId: string;
  workspaceId: string;
};

export async function classifyAndStoreFeedback({
  feedbackId,
  workspaceId,
}: ClassifyFeedbackInput) {
  const feedback = await db.feedback.findFirst({
    where: {
      id: feedbackId,
      workspaceId,
    },
    select: {
      id: true,
      content: true,
    },
  });

  if (!feedback) {
    throw new Error("Feedback not found.");
  }

  const analysis = await analyzeFeedback(feedback.content);

  const updatedFeedback = await db.feedback.update({
    where: {
      id: feedback.id,
    },
    data: {
      sentiment: analysis.sentiment,
      summary: analysis.summary,
      theme: analysis.theme,
      category: analysis.category,
    },
  });

  return updatedFeedback;
}