import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      memberships: {
        select: {
          id: true,
          role: true,
          workspace: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 1,
      },
    },
  });

  if (!user) {
    return null;
  }

  const membership = user.memberships[0];

  if (!membership) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    workspace: membership.workspace,
    role: membership.role,
  };
}