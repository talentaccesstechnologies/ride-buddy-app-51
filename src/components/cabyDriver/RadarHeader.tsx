import React from 'react';
import { Radio, Shield, Bell, AlertTriangle } from 'lucide-react';
import { LegalStatus } from '@/types/radar.types';

interface RadarHeaderProps {
  isOnline: boolean;
  legalStatus: LegalStatus;
  unreadNotifications: number;
  onNotificationClick: () => void;
}

const RadarHeader: React.FC<RadarHeaderProps> = ({
  isOnline,
  legalStatus,
  unreadNotifications,
  onNotificationClick,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-caby-card border border-caby-border rounded-3xl mx-4 mt-4">
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            isOnline
              ? 'bg-caby-green pulse-glow-green'
              : 'bg-caby-red'
          }`}
        />
        <span className="text-[10px] font-black uppercase tracking-widest text-caby-text">
          {isOnline ? 'En ligne' : 'Hors ligne'}
        </span>
      </div>

      {/* Legal status */}
      <div className="flex items-center gap-2">
        {legalStatus === 'green' ? (
          <div className="badge-legal-green flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold">
            <Shield className="w-3 h-3" />
            <span>LSE ✓</span>
          </div>
        ) : (
          <div className="badge-legal-red flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold">
            <AlertTriangle className="w-3 h-3" />
            <span>DOCS EXPIRÉS</span>
          </div>
        )}
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-3">
        {/* Radio connection indicator */}
        <div className="relative">
          <Radio className={`w-5 h-5 ${isOnline ? 'text-caby-blue animate-pulse' : 'text-caby-muted'}`} />
        </div>

        {/* Notifications */}
        <button onClick={onNotificationClick} className="relative">
          <Bell className="w-5 h-5 text-caby-text" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-caby-red text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default RadarHeader;
