import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github-service';
import { mqttService } from '@/lib/mqtt-service';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    // Find user in database using session user ID
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { id: session.user.id },
          { email: session.user.email },
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
    
    // Publish to MQTT for the Awtrix3 custom app
    mqttService.publishAwtrix3CustomApp(user.githubUsername, contributionsData);
    
    return NextResponse.json({
      success: true,
      data: contributionsData,
    });

  } catch (error) {
    console.error('Error fetching GitHub contributions:', error);
        
    return NextResponse.json(
      { 
        error: 'Failed to fetch contributions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 