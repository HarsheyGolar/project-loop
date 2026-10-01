import { z } from "zod";
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
}

const ai = new GoogleGenAI({
    apiKey,
});

const feedbackResponseSchema = {
    type: Type.OBJECT,
    properties: {
        sentiment: {
            type: Type.STRING,
            enum: ["positive", "neutral", "negative"],
            description: "Overall sentiment of the customer feedback.",
        },
        sentimentScore: {
            type: Type.NUMBER,
            description:
                "Sentiment score from -1.0 (strongly negative) to 1.0 (strongly positive).",
        },
        summary: {
            type: Type.STRING,
            description:
                "A concise summary of what the customer is saying.",
        },
        theme: {
            type: Type.STRING,
            description:
                "The main theme or issue discussed in the feedback.",
        },
        category: {
            type: Type.STRING,
            description:
                "A broad feature area such as product, performance, support, pricing, usability, or bug.",
        },
    },
    required: [
        "sentiment",
        "sentimentScore",
        "summary",
        "theme",
        "category",
    ],
};

const feedbackAnalysisSchema = z.object({
    sentiment: z.enum(["positive", "neutral", "negative"]),

    sentimentScore: z
        .number()
        .min(-1)
        .max(1),

    summary: z
        .string()
        .trim()
        .min(1),

    theme: z
        .string()
        .trim()
        .min(1),

    category: z
        .string()
        .trim()
        .min(1),
});

export type FeedbackAnalysis = z.infer<
    typeof feedbackAnalysisSchema
>;

export async function analyzeFeedback(
    feedback: string
): Promise<FeedbackAnalysis> {
    const prompt = `
Analyze the following customer feedback for Project LOOP.

Return:
- sentiment: positive, neutral, or negative
- sentimentScore: a number from -1.0 to 1.0
- summary: concise summary of the customer's feedback
- theme: the main topic or issue
- category: broad feature area such as product, performance, support, pricing, usability, or bug

Be consistent and concise.

Customer feedback:
"${feedback}"
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: feedbackResponseSchema,
        },
    });

    if (!response.text) {
        throw new Error("Gemini returned an empty response.");
    }

    let parsedResponse: unknown;

    try {
        parsedResponse = JSON.parse(response.text);
    } catch {
        throw new Error("Gemini returned invalid JSON.");
    }

    return feedbackAnalysisSchema.parse(parsedResponse);
}

export async function generateEmbedding(
    text: string,
    taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY"
): Promise<number[]> {
    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: text,
        config: {
            taskType,
            outputDimensionality: 768,
        },
    });

    const embedding = response.embeddings?.[0]?.values;

    if (!embedding || embedding.length === 0) {
        throw new Error("Gemini returned an empty embedding.");
    }

    return embedding;
}

export async function answerWithFeedback(
    question: string,
    context: string
): Promise<string> {
    const prompt = `
You are LOOP, a customer-feedback analysis assistant.

Answer the user's question using ONLY the feedback context provided below.
Do not invent facts.
Keep the answer concise and useful.
Mention patterns and issues that are actually present in the feedback.

User question:
${question}

Feedback context:
${context}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    if (!response.text) {
        throw new Error("Gemini returned an empty answer.");
    }

    return response.text.trim();
}

const vocReportSchema = z.object({
    executiveSummary: z.string().min(1),
    themeSummary: z.string().min(1),
    sentimentSummary: z.string().min(1),
    keyQuotes: z.array(z.string()).min(1).max(5),
    recommendedActions: z.string().min(1),
});

const vocReportResponseSchema = {
    type: Type.OBJECT,
    properties: {
        executiveSummary: {
            type: Type.STRING,
        },
        themeSummary: {
            type: Type.STRING,
        },
        sentimentSummary: {
            type: Type.STRING,
        },
        keyQuotes: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
            },
        },
        recommendedActions: {
            type: Type.STRING,
        },
    },
    required: [
        "executiveSummary",
        "themeSummary",
        "sentimentSummary",
        "keyQuotes",
        "recommendedActions",
    ],
};

export async function generateVocReport(
    context: string
) {
    const prompt = `
You are LOOP, a Voice-of-Customer analysis assistant.

Create a concise Voice-of-Customer report using ONLY the feedback provided below.

Return:
- executiveSummary: overall summary
- themeSummary: important recurring themes
- sentimentSummary: overall sentiment pattern
- keyQuotes: up to 5 representative customer quotes
- recommendedActions: practical product/business actions based only on the feedback

Do not invent information.

Feedback:
${context}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: vocReportResponseSchema,
        },
    });

    if (!response.text) {
        throw new Error("Gemini returned an empty report.");
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(response.text);
    } catch {
        throw new Error("Gemini returned invalid report JSON.");
    }

    return vocReportSchema.parse(parsed);
}