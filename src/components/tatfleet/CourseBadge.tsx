import React from 'react';
import { UserCheck, ArrowRightLeft, Zap, Package, RefreshCw } from 'lucide-react';
import { CourseType } from '@/types/radar.types';

interface CourseBadgeProps {
  type: CourseType;
}

const badgeConfig: Record<CourseType, { label: string; icon: typeof UserCheck; className: string }> = {
  private_client: {
    label: 'PRIVÉ',
    icon: UserCheck,
    className: 'badge-private-client',
  },
  network_dispatch: {
    label: 'CLUB PRIVÉ',
    icon: ArrowRightLeft,
    className: 'badge-network-dispatch',
  },
  caby_direct: {
    label: 'CABY RIDE',
    icon: Zap,
    className: 'badge-caby-direct',
  },
  livraison: {
    label: 'LIVRAISON',
    icon: Package,
    className: 'badge-livraison',
  },
  uber_sync: {
    label: 'UBER-SYNCHRO',
    icon: RefreshCw,
    className: 'badge-uber-sync',
  },
};

const CourseBadge: React.FC<CourseBadgeProps> = ({ type }) => {
  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`
        absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full
        text-[10px] font-bold uppercase tracking-wide
        ${config.className}
      `}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </div>
  );
};

export default CourseBadge;
