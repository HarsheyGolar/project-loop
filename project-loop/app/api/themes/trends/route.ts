import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const workspaceId =
      request.nextUrl.searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        workspaceId,
        trends: [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching theme trends:", error);

    return NextResponse.json(
      { error: "Failed to fetch theme trends" },
      { status: 500 }
    );
  }
}