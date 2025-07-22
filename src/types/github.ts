export interface GitHubContribution {
  date: string;
  contributionCount: number;
}

export interface GitHubContributionsData {
  totalContributions: number;
  contributions: GitHubContribution[];
} 