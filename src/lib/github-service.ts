import { prisma } from './prisma';

export class GitHubService {
  static async refreshGitHubAccessToken(account: any) {
    if (!account.refresh_token) {
      throw new Error('Cannot refresh GitHub access token because no refresh token is available. Please re-authenticate with GitHub.');
    }

    const params = new URLSearchParams({
      client_id: process.env.GITHUB_APP_CLIENT_ID as string,
      client_secret: process.env.GITHUB_APP_CLIENT_SECRET as string,
      grant_type: 'refresh_token',
      refresh_token: account.refresh_token,
    });

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to refresh GitHub access token: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const refreshedTokens = await response.json();

    if (!refreshedTokens.access_token) {
      throw new Error(`GitHub did not return a new access token. Response: ${JSON.stringify(refreshedTokens)}`);
    }

    // Persist the new tokens/expiry in the database
    const updatedAccount = await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: refreshedTokens.access_token,
        expires_at: refreshedTokens.expires_in ? Math.floor(Date.now() / 1000) + refreshedTokens.expires_in : null,
        refresh_token: refreshedTokens.refresh_token ?? account.refresh_token,
        refresh_token_expires_in: refreshedTokens.refresh_token_expires_in ?? account.refresh_token_expires_in,
        scope: refreshedTokens.scope ?? account.scope,
        token_type: refreshedTokens.token_type ?? account.token_type,
      },
    });

    return updatedAccount;
  }

  static async fetchGitHubContributionsWithOAuth2(userId: string) {
    // Get the user's GitHub account from the database
    let account = await prisma.account.findFirst({
      where: {
        userId: userId,
        provider: 'github'
      }
    });

    if (!account) {
      throw new Error('GitHub account not found. Please sign in with GitHub first.');
    }

    // Refresh the token proactively if it's expired (GitHub returns expires_at in seconds)
    if (account.expires_at && account.expires_at * 1000 < Date.now()) {
      try {
        account = await this.refreshGitHubAccessToken(account);
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to refresh GitHub access token');
      }
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

    let response = await fetch("https://api.github.com/graphql", {
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

    // Attempt to handle invalid/expired tokens by refreshing once
    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 401 || response.status === 403) {
        // Token might be expired or revoked – try to refresh once
        try {
          account = await this.refreshGitHubAccessToken(account);

          // Retry the request with the new token
          const retryRes = await fetch("https://api.github.com/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "IndieClock-App",
              "Authorization": `Bearer ${account.access_token}`,
            },
            body: JSON.stringify({
              query,
              variables: { userName: user.githubUsername },
            }),
          });

          if (retryRes.ok) {
            // Replace the response reference so the normal processing continues below
            response = retryRes;
          } else {
            const retryText = await retryRes.text();
            throw new Error(`GitHub GraphQL API error after token refresh: ${retryRes.status} ${retryRes.statusText} - ${retryText}`);
          }
        } catch (refreshErr) {
          throw refreshErr instanceof Error
            ? refreshErr
            : new Error('Failed to refresh GitHub access token');
        }
      }

      // Other errors – just propagate
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