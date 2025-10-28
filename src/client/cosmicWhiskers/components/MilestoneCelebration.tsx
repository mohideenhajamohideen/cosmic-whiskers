import React, { useEffect, useRef, useState } from 'react';
import type { CommunityMilestone } from '../../../shared/types/cosmicWhiskers';

interface MilestoneCelebrationProps {
  milestone: CommunityMilestone;
  onComplete: () => void;
}

interface Confetti {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'triangle';
}

const CONFETTI_SHAPES: Array<'circle' | 'square' | 'triangle'> = ['circle', 'square', 'triangle'];

export const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({
  milestone,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const confettiRef = useRef<Confetti[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(Date.now());
  const durationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Initialize confetti
    const colors = ['#FF6B9D', '#C44569', '#FFA07A', '#FFD700', '#00CED1', '#9370DB', '#FF69B4'];
    const confettiCount = 150;

    for (let i = 0; i < confettiCount; i++) {
      confettiRef.current.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 200,
        vy: Math.random() * 300 + 200,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 5,
        color: colors[Math.floor(Math.random() * colors.length)] || '#FF6B9D',
        size: Math.random() * 8 + 4,
        shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)] || 'circle',
      });
    }

    // Animation loop
    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      durationRef.current += deltaTime;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and render confetti
      confettiRef.current.forEach((confetti) => {
        // Update position
        confetti.x += confetti.vx * deltaTime;
        confetti.y += confetti.vy * deltaTime;
        confetti.rotation += confetti.rotationSpeed * deltaTime;

        // Apply gravity
        confetti.vy += 500 * deltaTime;

        // Apply air resistance
        confetti.vx *= 0.99;

        // Render confetti
        ctx.save();
        ctx.translate(confetti.x, confetti.y);
        ctx.rotate(confetti.rotation);
        ctx.fillStyle = confetti.color;

        if (confetti.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, confetti.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (confetti.shape === 'square') {
          ctx.fillRect(-confetti.size / 2, -confetti.size / 2, confetti.size, confetti.size);
        } else if (confetti.shape === 'triangle') {
          ctx.beginPath();
          ctx.moveTo(0, -confetti.size / 2);
          ctx.lineTo(confetti.size / 2, confetti.size / 2);
          ctx.lineTo(-confetti.size / 2, confetti.size / 2);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });

      // Continue animation for 5 seconds
      if (durationRef.current < 5) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsVisible(false);
        setTimeout(() => onComplete(), 500);
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Confetti Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Milestone Notification */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-md rounded-2xl p-8 md:p-12 border-4 border-yellow-400 shadow-2xl max-w-md md:max-w-lg mx-4 animate-bounce-in">
          {/* Celebration Icon */}
          <div className="text-center mb-4">
            <div className="text-7xl md:text-8xl animate-bounce inline-block">
              🎉
            </div>
          </div>

          {/* Milestone Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4 animate-pulse">
            {milestone.title}
          </h2>

          {/* Milestone Description */}
          <p className="text-lg md:text-xl text-white/90 text-center mb-6">
            {milestone.description}
          </p>

          {/* Achievement Badge */}
          <div className="flex items-center justify-center gap-3 bg-yellow-500/20 rounded-xl p-4 border-2 border-yellow-400/50">
            <span className="text-4xl">🏆</span>
            <div className="text-left">
              <div className="text-yellow-400 font-bold text-sm uppercase tracking-wide">
                Milestone Achieved
              </div>
              <div className="text-white text-lg font-semibold">
                {milestone.threshold.toLocaleString()} {milestone.id.includes('rings') ? 'Rings' : 'Players'}
              </div>
            </div>
          </div>

          {/* Sparkle Effects */}
          <div className="absolute -top-4 -left-4 text-4xl animate-spin-slow">✨</div>
          <div className="absolute -top-4 -right-4 text-4xl animate-spin-slow-reverse">✨</div>
          <div className="absolute -bottom-4 -left-4 text-4xl animate-spin-slow-reverse">⭐</div>
          <div className="absolute -bottom-4 -right-4 text-4xl animate-spin-slow">⭐</div>
        </div>
      </div>
    </div>
  );
};
