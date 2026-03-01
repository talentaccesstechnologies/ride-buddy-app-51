import React from 'react';
import { Package, ChevronUp, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { APP_CONFIG } from '@/config/app.config';

interface DriverDashboardSheetProps {
  isOnline: boolean;
  isColisMode: boolean;
  missionsCount: number;
  todayEarnings: number;
  dailyGoal: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onViewMissions: () => void;
}

const DriverDashboardSheet: React.FC<DriverDashboardSheetProps> = ({
  isOnline,
  isColisMode,
  missionsCount,
  todayEarnings,
  dailyGoal,
  expanded,
  onToggleExpand,
  onViewMissions,
}) => {
  const progressPercent = Math.min((todayEarnings / dailyGoal) * 100, 100);

  return (
    <div
      className={`absolute bottom-16 left-0 right-0 z-20 transition-all duration-300 ease-out ${
        expanded ? 'h-[280px]' : 'h-[140px]'
      }`}
    >
      <div className="h-full bg-card/95 backdrop-blur-xl border-t border-border rounded-t-3xl shadow-2xl flex flex-col">
        {/* Drag handle */}
        <button
          onClick={onToggleExpand}
          className="flex items-center justify-center pt-3 pb-1"
        >
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </button>

        <div className="flex-1 px-5 pb-4 overflow-hidden">
          {/* Status line */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--caby-green))] animate-pulse" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-muted-foreground" />
              )}
              <span className="text-sm font-semibold text-foreground">
                {!isOnline
                  ? 'Hors ligne'
                  : missionsCount > 0
                  ? `${missionsCount} mission${missionsCount > 1 ? 's' : ''} disponible${missionsCount > 1 ? 's' : ''}`
                  : 'En attente de courses…'}
              </span>
            </div>
            <ChevronUp
              className={`w-4 h-4 text-muted-foreground transition-transform ${
                expanded ? 'rotate-180' : ''
              }`}
            />
          </div>

          {/* Earnings row */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
                Gains du jour
              </p>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {todayEarnings.toFixed(0)}{' '}
                <span className="text-sm font-medium text-muted-foreground">{APP_CONFIG.DEFAULT_CURRENCY}</span>
              </p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-primary">
              <TrendingUp className="w-3 h-3" />
              <span>Obj. {dailyGoal} {APP_CONFIG.DEFAULT_CURRENCY}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <Progress value={progressPercent} className="h-2 bg-border" />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">
              {progressPercent.toFixed(0)}%
            </p>
          </div>

          {/* Expanded content */}
          {expanded && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {isColisMode && (
                <button
                  onClick={onViewMissions}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm active:scale-[0.98] transition-transform"
                >
                  <Package className="w-4 h-4" />
                  Voir les missions disponibles
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboardSheet;
