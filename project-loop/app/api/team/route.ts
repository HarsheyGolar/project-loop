import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireWorkspaceUser } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const roleSchema = z.enum(["ADMIN", "ANALYST", "VIEWER"]);

const inviteSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: roleSchema,
});

const updateSchema = z.object({
  memberId: z.string().min(1),
  role: roleSchema,
});

export async function GET() {
  const ctx = await requireWorkspaceUser();
  if ("error" in ctx) return ctx.error;

  const { user } = ctx;

  const members = await db.workspaceMember.findMany({
    where: { workspaceId: user.workspace.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({
    members,
    currentUserId: user.id,
    currentRole: user.role,
  });
}

export async function POST(request: Request) {
  const ctx = await requireWorkspaceUser(["ADMIN"]);
  if ("error" in ctx) return ctx.error;

  const parsed = inviteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await db.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      memberships: {
        create: {
          workspaceId: ctx.user.workspace.id,
          role: parsed.data.role,
        },
      },
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(request: Request) {
  const ctx = await requireWorkspaceUser(["ADMIN"]);
  if ("error" in ctx) return ctx.error;

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const workspaceId = ctx.user.workspace.id;

  const target = await db.workspaceMember.findFirst({
    where: { id: parsed.data.memberId, workspaceId },
    select: { id: true, role: true },
  });

  if (!target) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (target.role === "ADMIN" && parsed.data.role !== "ADMIN") {
    const admins = await db.workspaceMember.count({
      where: { workspaceId, role: "ADMIN" },
    });

    if (admins <= 1) {
      return NextResponse.json(
        { error: "A workspace needs at least one admin" },
        { status: 400 },
      );
    }
  }

  await db.workspaceMember.update({
    where: { id: target.id },
    data: { role: parsed.data.role },
  });

  return NextResponse.json({ ok: true });
}