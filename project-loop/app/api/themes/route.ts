import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  getThemeCounts,
  getFeedbackByTheme,
} from "@/lib/themes";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const membership = await db.workspaceMember.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        workspaceId: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const requestedWorkspaceId =
      request.nextUrl.searchParams.get("workspaceId");

    if (
      requestedWorkspaceId &&
      requestedWorkspaceId !== membership.workspaceId
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const workspaceId = membership.workspaceId;
    const theme = request.nextUrl.searchParams.get("theme");

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