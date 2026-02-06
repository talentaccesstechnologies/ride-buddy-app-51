import React from 'react';
import { Switch } from '@/components/ui/switch';

interface RadarToggleProps {
  isOnline: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}

const RadarToggle: React.FC<RadarToggleProps> = ({ isOnline, onToggle, disabled = false }) => {
  return (
    <div className="flex justify-center my-6">
      <button
        onClick={() => !disabled && onToggle(!isOnline)}
        disabled={disabled}
        className={`
          relative flex items-center justify-center gap-3 px-8 py-4 rounded-full
          font-bold text-sm uppercase tracking-wider
          transition-all duration-300 transform
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
          ${isOnline
            ? 'bg-gradient-to-r from-caby-gold to-caby-gold-light text-black shadow-gold-glow'
            : 'bg-caby-card text-caby-muted border border-caby-border hover:border-caby-gold/50'
          }
        `}
      >
        <div
          className={`
            w-3 h-3 rounded-full transition-all duration-300
            ${isOnline ? 'bg-black' : 'bg-caby-muted'}
          `}
        />
        <span>{isOnline ? 'Radar Actif' : 'Activer le Radar'}</span>
      </button>
    </div>
  );
};

export default RadarToggle;
