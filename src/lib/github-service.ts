import { prisma } from './prisma';

export class GitHubService {
  static async fetchGitHubContributionsWithOAuth2(userId: string) {
    // Get the user's GitHub account from the database
    const account = await prisma.account.findFirst({
      where: {
        userId: userId,
        provider: 'github'
      }
    });

    if (!account) {
      throw new Error('GitHub account not found. Please sign in with GitHub first.');
    }

    if (!account.access_token) {
      throw new Error('GitHub access token not found. Please sign in again with GitHub.');
    }

    // Get the user to find their GitHub username
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user?.githubUsername) {
      throw new Error('No GitHub username associated with this account');
    }

    const query = `
      query($userName: String!) {
        user(login: $userName) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "IndieClock-App",
        "Authorization": `Bearer ${account.access_token}`
      },
      body: JSON.stringify({
        query,
        variables: { userName: user.githubUsername }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();      
      // Check if it's a scope/permission issue
      if (response.status === 403 || response.status === 401) {
        throw new Error(`GitHub API access denied. The token may not have proper scopes. Please re-authenticate with GitHub. Error: ${response.status} ${response.statusText}`);
      }
      
      throw new Error(`GitHub GraphQL API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      // Check for permission-related GraphQL errors
      const permissionError = data.errors.find((error: any) => 
        error.message?.includes('permission') || 
        error.message?.includes('scope') ||
        error.message?.includes('access')
      );
      
      if (permissionError) {
        throw new Error(`GitHub API permission error: ${permissionError.message}. Please re-authenticate with GitHub to grant necessary permissions.`);
      }
      
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const githubUser = data.data?.user;
    if (!githubUser) {
      throw new Error('User not found or no data returned');
    }

    const contributionCalendar = githubUser.contributionsCollection?.contributionCalendar;
    if (!contributionCalendar) {
      throw new Error('No contribution data available');
    }

    // Flatten the weeks into a single array of contribution days
    const contributions = [];
    if (contributionCalendar.weeks) {
      for (const week of contributionCalendar.weeks) {
        if (week.contributionDays) {
          contributions.push(...week.contributionDays);
        }
      }
    }

    return {
      totalContributions: contributionCalendar.totalContributions || 0,
      contributions
    };
  }
} 