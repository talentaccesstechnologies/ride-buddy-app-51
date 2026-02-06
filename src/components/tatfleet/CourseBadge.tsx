import React from 'react';
import { UserCheck, ArrowRightLeft, Zap } from 'lucide-react';
import { CourseType } from '@/types/radar.types';

interface CourseBadgeProps {
  type: CourseType;
}

const badgeConfig = {
  private_client: {
    label: 'Mon Client Privé',
    icon: UserCheck,
    className: 'badge-private-client',
  },
  network_dispatch: {
    label: 'Club Privé',
    icon: ArrowRightLeft,
    className: 'badge-network-dispatch',
  },
  caby_direct: {
    label: 'Caby Direct',
    icon: Zap,
    className: 'badge-caby-direct',
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
