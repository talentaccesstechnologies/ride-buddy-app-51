import React from 'react';
import { Trophy, Star, Medal, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { computeMonthlyScore } from '@/lib/driverLevels';

export interface LeaderboardEntry {
  rank: number;
  driverName: string;
  driverAvatar?: string;
  score: number;
  rating: number;
  rides: number;
  isCurrentUser?: boolean;
  isWinner?: boolean;
}

interface MonthlyLeaderboardProps {
  entries: LeaderboardEntry[];
  currentMonth: string;
  driverOfMonthName?: string;
}

const rankIcons = [Trophy, Medal, Medal];
const rankColors = [
  'text-[hsl(var(--caby-gold))]',
  'text-muted-foreground',
  'text-orange-400',
];

const MonthlyLeaderboard: React.FC<MonthlyLeaderboardProps> = ({
  entries, currentMonth, driverOfMonthName
}) => {
  return (
    <div className="space-y-3">
      {/* Winner highlight */}
      {driverOfMonthName && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[hsl(var(--caby-gold))]/15 to-[hsl(var(--caby-gold))]/5 border border-[hsl(var(--caby-gold))]/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--caby-gold))]/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-[hsl(var(--caby-gold))]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Driver du Mois · {currentMonth}</p>
              <p className="text-base font-display font-bold text-foreground">{driverOfMonthName} 🏆</p>
              <p className="text-[10px] text-[hsl(var(--caby-gold))]">+500 CHF · Commission 5% · Priorité dispatch</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-1.5">
        {entries.map((entry) => {
          const isTop3 = entry.rank <= 3;
          const RankIcon = isTop3 ? rankIcons[entry.rank - 1] : null;

          return (
            <div key={entry.rank} className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
              entry.isCurrentUser
                ? 'bg-primary/10 border border-primary/20'
                : entry.isWinner
                  ? 'bg-[hsl(var(--caby-gold))]/10 border border-[hsl(var(--caby-gold))]/20'
                  : 'bg-card border border-border'
            }`}>
              {/* Rank */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isTop3 ? 'bg-muted' : ''
              }`}>
                {RankIcon ? (
                  <RankIcon className={`w-4 h-4 ${rankColors[entry.rank - 1]}`} />
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">{entry.rank}</span>
                )}
              </div>

              {/* Avatar & name */}
              <Avatar className="w-9 h-9">
                <AvatarImage src={entry.driverAvatar} />
                <AvatarFallback className="text-xs font-bold bg-muted">
                  {entry.driverName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {entry.driverName}
                  {entry.isCurrentUser && <span className="text-[10px] text-primary ml-1">(vous)</span>}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-[hsl(var(--caby-gold))] text-[hsl(var(--caby-gold))]" />
                    {entry.rating.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{entry.rides} courses</span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className={`text-sm font-black ${
                  entry.rank === 1 ? 'text-[hsl(var(--caby-gold))]' : 'text-foreground'
                }`}>
                  {entry.score}
                </p>
                <p className="text-[9px] text-muted-foreground">pts</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyLeaderboard;
