import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github-service';
import { rabbitmqService } from '@/lib/rabbitmq-service';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { decrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username') || session.user.email?.split('@')[0];
  const sync = searchParams.get('sync') === 'true';

  if (!username) {
    return NextResponse.json(
      { error: 'Username is required' },
      { status: 400 }
    );
  }

  try {
    // Find user in database using session user ID
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { id: session.user.id },
          { email: session.user.email },
          { username },
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

        let contributionsData;
    let hasPrivateAccess = false;

    if (sync) {
      // Check if user has a personal access token for private contributions
      if (user.personalAccessToken) {
        let decryptedToken: string;
        
        try {
          // Try to decrypt the personal access token
          decryptedToken = decrypt(user.personalAccessToken);
        } catch (error) {
          // If decryption fails, assume it's an unencrypted token (backward compatibility)
          console.log('Decryption failed, using token as-is (backward compatibility)');
          decryptedToken = user.personalAccessToken;
        }
        
        // Use personal access token to fetch fresh data from GitHub (includes private contributions)
        contributionsData = await GitHubService.syncUserContributionsWithUserToken(
          user.id,
          username,
          decryptedToken
        );
        hasPrivateAccess = true;
      } else {
        // Try to get GitHub App token from Account model
        const account = await prisma.account.findFirst({
          where: {
            userId: user.id,
            provider: 'github'
          }
        });
        
        if (account?.access_token) {
          // Fallback to GitHub App token (public contributions only)
          contributionsData = await GitHubService.syncUserContributionsWithUserToken(
            user.id,
            username,
            account.access_token
          );
          hasPrivateAccess = false;
        } else {
          return NextResponse.json(
            { error: 'No access token found. Please sign in again with GitHub or provide a Personal Access Token for private contributions.' },
            { status: 401 }
          );
        }
      }
    } else {
      // Get cached data from database
      contributionsData = await GitHubService.getUserContributions(user.id);
      // Check if user has private access token for status display
      hasPrivateAccess = !!user.personalAccessToken;
    }
    
    // Publish to RabbitMQ for the Awtrix clock
    rabbitmqService.publishGitHubContributions(username, contributionsData);
    rabbitmqService.publishStatus(username, 'data_updated');
    
    return NextResponse.json({
      success: true,
      data: contributionsData,
      lastSync: user.lastSyncAt,
      synced: sync,
      hasPrivateAccess
    });

  } catch (error) {
    console.error('Error fetching GitHub contributions:', error);
    
    // Publish error status to RabbitMQ
    rabbitmqService.publishStatus(username, 'error');
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch contributions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 