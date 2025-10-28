import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../api/cosmicWhiskersApi';

interface LeaderboardProps {
  themeId: number;
  onClose: () => void;
  onRefresh?: () => void;
}

type LeaderboardData = Awaited<ReturnType<typeof getLeaderboard>>;

export const Leaderboard: React.FC<LeaderboardProps> = ({ themeId, onClose, onRefresh }) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getLeaderboard(themeId);
      if (data.error && !data.cached) {
        setError(data.error);
      } else {
        setLeaderboardData(data);
        if (data.cached) {
          // Show a subtle indicator that data is cached
          console.log('Displaying cached leaderboard data');
        }
      }
    } catch (err) {
      setError('Failed to load leaderboard. Please try again.');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [themeId]);

  const handleRefresh = () => {
    fetchLeaderboard();
    onRefresh?.();
  };

  const getRankBadge = (rank: number): string => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  };

  return (
    <div className="bg-black/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 max-w-2xl w-full mx-auto shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          <span>🏆</span>
          <span>Community Leaderboard</span>
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-semibold"
          title="Refresh leaderboard"
        >
          {isLoading ? '⏳' : '🔄'}
        </button>
      </div>

      {/* Loading State with Skeleton */}
      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white/10 rounded-xl p-3 md:p-4 animate-pulse"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-8 md:w-10 h-8 md:h-10 bg-white/20 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/20 rounded w-32" />
                  <div className="h-3 bg-white/10 rounded w-20" />
                </div>
                <div className="w-16 h-6 bg-white/20 rounded" />
              </div>
            </div>
          ))}
          <p className="text-white/60 text-sm text-center mt-4">Loading leaderboard...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-4xl mb-4">😿</div>
          <p className="text-red-400 text-center mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Leaderboard Content */}
      {!isLoading && !error && leaderboardData && (
        <div className="space-y-3">
          {/* Cached Data Indicator */}
          {leaderboardData.cached && (
            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-2 mb-3">
              <p className="text-yellow-400 text-xs text-center">
                📡 Showing cached data - Network unavailable
              </p>
            </div>
          )}

          {/* Top 10 Players */}
          {leaderboardData.entries.length > 0 ? (
            <div className="space-y-2">
              {leaderboardData.entries.map((entry) => (
                <div
                  key={`${entry.rank}-${entry.username}`}
                  className={`
                    flex items-center justify-between p-3 md:p-4 rounded-xl transition-all
                    ${
                      entry.isCurrentUser
                        ? 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 border-2 border-purple-400 shadow-lg'
                        : 'bg-white/10 hover:bg-white/15'
                    }
                  `}
                >
                  {/* Rank and Badge */}
                  <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-8 md:w-10 flex-shrink-0">
                      {getRankBadge(entry.rank) ? (
                        <span className="text-2xl md:text-3xl">{getRankBadge(entry.rank)}</span>
                      ) : (
                        <span className="text-white/60 font-bold text-lg md:text-xl">
                          #{entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Username */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`
                          font-semibold truncate text-sm md:text-base
                          ${entry.isCurrentUser ? 'text-white' : 'text-white/90'}
                        `}
                      >
                        {entry.username}
                      </p>
                      {entry.isCurrentUser && (
                        <p className="text-purple-300 text-xs">You</p>
                      )}
                    </div>

                    {/* Score */}
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`
                          font-bold text-lg md:text-xl
                          ${entry.isCurrentUser ? 'text-yellow-400' : 'text-white'}
                        `}
                      >
                        {entry.score}
                      </p>
                      <p className="text-white/50 text-xs">rings</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎮</div>
              <p className="text-white/60">No scores yet. Be the first!</p>
            </div>
          )}

          {/* Player's Rank (if not in top 10) */}
          {leaderboardData.playerRank > 10 && leaderboardData.playerScore > 0 && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="bg-gradient-to-r from-purple-600/40 to-pink-600/40 border-2 border-purple-400 rounded-xl p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className="text-white/60 font-bold text-lg md:text-xl">
                      #{leaderboardData.playerRank}
                    </span>
                    <div>
                      <p className="text-white font-semibold text-sm md:text-base">Your Rank</p>
                      <p className="text-purple-300 text-xs">Keep climbing!</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold text-lg md:text-xl">
                      {leaderboardData.playerScore}
                    </p>
                    <p className="text-white/50 text-xs">rings</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
