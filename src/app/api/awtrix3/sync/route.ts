import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import NextAuth from "@/lib/auth"
import { prisma } from '@/lib/prisma';
import { GitHubService } from '@/lib/github-service';
import { mqttService } from '@/lib/mqtt-service';

export async function POST(request: NextRequest) {
  const session = await getServerSession(NextAuth) as any;
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    // Use the GitHub username from session if available, otherwise fall back to request body or email prefix
    const targetUsername = session.user.githubUsername;

    if (!targetUsername) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { id: session.user.id },
          { email: session.user.email },
          { githubUsername: targetUsername },
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.githubUsername) {
      return NextResponse.json(
        { error: 'No GitHub username associated with this account' },
        { status: 400 }
      );
    }

    // Use the new OAuth2-based method
    const contributionsData = await GitHubService.fetchGitHubContributionsWithOAuth2(user.id);

    const hasPrivateAccess = false; // Only public contributions

    // Publish to Awtrix3 custom app via MQTT
    mqttService.publishAwtrix3CustomApp(user.githubUsername, contributionsData);

    return NextResponse.json({
      success: true,
      data: contributionsData,
      hasPrivateAccess,
      message: 'Data fetched and published to Awtrix3 custom app'
    });

  } catch (error) {
    console.error('Error syncing Awtrix3 custom app:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to sync data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 