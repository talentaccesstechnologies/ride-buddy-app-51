import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-5xl',
  xl: 'text-7xl',
};

const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false, className }) => {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <h1 className={cn('font-display font-extrabold tracking-tight', sizeClasses[size])}>
        <span className="text-caby-gold">C</span>
        <span className="text-white">ABY</span>
      </h1>
      {showTagline && (
        <p className="text-caby-muted text-xs mt-1 tracking-wider uppercase">
          by Talent Access Technologies
        </p>
      )}
    </div>
  );
};

export default Logo;
