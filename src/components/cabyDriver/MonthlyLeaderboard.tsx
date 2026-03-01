import React, { useState } from 'react';
import { Trophy, Star, Medal, Crown, MapPin, DollarSign } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface LeaderboardEntry {
  rank: number;
  driverName: string;
  driverAvatar?: string;
  driverCity?: string;
  score: number;
  rating: number;
  rides: number;
  isCurrentUser?: boolean;
  isWinner?: boolean;
  initials?: string;
  avatarColor?: string;
}

interface MonthlyLeaderboardProps {
  entries: LeaderboardEntry[];
  currentMonth: string;
  driverOfMonthName?: string;
}

const PODIUM_PRIZES = [
  { rank: 1, amount: "1'000", emoji: '🥇', label: '1er' },
  { rank: 2, amount: '500', emoji: '🥈', label: '2ème' },
  { rank: 3, amount: '300', emoji: '🥉', label: '3ème' },
];

const MonthlyLeaderboard: React.FC<MonthlyLeaderboardProps> = ({
  entries, currentMonth, driverOfMonthName
}) => {
  const maxScore = entries[0]?.score || 100;
  const top3 = entries.filter(e => e.rank <= 3);
  const rest = entries.filter(e => e.rank > 3);

  return (
    <div className="space-y-4">
      {/* Podium prizes banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[hsl(var(--caby-gold))]/10 via-card to-card border border-[hsl(var(--caby-gold))]/20">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-[hsl(var(--caby-gold))]" />
          <h3 className="text-sm font-display font-bold text-foreground">Podium du Mois · {currentMonth}</h3>
        </div>
        <div className="flex gap-2">
          {PODIUM_PRIZES.map((p) => (
            <div key={p.rank} className={`flex-1 text-center p-2.5 rounded-xl ${
              p.rank === 1
                ? 'bg-[hsl(var(--caby-gold))]/15 border border-[hsl(var(--caby-gold))]/30'
                : 'bg-muted/50 border border-border'
            }`}>
              <span className="text-lg">{p.emoji}</span>
              <p className={`text-sm font-black mt-1 ${
                p.rank === 1 ? 'text-[hsl(var(--caby-gold))]' : 'text-foreground'
              }`}>
                +{p.amount}
              </p>
              <p className="text-[9px] text-muted-foreground">CHF</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2.5">
          Versé automatiquement sur votre prochain paiement
        </p>
      </div>

      {/* Top 3 Podium */}
      <div className="space-y-2">
        {top3.map((entry) => {
          const prize = PODIUM_PRIZES.find(p => p.rank === entry.rank);
          const barWidth = (entry.score / maxScore) * 100;

          return (
            <div key={entry.rank} className={`relative p-4 rounded-2xl border overflow-hidden ${
              entry.rank === 1
                ? 'bg-gradient-to-r from-[hsl(var(--caby-gold))]/10 to-transparent border-[hsl(var(--caby-gold))]/30'
                : entry.rank === 2
                  ? 'bg-card border-border'
                  : 'bg-card border-border'
            } ${entry.isCurrentUser ? 'ring-2 ring-primary/30' : ''}`}>
              <div className="flex items-center gap-3">
                {/* Rank badge */}
                <div className="relative flex-shrink-0">
                  <Avatar className={`${entry.rank === 1 ? 'w-14 h-14' : 'w-12 h-12'} border-2 ${
                    entry.rank === 1 ? 'border-[hsl(var(--caby-gold))]' : 'border-border'
                  }`}>
                    <AvatarImage src={entry.driverAvatar} />
                    <AvatarFallback
                      className="font-bold text-white"
                      style={{ backgroundColor: entry.avatarColor || 'hsl(var(--muted))' }}
                    >
                      {entry.initials || entry.driverName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {/* Crown / Medal overlay */}
                  <div className={`absolute -top-2 -right-1 text-base ${
                    entry.rank === 1 ? 'text-lg' : ''
                  }`}>
                    {entry.rank === 1 ? '👑' : entry.rank === 2 ? '🥈' : '🥉'}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">
                      {entry.driverName}
                      {entry.isCurrentUser && <span className="text-[10px] text-primary ml-1">(vous)</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {entry.driverCity && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        {entry.driverCity}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-[hsl(var(--caby-gold))] text-[hsl(var(--caby-gold))]" />
                      {entry.rating.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{entry.rides} courses</span>
                  </div>

                  {/* Score bar */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          entry.rank === 1
                            ? 'bg-[hsl(var(--caby-gold))]'
                            : entry.rank === 2
                              ? 'bg-muted-foreground/60'
                              : 'bg-orange-400/70'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className={`text-xs font-black min-w-[2rem] text-right ${
                      entry.rank === 1 ? 'text-[hsl(var(--caby-gold))]' : 'text-foreground'
                    }`}>
                      {entry.score}
                    </span>
                  </div>
                </div>

                {/* Prize */}
                {prize && (
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-black ${
                      entry.rank === 1 ? 'text-[hsl(var(--caby-gold))]' : 'text-[hsl(var(--caby-green))]'
                    }`}>
                      +{prize.amount}
                    </p>
                    <p className="text-[9px] text-muted-foreground">CHF</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ranks 4-10 */}
      <div className="space-y-1.5">
        {rest.map((entry) => {
          const barWidth = (entry.score / maxScore) * 100;

          return (
            <div key={entry.rank} className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
              entry.isCurrentUser
                ? 'bg-primary/10 border border-primary/20'
                : 'bg-card border border-border'
            }`}>
              {/* Rank number */}
              <div className="w-7 text-center">
                <span className="text-xs font-bold text-muted-foreground">{entry.rank}</span>
              </div>

              {/* Avatar */}
              <Avatar className="w-9 h-9">
                <AvatarImage src={entry.driverAvatar} />
                <AvatarFallback
                  className="text-xs font-bold text-white"
                  style={{ backgroundColor: entry.avatarColor || 'hsl(var(--muted))' }}
                >
                  {entry.initials || entry.driverName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {entry.driverName}
                  {entry.isCurrentUser && <span className="text-[10px] text-primary ml-1">(vous)</span>}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {entry.driverCity && (
                    <span className="text-[10px] text-muted-foreground">{entry.driverCity}</span>
                  )}
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-[hsl(var(--caby-gold))] text-[hsl(var(--caby-gold))]" />
                    {entry.rating.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{entry.rides} c.</span>
                </div>
                {/* Score bar */}
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/40 transition-all duration-1000 ease-out"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-black text-foreground min-w-[1.5rem] text-right">
                    {entry.score}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyLeaderboard;
