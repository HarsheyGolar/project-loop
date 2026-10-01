// import { NextResponse } from "next/server";
// import { z } from "zod";
// import { auth } from "@/auth";
// import { db } from "@/lib/db";
// import {
//   analyzeFeedback,
//   generateEmbedding,
// } from "@/lib/ai";
// import { normalizeTheme } from "@/lib/themes";

// const sourceSchema = z.enum([
//   "MANUAL",
//   "CSV",
//   "API",
//   "OTHER",
// ]);

// const sentimentSchema = z.enum([
//   "positive",
//   "neutral",
//   "negative",
// ]);

// const statusSchema = z.enum([
//   "NEW",
//   "REVIEWED",
//   "ACTIONED",
// ]);

// const createFeedbackSchema = z.object({
//   content: z.string().trim().min(1).max(10000),
//   source: sourceSchema.default("MANUAL"),
// });

// const updateFeedbackSchema = z.object({
//   id: z.string().min(1),
//   content: z.string().trim().min(1).max(10000).optional(),
//   source: sourceSchema.optional(),
//   status: statusSchema.optional(),
// });

// const querySchema = z.object({
//   page: z.coerce.number().int().min(1).default(1),
//   pageSize: z.coerce
//     .number()
//     .int()
//     .min(1)
//     .max(50)
//     .default(20),
//   q: z.string().trim().max(200).optional(),
//   source: sourceSchema.optional(),
//   sentiment: sentimentSchema.optional(),
//   theme: z.string().trim().max(200).optional(),
//   status: statusSchema.optional(),
//   from: z
//     .string()
//     .regex(/^\d{4}-\d{2}-\d{2}$/)
//     .optional(),
//   to: z
//     .string()
//     .regex(/^\d{4}-\d{2}-\d{2}$/)
//     .optional(),
// });

// export const dynamic = "force-dynamic";

// async function getWorkspaceId(
//   userId: string,
// ): Promise<string | null> {
//   const membership =
//     await db.workspaceMember.findFirst({
//       where: {
//         userId,
//       },
//       orderBy: {
//         createdAt: "asc",
//       },
//       select: {
//         workspaceId: true,
//       },
//     });

//   return membership?.workspaceId ?? null;
// }

// export async function GET(request: Request) {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 },
//       );
//     }

//     const workspaceId = await getWorkspaceId(
//       session.user.id,
//     );

//     if (!workspaceId) {
//       return NextResponse.json(
//         { error: "Workspace not found" },
//         { status: 404 },
//       );
//     }

//     const url = new URL(request.url);

//     const rawQuery = {
//       page:
//         url.searchParams.get("page") ??
//         undefined,
//       pageSize:
//         url.searchParams.get("pageSize") ??
//         undefined,
//       q:
//         url.searchParams.get("q") ??
//         undefined,
//       source:
//         url.searchParams.get("source") ??
//         undefined,
//       sentiment:
//         url.searchParams.get("sentiment") ??
//         undefined,
//       theme:
//         url.searchParams.get("theme") ??
//         undefined,
//       status:
//         url.searchParams.get("status") ??
//         undefined,
//       from:
//         url.searchParams.get("from") ??
//         undefined,
//       to:
//         url.searchParams.get("to") ??
//         undefined,
//     };

//     const parsed =
//       querySchema.safeParse(rawQuery);

//     if (!parsed.success) {
//       return NextResponse.json(
//         {
//           error: "Invalid feedback query",
//           issues:
//             parsed.error.flatten(),
//         },
//         { status: 400 },
//       );
//     }

//     const {
//       page,
//       pageSize,
//       q,
//       source,
//       sentiment,
//       theme,
//       status,
//       from,
//       to,
//     } = parsed.data;

//     if (from && to && from > to) {
//       return NextResponse.json(
//         {
//           error:
//             "The start date cannot be after the end date",
//         },
//         { status: 400 },
//       );
//     }

//     const createdAt: {
//       gte?: Date;
//       lte?: Date;
//     } = {};

//     if (from) {
//       createdAt.gte = new Date(
//         `${from}T00:00:00.000Z`,
//       );
//     }

//     if (to) {
//       createdAt.lte = new Date(
//         `${to}T23:59:59.999Z`,
//       );
//     }

//     const baseWhere = {
//       workspaceId,
//       ...(q
//         ? {
//             OR: [
//               {
//                 content: {
//                   contains: q,
//                   mode: "insensitive" as const,
//                 },
//               },
//             ],
//           }
//         : {}),
//       ...(source ? { source } : {}),
//       ...(sentiment ? { sentiment } : {}),
//       ...(theme ? { theme } : {}),
//       ...(from || to ? { createdAt } : {}),
//     };

//     const filteredWhere = {
//       ...baseWhere,
//       ...(status ? { status } : {}),
//     };

//     const skip = (page - 1) * pageSize;

//     /*
//      * Counts are calculated independently from the paginated
//      * feedback list so the inbox tabs always show the real
//      * workspace totals.
//      */
//     const [
//       total,
//       newCount,
//       reviewedCount,
//       actionedCount,
//       feedback,
//       themeRows,
//     ] = await Promise.all([
//       db.feedback.count({
//         where: baseWhere,
//       }),

//       db.feedback.count({
//         where: {
//           ...baseWhere,
//           status: "NEW",
//         },
//       }),

//       db.feedback.count({
//         where: {
//           ...baseWhere,
//           status: "REVIEWED",
//         },
//       }),

//       db.feedback.count({
//         where: {
//           ...baseWhere,
//           status: "ACTIONED",
//         },
//       }),

//       db.feedback.findMany({
//         where: filteredWhere,
//         orderBy: {
//           createdAt: "desc",
//         },
//         skip,
//         take: pageSize,
//       }),

//       db.feedback.findMany({
//         where: baseWhere,
//         select: {
//           theme: true,
//         },
//         distinct: ["theme"],
//       }),
//     ]);

//     const themes = themeRows
//       .map((row) => row.theme)
//       .filter(
//         (value): value is string =>
//           typeof value === "string" &&
//           value.trim().length > 0,
//       );

//     const totalPages =
//       total === 0
//         ? 1
//         : Math.ceil(total / pageSize);

//     return NextResponse.json({
//       feedback,
//       pagination: {
//         page,
//         pageSize,
//         total,
//         totalPages,
//         hasNext: page < totalPages,
//         hasPrevious: page > 1,
//       },
//       counts: {
//         ALL: total,
//         NEW: newCount,
//         REVIEWED: reviewedCount,
//         ACTIONED: actionedCount,
//       },
//       filters: {
//         themes,
//       },
//     });
//   } catch (error) {
//     console.error(
//       "GET /api/feedback error:",
//       error,
//     );

//     return NextResponse.json(
//       { error: "Failed to fetch feedback" },
//       { status: 500 },
//     );
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 },
//       );
//     }

//     const workspaceId = await getWorkspaceId(
//       session.user.id,
//     );

//     if (!workspaceId) {
//       return NextResponse.json(
//         { error: "Workspace not found" },
//         { status: 404 },
//       );
//     }

//     const body: unknown =
//       await request.json();

//     const parsed =
//       createFeedbackSchema.safeParse(body);

//     if (!parsed.success) {
//       return NextResponse.json(
//         {
//           error: "Invalid feedback data",
//           issues:
//             parsed.error.flatten(),
//         },
//         { status: 400 },
//       );
//     }

//     const feedback =
//       await db.feedback.create({
//         data: {
//           content: parsed.data.content,
//           source: parsed.data.source,
//           workspaceId,
//           createdById: session.user.id,
//           status: "New",
//         },
//       });

//     try {
//       const [analysis, embedding] =
//         await Promise.all([
//           analyzeFeedback(
//             feedback.content,
//           ),
//           generateEmbedding(
//             feedback.content,
//             "RETRIEVAL_DOCUMENT",
//           ),
//         ]);

//       const classifiedFeedback =
//         await db.feedback.update({
//           where: {
//             id: feedback.id,
//           },
//           data: {
//             sentiment:
//               analysis.sentiment,
//             sentimentScore:
//               analysis.sentimentScore,
//             summary:
//               analysis.summary,
//             theme:
//               normalizeTheme(
//                 analysis.theme,
//               ) ?? analysis.theme,
//             category:
//               analysis.category,
//             embedding,
//           },
//         });

//       return NextResponse.json(
//         {
//           message:
//             "Feedback created and classified successfully",
//           feedback:
//             classifiedFeedback,
//         },
//         { status: 201 },
//       );
//     } catch (aiError) {
//       console.error(
//         "Feedback AI classification error:",
//         aiError,
//       );

//       return NextResponse.json(
//         {
//           message:
//             "Feedback created, but AI classification failed",
//           feedback,
//         },
//         { status: 201 },
//       );
//     }
//   } catch (error) {
//     console.error(
//       "POST /api/feedback error:",
//       error,
//     );

//     return NextResponse.json(
//       {
//         error:
//           "Failed to create feedback",
//       },
//       { status: 500 },
//     );
//   }
// }

// export async function PATCH(request: Request) {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 },
//       );
//     }

//     const workspaceId = await getWorkspaceId(
//       session.user.id,
//     );

//     if (!workspaceId) {
//       return NextResponse.json(
//         { error: "Workspace not found" },
//         { status: 404 },
//       );
//     }

//     const body: unknown =
//       await request.json();

//     const parsed =
//       updateFeedbackSchema.safeParse(body);

//     if (!parsed.success) {
//       return NextResponse.json(
//         {
//           error:
//             "Invalid feedback update data",
//           issues:
//             parsed.error.flatten(),
//         },
//         { status: 400 },
//       );
//     }

//     const existingFeedback =
//       await db.feedback.findFirst({
//         where: {
//           id: parsed.data.id,
//           workspaceId,
//         },
//       });

//     if (!existingFeedback) {
//       return NextResponse.json(
//         {
//           error: "Feedback not found",
//         },
//         { status: 404 },
//       );
//     }

//     const feedback =
//       await db.feedback.update({
//         where: {
//           id: existingFeedback.id,
//         },
//         data: {
//           ...(parsed.data.content !==
//             undefined && {
//             content:
//               parsed.data.content,
//           }),

//           ...(parsed.data.source !==
//             undefined && {
//             source:
//               parsed.data.source,
//           }),

//           ...(parsed.data.status !==
//             undefined && {
//             status:
//               parsed.data.status,
//           }),
//         },
//       });

//     return NextResponse.json({
//       message:
//         "Feedback updated successfully",
//       feedback,
//     });
//   } catch (error) {
//     console.error(
//       "PATCH /api/feedback error:",
//       error,
//     );

//     return NextResponse.json(
//       {
//         error:
//           "Failed to update feedback",
//       },
//       { status: 500 },
//     );
//   }
// }

// export async function DELETE(request: Request) {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 },
//       );
//     }

//     const workspaceId = await getWorkspaceId(
//       session.user.id,
//     );

//     if (!workspaceId) {
//       return NextResponse.json(
//         { error: "Workspace not found" },
//         { status: 404 },
//       );
//     }

//     const body: unknown =
//       await request.json();

//     const deleteSchema = z.object({
//       id: z.string().min(1),
//     });

//     const parsed =
//       deleteSchema.safeParse(body);

//     if (!parsed.success) {
//       return NextResponse.json(
//         {
//           error:
//             "Invalid feedback ID",
//         },
//         { status: 400 },
//       );
//     }

//     const existingFeedback =
//       await db.feedback.findFirst({
//         where: {
//           id: parsed.data.id,
//           workspaceId,
//         },
//       });

//     if (!existingFeedback) {
//       return NextResponse.json(
//         {
//           error: "Feedback not found",
//         },
//         { status: 404 },
//       );
//     }

//     await db.feedback.delete({
//       where: {
//         id: existingFeedback.id,
//       },
//     });

//     return NextResponse.json({
//       message:
//         "Feedback deleted successfully",
//     });
//   } catch (error) {
//     console.error(
//       "DELETE /api/feedback error:",
//       error,
//     );

//     return NextResponse.json(
//       {
//         error:
//           "Failed to delete feedback",
//       },
//       { status: 500 },
//     );
//   }
// }
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { analyzeFeedback, generateEmbedding } from "@/lib/ai";
import { normalizeTheme } from "@/lib/themes";
import { requireWorkspaceUser, type Role } from "@/lib/rbac";

export const dynamic = "force-dynamic";

// Viewers are read-only; only these roles may create/update/delete feedback.
const WRITE_ROLES: Role[] = ["ADMIN", "ANALYST"];

const sourceSchema = z.enum(["MANUAL", "CSV", "API", "OTHER"]);
const sentimentSchema = z.enum(["positive", "neutral", "negative"]);
const statusSchema = z.enum(["NEW", "REVIEWED", "ACTIONED"]);

const createFeedbackSchema = z.object({
  content: z.string().trim().min(1).max(10000),
  source: sourceSchema.default("MANUAL"),
});

const updateFeedbackSchema = z.object({
  id: z.string().min(1),
  content: z.string().trim().min(1).max(10000).optional(),
  source: sourceSchema.optional(),
  status: statusSchema.optional(),
});

const deleteFeedbackSchema = z.object({
  id: z.string().min(1),
});

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  q: z.string().trim().max(200).optional(),
  source: sourceSchema.optional(),
  sentiment: sentimentSchema.optional(),
  theme: z.string().trim().max(200).optional(),
  status: statusSchema.optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
});

export async function GET(request: Request) {
  try {
    const ctx = await requireWorkspaceUser();
    if ("error" in ctx) return ctx.error;

    const workspaceId = ctx.user.workspace.id;
    const params = new URL(request.url).searchParams;

    const parsed = querySchema.safeParse({
      page: params.get("page") ?? undefined,
      pageSize: params.get("pageSize") ?? undefined,
      q: params.get("q") ?? undefined,
      source: params.get("source") ?? undefined,
      sentiment: params.get("sentiment") ?? undefined,
      theme: params.get("theme") ?? undefined,
      status: params.get("status") ?? undefined,
      from: params.get("from") ?? undefined,
      to: params.get("to") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid feedback query", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { page, pageSize, q, source, sentiment, theme, status, from, to } =
      parsed.data;

    if (from && to && from > to) {
      return NextResponse.json(
        { error: "The start date cannot be after the end date" },
        { status: 400 },
      );
    }

    const createdAt: { gte?: Date; lte?: Date } = {};
    if (from) createdAt.gte = new Date(`${from}T00:00:00.000Z`);
    if (to) createdAt.lte = new Date(`${to}T23:59:59.999Z`);

    // Every query below is filtered by the caller's workspaceId.
    const baseWhere = {
      workspaceId,
      ...(q
        ? { OR: [{ content: { contains: q, mode: "insensitive" as const } }] }
        : {}),
      ...(source ? { source } : {}),
      ...(sentiment ? { sentiment } : {}),
      ...(theme ? { theme } : {}),
      ...(from || to ? { createdAt } : {}),
    };

    const filteredWhere = { ...baseWhere, ...(status ? { status } : {}) };
    const skip = (page - 1) * pageSize;

    // Counts are independent from the paginated list so the tabs
    // always show real totals.
    const [total, newCount, reviewedCount, actionedCount, feedback, themeRows] =
      await Promise.all([
        db.feedback.count({ where: baseWhere }),
        db.feedback.count({ where: { ...baseWhere, status: "NEW" } }),
        db.feedback.count({ where: { ...baseWhere, status: "REVIEWED" } }),
        db.feedback.count({ where: { ...baseWhere, status: "ACTIONED" } }),
        db.feedback.findMany({
          where: filteredWhere,
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        }),
        db.feedback.findMany({
          where: baseWhere,
          select: { theme: true },
          distinct: ["theme"],
        }),
      ]);

    const themes = themeRows
      .map((row) => row.theme)
      .filter(
        (value): value is string =>
          typeof value === "string" && value.trim().length > 0,
      );

    const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);

    return NextResponse.json({
      feedback,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
      counts: {
        ALL: total,
        NEW: newCount,
        REVIEWED: reviewedCount,
        ACTIONED: actionedCount,
      },
      filters: { themes },
    });
  } catch (error) {
    console.error("GET /api/feedback error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireWorkspaceUser(WRITE_ROLES);
    if ("error" in ctx) return ctx.error;

    const body: unknown = await request.json();
    const parsed = createFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid feedback data", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const feedback = await db.feedback.create({
      data: {
        content: parsed.data.content,
        source: parsed.data.source,
        workspaceId: ctx.user.workspace.id,
        createdById: ctx.user.id,
        status: "NEW",
      },
    });

    try {
      const [analysis, embedding] = await Promise.all([
        analyzeFeedback(feedback.content),
        generateEmbedding(feedback.content, "RETRIEVAL_DOCUMENT"),
      ]);

      const classifiedFeedback = await db.feedback.update({
        where: { id: feedback.id },
        data: {
          sentiment: analysis.sentiment,
          sentimentScore: analysis.sentimentScore,
          summary: analysis.summary,
          theme: normalizeTheme(analysis.theme) ?? analysis.theme,
          category: analysis.category,
          embedding,
        },
      });

      return NextResponse.json(
        {
          message: "Feedback created and classified successfully",
          feedback: classifiedFeedback,
        },
        { status: 201 },
      );
    } catch (aiError) {
      console.error("Feedback AI classification error:", aiError);

      return NextResponse.json(
        {
          message: "Feedback created, but AI classification failed",
          feedback,
        },
        { status: 201 },
      );
    }
  } catch (error) {
    console.error("POST /api/feedback error:", error);
    return NextResponse.json(
      { error: "Failed to create feedback" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const ctx = await requireWorkspaceUser(WRITE_ROLES);
    if ("error" in ctx) return ctx.error;

    const body: unknown = await request.json();
    const parsed = updateFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid feedback update data", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existingFeedback = await db.feedback.findFirst({
      where: { id: parsed.data.id, workspaceId: ctx.user.workspace.id },
    });

    if (!existingFeedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    const feedback = await db.feedback.update({
      where: { id: existingFeedback.id },
      data: {
        ...(parsed.data.content !== undefined && { content: parsed.data.content }),
        ...(parsed.data.source !== undefined && { source: parsed.data.source }),
        ...(parsed.data.status !== undefined && { status: parsed.data.status }),
      },
    });

    return NextResponse.json({
      message: "Feedback updated successfully",
      feedback,
    });
  } catch (error) {
    console.error("PATCH /api/feedback error:", error);
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const ctx = await requireWorkspaceUser(WRITE_ROLES);
    if ("error" in ctx) return ctx.error;

    const body: unknown = await request.json();
    const parsed = deleteFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid feedback ID" }, { status: 400 });
    }

    const existingFeedback = await db.feedback.findFirst({
      where: { id: parsed.data.id, workspaceId: ctx.user.workspace.id },
    });

    if (!existingFeedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    await db.feedback.delete({ where: { id: existingFeedback.id } });

    return NextResponse.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/feedback error:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 },
    );
  }
}