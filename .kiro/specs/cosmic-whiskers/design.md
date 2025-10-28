# Cosmic Whiskers - Design Document

## Overview

Cosmic Whiskers is a story-driven endless runner game built on Reddit's Devvit Web platform. The game follows Luna, a space cat separated from her family, as she navigates through six themed chapters by flying through glowing cosmic rings. The design emphasizes emotional storytelling, progressive difficulty, visual variety, and community competition through Reddit integration.

### Core Gameplay Loop
1. Player taps/clicks to make Luna flap upward
2. Gravity pulls Luna downward when not flapping
3. Luna must navigate through cosmic ring openings
4. Score increases for each ring successfully passed
5. Game ends on collision with ring or boundary
6. Cumulative score unlocks new story themes
7. Players compete on theme-specific leaderboards

### Technical Stack
- **Frontend**: React with TypeScript, Vite bundler
- **Backend**: Devvit server-side handlers
- **Storage**: Redis for leaderboards and player progress
- **Rendering**: HTML5 Canvas for game graphics
- **Physics**: Custom 2D physics engine

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Reddit Devvit App                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Client (React + Canvas)                │   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │  Game Engine                              │   │   │
│  │  │  - Physics System                         │   │   │
│  │  │  - Collision Detection                    │   │   │
│  │  │  - Rendering Pipeline                     │   │   │
│  │  │  - Input Handler                          │   │   │
│  │  └──────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │  UI Components                            │   │   │
│  │  │  - SplashScreen                           │   │   │
│  │  │  - GameCanvas                             │   │   │
│  │  │  - ThemeSelector                          │   │   │
│  │  │  - Leaderboard                            │   │   │
│  │  │  - StoryCutscene                          │   │   │
│  │  └──────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│                          ↕                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Server (Devvit Handlers)              │   │
│  │  - Score submission                             │   │
│  │  - Leaderboard queries                          │   │
│  │  - Progress tracking                            │   │
│  │  - Theme unlock validation                      │   │
│  └─────────────────────────────────────────────────┘   │
│                          ↕                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Redis Storage                       │   │
│  │  - Player scores (sorted sets)                  │   │
│  │  - Theme progress (hashes)                      │   │
│  │  - Leaderboards per theme                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### Client-Side Components

**1. Game Engine**
- Manages game loop at 60 FPS
- Updates physics, collision detection, and rendering
- Handles state transitions (menu → playing → game over)

**2. Physics System**
- Applies gravity (800 px/s²) to Luna
- Applies upward velocity (350 px/s) on tap
- Updates Luna's position and rotation
- Manages velocity damping

**3. Collision Detection**
- Checks Luna's hitbox against cosmic rings
- Detects boundary collisions (top/bottom)
- Uses circular hitbox for Luna (radius: 20px)
- Uses ring geometry for obstacle detection

**4. Rendering Pipeline**
- Clears and redraws canvas each frame
- Renders background with theme-specific gradients
- Renders cosmic rings with glow effects
- Renders Luna with rotation and animation
- Renders UI overlays (score, progress)

**5. Theme System**
- Loads theme-specific assets and colors
- Manages theme unlock state
- Displays story cutscenes
- Tracks per-theme high scores

#### Server-Side Handlers

**1. Score Submission Handler**
```typescript
POST /api/submit-score
{
  userId: string,
  themeId: number,
  score: number,
  sessionId: string
}
```
- Validates score authenticity
- Updates cumulative score
- Checks for theme unlocks
- Updates leaderboard

**2. Leaderboard Query Handler**
```typescript
GET /api/leaderboard/:themeId
Response: {
  entries: Array<{username: string, score: number, rank: number}>,
  playerRank: number,
  playerScore: number
}
```

**3. Progress Query Handler**
```typescript
GET /api/progress
Response: {
  cumulativeScore: number,
  unlockedThemes: number[],
  themeScores: Record<number, number>
}
```

## Components and Interfaces

### Data Models

#### Player State
```typescript
interface PlayerState {
  userId: string;
  username: string;
  cumulativeScore: number;
  unlockedThemes: number[];
  themeHighScores: Record<number, number>;
  currentTheme: number;
}
```

#### Game State
```typescript
interface GameState {
  status: 'menu' | 'playing' | 'gameover' | 'cutscene';
  score: number;
  luna: LunaState;
  rings: CosmicRing[];
  theme: Theme;
  frameCount: number;
}

interface LunaState {
  x: number;
  y: number;
  velocityY: number;
  rotation: number;
  isFlapping: boolean;
}

interface CosmicRing {
  x: number;
  gapY: number;
  gapSize: number;
  passed: boolean;
  color: string;
}
```

#### Theme Configuration
```typescript
interface Theme {
  id: number;
  name: string;
  unlockScore: number;
  story: {
    title: string;
    description: string;
  };
  visuals: {
    backgroundGradient: [string, string];
    backgroundShift: [string, string]; // Secondary gradient for animation
    ringColor: string;
    ringGlowColor: string;
    ringAccentColor: string;
    particleColor: string;
    trailColor: string;
    starDensity: number;
    starColors: string[];
    nebulaColor?: string;
    nebulaOpacity?: number;
    planetImage?: string;
    specialEffect?: 'aurora' | 'lightRays' | 'energyField' | 'none';
  };
  audio?: {
    ambientSound?: string;
    ringPassSound?: string;
  };
}
```

### Theme Definitions

```typescript
const THEMES: Theme[] = [
  {
    id: 1,
    name: "Lost in Space",
    unlockScore: 0,
    story: {
      title: "The Beginning",
      description: "Luna the space cat was separated from her family during a meteor shower. Help her navigate through space to find them!"
    },
    visuals: {
      backgroundGradient: ['#1a0033', '#000033'],
      backgroundShift: ['#0f0028', '#00001a'],
      ringColor: '#6b46c1',
      ringGlowColor: '#9f7aea',
      ringAccentColor: '#c084fc',
      particleColor: '#ffffff',
      trailColor: '#a78bfa',
      starDensity: 50,
      starColors: ['#ffffff', '#e0e7ff', '#c7d2fe'],
      nebulaColor: '#4c1d95',
      nebulaOpacity: 0.2,
      specialEffect: 'none'
    }
  },
  {
    id: 2,
    name: "Nebula Dreams",
    unlockScore: 50,
    story: {
      title: "A Glimmer of Hope",
      description: "Luna senses her family's presence in the colorful nebula clouds ahead. Keep flying!"
    },
    visuals: {
      backgroundGradient: ['#4c1d95', '#ec4899'],
      backgroundShift: ['#5b21b6', '#db2777'],
      ringColor: '#ec4899',
      ringGlowColor: '#f9a8d4',
      ringAccentColor: '#06b6d4',
      particleColor: '#06b6d4',
      trailColor: '#f0abfc',
      starDensity: 70,
      starColors: ['#fae8ff', '#fbcfe8', '#a5f3fc'],
      nebulaColor: '#ec4899',
      nebulaOpacity: 0.4,
      planetImage: 'pink-planet',
      specialEffect: 'aurora'
    }
  },
  {
    id: 3,
    name: "Asteroid Belt",
    unlockScore: 150,
    story: {
      title: "Memories Return",
      description: "The asteroid belt is dangerous, but Luna remembers playing here with her siblings. She's getting closer!"
    },
    visuals: {
      backgroundGradient: ['#292524', '#57534e'],
      backgroundShift: ['#1c1917', '#44403c'],
      ringColor: '#78716c',
      ringGlowColor: '#a8a29e',
      ringAccentColor: '#fbbf24',
      particleColor: '#fbbf24',
      trailColor: '#d6d3d1',
      starDensity: 30,
      starColors: ['#fef3c7', '#fde68a', '#ffffff'],
      nebulaColor: '#57534e',
      nebulaOpacity: 0.15,
      planetImage: 'rocky-planet',
      specialEffect: 'none'
    }
  },
  {
    id: 4,
    name: "Starlight Path",
    unlockScore: 300,
    story: {
      title: "Mother's Guidance",
      description: "Luna follows the starlight path her mother taught her. Home is near!"
    },
    visuals: {
      backgroundGradient: ['#1e3a8a', '#fbbf24'],
      backgroundShift: ['#1e40af', '#f59e0b'],
      ringColor: '#fbbf24',
      ringGlowColor: '#fde047',
      ringAccentColor: '#ffffff',
      particleColor: '#ffffff',
      trailColor: '#fef3c7',
      starDensity: 100,
      starColors: ['#fef3c7', '#fde047', '#ffffff'],
      nebulaColor: '#3b82f6',
      nebulaOpacity: 0.25,
      specialEffect: 'lightRays'
    }
  },
  {
    id: 5,
    name: "Galaxy's Edge",
    unlockScore: 500,
    story: {
      title: "Almost There",
      description: "At the galaxy's edge, Luna hears her family's calls. Just a little further!"
    },
    visuals: {
      backgroundGradient: ['#581c87', '#0891b2'],
      backgroundShift: ['#6b21a8', '#0e7490'],
      ringColor: '#06b6d4',
      ringGlowColor: '#67e8f9',
      ringAccentColor: '#c084fc',
      particleColor: '#c084fc',
      trailColor: '#a5f3fc',
      starDensity: 80,
      starColors: ['#e0e7ff', '#a5f3fc', '#ddd6fe'],
      nebulaColor: '#7c3aed',
      nebulaOpacity: 0.35,
      planetImage: 'purple-planet',
      specialEffect: 'energyField'
    }
  },
  {
    id: 6,
    name: "Home Sweet Home",
    unlockScore: 800,
    story: {
      title: "Reunion",
      description: "Luna reunites with her family! But the adventure continues as they explore space together."
    },
    visuals: {
      backgroundGradient: ['#ea580c', '#fbbf24'],
      backgroundShift: ['#dc2626', '#f59e0b'],
      ringColor: '#fb923c',
      ringGlowColor: '#fdba74',
      ringAccentColor: '#fef3c7',
      particleColor: '#fef3c7',
      trailColor: '#fed7aa',
      starDensity: 60,
      starColors: ['#fef3c7', '#fde68a', '#fecaca'],
      nebulaColor: '#f97316',
      nebulaOpacity: 0.3,
      planetImage: 'home-planet',
      specialEffect: 'lightRays'
    }
  }
];
```

### Game Constants

```typescript
const GAME_CONFIG = {
  // Canvas dimensions
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  // Luna physics
  GRAVITY: 800, // px/s²
  FLAP_VELOCITY: -350, // px/s (negative = upward)
  LUNA_SIZE: 40, // px
  LUNA_HITBOX_RADIUS: 20, // px
  MAX_ROTATION: 30, // degrees
  
  // Ring generation
  RING_SPACING: 250, // px
  RING_WIDTH: 80, // px
  GAP_SIZE: 180, // px
  GAP_MIN_Y: 80, // px from top
  GAP_MAX_Y: 320, // px from top
  SCROLL_SPEED: 150, // px/s
  
  // Visual effects
  RING_GLOW_RADIUS: 20, // px
  RING_PULSE_SPEED: 2, // Hz
  RING_ORBIT_PARTICLES: 10,
  TRAIL_PARTICLE_COUNT: 15,
  COLLISION_PARTICLE_COUNT: 30,
  CELEBRATION_PARTICLE_COUNT: 20,
  STAR_TWINKLE_SPEED: 0.5, // Hz
  STAR_LAYERS: 3,
  PARALLAX_SPEEDS: [0.2, 0.5, 0.8], // Multipliers for each star layer
  
  // Polish effects
  SQUASH_STRETCH_AMOUNT: 0.1, // Scale change on flap
  SCREEN_SHAKE_INTENSITY: 5, // px on collision
  COMBO_THRESHOLD: 3, // Rings for combo bonus
  SPEED_LINE_THRESHOLD: 5, // Score for speed lines
  
  // Game timing
  FPS: 60,
  CUTSCENE_DURATION: 5000, // ms
};
```

## Data Flow

### Game Session Flow

```
1. Player selects theme from menu
   ↓
2. Load theme assets and configuration
   ↓
3. Initialize game state (Luna at start position, generate initial rings)
   ↓
4. Start game loop (60 FPS)
   ├─ Handle input (tap/click)
   ├─ Update physics (gravity, velocity, position)
   ├─ Update rings (scroll, generate new, remove old)
   ├─ Check collisions
   ├─ Update score
   └─ Render frame
   ↓
5. On collision: End game
   ↓
6. Submit score to server
   ↓
7. Server validates and stores score
   ↓
8. Check for theme unlocks
   ↓
9. Display game over screen with:
   - Final score
   - Personal best for theme
   - Leaderboard position
   - Theme unlock notification (if applicable)
   ↓
10. Player chooses: Play Again or Return to Menu
```

### Theme Unlock Flow

```
1. Player completes game session
   ↓
2. Score submitted to server
   ↓
3. Server adds score to cumulative total
   ↓
4. Server checks if cumulative score >= next theme unlock threshold
   ↓
5. If yes:
   ├─ Mark theme as unlocked in Redis
   ├─ Return unlock notification to client
   └─ Client displays story cutscene
   ↓
6. Client updates theme selector UI
```

## Rendering Strategy

### Canvas Layers (Back to Front)

1. **Background Layer**
   - Animated gradient fill based on theme (slow color shifting)
   - Multiple star layers with parallax scrolling (3 depths)
   - Twinkling stars with varying sizes and brightness
   - Nebula clouds (semi-transparent, slowly drifting)
   - Distant planets or moons in background
   - Shooting stars occasionally crossing the screen

2. **Environmental Effects Layer**
   - Floating space dust particles
   - Light rays/god rays from distant stars
   - Aurora-like effects for certain themes
   - Animated constellation patterns

3. **Ring Layer**
   - Cosmic rings with multi-layer glow effect
   - Pulsing animation (scale 0.95-1.05)
   - Rotating energy particles around ring edges
   - Inner glow + outer bloom effect
   - Shadow/blur for depth
   - Trail effect as rings move
   - Color-shifting based on theme

4. **Luna Layer**
   - Cute cat sprite with expressive eyes
   - Smooth flapping animation (3-5 frames)
   - Rotation based on velocity with easing
   - Sparkle trail following Luna's path
   - Glowing aura around Luna
   - Facial expressions (happy when flying, worried when falling)
   - Jetpack or space suit details

5. **Particle Layer**
   - Collision particles with physics (bounce, fade)
   - Continuous sparkle trail behind Luna
   - Ring-passing celebration particles (confetti-like)
   - Score popup animations with bounce effect
   - Speed lines when moving fast
   - Glow orbs floating upward

6. **UI Layer**
   - Score display with glowing text and shadow
   - Animated score increment (number roll effect)
   - Progress bar with gradient fill and glow
   - Theme indicator with icon
   - Combo counter for consecutive rings
   - Distance traveled indicator
   - Smooth UI animations and transitions

### Animation Techniques

**Luna Flapping Animation**
- 5-frame sprite sheet: wings up, mid-up, neutral, mid-down, wings down
- Cycle through frames at 12 FPS when flapping
- Smooth rotation with easing: `rotation = velocityY * 0.05` (clamped to ±30°)
- Squash and stretch effect on flap (subtle scale change)
- Eye blink animation every 3-5 seconds
- Facial expression changes based on game state

**Cosmic Ring Effects**
- Multi-layer glow: inner glow (bright) + outer bloom (soft)
- Pulsing effect: `scale = 1 + 0.05 * sin(time * 2π * 2)`
- Rotating energy particles: 8-12 small orbs orbiting the ring
- Color gradient animation along ring edge
- Blur and shadow filters for depth
- Shimmer effect (moving highlight)

**Star Field Animation**
- 3 parallax layers: far (slow), mid (medium), near (fast)
- Random opacity per star: `opacity = 0.3 + 0.7 * sin(time * 2π * 0.5 + starSeed)`
- Varying star sizes (1-3px)
- Occasional shooting stars with trail effect
- Color variation (white, blue, yellow tints)

**Particle Systems**
- **Trail Particles**: Spawn behind Luna, fade out over 0.5s, slight random drift
- **Collision Particles**: Burst of 20-30 particles, physics-based movement, bounce off edges
- **Ring Pass Particles**: Confetti-like celebration, colorful, gravity-affected
- **Ambient Particles**: Floating space dust, slow drift, subtle glow

**UI Animations**
- **Score Counter**: Number roll animation with easing, scale bounce on increment
- **Progress Bar**: Smooth fill animation, pulsing glow when near unlock
- **Theme Unlock**: Screen flash, particle burst, zoom animation
- **Game Over**: Fade in with bounce effect, staggered element appearance

**Background Animations**
- Gradient color shift (subtle, 30-second cycle)
- Nebula clouds drift slowly (different speeds per layer)
- Planets slowly rotate
- Light rays pulse and shift
- Aurora waves (for certain themes)

## Error Handling

### Client-Side Error Handling

**Network Failures**
```typescript
async function submitScore(score: number): Promise<void> {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      await api.submitScore(score);
      return;
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        // Cache score locally
        localStorage.setItem('pendingScore', JSON.stringify({
          score,
          themeId: currentTheme,
          timestamp: Date.now()
        }));
        showError('Score will be submitted when connection is restored');
      }
      await delay(1000 * attempt); // Exponential backoff
    }
  }
}
```

**Invalid Game States**
- Validate Luna position stays within bounds
- Prevent negative scores
- Ensure ring generation maintains playable gaps
- Reset game state on critical errors

### Server-Side Error Handling

**Score Validation**
```typescript
function validateScore(score: number, sessionDuration: number): boolean {
  const maxPossibleScore = Math.floor(sessionDuration / 1000 * SCROLL_SPEED / RING_SPACING);
  return score >= 0 && score <= maxPossibleScore * 1.2; // 20% tolerance
}
```

**Redis Failures**
- Implement circuit breaker pattern
- Return cached/default data on Redis unavailability
- Log errors for monitoring
- Graceful degradation (game playable without leaderboard)

## Testing Strategy

### Unit Tests

**Physics System**
- Test gravity application over time
- Test flap velocity application
- Test position updates
- Test rotation calculations

**Collision Detection**
- Test Luna-ring collisions (hit and miss cases)
- Test boundary collisions
- Test hitbox accuracy

**Theme System**
- Test theme unlock logic
- Test cumulative score calculation
- Test theme configuration loading

### Integration Tests

**Game Flow**
- Test complete game session from start to game over
- Test score submission and leaderboard update
- Test theme unlock triggering cutscene
- Test theme selection and loading

**Server Handlers**
- Test score submission with valid/invalid data
- Test leaderboard queries with various user states
- Test progress tracking across sessions

### Manual Testing Checklist

- [ ] Game runs at stable 60 FPS on mobile and desktop
- [ ] Touch and click inputs work correctly
- [ ] Luna physics feel responsive and fair
- [ ] Rings generate with playable gaps
- [ ] Collision detection is accurate
- [ ] Score increments correctly
- [ ] All 6 themes unlock at correct thresholds
- [ ] Story cutscenes display properly
- [ ] Leaderboards update in real-time
- [ ] Game recovers from network errors
- [ ] Visual effects render smoothly
- [ ] Responsive design works on various screen sizes

## Performance Considerations

### Optimization Strategies

**Canvas Rendering**
- Use `requestAnimationFrame` for smooth 60 FPS
- Only redraw changed regions (dirty rectangle optimization)
- Limit particle count based on device performance
- Use sprite sheets to reduce draw calls

**Memory Management**
- Remove off-screen rings from array
- Limit particle lifetime
- Reuse object pools for rings and particles
- Clear unused theme assets when switching

**Network Optimization**
- Batch score submissions if multiple pending
- Cache leaderboard data with 30-second TTL
- Compress API payloads
- Use Redis pipelining for multiple operations

**Mobile Optimization**
- Reduce particle effects on low-end devices
- Scale canvas resolution based on device pixel ratio
- Disable expensive visual effects if FPS drops below 50
- Use touch event optimization (passive listeners)

## Accessibility

### Input Methods
- Touch (mobile)
- Mouse click (desktop)
- Spacebar (desktop)
- Enter key (desktop)

### Visual Accessibility
- High contrast between Luna and background
- Clear ring outlines
- Large tap targets (full screen for flapping)
- Colorblind-friendly theme palettes

### User Experience
- Clear visual feedback on input
- Intuitive one-button control
- Forgiving hitboxes
- Progressive difficulty through themes

## Visual Polish Details

### Luna Character Design
- **Cute Features**: Large expressive eyes, small nose, rounded ears
- **Space Suit**: Transparent helmet with stars reflection, small jetpack
- **Animations**: 
  - Happy expression when ascending
  - Determined expression when flying straight
  - Worried expression when falling
  - Celebration animation when passing rings
  - Eye blinks every 3-5 seconds
- **Color Scheme**: White/gray fur with pink accents, blue space suit

### Cosmic Ring Design
- **Structure**: Circular portal with thick glowing border
- **Effects**:
  - Inner glow (bright, sharp)
  - Outer bloom (soft, large radius)
  - Rotating energy particles (8-12 orbs)
  - Shimmer effect (moving highlight along edge)
  - Pulsing scale animation
  - Color gradient that shifts
- **Variations**: Each theme has unique ring colors and particle effects

### UI Polish
- **Score Display**:
  - Large, bold font with glow effect
  - Number roll animation on increment
  - Scale bounce effect (+10% for 0.2s)
  - Combo multiplier indicator (2x, 3x, etc.)
  - Floating "+1" popup on ring pass
  
- **Progress Bar**:
  - Gradient fill matching theme colors
  - Pulsing glow when near unlock threshold
  - Smooth fill animation with easing
  - Sparkle particles along filled portion
  - Theme preview icons at unlock points
  
- **Theme Unlock Celebration**:
  - Screen flash (white, 0.3s)
  - Particle burst from center (50+ particles)
  - Zoom animation on unlock notification
  - Story cutscene with fade transition
  - Confetti rain effect

### Environmental Details
- **Star Field**:
  - 3 parallax layers (far, mid, near)
  - Varying sizes (1-3px)
  - Color variation (white, blue, yellow)
  - Twinkling animation
  - Occasional shooting stars with trails
  
- **Nebula Clouds**:
  - Semi-transparent, organic shapes
  - Slow drift animation (different speeds)
  - Subtle color pulsing
  - Layered for depth
  
- **Planets/Moons**:
  - Visible in background (theme-specific)
  - Slow rotation
  - Atmospheric glow
  - Surface details (craters, clouds)
  
- **Special Effects**:
  - **Aurora**: Wavy, translucent bands of color
  - **Light Rays**: God rays from distant stars
  - **Energy Field**: Pulsing grid pattern
  - **Space Dust**: Floating particles with subtle glow

### Particle Systems Detail

**Trail Particles (Behind Luna)**
- Spawn rate: 3 per frame
- Lifetime: 0.5 seconds
- Color: Theme trail color with fade
- Size: 3-5px, shrinking over time
- Movement: Slight random drift

**Ring Pass Celebration**
- Spawn: 20 particles on ring pass
- Colors: Theme accent colors
- Movement: Burst outward, then float up
- Rotation: Random spin
- Lifetime: 1 second

**Collision Particles**
- Spawn: 30 particles on collision
- Colors: White and theme colors
- Movement: Physics-based, bounce off edges
- Size: 2-6px
- Lifetime: 1.5 seconds

**Ambient Space Dust**
- Always present: 50 particles
- Slow drift across screen
- Subtle glow
- Varying opacity
- Parallax movement

### Screen Effects
- **Screen Shake**: On collision, 5px intensity, 0.3s duration
- **Slow Motion**: Brief slow-mo on close calls (optional)
- **Vignette**: Subtle darkening at edges for focus
- **Bloom**: Post-processing bloom on bright elements
- **Motion Blur**: Subtle blur on fast movement (optional)

## Future Enhancements

### Potential Features (Post-MVP)
- Daily challenges with special rewards
- Power-ups (shield, slow-motion, double points)
- Customizable Luna skins (different cats, colors, accessories)
- Multiplayer race mode
- Achievement system with badges
- Sound effects and background music
- Social sharing of high scores with screenshot
- Seasonal events with limited-time themes
- Photo mode to capture beautiful moments
- Replay system to watch best runs
