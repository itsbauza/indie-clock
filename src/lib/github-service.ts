import { prisma } from './prisma';
import { fetchGitHubContributions } from './github-auth';

export class GitHubService {
  static async syncUserContributions(userId: string, accessToken: string, username: string) {
    try {
      // Fetch latest contributions from GitHub
      const contributionsData = await fetchGitHubContributions(accessToken, username);
      
      // Get current year
      const currentYear = new Date().getFullYear();
      
      // Delete existing contributions for current year
      await prisma.contribution.deleteMany({
        where: {
          userId,
          year: currentYear
        }
      });

      // Insert new contributions
      const contributions = contributionsData.contributions.map(contribution => ({
        userId,
        date: new Date(contribution.date),
        count: contribution.contributionCount,
        year: currentYear
      }));

      await prisma.contribution.createMany({
        data: contributions
      });

      // Update user's last sync time
      await prisma.user.update({
        where: { id: userId },
        data: { lastSyncAt: new Date() }
      });

      return contributionsData;
    } catch (error) {
      console.error('Error syncing user contributions:', error);
      throw error;
    }
  }

  static async syncUserContributionsWithUserToken(userId: string, username: string, accessToken: string) {
    try {
      // Fetch latest contributions from GitHub using user's access token
      const contributionsData = await this.fetchGitHubContributionsWithUserToken(username, accessToken);
      
      // Get current year
      const currentYear = new Date().getFullYear();
      
      // Delete existing contributions for current year
      await prisma.contribution.deleteMany({
        where: {
          userId,
          year: currentYear
        }
      });

      // Insert new contributions
      const contributions = contributionsData.contributions.map(contribution => ({
        userId,
        date: new Date(contribution.date),
        count: contribution.contributionCount,
        year: currentYear
      }));

      await prisma.contribution.createMany({
        data: contributions
      });

      // Update user's last sync time
      await prisma.user.update({
        where: { id: userId },
        data: { lastSyncAt: new Date() }
      });

      return contributionsData;
    } catch (error) {
      console.error('Error syncing user contributions with user token:', error);
      throw error;
    }
  }

  static async fetchGitHubContributionsWithUserToken(username: string, accessToken: string) {
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
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        query,
        variables: { userName: username }
      })
    });

    if (!response.ok) {
      throw new Error(`GitHub GraphQL API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const user = data.data?.user;
    if (!user) {
      throw new Error('User not found or no data returned');
    }

    const contributionCalendar = user.contributionsCollection?.contributionCalendar;
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

  static async getUserContributions(userId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();
    
    const contributions = await prisma.contribution.findMany({
      where: {
        userId,
        year: targetYear
      },
      orderBy: {
        date: 'asc'
      }
    });

    return {
      totalContributions: contributions.reduce((sum, c) => sum + c.count, 0),
      contributions: contributions.map(c => ({
        date: c.date.toISOString().split('T')[0],
        contributionCount: c.count
      }))
    };
  }

  static async createOrUpdateUser(githubData: any, accessToken: string) {
    const { id, login, name, email, avatar_url } = githubData;
    
    return await prisma.user.upsert({
      where: { githubId: id.toString() },
      update: {
        username: login,
        name,
        email,
        accessToken,
        updatedAt: new Date()
      },
      create: {
        githubId: id.toString(),
        username: login,
        name,
        email,
        accessToken
      }
    });
  }
} 