import React, { useEffect, useState } from 'react';
import { Theme } from '../../../shared/types/cosmicWhiskers';
import { GAME_CONFIG } from '../../../shared/cosmicWhiskersConstants';

interface StoryCutsceneProps {
  theme: Theme;
  onComplete: () => void;
  onSkip: () => void;
}

export const StoryCutscene: React.FC<StoryCutsceneProps> = ({ theme, onComplete, onSkip }) => {
  const [fadeState, setFadeState] = useState<'in' | 'visible' | 'out'>('in');

  useEffect(() => {
    // Fade in
    const fadeInTimer = setTimeout(() => {
      setFadeState('visible');
    }, 500);

    // Auto-complete after duration
    const completeTimer = setTimeout(() => {
      setFadeState('out');
      setTimeout(onComplete, 500);
    }, GAME_CONFIG.CUTSCENE_DURATION);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setFadeState('out');
    setTimeout(onSkip, 300);
  };

  const opacityClass =
    fadeState === 'in'
      ? 'opacity-0'
      : fadeState === 'visible'
        ? 'opacity-100'
        : 'opacity-0';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${theme.visuals.backgroundGradient[0]}, ${theme.visuals.backgroundGradient[1]})`,
      }}
    >
      {/* Animated stars background */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Glowing orb effect */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${theme.visuals.ringGlowColor}, transparent 70%)`,
        }}
      />

      <div
        className={`relative transition-all duration-700 ${opacityClass} max-w-3xl mx-auto px-6 md:px-8 text-center transform ${fadeState === 'visible' ? 'scale-100' : 'scale-95'}`}
      >
        {/* Story content with enhanced styling */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 md:p-12 border-2 border-white/20 shadow-2xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] leading-tight">
            {theme.story.title}
          </h1>
          <p className="text-lg md:text-2xl text-white/95 leading-relaxed mb-8 font-medium">
            {theme.story.description}
          </p>

          {/* Decorative line */}
          <div
            className="h-1 w-32 mx-auto mb-8 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${theme.visuals.ringGlowColor}, transparent)`,
            }}
          />

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleSkip}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all backdrop-blur-sm border border-white/30 hover:scale-105 active:scale-95"
            >
              Skip Story
            </button>
            <button
              onClick={handleSkip}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              Start Adventure →
            </button>
          </div>
        </div>

        {/* Floating cat emoji */}
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-6xl md:text-8xl animate-bounce">
          🐱
        </div>
      </div>
    </div>
  );
};
