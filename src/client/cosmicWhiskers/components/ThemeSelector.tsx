import React from 'react';
import { Theme } from '../../../shared/types/cosmicWhiskers';

interface ThemeSelectorProps {
  themes: Theme[];
  unlockedThemeIds: number[];
  currentThemeId: number;
  themeHighScores: Record<number, number>;
  onSelectTheme: (themeId: number) => void;
  onClose: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  themes,
  unlockedThemeIds,
  currentThemeId,
  themeHighScores,
  onSelectTheme,
  onClose,
}) => {
  const isUnlocked = (themeId: number) => unlockedThemeIds.includes(themeId);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Select Theme</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl px-3 py-1"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themes.map((theme) => {
            const unlocked = isUnlocked(theme.id);
            const isCurrent = theme.id === currentThemeId;
            const highScore = themeHighScores[theme.id] || 0;

            return (
              <button
                key={theme.id}
                onClick={() => unlocked && onSelectTheme(theme.id)}
                disabled={!unlocked}
                className={`
                  relative p-4 rounded-lg transition-all
                  ${unlocked ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-60'}
                  ${isCurrent ? 'ring-4 ring-white' : ''}
                `}
                style={{
                  background: unlocked
                    ? `linear-gradient(135deg, ${theme.visuals.backgroundGradient[0]}, ${theme.visuals.backgroundGradient[1]})`
                    : '#1f2937',
                }}
              >
                {!unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🔒</div>
                      <div className="text-white font-semibold">
                        Unlock at {theme.unlockScore} points
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-2">{theme.name}</h3>
                  <p className="text-sm text-white/80 mb-3">{theme.story.title}</p>

                  {unlocked && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/70">High Score:</span>
                      <span className="text-lg font-bold text-white">{highScore}</span>
                    </div>
                  )}

                  {isCurrent && (
                    <div className="mt-2 text-center">
                      <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm text-white">
                        Current
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
