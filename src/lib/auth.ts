import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "./prisma"
import { GITHUB_SCOPES } from "./github-auth"

async function refreshAccessToken(token: any) {
  try {
    const url = "https://github.com/login/oauth/access_token";
    
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.GITHUB_APP_CLIENT_ID!,
        client_secret: process.env.GITHUB_APP_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      console.error("GitHub refresh token error:", refreshedTokens);
      throw new Error(`GitHub refresh failed: ${refreshedTokens.error || 'Unknown error'}`);
    }

    // Update the user's tokens in the database
    if (token.sub) {
      await prisma.user.update({
        where: { id: token.sub },
        data: {
          accessToken: refreshedTokens.access_token,
          refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
          tokenExpiresAt: refreshedTokens.expires_in 
            ? new Date(Date.now() + refreshedTokens.expires_in * 1000)
            : null,
        },
      });
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
          GitHubProvider({
        clientId: process.env.GITHUB_APP_CLIENT_ID!,
        clientSecret: process.env.GITHUB_APP_CLIENT_SECRET!,
        authorization: {
          params: {
            scope: `${GITHUB_SCOPES.USER} ${GITHUB_SCOPES.USER_EMAIL} ${GITHUB_SCOPES.READ_USER} ${GITHUB_SCOPES.READ_ORG}`,
          },
        },
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
              accessToken: account.access_token || null,
              refreshToken: account.refresh_token || null,
              tokenExpiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
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
              accessToken: account.access_token || null,
              refreshToken: account.refresh_token || null,
              tokenExpiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
            },
          });
          token.sub = newUser.id;
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
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