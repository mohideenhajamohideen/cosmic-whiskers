import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './engine/GameEngine';
import { GAME_CONFIG } from '../../shared/cosmicWhiskersConstants';
import { submitScore, getProgress, getCommunityStats, getCurrentUser } from './api/cosmicWhiskersApi';
import type { CosmicWhiskersProgress, CommunityStats as CommunityStatsType, CommunityMilestone } from '../../shared/types/cosmicWhiskers';
import { Leaderboard } from './components/Leaderboard';
import { CommunityStats } from './components/CommunityStats';
import { UsernameDisplay } from './components/UsernameDisplay';
import { MilestoneCelebration } from './components/MilestoneCelebration';
import { ConfettiCelebration } from './components/ConfettiCelebration';

export const CosmicWhiskersApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState<CosmicWhiskersProgress | null>(null);
  const [currentTheme] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardKey, setLeaderboardKey] = useState(0);
  const [communityStats, setCommunityStats] = useState<CommunityStatsType | null>(null);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [username, setUsername] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [celebratingMilestone, setCelebratingMilestone] = useState<CommunityMilestone | null>(null);
  const previousStatsRef = useRef<CommunityStatsType | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Load progress, community stats, and username on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progressData = await getProgress();
        if (progressData.error) {
          setProgressError(progressData.error);
          console.warn('Progress loaded with error:', progressData.error);
        }
        setProgress(progressData);
      } catch (error) {
        console.error('Failed to load progress:', error);
        setProgressError('Failed to load progress');
        // Set default progress so game can still work
        setProgress({ cumulativeScore: 0, unlockedThemes: [1], themeScores: {} });
      }
    };
    const loadCommunityStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const stats = await getCommunityStats();
        if (stats.error) {
          setStatsError(stats.error);
          console.warn('Community stats loaded with error:', stats.error);
        }
        setCommunityStats(stats);
      } catch (error) {
        console.error('Failed to load community stats:', error);
        setStatsError('Failed to load community stats');
      } finally {
        setStatsLoading(false);
      }
    };
    const loadUsername = async () => {
      try {
        const user = await getCurrentUser();
        if (user.error) {
          console.warn('Username loaded with error:', user.error);
        }
        setUsername(user.username);
      } catch (error) {
        console.error('Failed to load username:', error);
        setUsername('Guest Player');
      }
    };
    loadProgress();
    loadCommunityStats();
    loadUsername();
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
    
    // Check if this is a new high score
    const currentHighScore = progress?.themeScores[currentTheme] || 0;
    const isNewHigh = finalScore > currentHighScore;
    setIsNewHighScore(isNewHigh);
    
    // Trigger confetti for new high score
    if (isNewHigh) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    
    setIsSubmitting(true);
    try {
      console.log(`Submitting score: ${finalScore} for theme ${currentTheme}`);
      const result = await submitScore(currentTheme, finalScore);
      console.log('Score submission result:', result);
      
      if (result.success) {
        console.log(`Score saved! New cumulative: ${result.cumulativeScore}`);
        // Reload progress to get updated data
        const progressData = await getProgress();
        if (progressData.error) {
          console.warn('Progress reload error:', progressData.error);
        } else {
          console.log('Progress reloaded:', progressData);
        }
        setProgress(progressData);
        // Refresh community stats
        await handleRefreshCommunityStats();
        // Show leaderboard after score submission
        setShowLeaderboard(true);
      } else if (result.error) {
        console.error('Score submission failed:', result.error);
        // Still show leaderboard even if submission failed
        setShowLeaderboard(true);
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
      // Still show leaderboard even if submission failed
      setShowLeaderboard(true);
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
    setShowLeaderboard(false);
    handleStart();
  };

  const handleRefreshLeaderboard = () => {
    setLeaderboardKey((prev) => prev + 1);
  };

  const handleRefreshCommunityStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const stats = await getCommunityStats();
      if (stats.error) {
        setStatsError(stats.error);
        console.warn('Community stats refresh error:', stats.error);
      }
      
      // Check for newly achieved milestones
      if (previousStatsRef.current && stats.milestones) {
        const newlyAchieved = stats.milestones.find(
          (milestone) =>
            milestone.achieved &&
            !previousStatsRef.current!.milestones.find((prev) => prev.id === milestone.id)?.achieved
        );

        if (newlyAchieved) {
          setCelebratingMilestone(newlyAchieved);
          // Play celebration sound
          if (engineRef.current) {
            engineRef.current.getAudioManager().playMilestoneCelebration();
          }
        }
      }
      
      previousStatsRef.current = stats;
      setCommunityStats(stats);
      setStatsRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to refresh community stats:', error);
      setStatsError('Failed to refresh stats');
    } finally {
      setStatsLoading(false);
    }
  };

  const toggleMute = () => {
    if (engineRef.current) {
      const muted = engineRef.current.getAudioManager().toggleMute();
      setIsMuted(muted);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f0a2e] overflow-hidden">
      {/* Confetti Celebration for New High Score */}
      <ConfettiCelebration trigger={showConfetti} duration={3000} />
      
      {/* Milestone Celebration Overlay */}
      {celebratingMilestone && (
        <MilestoneCelebration
          milestone={celebratingMilestone}
          onComplete={() => setCelebratingMilestone(null)}
        />
      )}

      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full backdrop-blur-sm transition-colors"
        title={isMuted ? 'Unmute' : 'Mute'}
        style={{ marginRight: gameState === 'menu' ? '180px' : '0' }}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Canvas Container - Full screen responsive */}
      <div className="relative w-full h-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={GAME_CONFIG.CANVAS_WIDTH}
          height={GAME_CONFIG.CANVAS_HEIGHT}
          style={{ 
            display: 'block',
            touchAction: 'none',
            imageRendering: 'auto',
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />

        {/* Menu Overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-4 overflow-y-auto">
            {/* Username Display - Top Right on Menu */}
            <UsernameDisplay username={username} position="top-right" />
            
            <div className="max-w-md w-full text-center my-auto space-y-3 md:space-y-4">
              <div className="text-4xl md:text-6xl mb-2 md:mb-4 animate-bounce">😸</div>
              <h1 className="text-3xl md:text-6xl font-bold text-white mb-2 md:mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Cosmic Whiskers
              </h1>
              <p className="text-sm md:text-xl text-white/90 mb-3 md:mb-6">
                Help Luna find her family!
              </p>
              
              {progress && (
                <div className="space-y-2 md:space-y-3">
                  {/* Stats Card */}
                  <div className="bg-black/40 rounded-lg md:rounded-xl p-3 md:p-4 space-y-1.5 md:space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-xs md:text-base">Your Best Score</span>
                      <span className="text-yellow-400 font-bold text-base md:text-xl">
                        {progress.themeScores[currentTheme] || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-xs md:text-base">Total Score</span>
                      <span className="text-purple-300 font-bold text-base md:text-xl">
                        {progress.cumulativeScore}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-xs md:text-base">Themes Unlocked</span>
                      <span className="text-blue-300 font-bold text-base md:text-xl">
                        {progress.unlockedThemes.length}/6
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="bg-black/40 rounded-lg md:rounded-xl p-2.5 md:p-3">
                    <p className="text-white/70 text-xs md:text-sm mb-1.5 md:mb-2">Story Progress</p>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 md:h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 md:h-2 rounded-full transition-all duration-500"
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
                className="w-full px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800 text-white text-lg md:text-2xl font-bold rounded-lg transition-all shadow-lg transform hover:scale-105 active:scale-95"
              >
                START ADVENTURE
              </button>

              <p className="text-white/50 text-xs md:text-sm">
                Controls: Click, Tap, or press Space/Enter to flap
              </p>

              {/* Community Stats on Menu */}
              <div className="mt-3 md:mt-6">
                <CommunityStats
                  key={statsRefreshKey}
                  stats={communityStats}
                  refreshInterval={30000}
                  onRefresh={handleRefreshCommunityStats}
                  error={statsError}
                  isLoading={statsLoading}
                />
              </div>

              {/* Progress Error Indicator */}
              {progressError && (
                <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-2 md:p-3">
                  <p className="text-yellow-400 text-xs text-center">
                    ⚠️ {progressError} - Using default progress
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-3 md:p-4 overflow-y-auto">
            {/* Username Display - Top Right on Game Over */}
            <UsernameDisplay username={username} position="top-right" />
            
            <div className="max-w-4xl w-full my-auto space-y-3 md:space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4 text-center">Game Over!</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                {/* Left Column - Score and Stats */}
                <div className="space-y-3 md:space-y-4">
                  {/* Current Score */}
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg md:rounded-xl p-4 md:p-6 text-center">
                    <p className="text-white/80 text-xs md:text-base mb-1">Your Score</p>
                    <p className="text-3xl md:text-5xl font-bold text-white">{score}</p>
                  </div>
                  
                  {isSubmitting && (
                    <div className="text-center py-2">
                      <div className="w-6 h-6 md:w-8 md:h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-white/60 text-xs md:text-sm">Submitting score...</p>
                    </div>
                  )}
                  
                  {progress && !isSubmitting && (
                    <>
                      {/* High Score & Stats */}
                      <div className="bg-black/40 rounded-lg md:rounded-xl p-3 md:p-4 space-y-2 md:space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 text-xs md:text-base">High Score (Theme {currentTheme})</span>
                          <span className="text-yellow-400 font-bold text-base md:text-xl">
                            {progress.themeScores[currentTheme] || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 text-xs md:text-base">Total Score</span>
                          <span className="text-purple-300 font-bold text-base md:text-xl">
                            {progress.cumulativeScore}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 text-xs md:text-base">Themes Unlocked</span>
                          <span className="text-blue-300 font-bold text-base md:text-xl">
                            {progress.unlockedThemes.length}/6
                          </span>
                        </div>
                        
                        {/* New High Score Badge */}
                        {score > (progress.themeScores[currentTheme] || 0) && (
                          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-2 text-center animate-pulse">
                            <p className="text-white font-bold text-xs md:text-base">
                              🏆 NEW HIGH SCORE! 🏆
                            </p>
                          </div>
                        )}
                        
                        {/* Theme Unlock Notification */}
                        {progress.unlockedThemes.length > currentTheme && (
                          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-2 text-center">
                            <p className="text-white font-bold text-xs md:text-base">
                              🎉 New Theme Unlocked! 🎉
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {/* Play Again Button */}
                  <button
                    onClick={handlePlayAgain}
                    className="w-full px-6 md:px-8 py-3 md:py-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-lg md:text-2xl font-bold rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    Play Again
                  </button>
                </div>

                {/* Right Column - Leaderboard & Community Stats */}
                <div className="lg:max-h-[600px] lg:overflow-y-auto space-y-3 md:space-y-4">
                  {/* Community Stats - Always Visible at Top */}
                  {!isSubmitting && (
                    <CommunityStats
                      key={statsRefreshKey}
                      stats={communityStats}
                      refreshInterval={30000}
                      onRefresh={handleRefreshCommunityStats}
                      error={statsError}
                      isLoading={statsLoading}
                    />
                  )}

                  {/* Leaderboard - Always Visible */}
                  {!isSubmitting && (
                    <Leaderboard
                      key={leaderboardKey}
                      themeId={currentTheme}
                      onClose={() => {}} // No close button - always visible
                      onRefresh={handleRefreshLeaderboard}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Score Display - Playing */}
        {gameState === 'playing' && (
          <>
            {/* Username Display - Top Right, more prominent */}
            <div className="absolute top-4 right-4 z-20">
              <UsernameDisplay username={username} position="top-right" />
            </div>
            
            {/* Score - Top Center */}
            <div className="absolute top-4 md:top-6 left-1/2 transform -translate-x-1/2 z-10">
              <div className="text-4xl md:text-5xl font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                {score}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
