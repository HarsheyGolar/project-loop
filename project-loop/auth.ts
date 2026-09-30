import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/lib/db";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/auth/login",
  },

  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const email = parsed.data.email.toLowerCase().trim();

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const passwordValid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );

        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      const typedToken = token as typeof token & { userId?: string };

      if (user) {
        typedToken.userId = user.id as string;
      }

      return typedToken;
    },

    async session({ session, token }) {
      const typedToken = token as typeof token & { userId?: string };

      if (session.user && typedToken.userId) {
        session.user.id = typedToken.userId;
      }

      return session;
    },
  },
});