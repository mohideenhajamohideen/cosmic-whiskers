import React from 'react';
import { Theme } from '../../../shared/types/cosmicWhiskers';

interface GameOverScreenProps {
  score: number;
  personalBest: number;
  isNewBest: boolean;
  theme: Theme;
  newlyUnlockedThemes?: number[];
  onPlayAgain: () => void;
  onMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  personalBest,
  isNewBest,
  theme,
  newlyUnlockedThemes = [],
  onPlayAgain,
  onMenu,
}) => {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-30 animate-fadeIn"
      style={{
        background: `linear-gradient(135deg, ${theme.visuals.backgroundGradient[0]}dd, ${theme.visuals.backgroundGradient[1]}dd)`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="text-center px-8 max-w-lg">
        {/* Game Over Title */}
        <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-2xl">Game Over!</h1>

        {/* Score Display */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 mb-6">
          <div className="mb-6">
            <p className="text-white/70 text-lg mb-2">Your Score</p>
            <p className="text-7xl font-bold text-white">{score}</p>
            {isNewBest && (
              <p className="text-yellow-400 text-xl mt-2 animate-bounce">🎉 New Best!</p>
            )}
          </div>

          <div className="border-t border-white/20 pt-4">
            <p className="text-white/70 text-sm">Personal Best</p>
            <p className="text-3xl font-bold text-white">{personalBest}</p>
          </div>
        </div>

        {/* Theme Unlock Notification */}
        {newlyUnlockedThemes.length > 0 && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-6 animate-pulse">
            <p className="text-white text-2xl font-bold mb-2">🎊 Theme Unlocked!</p>
            <p className="text-white/90">
              You've unlocked {newlyUnlockedThemes.length} new theme
              {newlyUnlockedThemes.length > 1 ? 's' : ''}!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={onPlayAgain}
            className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-2xl font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
          >
            ▶ Play Again
          </button>

          <button
            onClick={onMenu}
            className="w-full px-8 py-3 bg-white/20 hover:bg-white/30 text-white text-lg font-semibold rounded-xl transition-colors backdrop-blur-sm"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
