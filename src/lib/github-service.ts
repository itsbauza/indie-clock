import { prisma } from './prisma';

export class GitHubService {
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

  static async createOrUpdateUser(githubData: any, accessToken: string) {
    const { id, login, name, email, avatar_url } = githubData;
    
    return await prisma.user.upsert({
      where: { githubId: id.toString() },
      update: {
        username: login,
        name,
        email,
        updatedAt: new Date()
      },
      create: {
        githubId: id.toString(),
        username: login,
        name,
        email
      }
    });
  }
} 