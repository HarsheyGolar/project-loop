// import { db } from "@/lib/db";

// export function normalizeTheme(theme: string | null | undefined): string | null {
//   if (!theme) {
//     return null;
//   }

//   const value = theme
//     .trim()
//     .toLowerCase()
//     .replace(/[–—]/g, "-")
//     .replace(/\s+/g, " ");

//   if (!value) {
//     return null;
//   }

//   // Profile picture / photo upload crash variants
//   if (
//     /(profile picture|profile photo)/i.test(value) &&
//     /(upload|uploading|uploaded)/i.test(value) &&
//     /(crash|crashes|crashing|failed|failure|bug)/i.test(value)
//   ) {
//     return "Profile picture upload crash";
//   }

//   // Reports page performance variants
//   if (
//     /(reports page|report page|reports)/i.test(value) &&
//     /(slow|loading|performance|load time)/i.test(value)
//   ) {
//     return "Reports page performance";
//   }

//   // Checkout complexity variants
//   if (
//     /checkout/i.test(value) &&
//     /(complex|confus|lengthy|too many steps|many steps|friction)/i.test(value)
//   ) {
//     return "Checkout process complexity";
//   }

//   // New dashboard positive variants
//   if (
//     /new dashboard/i.test(value) &&
//     /(love|like|good|great|positive|satisf|appreciat)/i.test(value)
//   ) {
//     return "New dashboard";
//   }

//   // Clean up common AI wording differences.
//   const cleaned = value
//     .replace(/\b(app|application)\b/g, "")
//     .replace(/\b(issue|problem|feedback|experience)\b/g, "")
//     .replace(/\s+/g, " ")
//     .trim();

//   if (!cleaned) {
//     return null;
//   }

//   return cleaned
//     .split(" ")
//     .map(
//       (word) =>
//         word.charAt(0).toUpperCase() + word.slice(1),
//     )
//     .join(" ");
// }

// export async function getThemeCounts(workspaceId: string) {
//   const feedback = await db.feedback.findMany({
//     where: {
//       workspaceId,
//       theme: {
//         not: null,
//       },
//     },
//     select: {
//       theme: true,
//     },
//   });

//   const counts = new Map<string, number>();

//   for (const item of feedback) {
//     const theme = normalizeTheme(item.theme);

//     if (!theme) {
//       continue;
//     }

//     counts.set(
//       theme,
//       (counts.get(theme) ?? 0) + 1,
//     );
//   }

//   return Array.from(counts.entries())
//     .map(([theme, count]) => ({
//       theme,
//       count,
//     }))
//     .sort(
//       (a, b) =>
//         b.count - a.count ||
//         a.theme.localeCompare(b.theme),
//     );
// }

// export async function getFeedbackByTheme(
//   workspaceId: string,
//   theme: string,
// ) {
//   const feedback = await db.feedback.findMany({
//     where: {
//       workspaceId,
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });

//   const requestedTheme = normalizeTheme(theme);

//   return feedback.filter(
//     (item) =>
//       normalizeTheme(item.theme) ===
//       requestedTheme,
//   );
// }

// export async function getTrendData(workspaceId: string) {
//   const feedback = await db.feedback.findMany({
//     where: {
//       workspaceId,
//     },
//     orderBy: {
//       createdAt: "asc",
//     },
//     select: {
//       id: true,
//       sentiment: true,
//       createdAt: true,
//     },
//   });

//   const dailyData: Record<
//     string,
//     {
//       total: number;
//       positive: number;
//       neutral: number;
//       negative: number;
//     }
//   > = {};

//   for (const item of feedback) {
//     const date = item.createdAt
//       .toISOString()
//       .slice(0, 10);

//     if (!dailyData[date]) {
//       dailyData[date] = {
//         total: 0,
//         positive: 0,
//         neutral: 0,
//         negative: 0,
//       };
//     }

//     dailyData[date].total += 1;

//     if (item.sentiment === "positive") {
//       dailyData[date].positive += 1;
//     }

//     if (item.sentiment === "neutral") {
//       dailyData[date].neutral += 1;
//     }

//     if (item.sentiment === "negative") {
//       dailyData[date].negative += 1;
//     }
//   }

//   return Object.entries(dailyData).map(
//     ([date, values]) => ({
//       date,
//       ...values,
//     }),
//   );
// }

// export async function getThemeTrendData(workspaceId: string) {
//   const feedback = await db.feedback.findMany({
//     where: {
//       workspaceId,
//     },
//     orderBy: {
//       createdAt: "asc",
//     },
//     select: {
//       theme: true,
//       createdAt: true,
//     },
//   });

//   const dailyThemes: Record<
//     string,
//     Record<string, number>
//   > = {};

//   for (const item of feedback) {
//     const theme = normalizeTheme(item.theme);

//     if (!theme) continue;

//     const date = item.createdAt.toISOString().slice(0, 10);

//     if (!dailyThemes[date]) {
//       dailyThemes[date] = {};
//     }

//     dailyThemes[date][theme] =
//       (dailyThemes[date][theme] ?? 0) + 1;
//   }

//   return Object.entries(dailyThemes).map(
//     ([date, themes]) => ({
//       date,
//       themes,
//     })
//   );
// }

import { db } from "@/lib/db";

export function normalizeTheme(theme: string | null | undefined): string | null {
  if (!theme) {
    return null;
  }

  const value = theme
    .trim()
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ");

  if (!value) {
    return null;
  }

  // Profile picture / photo upload crash variants
  if (
    /(profile picture|profile photo)/i.test(value) &&
    /(upload|uploading|uploaded)/i.test(value) &&
    /(crash|crashes|crashing|failed|failure|bug)/i.test(value)
  ) {
    return "Profile picture upload crash";
  }

  // Reports page performance variants
  if (
    /(reports page|report page|reports)/i.test(value) &&
    /(slow|loading|performance|load time)/i.test(value)
  ) {
    return "Reports page performance";
  }

  // Checkout complexity variants
  if (
    /checkout/i.test(value) &&
    /(complex|confus|lengthy|too many steps|many steps|friction)/i.test(value)
  ) {
    return "Checkout process complexity";
  }

  // New dashboard positive variants
  if (
    /new dashboard/i.test(value) &&
    /(love|like|good|great|positive|satisf|appreciat)/i.test(value)
  ) {
    return "New dashboard";
  }

  // Clean up common AI wording differences.
  const cleaned = value
    .replace(/\b(app|application)\b/g, "")
    .replace(/\b(issue|problem|feedback|experience)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return null;
  }

  return cleaned
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

export async function getThemeCounts(workspaceId: string) {
  const feedback = await db.feedback.findMany({
    where: {
      workspaceId,
      theme: {
        not: null,
      },
    },
    select: {
      theme: true,
    },
  });

  const counts = new Map<string, number>();

  for (const item of feedback) {
    const theme = normalizeTheme(item.theme);

    if (!theme) {
      continue;
    }

    counts.set(
      theme,
      (counts.get(theme) ?? 0) + 1,
    );
  }

  return Array.from(counts.entries())
    .map(([theme, count]) => ({
      theme,
      count,
    }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        a.theme.localeCompare(b.theme),
    );
}

export async function getFeedbackByTheme(
  workspaceId: string,
  theme: string,
) {
  const feedback = await db.feedback.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const requestedTheme = normalizeTheme(theme);

  return feedback.filter(
    (item) =>
      normalizeTheme(item.theme) ===
      requestedTheme,
  );
}

export async function getTrendData(workspaceId: string) {
  const feedback = await db.feedback.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      sentiment: true,
      createdAt: true,
    },
  });

  const dailyData: Record<
    string,
    {
      total: number;
      positive: number;
      neutral: number;
      negative: number;
    }
  > = {};

  for (const item of feedback) {
    const date = item.createdAt
      .toISOString()
      .slice(0, 10);

    if (!dailyData[date]) {
      dailyData[date] = {
        total: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
      };
    }

    dailyData[date].total += 1;

    if (item.sentiment === "positive") {
      dailyData[date].positive += 1;
    }

    if (item.sentiment === "neutral") {
      dailyData[date].neutral += 1;
    }

    if (item.sentiment === "negative") {
      dailyData[date].negative += 1;
    }
  }

  return Object.entries(dailyData).map(
    ([date, values]) => ({
      date,
      ...values,
    }),
  );
}

export async function getThemeTrendData(workspaceId: string) {
  const feedback = await db.feedback.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      theme: true,
      createdAt: true,
    },
  });

  const dailyThemes: Record<
    string,
    Record<string, number>
  > = {};

  for (const item of feedback) {
    const theme = normalizeTheme(item.theme);

    if (!theme) continue;

    const date = item.createdAt.toISOString().slice(0, 10);

    if (!dailyThemes[date]) {
      dailyThemes[date] = {};
    }

    dailyThemes[date][theme] =
      (dailyThemes[date][theme] ?? 0) + 1;
  }

  return Object.entries(dailyThemes).map(
    ([date, themes]) => ({
      date,
      themes,
    })
  );
}

export async function getThemeSpikes(workspaceId: string, windowDays = 7) {
  const dayMs = 86_400_000;
  const now = Date.now();
  const currentStart = new Date(now - windowDays * dayMs);
  const previousStart = new Date(now - 2 * windowDays * dayMs);

  const feedback = await db.feedback.findMany({
    where: {
      workspaceId,
      theme: { not: null },
      createdAt: { gte: previousStart },
    },
    select: { theme: true, createdAt: true },
  });

  const buckets = new Map<string, { current: number; previous: number }>();

  for (const item of feedback) {
    const theme = normalizeTheme(item.theme);
    if (!theme) continue;

    const bucket = buckets.get(theme) ?? { current: 0, previous: 0 };

    if (item.createdAt >= currentStart) bucket.current += 1;
    else bucket.previous += 1;

    buckets.set(theme, bucket);
  }

  return Array.from(buckets.entries())
    .map(([theme, { current, previous }]) => {
      const changePct =
        previous === 0
          ? current > 0
            ? 100
            : 0
          : Math.round(((current - previous) / previous) * 100);

      const isSpiking =
        current >= 2 && current > previous && (previous === 0 || changePct >= 50);

      return { theme, current, previous, changePct, isSpiking };
    })
    .sort(
      (a, b) =>
        Number(b.isSpiking) - Number(a.isSpiking) || b.current - a.current,
    );
}