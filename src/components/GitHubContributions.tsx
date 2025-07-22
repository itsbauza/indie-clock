'use client';

import { useState, useEffect } from 'react';
import { GitHubContributionsData, GitHubContribution } from '@/lib/github-auth';

interface GitHubContributionsProps {
  username?: string;
}

export default function GitHubContributions({ username }: GitHubContributionsProps) {
  const [contributions, setContributions] = useState<GitHubContributionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPrivateAccess, setHasPrivateAccess] = useState<boolean | null>(null);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/github/contributions');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch contributions');
      }
      
      const result = await response.json();
      setContributions(result.data);
      setHasPrivateAccess(result.hasPrivateAccess || false);
    } catch (err) {
      console.error('Error fetching contributions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contributions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchContributions();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading contributions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-700 text-sm">Error loading contributions: {error}</p>
        {error.includes('GitHub access token') && (
          <p className="text-red-600 text-xs mt-2">
            Please sign out and sign in again with GitHub to refresh your access token.
          </p>
        )}
        <button
          onClick={() => fetchContributions()}
          className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!contributions) {
    return null;
  }

  // Create a 7x24 grid for the last 24 weeks, transposed for column=week, row=day
  const createContributionGrid = () => {
    const weeks = 24;
    const days = 7;
    const grid: (GitHubContribution | null)[][] = Array.from({ length: days }, () => Array(weeks).fill(null));
    // Map for quick lookup
    const contributionsMap = new Map<string, GitHubContribution>();
    contributions.contributions.forEach(contribution => {
      contributionsMap.set(contribution.date, contribution);
    });
    // Find the most recent Sunday
    const today = new Date();
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - today.getDay());
    // Fill the grid from right (most recent week) to left
    for (let week = weeks - 1; week >= 0; week--) {
      for (let day = 0; day < days; day++) {
        const cellDate = new Date(lastSunday);
        cellDate.setDate(lastSunday.getDate() - (weeks - 1 - week) * 7 + day);
        const dateString = cellDate.toISOString().split('T')[0];
        grid[day][week] = contributionsMap.get(dateString) || null;
      }
    }
    return grid;
  };

  const grid = createContributionGrid();
  const dayLabels = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];

  // Get color based on contribution count
  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    if (count <= 3) return 'bg-green-200';
    if (count <= 6) return 'bg-green-300';
    if (count <= 9) return 'bg-green-400';
    return 'bg-green-500';
  };

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your GitHub Contributions</h3>
          <p className="text-gray-600 text-sm">
            Total contributions: <span className="font-medium">{contributions.totalContributions}</span>
          </p>
          {hasPrivateAccess !== null && (
            <div className="mt-2">
              {hasPrivateAccess ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  🔒 Private contributions included
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  📊 Public contributions only
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-start">
        {/* Day labels */}
        <div className="flex flex-col justify-between h-[176px] mr-2 pt-[2px]">
          {dayLabels.map((label, i) => (
            <span key={i} className="text-xs text-gray-500 h-6 flex items-center justify-end w-8">
              {label}
            </span>
          ))}
        </div>
        {/* Grid */}
        <div className="grid grid-cols-24 grid-rows-7 gap-[4px]">
          {grid.map((row, rowIdx) =>
            row.map((contribution, colIdx) => {
              const date = contribution?.date;
              const count = contribution?.contributionCount || 0;
              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={`w-4 h-4 rounded-[3px] ${getColor(count)} border border-gray-100`}
                  title={date ? `${date}: ${count} contributions` : 'No contributions'}
                />
              );
            })
          )}
        </div>
      </div>
      {/* Legend */}
      <div className="mt-4 flex items-center space-x-2 text-xs text-gray-600">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-4 h-4 bg-gray-100 rounded-[3px] border border-gray-200"></div>
          <div className="w-4 h-4 bg-green-200 rounded-[3px] border border-gray-200"></div>
          <div className="w-4 h-4 bg-green-300 rounded-[3px] border border-gray-200"></div>
          <div className="w-4 h-4 bg-green-400 rounded-[3px] border border-gray-200"></div>
          <div className="w-4 h-4 bg-green-500 rounded-[3px] border border-gray-200"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
} 