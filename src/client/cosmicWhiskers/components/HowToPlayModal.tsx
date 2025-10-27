import React from 'react';
import { Theme } from '../../../shared/types/cosmicWhiskers';

interface HowToPlayModalProps {
  theme: Theme;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ theme, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8"
        style={{
          background: `linear-gradient(135deg, ${theme.visuals.backgroundGradient[0]}ee, ${theme.visuals.backgroundGradient[1]}ee)`,
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-white">❓ How to Play</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-3xl px-3 py-1"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 text-white">
          {/* Controls */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-4">🎮 Controls</h3>
            <ul className="space-y-2 text-white/90">
              <li>• <strong>Tap/Click</strong> anywhere to make Luna flap</li>
              <li>• <strong>Spacebar</strong> or <strong>Enter</strong> also works</li>
              <li>• Works on both mobile and desktop!</li>
            </ul>
          </div>

          {/* Objective */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-4">🎯 Objective</h3>
            <p className="text-white/90 mb-3">
              Help Luna the space cat navigate through cosmic rings to reunite with her family!
            </p>
            <ul className="space-y-2 text-white/90">
              <li>• Fly through the glowing ring openings</li>
              <li>• Avoid hitting the rings or boundaries</li>
              <li>• Score points for each ring you pass</li>
            </ul>
          </div>

          {/* Themes */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-4">🌟 Story Themes</h3>
            <p className="text-white/90 mb-3">
              Unlock 6 beautiful themes by earning points:
            </p>
            <ul className="space-y-1 text-white/80 text-sm">
              <li>• Lost in Space (0 pts) - The journey begins</li>
              <li>• Nebula Dreams (50 pts) - Colorful nebula clouds</li>
              <li>• Asteroid Belt (150 pts) - Memories of siblings</li>
              <li>• Starlight Path (300 pts) - Following mother's guidance</li>
              <li>• Galaxy's Edge (500 pts) - Almost home</li>
              <li>• Home Sweet Home (800 pts) - Family reunion!</li>
            </ul>
          </div>

          {/* Tips */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-4">💡 Tips</h3>
            <ul className="space-y-2 text-white/90">
              <li>• Tap gently for small adjustments</li>
              <li>• Watch Luna's rotation for flight direction</li>
              <li>• Cumulative score unlocks new themes</li>
              <li>• Each theme has its own leaderboard</li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};
