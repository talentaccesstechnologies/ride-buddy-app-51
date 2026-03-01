import React from 'react';
import { Star, Trophy, TrendingUp, Crown, ChevronUp } from 'lucide-react';
import { LEVEL_CONFIGS, LEVEL_ORDER, getNextLevel, getProgressToNext, type DriverLevel } from '@/lib/driverLevels';

interface SuperDriverBadgeCardProps {
  level: DriverLevel;
  rating: number;
  acceptance: number;
  cancellation: number;
  quarter: string;
}

const SuperDriverBadgeCard: React.FC<SuperDriverBadgeCardProps> = ({
  level, rating, acceptance, cancellation, quarter
}) => {
  const config = LEVEL_CONFIGS[level];
  const nextLevel = getNextLevel(level);
  const progress = getProgressToNext(level, rating, acceptance, cancellation);
  const nextConfig = nextLevel ? LEVEL_CONFIGS[nextLevel] : null;

  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 ${
      level === 'super_gold'
        ? `bg-gradient-to-br ${config.gradient}`
        : 'bg-gradient-to-br from-card via-muted/50 to-card border border-border'
    }`}>
      {/* Shimmer for gold */}
      {level === 'super_gold' && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.2)_0%,transparent_60%)]" />
        </div>
      )}

      <div className="relative z-10 flex items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
          level === 'super_gold' ? 'bg-black/20 backdrop-blur-sm' : config.bgColor
        }`}>
          {level === 'super_gold' ? (
            <Crown className="w-8 h-8 text-white" />
          ) : level === 'super' ? (
            <Trophy className="w-8 h-8 text-[hsl(var(--caby-blue))]" />
          ) : (
            <Star className={`w-8 h-8 ${config.color}`} />
          )}
        </div>
        <div className="flex-1">
          <h2 className={`text-lg font-display font-bold ${
            level === 'super_gold' ? 'text-black' : 'text-foreground'
          }`}>
            {config.label}
          </h2>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: config.stars }).map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 fill-current ${
                level === 'super_gold' ? 'text-black/70' : config.color
              }`} />
            ))}
            {Array.from({ length: 5 - config.stars }).map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${
                level === 'super_gold' ? 'text-black/20' : 'text-muted-foreground/20'
              }`} />
            ))}
          </div>
          <p className={`text-[11px] mt-1 ${
            level === 'super_gold' ? 'text-black/60' : 'text-muted-foreground'
          }`}>
            Commission : {(config.commission * 100).toFixed(0)}% · {quarter}
          </p>
        </div>
      </div>

      {/* Progress to next level */}
      {nextConfig && (
        <div className="relative z-10 mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-semibold ${
              level === 'super_gold' ? 'text-black/70' : 'text-muted-foreground'
            }`}>
              Progression vers {nextConfig.label}
            </span>
            <span className={`text-xs font-black ${
              level === 'super_gold' ? 'text-black' : config.color
            }`}>
              {progress}%
            </span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${
            level === 'super_gold' ? 'bg-black/20' : 'bg-muted'
          }`}>
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                level === 'super_gold'
                  ? 'bg-black/40'
                  : nextConfig.bgColor.replace('/15', '')
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {level === 'super_gold' && (
        <div className="relative z-10 mt-3 text-center">
          <p className="text-[11px] font-semibold text-black/70">
            ✨ Niveau maximum atteint — Félicitations !
          </p>
        </div>
      )}
    </div>
  );
};

export default SuperDriverBadgeCard;
