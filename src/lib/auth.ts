import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "./prisma"

export default NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_APP_CLIENT_ID!,
      clientSecret: process.env.GITHUB_APP_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email'
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token?.sub || '';
        session.user.githubUsername = token?.username as string || null;
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
              { githubId: (profile as any).id?.toString() }
            ]
          }
        });

        if (existingUser) {
          // Update existing user with GitHub data
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              email: token.email || null,
              name: token.name || null,
              image: token.picture || null,
              githubId: (profile as any).id?.toString() || null,
              githubUsername: (profile as any).login || null,
            },
          });
          token.sub = existingUser.id;
          token.username = (profile as any).login || null;
        } else {
          // Create new user with GitHub data
          const newUser = await prisma.user.create({
            data: {
              email: token.email || null,
              name: token.name || null,
              image: token.picture || null,
              githubId: (profile as any).id?.toString() || null,
              githubUsername: (profile as any).login || null,
            },
          });
          token.sub = newUser.id;
          token.username = (profile as any).login || null;
        }
      }
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