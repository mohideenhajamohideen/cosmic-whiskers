import React from 'react';
import { Theme } from '../../../shared/types/cosmicWhiskers';

interface CosmicWhiskersSplashProps {
  theme: Theme;
  unlockedThemesCount: number;
  totalThemes: number;
  onPlayGame: () => void;
  onSelectTheme: () => void;
  onHowToPlay: () => void;
}

export const CosmicWhiskersSplash: React.FC<CosmicWhiskersSplashProps> = ({
  theme,
  unlockedThemesCount,
  totalThemes,
  onPlayGame,
  onSelectTheme,
  onHowToPlay,
}) => {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      style={{
        background: `linear-gradient(135deg, ${theme.visuals.backgroundGradient[0]}, ${theme.visuals.backgroundGradient[1]})`,
      }}
    >
      <div className="text-center px-8 max-w-2xl">
        {/* Game Title */}
        <div className="mb-8">
          <div className="text-8xl mb-4 animate-bounce">🐱</div>
          <h1 className="text-7xl font-bold text-white mb-2 drop-shadow-2xl">Flappy Cat</h1>
          <p className="text-2xl text-white/80 italic">Luna's Journey Home</p>
        </div>

        {/* Current Theme Info */}
        <div className="mb-8 bg-black/30 backdrop-blur-sm rounded-lg p-4">
          <p className="text-white/90 text-lg mb-2">{theme.story.title}</p>
          <p className="text-white/70 text-sm">{theme.story.description}</p>
        </div>

        {/* Instructions */}
        <div className="mb-8">
          <p className="text-white/90 text-xl mb-2">Tap to Jump!</p>
          <p className="text-white/60 text-sm">
            Navigate through cosmic rings and help Luna reunite with her family
          </p>
        </div>

        {/* Main Play Button */}
        <button
          onClick={onPlayGame}
          className="w-full max-w-md px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-3xl font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl mb-4"
        >
          ▶ PLAY GAME
        </button>

        {/* Secondary Buttons */}
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={onSelectTheme}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
          >
            🎨 Themes ({unlockedThemesCount}/{totalThemes})
          </button>

          <button
            onClick={onHowToPlay}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
          >
            ❓ How to Play
          </button>
        </div>

        {/* Progress Indicator */}
        {unlockedThemesCount < totalThemes && (
          <div className="text-white/60 text-sm">
            <p>Unlock all {totalThemes} themes by earning points!</p>
          </div>
        )}
      </div>
    </div>
  );
};
