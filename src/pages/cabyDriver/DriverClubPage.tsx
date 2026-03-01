import React, { useState } from 'react';
import { Shield, Clock, Trophy, TrendingUp, Sparkles, DollarSign, Calendar } from 'lucide-react';
import DriverBottomNav from '@/components/cabyDriver/DriverBottomNav';
import DriverPrivateClients from '@/components/cabyDriver/DriverPrivateClients';
import SuperDriverBadgeCard from '@/components/cabyDriver/SuperDriverBadgeCard';
import ScoreBreakdown from '@/components/cabyDriver/ScoreBreakdown';
import LevelHistory from '@/components/cabyDriver/LevelHistory';
import MonthlyLeaderboard, { type LeaderboardEntry } from '@/components/cabyDriver/MonthlyLeaderboard';
import { type DriverLevel } from '@/lib/driverLevels';

// ── Mock data ──
const MOCK_DRIVER = {
  level: 'super' as DriverLevel,
  rating: 4.87,
  acceptance: 92,
  cancellation: 0.5,
  punctuality: 96,
  totalRides: 127,
  quarter: '2026-Q1',
};

const MOCK_HISTORY = [
  { quarter: '2026-Q1', level: 'super' as DriverLevel, rating: 4.87, acceptance: 92, cancellation: 0.5, rides: 127 },
  { quarter: '2025-Q4', level: 'certified' as DriverLevel, rating: 4.65, acceptance: 85, cancellation: 1.2, rides: 98 },
  { quarter: '2025-Q3', level: 'certified' as DriverLevel, rating: 4.52, acceptance: 82, cancellation: 1.8, rides: 74 },
];

const AVATAR_COLORS = [
  '#C9A84C', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
  '#EF4444', '#06B6D4', '#EC4899', '#84CC16', '#F97316',
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, driverName: 'Moussa Diallo', initials: 'MD', avatarColor: AVATAR_COLORS[0], driverAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face', driverCity: 'Genève', score: 94, rating: 4.97, rides: 185, isWinner: true },
  { rank: 2, driverName: 'Alexandre Koné', initials: 'AK', avatarColor: AVATAR_COLORS[1], driverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', driverCity: 'Carouge', score: 91, rating: 4.93, rides: 172 },
  { rank: 3, driverName: 'Youssef Benali', initials: 'YB', avatarColor: AVATAR_COLORS[2], driverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', driverCity: 'Vernier', score: 88, rating: 4.90, rides: 158 },
  { rank: 4, driverName: 'Jean-Paul Müller', initials: 'JM', avatarColor: AVATAR_COLORS[3], driverAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', driverCity: 'Lancy', score: 85, rating: 4.87, rides: 127, isCurrentUser: true },
  { rank: 5, driverName: 'Pierre Lugrin', initials: 'PL', avatarColor: AVATAR_COLORS[4], driverAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face', driverCity: 'Meyrin', score: 82, rating: 4.85, rides: 145 },
  { rank: 6, driverName: 'David Rouiller', initials: 'DR', avatarColor: AVATAR_COLORS[5], driverAvatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face', driverCity: 'Onex', score: 80, rating: 4.82, rides: 130 },
  { rank: 7, driverName: 'Samuel Tettamanti', initials: 'ST', avatarColor: AVATAR_COLORS[6], driverAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face', driverCity: 'Thônex', score: 78, rating: 4.80, rides: 118 },
  { rank: 8, driverName: 'Marc Auberson', initials: 'MA', avatarColor: AVATAR_COLORS[7], driverAvatar: 'https://images.unsplash.com/photo-1480455624313-e29b44bbafae?w=150&h=150&fit=crop&crop=face', driverCity: 'Chêne-Bourg', score: 75, rating: 4.78, rides: 110 },
  { rank: 9, driverName: 'Nicolas Favre', initials: 'NF', avatarColor: AVATAR_COLORS[8], driverAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face', driverCity: 'Plan-les-Ouates', score: 72, rating: 4.75, rides: 105 },
  { rank: 10, driverName: 'Karim Sadki', initials: 'KS', avatarColor: AVATAR_COLORS[9], driverAvatar: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=150&h=150&fit=crop&crop=face', driverCity: 'Bernex', score: 70, rating: 4.72, rides: 95 },
];

const currentMonthFr = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date());

const getNextEvaluation = () => {
  const now = new Date();
  const nextQuarter = new Date(now.getFullYear(), Math.ceil((now.getMonth() + 1) / 3) * 3, 1);
  const diffDays = Math.ceil((nextQuarter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const formatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  return { date: formatter.format(nextQuarter), days: diffDays };
};

const PODIUM_BONUSES: Record<number, string> = { 1: "1'000", 2: '500', 3: '300' };

type Tab = 'dashboard' | 'leaderboard' | 'clients';

const DriverClubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const nextEval = getNextEvaluation();

  const tabs: { key: Tab; label: string }[] = [
    { key: 'dashboard', label: 'SuperDriver' },
    { key: 'leaderboard', label: 'Classement' },
    { key: 'clients', label: 'Clients' },
  ];

  const currentRank = MOCK_LEADERBOARD.find(e => e.isCurrentUser)?.rank || 0;
  const pointsToFirst = currentRank > 1
    ? MOCK_LEADERBOARD[0].score - (MOCK_LEADERBOARD.find(e => e.isCurrentUser)?.score || 0)
    : 0;
  const currentPrize = PODIUM_BONUSES[currentRank] || null;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-2">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Programme</p>
        <h1 className="text-2xl font-display font-bold text-foreground mt-1">Club & SuperDriver</h1>
      </div>

      {/* Tab switcher */}
      <div className="px-5 mt-3 mb-4">
        <div className="flex gap-1 p-1 bg-muted rounded-2xl">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === tab.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ DASHBOARD TAB ═══ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Badge Card */}
          <div className="px-5">
            <SuperDriverBadgeCard
              level={MOCK_DRIVER.level}
              rating={MOCK_DRIVER.rating}
              acceptance={MOCK_DRIVER.acceptance}
              cancellation={MOCK_DRIVER.cancellation}
              quarter={MOCK_DRIVER.quarter}
            />
          </div>

          {/* Evaluation countdown */}
          <div className="px-5">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--caby-blue))]/15 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[hsl(var(--caby-blue))]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Prochaine évaluation</p>
                <p className="text-sm font-bold text-foreground">{nextEval.date}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-[hsl(var(--caby-blue))]">{nextEval.days}j</p>
                <p className="text-[10px] text-muted-foreground">restants</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Performances analysées sur les 12 derniers mois glissants
            </p>
          </div>

          {/* Positive messaging */}
          <div className="px-5">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/15">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-foreground">Votre bilan trimestriel</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vos points forts : note clients excellente et fiabilité. Continuez à améliorer votre taux d'acceptation pour atteindre SuperDriver Gold !
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="px-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-primary" />
              <h3 className="text-sm font-display font-bold text-foreground">Score Détaillé</h3>
            </div>
            <ScoreBreakdown
              level={MOCK_DRIVER.level}
              rating={MOCK_DRIVER.rating}
              acceptance={MOCK_DRIVER.acceptance}
              cancellation={MOCK_DRIVER.cancellation}
              punctuality={MOCK_DRIVER.punctuality}
            />
          </div>

          {/* Driver of Month estimation */}
          <div className="px-5">
            <div className="p-4 rounded-2xl bg-[hsl(var(--caby-gold))]/5 border border-[hsl(var(--caby-gold))]/15">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--caby-gold))]/15 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[hsl(var(--caby-gold))]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Estimation Driver du Mois</p>
                  <p className="text-sm font-bold text-foreground">
                    {currentRank === 1 ? '🏆 Vous êtes en tête !' : `#${currentRank} — ${pointsToFirst} pts du 1er`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[hsl(var(--caby-gold))]">
                    {currentPrize ? `+${currentPrize}` : '—'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">CHF bonus</p>
                </div>
              </div>
              {/* Podium prizes reminder */}
              <div className="flex gap-2 pt-2 border-t border-[hsl(var(--caby-gold))]/10">
                {[
                  { emoji: '🥇', amount: "1'000 CHF" },
                  { emoji: '🥈', amount: '500 CHF' },
                  { emoji: '🥉', amount: '300 CHF' },
                ].map((p) => (
                  <div key={p.emoji} className="flex-1 text-center">
                    <span className="text-sm">{p.emoji}</span>
                    <p className="text-[10px] font-bold text-muted-foreground">{p.amount}</p>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-muted-foreground text-center mt-2">
                Versé automatiquement sur votre prochain paiement
              </p>
            </div>
          </div>

          {/* Quarterly History */}
          <div className="px-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-muted-foreground/30" />
              <h3 className="text-sm font-display font-bold text-foreground">Historique des Niveaux</h3>
            </div>
            <LevelHistory history={MOCK_HISTORY} />
          </div>
        </div>
      )}

      {/* ═══ LEADERBOARD TAB ═══ */}
      {activeTab === 'leaderboard' && (
        <div className="px-5">
          <MonthlyLeaderboard
            entries={MOCK_LEADERBOARD}
            currentMonth={currentMonthFr}
            driverOfMonthName="Moussa D."
          />
        </div>
      )}

      {/* ═══ CLIENTS TAB ═══ */}
      {activeTab === 'clients' && (
        <div className="px-5">
          <DriverPrivateClients />
        </div>
      )}

      {/* Footer */}
      <div className="px-5 mt-8 mb-4">
        <div className="flex items-center justify-center gap-4 opacity-30">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Caby LSE Certified</span>
          </div>
          <span className="text-[8px] font-mono text-muted-foreground">ENCRYPTED_STREAM_V2_ACTIVE</span>
        </div>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default DriverClubPage;
