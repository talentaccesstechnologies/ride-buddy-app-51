import React from 'react';
import { APP_CONFIG } from '@/config/app.config';

interface RadarEmptyStateProps {
  stats: {
    todayRides: number;
    todayEarnings: number;
    onlineMinutes: number;
  };
}

const RadarEmptyState: React.FC<RadarEmptyStateProps> = ({ stats }) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  return (
    <div className="text-center py-8">
      <p className="text-lg font-semibold text-caby-muted mb-2">
        Aucune course pour le moment
      </p>
      <p className="text-sm text-caby-muted/70 mb-8">
        Restez en ligne, nous vous alerterons
      </p>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 px-4">
        <div className="bg-caby-card border border-caby-border rounded-2xl p-4">
          <p className="text-2xl font-bold text-white">{stats.todayRides}</p>
          <p className="text-[10px] text-caby-muted uppercase tracking-wide">Courses</p>
        </div>
        <div className="bg-caby-card border border-caby-border rounded-2xl p-4">
          <p className="text-2xl font-bold text-caby-gold">{stats.todayEarnings}</p>
          <p className="text-[10px] text-caby-muted uppercase tracking-wide">{APP_CONFIG.DEFAULT_CURRENCY}</p>
        </div>
        <div className="bg-caby-card border border-caby-border rounded-2xl p-4">
          <p className="text-2xl font-bold text-white">{formatTime(stats.onlineMinutes)}</p>
          <p className="text-[10px] text-caby-muted uppercase tracking-wide">En ligne</p>
        </div>
      </div>
    </div>
  );
};

export default RadarEmptyState;
