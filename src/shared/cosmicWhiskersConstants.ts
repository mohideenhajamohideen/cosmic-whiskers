// Cosmic Whiskers Game Constants
import { Theme } from './types/cosmicWhiskers';

export const GAME_CONFIG = {
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

export const THEMES: Theme[] = [
  {
    id: 1,
    name: 'Lost in Space',
    unlockScore: 0,
    story: {
      title: '🌌 Chapter 1: Lost in the Cosmos',
      description:
        'Luna the brave space cat was separated from her family during a meteor shower. Alone in the vast darkness of space, she must navigate through mysterious cosmic rings to find her way home. Will you help Luna reunite with her family?',
    },
    visuals: {
      backgroundGradient: ['#0f0a2e', '#1a0f4d'],
      backgroundShift: ['#1a0f4d', '#2d1b69'],
      ringColor: '#8b5cf6',
      ringGlowColor: '#c084fc',
      ringAccentColor: '#e9d5ff',
      particleColor: '#ffffff',
      trailColor: '#c084fc',
      starDensity: 50,
      starColors: ['#ffffff', '#e0e7ff', '#c7d2fe'],
      nebulaColor: '#6d28d9',
      nebulaOpacity: 0.3,
      specialEffect: 'none',
    },
  },
  {
    id: 2,
    name: 'Nebula Dreams',
    unlockScore: 10,
    story: {
      title: '💫 Chapter 2: The Pink Nebula',
      description:
        "Luna's whiskers tingle with hope! She senses her family's presence in the shimmering pink nebula clouds ahead. The cosmic rings glow brighter here, as if guiding her path. Her mother once told her stories of this magical place. Keep flying, Luna!",
    },
    visuals: {
      backgroundGradient: ['#701a75', '#ec4899'],
      backgroundShift: ['#86198f', '#f472b6'],
      ringColor: '#f0abfc',
      ringGlowColor: '#fae8ff',
      ringAccentColor: '#22d3ee',
      particleColor: '#22d3ee',
      trailColor: '#f0abfc',
      starDensity: 70,
      starColors: ['#fae8ff', '#fbcfe8', '#a5f3fc'],
      nebulaColor: '#ec4899',
      nebulaOpacity: 0.5,
      planetImage: 'pink-planet',
      specialEffect: 'aurora',
    },
  },
  {
    id: 3,
    name: 'Asteroid Belt',
    unlockScore: 20,
    story: {
      title: '☄️ Chapter 3: Memories in the Rocks',
      description:
        "The asteroid belt! Luna's heart races with memories - she used to play hide-and-seek here with her siblings among the floating rocks. Each golden ring reminds her of their laughter. The path is dangerous, but she's getting closer to home!",
    },
    visuals: {
      backgroundGradient: ['#1c1917', '#44403c'],
      backgroundShift: ['#292524', '#57534e'],
      ringColor: '#fbbf24',
      ringGlowColor: '#fde047',
      ringAccentColor: '#fb923c',
      particleColor: '#fde047',
      trailColor: '#fef3c7',
      starDensity: 30,
      starColors: ['#fef3c7', '#fde68a', '#ffffff'],
      nebulaColor: '#78716c',
      nebulaOpacity: 0.2,
      planetImage: 'rocky-planet',
      specialEffect: 'none',
    },
  },
  {
    id: 4,
    name: 'Starlight Path',
    unlockScore: 30,
    story: {
      title: '⭐ Chapter 4: Mother\'s Guidance',
      description: 'Luna remembers! Her mother taught her to follow the golden starlight path when lost. The stars shine brighter than ever, forming a glowing trail through the cosmos. She can almost hear her mother\'s purr. Home is near, Luna can feel it!',
    },
    visuals: {
      backgroundGradient: ['#1e3a8a', '#f59e0b'],
      backgroundShift: ['#1e40af', '#fbbf24'],
      ringColor: '#fde047',
      ringGlowColor: '#fef3c7',
      ringAccentColor: '#ffffff',
      particleColor: '#ffffff',
      trailColor: '#fef3c7',
      starDensity: 100,
      starColors: ['#fef3c7', '#fde047', '#ffffff'],
      nebulaColor: '#3b82f6',
      nebulaOpacity: 0.3,
      specialEffect: 'lightRays',
    },
  },
  {
    id: 5,
    name: "Galaxy's Edge",
    unlockScore: 40,
    story: {
      title: '🌠 Chapter 5: Voices in the Void',
      description: "At the galaxy's edge, where reality bends and stars dance, Luna hears them! Familiar meows echo through the cosmic void. Her family is calling! The cyan rings pulse with energy, creating a bridge between worlds. Just a little further, brave Luna!",
    },
    visuals: {
      backgroundGradient: ['#581c87', '#0891b2'],
      backgroundShift: ['#6b21a8', '#06b6d4'],
      ringColor: '#22d3ee',
      ringGlowColor: '#67e8f9',
      ringAccentColor: '#c084fc',
      particleColor: '#c084fc',
      trailColor: '#a5f3fc',
      starDensity: 80,
      starColors: ['#e0e7ff', '#a5f3fc', '#ddd6fe'],
      nebulaColor: '#7c3aed',
      nebulaOpacity: 0.4,
      planetImage: 'purple-planet',
      specialEffect: 'energyField',
    },
  },
  {
    id: 6,
    name: 'Home Sweet Home',
    unlockScore: 50,
    story: {
      title: '🏠 Chapter 6: Together Again',
      description:
        'Luna made it! Tears of joy stream down her furry cheeks as she reunites with her family. They purr and nuzzle, sharing stories of their adventures. But this isn\'t the end - it\'s a new beginning! Together, they\'ll explore the cosmos as a family. The adventure continues!',
    },
    visuals: {
      backgroundGradient: ['#dc2626', '#f59e0b'],
      backgroundShift: ['#ea580c', '#fbbf24'],
      ringColor: '#fb923c',
      ringGlowColor: '#fdba74',
      ringAccentColor: '#fef3c7',
      particleColor: '#fef3c7',
      trailColor: '#fed7aa',
      starDensity: 60,
      starColors: ['#fef3c7', '#fde68a', '#fecaca'],
      nebulaColor: '#f97316',
      nebulaOpacity: 0.35,
      planetImage: 'home-planet',
      specialEffect: 'lightRays',
    },
  },
];

export const COMMUNITY_MILESTONES = [
  {
    id: '1000rings',
    threshold: 1000,
    title: 'First Thousand! 🎉',
    description: 'The community has passed 1,000 cosmic rings together!',
    achieved: false,
  },
  {
    id: '10000rings',
    threshold: 10000,
    title: 'Ten Thousand Strong! 🚀',
    description: 'Amazing! 10,000 rings passed by our space explorers!',
    achieved: false,
  },
  {
    id: '50000rings',
    threshold: 50000,
    title: 'Cosmic Legends! ✨',
    description: '50,000 rings! Luna is proud of this amazing community!',
    achieved: false,
  },
  {
    id: '100players',
    threshold: 100,
    title: 'Growing Fleet! 👥',
    description: "100 brave pilots have joined Luna's adventure!",
    achieved: false,
  },
  {
    id: '1000players',
    threshold: 1000,
    title: 'Massive Community! 🌟',
    description: '1,000 players helping Luna find her way home!',
    achieved: false,
  },
  {
    id: '5000players',
    threshold: 5000,
    title: 'Galactic Family! 🌌',
    description: '5,000 space explorers united in this cosmic journey!',
    achieved: false,
  },
];
