import React, { useEffect, useState } from 'react';
import type { CommunityStats as CommunityStatsType } from '../../../shared/types/cosmicWhiskers';

interface CommunityStatsProps {
  stats: CommunityStatsType | null;
  refreshInterval?: number;
  onRefresh?: () => void;
  error?: string | null;
  isLoading?: boolean;
}

export const CommunityStats: React.FC<CommunityStatsProps> = ({
  stats,
  refreshInterval = 30000,
  onRefresh,
  error = null,
  isLoading = false,
}) => {
  const [celebratingMilestone, setCelebratingMilestone] = useState<string | null>(null);
  const [previousStats, setPreviousStats] = useState<CommunityStatsType | null>(null);

  // Auto-refresh functionality
  useEffect(() => {
    if (!refreshInterval || !onRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, onRefresh]);

  // Check for newly achieved milestones
  useEffect(() => {
    if (!stats || !previousStats) {
      setPreviousStats(stats);
      return;
    }

    // Find newly achieved milestones
    const newlyAchieved = stats.milestones.find(
      (milestone) =>
        milestone.achieved &&
        !previousStats.milestones.find((prev) => prev.id === milestone.id)?.achieved
    );

    if (newlyAchieved) {
      setCelebratingMilestone(newlyAchieved.id);
      setTimeout(() => setCelebratingMilestone(null), 5000);
    }

    setPreviousStats(stats);
  }, [stats]);

  // Loading skeleton
  if (isLoading && !stats) {
    return (
      <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-purple-500/30 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-white/20 rounded w-48 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-black/40 rounded-lg p-4 border border-purple-500/20 animate-pulse">
              <div className="h-10 bg-white/20 rounded mb-2" />
              <div className="h-4 bg-white/10 rounded w-24 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !stats) {
    return (
      <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-red-500/30 shadow-xl">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-4xl mb-4">😿</div>
          <p className="text-red-400 text-center mb-4">{error}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getMilestoneProgress = (threshold: number, current: number): number => {
    return Math.min((current / threshold) * 100, 100);
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-purple-500/30 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <span>🌟</span>
          <span>Community Progress</span>
        </h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-semibold"
            title="Refresh stats"
          >
            {isLoading ? '⏳' : '🔄'}
          </button>
        )}
      </div>

      {/* Error Indicator */}
      {error && (
        <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-2 mb-3">
          <p className="text-yellow-400 text-xs text-center">
            ⚠️ {error} - Showing cached data
          </p>
        </div>
      )}

      {/* Community Achievement Banner */}
      <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-2 border-purple-500/50 rounded-xl p-4 mb-4">
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-white mb-2">
            {formatNumber(stats.totalRingsPassed)}
          </div>
          <div className="text-white/90 text-sm md:text-base font-semibold">
            🎯 Total Rings Passed by Community
          </div>
          <div className="text-purple-300 text-xs md:text-sm mt-1">
            {formatNumber(stats.totalPlayers)} players working together!
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        {/* Total Rings Passed */}
        <div className="bg-black/40 rounded-lg p-4 text-center border border-purple-500/20">
          <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-1">
            {formatNumber(stats.totalRingsPassed)}
          </div>
          <div className="text-white/70 text-sm">Rings Passed</div>
          <div className="text-purple-300 text-xs mt-1">by everyone</div>
        </div>

        {/* Average Score */}
        <div className="bg-black/40 rounded-lg p-4 text-center border border-pink-500/20">
          <div className="text-3xl md:text-4xl font-bold text-pink-400 mb-1">
            {stats.averageScore.toFixed(1)}
          </div>
          <div className="text-white/70 text-sm">Average Score</div>
          <div className="text-pink-300 text-xs mt-1">community avg</div>
        </div>

        {/* Total Players */}
        <div className="bg-black/40 rounded-lg p-4 text-center border border-blue-500/20">
          <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-1">
            {formatNumber(stats.totalPlayers)}
          </div>
          <div className="text-white/70 text-sm">Players</div>
          <div className="text-blue-300 text-xs mt-1">joined Luna</div>
        </div>
      </div>

      {/* Milestones Section */}
      {stats.milestones.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg md:text-xl font-bold text-white mb-3 flex items-center gap-2">
            <span>🎯</span>
            <span>Community Milestones</span>
            <span className="text-sm text-white/60 font-normal">
              ({stats.milestones.filter(m => m.achieved).length}/{stats.milestones.length} achieved)
            </span>
          </h4>

          {stats.milestones.map((milestone) => {
            const progress = getMilestoneProgress(
              milestone.threshold,
              milestone.id.includes('rings') ? stats.totalRingsPassed : stats.totalPlayers
            );
            const isCelebrating = celebratingMilestone === milestone.id;

            return (
              <div
                key={milestone.id}
                className={`
                  bg-black/40 rounded-lg p-3 md:p-4 border transition-all duration-500
                  ${
                    milestone.achieved
                      ? 'border-green-500/50 bg-green-900/20'
                      : 'border-white/10'
                  }
                  ${isCelebrating ? 'animate-pulse scale-105' : ''}
                `}
              >
                {/* Milestone Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="text-white font-semibold text-sm md:text-base">
                        {milestone.title}
                      </h5>
                      {milestone.achieved && (
                        <span className="text-green-400 text-lg">✓</span>
                      )}
                    </div>
                    <p className="text-white/60 text-xs md:text-sm">
                      {milestone.description}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-white/80 font-bold text-sm">
                      {formatNumber(
                        milestone.id.includes('rings')
                          ? stats.totalRingsPassed
                          : stats.totalPlayers
                      )}
                    </div>
                    <div className="text-white/50 text-xs">
                      / {formatNumber(milestone.threshold)}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {!milestone.achieved && (
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {/* Achievement Date */}
                {milestone.achieved && milestone.achievedAt && (
                  <div className="text-green-400/80 text-xs mt-2">
                    Achieved {new Date(milestone.achievedAt).toLocaleDateString()}
                  </div>
                )}

                {/* Celebration Animation */}
                {isCelebrating && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 animate-pulse rounded-lg" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl animate-bounce">
                      🎉
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Top Score Display */}
      {stats.topScore > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Community Best:</span>
            <span className="text-yellow-400 font-bold text-lg">
              {stats.topScore} rings 🏆
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
