// import { NextResponse } from "next/server";
// import {z} from "zod"
// import { analyzeFeedback } from "@/lib/ai";

// const analyzeRequestSchema = z.object({
//     feedback: z
//     .string()
//     .trim()
//     .min(1, "Feedback is required.")
//     .max(5000, "Feedback is too long."),
// });

// export async function POST(request: Request){
//     try {
//         const body: unknown = await request.json();

//         const validation = analyzeRequestSchema.safeParse(body);

//         if(!validation.success) {
//             return NextResponse.json(
//                 {
//                     error:
//                     validation.error.issues[0]?.message ?? "Invalid request payload.",
//                 },
//                 {status: 400}
//             );
//         }

//         const analysis = await analyzeFeedback(validation.data.feedback);

//         return NextResponse.json(analysis, {
//             status: 200,
//         });
//     } catch (error) {
//         console.error("AI analysis error:", error);

//         return NextResponse.json(
//             {
//                 error: "Failed to analyze feedback.",
//             },
//             {status:500}
//         );
//     }
// }

import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeFeedback } from "@/lib/ai";
import { requireWorkspaceUser } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const analyzeRequestSchema = z.object({
  feedback: z
    .string()
    .trim()
    .min(1, "Feedback is required.")
    .max(5000, "Feedback is too long."),
});

export async function POST(request: Request) {
  try {
    // Without this guard anyone on the internet could spend the AI quota.
    const ctx = await requireWorkspaceUser(["ADMIN", "ANALYST"]);
    if ("error" in ctx) return ctx.error;

    const body: unknown = await request.json();
    const validation = analyzeRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error:
            validation.error.issues[0]?.message ?? "Invalid request payload.",
        },
        { status: 400 },
      );
    }

    const analysis = await analyzeFeedback(validation.data.feedback);

    return NextResponse.json(analysis, { status: 200 });
  } catch (error) {
    console.error("AI analysis error:", error);

    return NextResponse.json(
      { error: "Failed to analyze feedback." },
      { status: 500 },
    );
  }
}