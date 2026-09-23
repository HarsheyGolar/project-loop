import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import {
  getThemeCounts,
  getFeedbackByTheme,
} from "../../../lib/themes";

export async function GET(request: NextRequest) {
  try {
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    const theme = request.nextUrl.searchParams.get("theme");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    if (theme) {
      const feedback = await getFeedbackByTheme(workspaceId, theme);

      return NextResponse.json(feedback, { status: 200 });
    }

    const themes = await getThemeCounts(workspaceId);

    return NextResponse.json(themes, { status: 200 });
  } catch (error) {
    console.error("Error fetching themes:", error);

    return NextResponse.json(
      { error: "Failed to fetch themes" },
      { status: 500 }
    );
  }
}