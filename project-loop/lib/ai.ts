import { GoogleGenAI, Type } from "@google/genai";

const apikey = process.env.GEMINI_API_KEY;

if (!apikey) {
    throw new Error("GEMINI_API_KEY is not configured.");
}

const ai = new GoogleGenAI({
    apiKey: apikey,
});

const feedbackResponseSchema = {
    type: Type.OBJECT,
    properties: {
        sentiment: {
            type: Type.STRING,
            enum: ["positive", "neutral", "negative"],
            description: "overall sentiment of the customer feedback.",
        },
        summary: {
            type: Type.STRING,
            description: "The main topic or issue discussed in the feedback"
        },
        theme: {
            type: Type.STRING,
            description: "The main topic or issue discussed in the feedback."
        },
        category: {
            type: Type.STRING,
            description: 
            "A broad category such as product, performance, support, pricing, usability, or bug.",
        },
    },
    required: ["sentiment", "summary", "theme", "category"],
};

export async function analyzeFeedback(feedback: string) {
    const prompt = `
    Analyze the following customer feedback for project LOOP.
    
    Return:
    - sentiment: positive, neutral, or negative
    - summary: concise summary
    - theme: main topic or issue
    - category: broad category
    
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

    return JSON.parse(response.text)
}

