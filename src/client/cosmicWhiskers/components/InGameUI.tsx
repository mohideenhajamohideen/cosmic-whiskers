import React from 'react';

interface InGameUIProps {
  score: number;
  cumulativeScore: number;
  nextThemeUnlock: number;
  themeName: string;
}

export const InGameUI: React.FC<InGameUIProps> = ({
  score,
  cumulativeScore,
  nextThemeUnlock,
  themeName,
}) => {
  const progress = nextThemeUnlock > 0 ? (cumulativeScore / nextThemeUnlock) * 100 : 100;

  return (
    <>
      {/* Score Display */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="text-6xl font-bold text-white drop-shadow-2xl animate-pulse">
          {score}
        </div>
      </div>

      {/* Theme Name */}
      <div className="absolute top-8 left-8 z-20">
        <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg">
          <p className="text-white/80 text-sm">Current Theme</p>
          <p className="text-white font-bold">{themeName}</p>
        </div>
      </div>

      {/* Progress Bar */}
      {nextThemeUnlock > 0 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-80 z-20">
          <div className="bg-black/40 backdrop-blur-sm px-4 py-3 rounded-lg">
            <p className="text-white/80 text-xs mb-2 text-center">
              Next Theme: {cumulativeScore}/{nextThemeUnlock}
            </p>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
