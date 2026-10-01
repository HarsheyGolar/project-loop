declare module 'next/server';

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/lib/db";

const signupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid signup details",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const name = parsed.data.name;
    const email = parsed.data.email.toLowerCase().trim();

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: `${name}'s Workspace`,
        },
      });

      await tx.workspaceMember.create({
        data: {
          userId: newUser.id,
          workspaceId: workspace.id,
          role: "ADMIN",
        },
      });

      return newUser;
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      { error: "Something went wrong while creating your account" },
      { status: 500 },
    );
  }
}