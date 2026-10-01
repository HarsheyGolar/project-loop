import { db } from "@/lib/db";
import {
    answerWithFeedback,
    generateEmbedding,
} from "@/lib/ai";

function cosineSimilarity(
  a: number[],
  b: number[]
): number {
  if (a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return (
    dot /
    (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
  );
}

export async function askLoop(
  workspaceId: string,
  question: string
) {
  const questionEmbedding = await generateEmbedding(
    question,
    "RETRIEVAL_QUERY"
  );

  const feedback = await db.feedback.findMany({
    where: {
      workspaceId,
    },
    select: {
      id: true,
      content: true,
      sentiment: true,
      theme: true,
      category: true,
      summary: true,
      embedding: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const scoredFeedback = [];

  for (const item of feedback) {
    let embedding = item.embedding;

    if (!Array.isArray(embedding)) {
      embedding = await generateEmbedding(
        item.content,
        "RETRIEVAL_DOCUMENT"
      );

      await db.feedback.update({
        where: {
          id: item.id,
        },
        data: {
          embedding,
        },
      });
    }

    const score = cosineSimilarity(
      questionEmbedding,
      embedding as number[]
    );

    scoredFeedback.push({
      ...item,
      score,
    });
  }

  const relevantFeedback = scoredFeedback
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const context = relevantFeedback
    .map(
        (item, index) => `
SOURCE ${index + 1}
Feedback: ${item.content}
Sentiment: ${item.sentiment ?? "unknown"}
Theme: ${item.theme ?? "unknown"}
Category: ${item.category ?? "unknown"}
Summary: ${item.summary ?? "unknown"}
`
    )
    .join("\n");

const answer = await answerWithFeedback(
    question,
    context
);

return {
    question,
    answer,
    sources: relevantFeedback.map((item) => ({
        id: item.id,
        content: item.content,
        sentiment: item.sentiment,
        theme: item.theme,
        category: item.category,
        score: Number(item.score.toFixed(4)),
    })),
}};