import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github-service';
import { mqttService } from '@/lib/mqtt-service';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  // Verify the request is from a legitimate cron job
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET_TOKEN;
  
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('Starting hourly GitHub sync job...');
    
    // Get all users with GitHub accounts
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { githubUsername: { not: null } },
          { githubUsername: { not: '' } }
        ]
      },
      include: {
        accounts: {
          where: {
            provider: 'github'
          }
        }
      }
    });

    console.log(`Found ${users.length} users with GitHub accounts`);

    const results = {
      total: users.length,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process each user
    for (const user of users) {
      try {
        console.log(`Processing user: ${user.githubUsername}`);
        
        // Check if user has GitHub account with access token
        const githubAccount = user.accounts.find((acc: unknown) => (acc as { provider: string }).provider === 'github');
        if (!githubAccount || !githubAccount.access_token) {
          console.log(`Skipping user ${user.githubUsername}: No GitHub access token`);
          results.failed++;
          results.errors.push(`${user.githubUsername}: No GitHub access token`);
          continue;
        }

        // Fetch GitHub contributions
        const contributionsData = await GitHubService.fetchGitHubContributionsWithOAuth2(user.id);
        
        // Send to MQTT for all user's devices
        await mqttService.publishAwtrix3CustomApp(user.githubUsername!, contributionsData);
        
        console.log(`✅ Successfully processed user: ${user.githubUsername}`);
        results.successful++;
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Error processing user ${user.githubUsername}:`, errorMessage);
        results.failed++;
        results.errors.push(`${user.githubUsername}: ${errorMessage}`);
      }
    }

    console.log(`Hourly GitHub sync completed. Results:`, results);
    
    return NextResponse.json({
      success: true,
      message: 'Hourly GitHub sync completed',
      results
    });

  } catch (error) {
    console.error('Error in hourly GitHub sync job:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run hourly GitHub sync',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 