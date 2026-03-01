import React from 'react';
import { LEVEL_CONFIGS, LEVEL_ORDER, type DriverLevel } from '@/lib/driverLevels';
import { Star, ChevronRight } from 'lucide-react';

interface LevelHistoryEntry {
  quarter: string;
  level: DriverLevel;
  rating: number;
  acceptance: number;
  cancellation: number;
  rides: number;
}

interface LevelHistoryProps {
  history: LevelHistoryEntry[];
}

const LevelHistory: React.FC<LevelHistoryProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Aucun historique disponible
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((entry, i) => {
        const config = LEVEL_CONFIGS[entry.level];
        return (
          <div key={entry.quarter} className={`flex items-center gap-3 p-3 rounded-2xl border ${
            i === 0 ? `${config.bgColor} ${config.borderColor}` : 'bg-card border-border'
          }`}>
            <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center`}>
              <div className="flex gap-0.5">
                {Array.from({ length: Math.min(config.stars, 3) }).map((_, j) => (
                  <Star key={j} className={`w-2.5 h-2.5 fill-current ${config.color}`} />
                ))}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{config.label}</p>
                {i === 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
                    Actuel
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">{entry.quarter} · {entry.rides} courses</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-black ${config.color}`}>{entry.rating.toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">note</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LevelHistory;
