export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

export interface GitHubContribution {
  date: string;
  contributionCount: number;
}

export interface GitHubContributionsData {
  totalContributions: number;
  contributions: GitHubContribution[];
}

export const GITHUB_SCOPES = {
  USER: 'user',
  READ_USER: 'read:user',
  USER_EMAIL: 'user:email',
  READ_ORG: 'read:org',
  REPO: 'repo',
} as const;

export function buildGitHubAuthUrl(clientId: string, redirectUri: string, scopes: string[] = [GITHUB_SCOPES.USER, GITHUB_SCOPES.USER_EMAIL]) {
  const scope = scopes.join(' ');
  return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
}

export function getGitHubCallbackUrl(baseUrl: string) {
  return `${baseUrl}/api/auth/github/callback`;
}

export function validateGitHubUser(user: any): user is GitHubUser {
  return (
    user &&
    typeof user.id === 'number' &&
    typeof user.login === 'string' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    typeof user.avatar_url === 'string'
  );
}

export async function fetchGitHubContributions(accessToken: string, username: string): Promise<GitHubContributionsData> {
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
  const contributions: GitHubContribution[] = [];
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