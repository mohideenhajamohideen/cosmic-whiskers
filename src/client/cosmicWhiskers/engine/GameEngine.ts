// Game Engine - Core game loop and state management
import { GameState, LunaState } from '../../../shared/types/cosmicWhiskers';
import { GAME_CONFIG, THEMES } from '../../../shared/cosmicWhiskersConstants';
import { PhysicsSystem } from './PhysicsSystem';
import { InputHandler } from './InputHandler';
import { RingSystem } from './RingSystem';
import { CollisionSystem } from './CollisionSystem';
import { ThemeManager } from './ThemeManager';
import { ProgressTracker } from './ProgressTracker';
import { BackgroundRenderer } from '../rendering/BackgroundRenderer';
import { EnvironmentalRenderer } from '../rendering/EnvironmentalRenderer';
import { RingRenderer } from '../rendering/RingRenderer';
import { LunaRenderer } from '../rendering/LunaRenderer';
import { ParticleSystem } from '../rendering/ParticleSystem';
import { AudioManager } from '../audio/AudioManager';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private lastFrameTime: number = 0;
  private animationFrameId: number | null = null;
  private physicsSystem: PhysicsSystem;
  private inputHandler: InputHandler;
  private ringSystem: RingSystem;
  private collisionSystem: CollisionSystem;
  private themeManager: ThemeManager;
  private progressTracker: ProgressTracker;
  private onThemeUnlock?: (themeIds: number[]) => void;

  // Rendering systems
  private backgroundRenderer: BackgroundRenderer;
  private environmentalRenderer: EnvironmentalRenderer;
  private ringRenderer: RingRenderer;
  private lunaRenderer: LunaRenderer;
  private particleSystem: ParticleSystem;
  
  // Audio system
  private audioManager: AudioManager;

  constructor(
    canvas: HTMLCanvasElement,
    unlockedThemes: number[] = [1],
    cumulativeScore: number = 0,
    themeScores: Record<number, number> = {}
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = context;

    // Initialize managers
    this.themeManager = new ThemeManager(unlockedThemes);
    this.progressTracker = new ProgressTracker(cumulativeScore, themeScores);

    // Initialize game state
    this.gameState = this.createInitialState();

    // Initialize systems
    this.physicsSystem = new PhysicsSystem();
    this.inputHandler = new InputHandler(canvas, () => this.flap());
    this.ringSystem = new RingSystem(canvas.width, canvas.height, this.gameState.theme);
    this.collisionSystem = new CollisionSystem();
    this.ringSystem.initialize();

    // Initialize rendering systems
    this.backgroundRenderer = new BackgroundRenderer(canvas.width, canvas.height);
    this.environmentalRenderer = new EnvironmentalRenderer(canvas.width, canvas.height);
    this.ringRenderer = new RingRenderer();
    this.lunaRenderer = new LunaRenderer();
    this.particleSystem = new ParticleSystem();
    
    // Initialize audio system
    this.audioManager = new AudioManager();

    // Render initial frame so Luna is visible in menu
    this.render();
  }

  private createInitialState(): GameState {
    const initialLuna: LunaState = {
      x: 150,
      y: GAME_CONFIG.CANVAS_HEIGHT / 2,
      velocityY: 0,
      rotation: 0,
      isFlapping: false,
    };

    const defaultTheme = THEMES[0];
    if (!defaultTheme) {
      throw new Error('No themes available');
    }

    return {
      status: 'menu',
      score: 0,
      luna: initialLuna,
      rings: [],
      theme: defaultTheme,
      frameCount: 0,
    };
  }

  public start(): void {
    this.gameState.status = 'ready'; // Start in ready state, waiting for first input
    this.lastFrameTime = performance.now();
    this.audioManager.resume(); // Resume audio context
    this.gameLoop(this.lastFrameTime);
  }

  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private gameLoop = (currentTime: number): void => {
    const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = currentTime;

    // Update game state
    this.update(deltaTime);

    // Render frame
    this.render();

    // Continue loop
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    if (this.gameState.status !== 'playing' && this.gameState.status !== 'ready') return;

    // Cap delta time to prevent large jumps
    const cappedDelta = Math.min(deltaTime, 1 / 30); // Max 30 FPS minimum

    // In ready state, just hover Luna in place (gentle bobbing animation)
    if (this.gameState.status === 'ready') {
      const bobAmount = Math.sin(performance.now() * 0.003) * 10;
      this.gameState.luna.y = GAME_CONFIG.CANVAS_HEIGHT / 2 + bobAmount;
      this.gameState.luna.velocityY = 0;
      this.gameState.luna.rotation = 0;
      
      // Update background and environmental effects even in ready state
      this.backgroundRenderer.updateParallax(GAME_CONFIG.SCROLL_SPEED * cappedDelta * 0.3);
      this.environmentalRenderer.updateClouds(cappedDelta);
      return;
    }

    this.gameState.frameCount++;

    // Apply physics to Luna
    this.physicsSystem.applyGravity(this.gameState.luna, cappedDelta);
    this.physicsSystem.updatePosition(this.gameState.luna, cappedDelta);

    // Check boundary collisions
    if (this.physicsSystem.checkBoundaryCollision(this.gameState.luna, this.canvas.height)) {
      this.particleSystem.spawnCollisionParticles(
        this.gameState.luna.x,
        this.gameState.luna.y,
        this.gameState.theme
      );
      this.audioManager.playCollision(); // Play collision sound
      this.endGame();
      return;
    }

    // Update rings (scrolling and generation)
    this.ringSystem.update(cappedDelta);
    this.gameState.rings = this.ringSystem.getRings();

    // Update background parallax
    this.backgroundRenderer.updateParallax(GAME_CONFIG.SCROLL_SPEED * cappedDelta);

    // Update environmental effects
    this.environmentalRenderer.updateClouds(cappedDelta);

    // Update particles
    this.particleSystem.update(cappedDelta);

    // Spawn trail particles behind Luna
    if (this.gameState.frameCount % 2 === 0) {
      this.particleSystem.spawnTrailParticles(
        this.gameState.luna.x,
        this.gameState.luna.y,
        this.gameState.theme
      );
    }

    // Check ring collisions and score tracking
    for (const ring of this.gameState.rings) {
      // Check collision
      if (this.collisionSystem.checkRingCollision(this.gameState.luna, ring)) {
        this.particleSystem.spawnCollisionParticles(
          this.gameState.luna.x,
          this.gameState.luna.y,
          this.gameState.theme
        );
        this.audioManager.playCollision(); // Play collision sound
        this.endGame();
        return;
      }

      // Check if Luna passed through the ring (for scoring)
      if (!ring.passed && this.collisionSystem.checkIfPassed(this.gameState.luna, ring)) {
        ring.passed = true;
        this.gameState.score++;

        // Spawn celebration particles
        this.particleSystem.spawnCelebrationParticles(
          ring.x,
          ring.gapY,
          this.gameState.theme
        );
        
        // Play score sound
        this.audioManager.playScore();
      }
    }
  }

  private endGame(): void {
    this.gameState.status = 'gameover';
    this.stop();
    this.audioManager.stopAmbientMusic(); // Stop music on game over

    // Update progress tracker
    const currentThemeId = this.gameState.theme.id;
    this.progressTracker.addScore(currentThemeId, this.gameState.score);

    // Check for theme unlocks
    const newlyUnlocked = this.themeManager.checkUnlocks(
      this.progressTracker.getCumulativeScore()
    );

    if (newlyUnlocked.length > 0 && this.onThemeUnlock) {
      this.onThemeUnlock(newlyUnlocked);
    }
  }

  public setThemeUnlockCallback(callback: (themeIds: number[]) => void): void {
    this.onThemeUnlock = callback;
  }

  public getThemeManager(): ThemeManager {
    return this.themeManager;
  }

  public getProgressTracker(): ProgressTracker {
    return this.progressTracker;
  }

  public setTheme(themeId: number): boolean {
    if (this.themeManager.setCurrentTheme(themeId)) {
      this.gameState.theme = this.themeManager.getCurrentTheme();
      this.ringSystem.setTheme(this.gameState.theme);
      return true;
    }
    return false;
  }

  public flap(): void {
    if (this.gameState.status === 'ready') {
      // First tap starts the game
      this.gameState.status = 'playing';
      this.audioManager.startAmbientMusic(); // Start music when game actually begins
      this.physicsSystem.applyFlapVelocity(this.gameState.luna);
      this.audioManager.playFlap(); // Play flap sound
    } else if (this.gameState.status === 'playing') {
      this.physicsSystem.applyFlapVelocity(this.gameState.luna);
      this.audioManager.playFlap(); // Play flap sound
    }
  }

  private render(): void {
    const time = performance.now();

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render background with animated gradient and stars
    this.backgroundRenderer.render(this.ctx, this.gameState.theme, time);

    // Render environmental effects (nebula, planets, special effects)
    this.environmentalRenderer.render(this.ctx, this.gameState.theme, time);

    // Render cosmic rings with glow and particles (only when playing)
    if (this.gameState.status === 'playing') {
      this.ringRenderer.render(this.ctx, this.gameState.rings, this.gameState.theme, time);
    }

    // Render particles (behind Luna)
    this.particleSystem.render(this.ctx);

    // Render Luna with animations
    this.lunaRenderer.render(this.ctx, this.gameState.luna, this.gameState.theme, time);

    // Show "Tap to Start" message in ready state
    if (this.gameState.status === 'ready') {
      this.renderReadyMessage(time);
    }
  }

  private renderReadyMessage(time: number): void {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height * 0.7;

    // Pulsing animation
    const pulse = 0.8 + Math.sin(time * 0.005) * 0.2;

    ctx.save();
    ctx.globalAlpha = pulse;

    // Main text
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = 'TAP TO START';
    ctx.strokeText(text, centerX, centerY);
    ctx.fillText(text, centerX, centerY);

    // Subtitle
    ctx.font = '18px Arial';
    ctx.globalAlpha = pulse * 0.8;
    const subtitle = 'Click, tap, or press SPACE';
    ctx.strokeText(subtitle, centerX, centerY + 40);
    ctx.fillText(subtitle, centerX, centerY + 40);

    ctx.restore();
  }

  public getState(): GameState {
    return this.gameState;
  }

  public setState(newState: Partial<GameState>): void {
    this.gameState = { ...this.gameState, ...newState };
  }

  public reset(): void {
    this.gameState = this.createInitialState();
    this.ringSystem.reset();
    this.particleSystem.clear();
  }

  public pause(): void {
    if (this.gameState.status === 'playing') {
      this.stop();
    }
  }

  public resume(): void {
    if (this.gameState.status === 'playing' && this.animationFrameId === null) {
      this.lastFrameTime = performance.now();
      this.gameLoop(this.lastFrameTime);
    }
  }

  public getAudioManager(): AudioManager {
    return this.audioManager;
  }

  public destroy(): void {
    this.stop();
    this.inputHandler.destroy();
    this.audioManager.destroy();
  }
}
