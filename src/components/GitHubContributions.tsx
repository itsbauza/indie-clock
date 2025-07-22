'use client';

import { useState, useEffect } from 'react';
import { GitHubContributionsData, GitHubContribution } from '@/types/github';

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
      <div className="mt-6 p-6 bg-[#0d1117] border border-[#30363d]">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#58a6ff]"></div>
          <span className="ml-3 text-[#f0f6fc] text-sm">Loading contributions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-6 bg-[#0d1117] border border-[#f85149]">
        <p className="text-[#f85149] text-sm mb-3">Error loading contributions: {error}</p>
        {error.includes('GitHub access token') && (
          <p className="text-[#f0f6fc] text-xs mb-3 opacity-75">
            Please sign out and sign in again with GitHub to refresh your access token.
          </p>
        )}
        <button
          onClick={() => fetchContributions()}
          className="px-3 py-1.5 bg-[#238636] text-[#f0f6fc] text-xs rounded-md hover:bg-[#2ea043] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!contributions) {
    return null;
  }

  // Create a 7x32 grid for the last 32 weeks, transposed for column=week, row=day
  const createContributionGrid = () => {
    const weeks = 32;
    const days = 7;
    const grid: (GitHubContribution | null)[][] = Array.from({ length: days }, () => Array(weeks).fill(null));
    const monthPositions: Array<{ month: string; position: number }> = [];
    
    // Map for quick lookup
    const contributionsMap = new Map<string, GitHubContribution>();
    contributions.contributions.forEach(contribution => {
      contributionsMap.set(contribution.date, contribution);
    });
    
    // Find the most recent Sunday
    const today = new Date();
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - today.getDay());
    
    // Track seen months to place labels only on 1st occurrence
    const seenMonths = new Set<string>();
    
    // Fill the grid from right (most recent week) to left
    for (let week = weeks - 1; week >= 0; week--) {
      for (let day = 0; day < days; day++) {
        const cellDate = new Date(lastSunday);
        cellDate.setDate(lastSunday.getDate() - (weeks - 1 - week) * 7 + day);
        const dateString = cellDate.toISOString().split('T')[0];
        grid[day][week] = contributionsMap.get(dateString) || null;
        
        // Add month label at the exact position of the 1st day of each month
        if (cellDate.getDate() === 1) {
          const monthKey = cellDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          if (!seenMonths.has(monthKey)) {
            seenMonths.add(monthKey);
            monthPositions.push({
              month: cellDate.toLocaleDateString('en-US', { month: 'short' }),
              position: week
            });
          }
        }
      }
    }
    
    return { grid, monthPositions };
  };

  const { grid, monthPositions } = createContributionGrid();
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Responsive sizing using rem units
  const CELL_SIZE = 0.9375; // rem (15px equivalent)
  const CELL_GAP = 0.125; // rem (2px equivalent) 
  const CELL_TOTAL = CELL_SIZE + CELL_GAP; // total space per cell
  
  // Device frame sizing - adjust these to make the frame smaller/larger
  const FRAME_PADDING = 0.5; // rem - white border thickness (p-2 = 0.5rem)
  const SCREEN_PADDING = 1.5; // rem - black screen padding (p-6 = 1.5rem, p-8 = 2rem)

  // Get color based on contribution count (GitHub's actual colors)
  const getColor = (count: number) => {
    if (count === 0) return 'bg-[#161b22]';
    if (count <= 3) return 'bg-[#0e4429]';
    if (count <= 6) return 'bg-[#006d32]';
    if (count <= 9) return 'bg-[#26a641]';
    return 'bg-[#39d353]';
  };

  return (
    <div className="mt-6 flex flex-col items-center">
      {/* Header Info */}
              <div className="mb-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-2">
            {hasPrivateAccess !== null && (
              <div>
                {hasPrivateAccess ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#238636] text-[#f0f6fc]">
                    🔒 Private repos included
                  </span>
                ) : (
                  <div className="relative group">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#8b949e] text-[#f0f6fc] cursor-help">
                      📊 Public only
                    </span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-64">
                      <p className="text-xs text-[#f0f6fc] text-center">
                        Only public contributions are shown. To see private contributions, change your profile visibility in GitHub settings.
                      </p>
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#0d1117]"></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      {/* Device Container with Labels */}
      <div className="flex justify-center">
        <div className="relative inline-block">
        
                 {/* Month labels above the device */}
         <div className="flex text-[#8b949e] text-xs mb-4">
           <div className="w-12"></div> {/* Spacer for day labels */}
           <div className="relative" style={{ width: `${(grid[0]?.length || 32) * CELL_TOTAL}rem`, marginLeft: '0.5rem' }}>
             {monthPositions.map(({ month, position }, i: number) => (
               <div 
                 key={i} 
                 className="absolute text-left" 
                 style={{ 
                   left: `${position * CELL_TOTAL - (2 * CELL_TOTAL) + 0.75}rem`, // Move 2 weeks left + 0.5rem right
                   width: '1.875rem'
                 }}
               >
                 {month}
               </div>
             ))}
           </div>
         </div>

                 {/* Day labels positioned independently */}
         <div className="absolute -left-12 flex flex-col text-[#8b949e] text-xs" style={{ top: `${1 + (1 * CELL_TOTAL)}rem` }}>
           {/* Empty space for first row displacement */}
           <div style={{ height: `${CELL_TOTAL}rem` }}></div>
           {dayLabels.map((label, i) => (
             <div key={i} className="flex items-center justify-end w-10" style={{ height: `${CELL_TOTAL}rem` }}>
               {i % 2 === 1 ? label : ''}
             </div>
           ))}
         </div>

                                 {/* Centered Device Frame */}
         <div 
           className="bg-white rounded-2xl shadow-2xl shadow-gray-400/50"
           style={{ padding: `${FRAME_PADDING}rem` }}
         >
           {/* Device Screen (Black Background) */}
           <div 
             className="bg-black rounded-xl"
             style={{ padding: `${SCREEN_PADDING}rem` }}
           >
                             {/* Just the Grid - Clean Device Display */}
               <div className="grid" style={{ 
                 gap: `${CELL_GAP}rem`,
                 gridTemplateColumns: `repeat(${grid[0]?.length || 32}, ${CELL_SIZE}rem)`, 
                 gridTemplateRows: `repeat(8, ${CELL_SIZE}rem)` 
               }}>
                {/* First 7 rows - actual contribution data */}
                {grid.map((row, rowIdx) =>
                  row.map((contribution, colIdx) => {
                    const date = contribution?.date;
                    const count = contribution?.contributionCount || 0;
                    const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    }) : '';
                    
                    return (
                                             <div
                         key={`${rowIdx}-${colIdx}`}
                         className={`${getColor(count)} transition-all duration-300 hover:scale-110`}
                         title={date ? `${count} contribution${count !== 1 ? 's' : ''} on ${formattedDate}` : 'No contributions'}
                         style={{ 
                           cursor: 'default',
                           width: `${CELL_SIZE}rem`,
                           height: `${CELL_SIZE}rem`
                         }}
                       />
                    );
                  })
                )}
                {/* 8th row - unused pixels (empty/dark) */}
                {Array.from({ length: grid[0]?.length || 32 }, (_, colIdx) => (
                                     <div
                     key={`unused-${colIdx}`}
                     className="bg-[#161b22]"
                     title="Unused pixel"
                     style={{
                       width: `${CELL_SIZE}rem`,
                       height: `${CELL_SIZE}rem`
                     }}
                   />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend below the device */}
      <div className="mt-4 flex items-center justify-center">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-[#8b949e] mr-2">Less</span>
          <div className="flex space-x-1">
            <div className="w-[11px] h-[11px] bg-[#161b22]"></div>
            <div className="w-[11px] h-[11px] bg-[#0e4429]"></div>
            <div className="w-[11px] h-[11px] bg-[#006d32]"></div>
            <div className="w-[11px] h-[11px] bg-[#26a641]"></div>
            <div className="w-[11px] h-[11px] bg-[#39d353]"></div>
          </div>
          <span className="text-xs text-[#8b949e] ml-2">More</span>
        </div>
      </div>
    </div>
  );
} 