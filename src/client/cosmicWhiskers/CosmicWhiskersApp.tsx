import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './engine/GameEngine';
import { GAME_CONFIG } from '../../shared/cosmicWhiskersConstants';
import { submitScore, getProgress } from './api/cosmicWhiskersApi';
import type { CosmicWhiskersProgress } from '../../shared/types/cosmicWhiskers';

export const CosmicWhiskersApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState<CosmicWhiskersProgress | null>(null);
  const [currentTheme] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Load progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progressData = await getProgress();
        setProgress(progressData);
      } catch (error) {
        console.error('Failed to load progress:', error);
      }
    };
    loadProgress();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize game engine only once
    if (!engineRef.current) {
      const engine = new GameEngine(canvasRef.current);
      engineRef.current = engine;
    }

    // Update score display and check for game over
    const updateInterval = setInterval(() => {
      if (engineRef.current) {
        const state = engineRef.current.getState();
        setScore(state.score);
        
        // Handle game over
        if (state.status === 'gameover' && gameState === 'playing') {
          setGameState('gameover');
          handleGameOver(state.score);
        }
      }
    }, 100);

    return () => {
      clearInterval(updateInterval);
    };
  }, [gameState]);

  const handleGameOver = async (finalScore: number) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const result = await submitScore(currentTheme, finalScore);
      if (result.success) {
        // Reload progress to get updated data
        const progressData = await getProgress();
        setProgress(progressData);
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStart = () => {
    if (engineRef.current) {
      engineRef.current.reset();
      engineRef.current.start();
      setGameState('playing');
      setScore(0);
    }
  };

  const handlePlayAgain = () => {
    handleStart();
  };

  const toggleMute = () => {
    if (engineRef.current) {
      const muted = engineRef.current.getAudioManager().toggleMute();
      setIsMuted(muted);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900">
      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Canvas Container - Full screen on mobile, centered on desktop */}
      <div className="relative w-full h-full md:w-auto md:h-auto md:max-w-4xl md:aspect-[4/3] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={GAME_CONFIG.CANVAS_WIDTH}
          height={GAME_CONFIG.CANVAS_HEIGHT}
          className="w-full h-full object-contain md:border-4 md:border-purple-500 md:rounded-lg md:shadow-2xl"
          style={{ 
            display: 'block',
            touchAction: 'none',
            imageRendering: 'auto',
            maxHeight: '100vh',
            maxWidth: '100vw'
          }}
        />

        {/* Menu Overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 md:rounded-lg p-4 overflow-y-auto">
            <div className="max-w-md w-full text-center my-auto">
              <div className="text-5xl md:text-6xl mb-3 md:mb-4 animate-bounce">🐱</div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 md:mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Flappy Cat
              </h1>
              <p className="text-base md:text-xl text-white/90 mb-4 md:mb-6">
                Help Luna find her family!
              </p>
              
              {progress && (
                <div className="mb-6 space-y-3">
                  {/* Stats Card */}
                  <div className="bg-black/40 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm md:text-base">Your Best Score</span>
                      <span className="text-yellow-400 font-bold text-lg md:text-xl">
                        {progress.themeScores[currentTheme] || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm md:text-base">Total Score</span>
                      <span className="text-purple-300 font-bold text-lg md:text-xl">
                        {progress.cumulativeScore}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm md:text-base">Themes Unlocked</span>
                      <span className="text-blue-300 font-bold text-lg md:text-xl">
                        {progress.unlockedThemes.length}/6
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="bg-black/40 rounded-xl p-3">
                    <p className="text-white/70 text-xs md:text-sm mb-2">Story Progress</p>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(progress.unlockedThemes.length / 6) * 100}%` }}
                      />
                    </div>
                    <p className="text-white/50 text-xs mt-1">
                      Chapter {progress.unlockedThemes.length} of 6
                    </p>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleStart}
                className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800 text-white text-xl md:text-2xl font-bold rounded-lg transition-all shadow-lg transform hover:scale-105 active:scale-95"
              >
                START ADVENTURE
              </button>

              <p className="mt-4 text-white/50 text-xs md:text-sm">
                Controls: Click, Tap, or press Space/Enter to flap
              </p>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 md:rounded-lg p-4 overflow-y-auto">
            <div className="max-w-md w-full my-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 md:mb-4 text-center">Game Over!</h2>
              
              {/* Current Score */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-4 text-center">
                <p className="text-white/80 text-sm md:text-base mb-1">Your Score</p>
                <p className="text-4xl md:text-5xl font-bold text-white">{score}</p>
              </div>
              
              {isSubmitting && (
                <div className="mb-4 text-center">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-white/60 text-sm">Submitting score...</p>
                </div>
              )}
              
              {progress && !isSubmitting && (
                <>
                  {/* High Score & Stats */}
                  <div className="bg-black/40 rounded-xl p-4 mb-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm md:text-base">High Score (Theme {currentTheme})</span>
                      <span className="text-yellow-400 font-bold text-lg md:text-xl">
                        {progress.themeScores[currentTheme] || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm md:text-base">Total Score</span>
                      <span className="text-purple-300 font-bold text-lg md:text-xl">
                        {progress.cumulativeScore}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm md:text-base">Themes Unlocked</span>
                      <span className="text-blue-300 font-bold text-lg md:text-xl">
                        {progress.unlockedThemes.length}/6
                      </span>
                    </div>
                    
                    {/* New High Score Badge */}
                    {score > (progress.themeScores[currentTheme] || 0) && (
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-2 text-center animate-pulse">
                        <p className="text-white font-bold text-sm md:text-base">
                          🏆 NEW HIGH SCORE! 🏆
                        </p>
                      </div>
                    )}
                    
                    {/* Theme Unlock Notification */}
                    {progress.unlockedThemes.length > currentTheme && (
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-2 text-center">
                        <p className="text-white font-bold text-sm md:text-base">
                          🎉 New Theme Unlocked! 🎉
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Share Button */}
                  <button
                    onClick={() => {
                      const shareText = `🐱 I scored ${score} in Flappy Cat! Can you beat my score? 🚀`;
                      if (navigator.share) {
                        navigator.share({
                          title: 'Flappy Cat Score',
                          text: shareText,
                        }).catch(() => {
                          // Fallback: copy to clipboard
                          navigator.clipboard.writeText(shareText);
                          alert('Score copied to clipboard!');
                        });
                      } else {
                        // Fallback: copy to clipboard
                        navigator.clipboard.writeText(shareText);
                        alert('Score copied to clipboard!');
                      }
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-lg transition-all shadow-lg mb-3 flex items-center justify-center gap-2"
                  >
                    <span>📤</span>
                    <span>Share Score</span>
                  </button>
                </>
              )}
              
              {/* Play Again Button */}
              <button
                onClick={handlePlayAgain}
                className="w-full px-8 py-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-xl md:text-2xl font-bold rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Score Display - Playing */}
        {gameState === 'playing' && (
          <div className="absolute top-4 md:top-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="text-4xl md:text-5xl font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
              {score}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
