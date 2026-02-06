import React from 'react';

interface RadarAnimationProps {
  isActive: boolean;
}

const RadarAnimation: React.FC<RadarAnimationProps> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Radar rings */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Outer rings */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute inset-0 border-2 border-caby-gold/30 rounded-full radar-ring"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
        
        {/* Center dot */}
        <div className="relative z-10 w-4 h-4 bg-caby-gold rounded-full shadow-gold-glow" />
        
        {/* Scanning dots */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={`dot-${i}`}
            className="absolute w-1.5 h-1.5 bg-caby-gold/60 rounded-full animate-pulse"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Text */}
      <p className="text-caby-muted text-sm mt-6 animate-pulse">
        Scan en cours...
      </p>
    </div>
  );
};

export default RadarAnimation;
