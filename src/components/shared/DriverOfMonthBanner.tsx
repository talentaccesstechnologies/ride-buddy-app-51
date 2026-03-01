import React from 'react';
import { Trophy, Star, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DriverOfMonthBannerProps {
  driverName: string;
  driverAvatar?: string;
  city: string;
  month: string;
}

const DriverOfMonthBanner: React.FC<DriverOfMonthBannerProps> = ({
  driverName, driverAvatar, city, month
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[hsl(var(--caby-gold))]/10 via-[hsl(var(--caby-gold))]/5 to-transparent border border-[hsl(var(--caby-gold))]/20 p-4">
      <div className="absolute top-1 right-2 opacity-10">
        <Crown className="w-16 h-16 text-[hsl(var(--caby-gold))]" />
      </div>
      <div className="flex items-center gap-3 relative z-10">
        <div className="relative">
          <Avatar className="w-12 h-12 border-2 border-[hsl(var(--caby-gold))]/40">
            <AvatarImage src={driverAvatar} />
            <AvatarFallback className="bg-[hsl(var(--caby-gold))]/20 text-sm font-bold">
              {driverName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[hsl(var(--caby-gold))] flex items-center justify-center">
            <Trophy className="w-3 h-3 text-black" />
          </div>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            Driver du Mois · {month}
          </p>
          <p className="text-sm font-bold text-foreground">{driverName}</p>
          <p className="text-[11px] text-muted-foreground">{city}</p>
        </div>
      </div>
    </div>
  );
};

export default DriverOfMonthBanner;
