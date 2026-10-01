// import { NextResponse } from "next/server";
// import { auth } from "@/auth";
// import { db } from "@/lib/db";
// import {
//   getThemeCounts,
//   getTrendData,
//   getThemeTrendData,
// } from "@/lib/themes";

// export const dynamic = "force-dynamic";

// export async function GET() {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const membership = await db.workspaceMember.findFirst({
//       where: {
//         userId: session.user.id,
//       },
//       orderBy: {
//         createdAt: "asc",
//       },
//       select: {
//         workspaceId: true,
//       },
//     });

//     if (!membership) {
//       return NextResponse.json(
//         { error: "Workspace not found" },
//         { status: 404 }
//       );
//     }

//     const [trends, themeTrends, topThemes] = await Promise.all([
//       getTrendData(membership.workspaceId),
//       getThemeTrendData(membership.workspaceId),
//       getThemeCounts(membership.workspaceId),
//     ]);

//     return NextResponse.json({
//       trends,
//       themeTrends,
//       topThemes,
//     });
//   } catch (error) {
//     console.error("GET /api/themes/trends error:", error);

//     return NextResponse.json(
//       { error: "Failed to fetch trends" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  getThemeCounts,
  getTrendData,
  getThemeTrendData,
  getThemeSpikes,
} from "@/lib/themes";

export const dynamic = "force-dynamic";

export async function GET() {
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

    const [trends, themeTrends, topThemes, spikes] = await Promise.all([
      getTrendData(membership.workspaceId),
      getThemeTrendData(membership.workspaceId),
      getThemeCounts(membership.workspaceId),
      getThemeSpikes(membership.workspaceId),
    ]);

    return NextResponse.json({
      trends,
      themeTrends,
      topThemes,
      spikes,
    });
  } catch (error) {
    console.error("GET /api/themes/trends error:", error);

    return NextResponse.json(
      { error: "Failed to fetch trends" },
      { status: 500 }
    );
  }
}