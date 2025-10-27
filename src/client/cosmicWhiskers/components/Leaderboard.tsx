import React from 'react';
import { Theme } from '../../../shared/types/cosmicWhiskers';

interface LeaderboardEntry {
  username: string;
  score: number;
  rank: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  playerRank: number;
  playerScore: number;
  playerUsername: string;
  theme: Theme;
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  playerRank,
  playerScore,
  playerUsername,
  theme,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
      <div
        className="rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8"
        style={{
          background: `linear-gradient(135deg, ${theme.visuals.backgroundGradient[0]}ee, ${theme.visuals.backgroundGradient[1]}ee)`,
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-white">🏆 Leaderboard</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-3xl px-3 py-1 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Player's Rank */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 mb-6">
          <p className="text-white/80 text-sm mb-1">Your Rank</p>
          <div className="flex justify-between items-center">
            <p className="text-white font-bold text-xl">{playerUsername}</p>
            <div className="text-right">
              <p className="text-white text-2xl font-bold">#{playerRank}</p>
              <p className="text-white/70 text-sm">{playerScore} points</p>
            </div>
          </div>
        </div>

        {/* Top 10 */}
        <div className="space-y-2">
          <p className="text-white/80 text-sm mb-3">Top Players</p>
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60">No scores yet. Be the first!</p>
            </div>
          ) : (
            entries.map((entry) => {
              const isPlayer = entry.username === playerUsername;
              const medalEmoji = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : '';

              return (
                <div
                  key={entry.rank}
                  className={`
                    flex justify-between items-center p-4 rounded-lg transition-all
                    ${isPlayer ? 'bg-white/30 ring-2 ring-white' : 'bg-black/30'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white/70 font-mono text-sm w-8">
                      {medalEmoji || `#${entry.rank}`}
                    </span>
                    <span className={`font-semibold ${isPlayer ? 'text-white' : 'text-white/90'}`}>
                      {entry.username}
                    </span>
                  </div>
                  <span className="text-white font-bold text-lg">{entry.score}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
