import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GitHubService } from '@/lib/github-service';
import { mqttService } from '@/lib/mqtt-service';

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const { username } = await request.json();
    // Use the GitHub username from session if available, otherwise fall back to request body or email prefix
    const targetUsername = username || session.user.username || session.user.email?.split('@')[0];

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
          { username: targetUsername },
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch fresh data from GitHub API
    let contributionsData;
    let hasPrivateAccess = false;

    if (user.personalAccessToken) {
      // Use personal access token for private contributions
      contributionsData = await GitHubService.fetchGitHubContributionsWithUserToken(
        targetUsername,
        user.personalAccessToken
      );
      hasPrivateAccess = true;
    } else {
      // Try GitHub App token
      const account = await prisma.account.findFirst({
        where: {
          userId: user.id,
          provider: 'github'
        }
      });
      
      if (account?.access_token) {
        contributionsData = await GitHubService.fetchGitHubContributionsWithUserToken(
          targetUsername,
          account.access_token
        );
        hasPrivateAccess = false;
      } else {
        return NextResponse.json(
          { error: 'No access token found' },
          { status: 401 }
        );
      }
    }

    // Publish to Awtrix3 custom app via MQTT
    mqttService.publishAwtrix3CustomApp(targetUsername, contributionsData);

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