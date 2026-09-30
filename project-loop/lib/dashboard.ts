// import { db } from "@/lib/db";

// export async function getDashboardStats(workspaceId: string) {
//   const [totalFeedback, positiveFeedback, negativeFeedback, recentFeedback] =
//     await Promise.all([
//       db.feedback.count({
//         where: {
//           workspaceId,
//         },
//       }),

//       db.feedback.count({
//         where: {
//           workspaceId,
//           sentiment: {
//             equals: "positive",
//             mode: "insensitive",
//           },
//         },
//       }),

//       db.feedback.count({
//         where: {
//           workspaceId,
//           sentiment: {
//             equals: "negative",
//             mode: "insensitive",
//           },
//         },
//       }),

//       db.feedback.findMany({
//         where: {
//           workspaceId,
//         },
//         orderBy: {
//           createdAt: "desc",
//         },
//         take: 5,
//         select: {
//           id: true,
//           content: true,
//           sentiment: true,
//           theme: true,
//           source: true,
//           createdAt: true,
//         },
//       }),
//     ]);

//   return {
//     totalFeedback,
//     positiveFeedback,
//     negativeFeedback,
//     recentFeedback,
//   };
// }

import { db } from "@/lib/db";

export async function getDashboardStats(workspaceId: string) {
  const [
    totalFeedback,
    positiveFeedback,
    negativeFeedback,
    recentFeedback,
    themeCounts,
  ] = await Promise.all([
    db.feedback.count({
      where: {
        workspaceId,
      },
    }),

    db.feedback.count({
      where: {
        workspaceId,
        sentiment: {
          equals: "positive",
          mode: "insensitive",
        },
      },
    }),

    db.feedback.count({
      where: {
        workspaceId,
        sentiment: {
          equals: "negative",
          mode: "insensitive",
        },
      },
    }),

    db.feedback.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        content: true,
        sentiment: true,
        sentimentScore: true,
        summary: true,
        theme: true,
        category: true,
        source: true,
        createdAt: true,
      },
    }),

    db.feedback.groupBy({
      by: ["theme"],
      where: {
        workspaceId,
        theme: {
          not: null,
        },
      },
      _count: {
        theme: true,
      },
      orderBy: {
        _count: {
          theme: "desc",
        },
      },
      take: 5,
    }),
  ]);

  const topThemes = themeCounts.map((item) => ({
    theme: item.theme,
    count: item._count.theme,
  }));

  return {
    totalFeedback,
    positiveFeedback,
    negativeFeedback,
    recentFeedback,
    topThemes,
  };
}