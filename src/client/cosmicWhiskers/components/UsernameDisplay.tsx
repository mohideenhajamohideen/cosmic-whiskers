import React from 'react';

interface UsernameDisplayProps {
  username: string | null;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

export const UsernameDisplay: React.FC<UsernameDisplayProps> = ({
  username,
  position = 'top-right',
  className = '',
}) => {
  const displayName = username ? `u/${username}` : 'Guest Player';

  const positionClasses = {
    'top-left': 'top-3 left-3 md:top-4 md:left-4',
    'top-right': 'top-3 right-3 md:top-4 md:right-4',
    'bottom-left': 'bottom-3 left-3 md:bottom-4 md:left-4',
    'bottom-right': 'bottom-3 right-3 md:bottom-4 md:right-4',
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} z-20 bg-black/60 backdrop-blur-sm px-2 py-1 md:px-4 md:py-2 rounded-lg ${className}`}
    >
      <div className="flex items-center gap-1 md:gap-2">
        <span className="text-base md:text-2xl">👤</span>
        <span className="text-white font-semibold text-xs md:text-base truncate max-w-[120px] md:max-w-none">
          {displayName}
        </span>
      </div>
    </div>
  );
};
