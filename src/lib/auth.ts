import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "./prisma"
import { GITHUB_SCOPES } from "./github-auth"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_APP_CLIENT_ID!,
      clientSecret: process.env.GITHUB_APP_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        session.user.id = user?.id || token?.sub || '';
      }
      return session
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (account?.provider === "github" && profile) {
        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
          where: { 
            OR: [
              { email: token.email },
              { githubId: profile.id?.toString() }
            ]
          }
        });

        if (existingUser) {
          // Update existing user with GitHub data
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              githubId: profile.id?.toString() || null,
              username: (profile as any).login || null,
            },
          });
          token.sub = existingUser.id;
        } else {
          // Create new user with GitHub data
          const newUser = await prisma.user.create({
            data: {
              email: token.email || null,
              name: token.name || null,
              image: token.picture || null,
              githubId: profile.id?.toString() || null,
              username: (profile as any).login || null,
            },
          });
          token.sub = newUser.id;
        }
      }
      // No manual refresh logic needed; Auth.js handles it
      return token;
    },
    async signIn({ user, account, profile }) {
      return true
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
}) 