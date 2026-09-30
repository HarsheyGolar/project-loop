import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";

export type Role = "ADMIN" | "ANALYST" | "VIEWER";

export async function requireWorkspaceUser(allowed?: Role[]) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as const;
  }

  if (allowed && !allowed.includes(user.role as Role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    } as const;
  }

  return { user } as const;
}