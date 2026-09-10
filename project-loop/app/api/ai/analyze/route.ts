import { NextResponse } from "next/server";
import { analyzeFeedback } from "@/lib/ai";

export async function POST(request: Request){
    try {
        const body = await request.json();
        if (
            !body ||
            typeof body.feedback !== "string" ||
            body.feedback.trim().length === 0
        ) {
            return NextResponse.json(
                {error: "Feedback is required. "},
                {status: 400}
            );
        }

        const result = await analyzeFeedback(body.feedback);

        return NextResponse.json(result, {status: 200});
    } catch (error) {
        console.error("AI analysis error: ", error);

        return NextResponse.json(
            {error: "Failed to analysis feedback."},
            { status: 500}
        );
    }
}