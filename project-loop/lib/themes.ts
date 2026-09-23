import { db } from "./db";

export async function getThemeCounts(workspaceId: string) {
  const themes = await db.feedback.groupBy({
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
  });

  return themes.map((item) => ({
    theme: item.theme,
    count: item._count.theme,
  }));
}

export async function getFeedbackByTheme(
  workspaceId: string,
  theme: string
) {
  return db.feedback.findMany({
    where: {
      workspaceId,
      theme,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}