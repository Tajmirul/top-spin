import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          hd: "strativ.se", // Restrict to @strativ.se domain
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Enforce @strativ.se email domain
      if (!user.email?.endsWith("@strativ.se")) {
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (!user) return token;

      // Find existing user by email (might be placeholder from invite)
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      if (existingUser) {
        // Update existing user with name and image from Google
        const dbUser = await prisma.user.update({
          where: { email: user.email! },
          data: {
            name: user.name!,
            image: user.image,
          },
        });
        token.id = dbUser.id;
      } else {
        // Create new user
        const dbUser = await prisma.user.create({
          data: {
            email: user.email!,
            name: user.name!,
            image: user.image,
            rating: 1500,
          },
        });
        token.id = dbUser.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;

        // Fetch fresh rating from database on every session access
        const user = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { rating: true, role: true },
        });

        if (user) {
          session.user.rating = user.rating;
          session.user.role = user.role;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // Redirect to landing page for sign in
    error: "/", // Redirect to landing page on error
  },
});
