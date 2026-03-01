import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, Calendar, Wallet, Car, Package, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { APP_CONFIG } from '@/config/app.config';
import DriverBottomNav from '@/components/cabyDriver/DriverBottomNav';

/* ── Simulated data ── */
interface DayEarnings {
  label: string;
  courses: number;
  livraisons: number;
  club: number;
}

interface WeekData {
  id: string;
  label: string;
  days: DayEarnings[];
}

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const generateWeek = (startDate: string, baseLevel: number): WeekData => {
  const days: DayEarnings[] = DAY_LABELS.map((label, i) => {
    const isWeekend = i >= 5;
    const mult = isWeekend ? 1.4 + Math.random() * 0.4 : 0.7 + Math.random() * 0.6;
    const courses = Math.round(baseLevel * mult * (0.7 + Math.random() * 0.3));
    const livraisons = Math.round(courses * (0.1 + Math.random() * 0.15));
    const club = Math.round(courses * (0.03 + Math.random() * 0.05));
    return { label, courses, livraisons, club };
  });
  return { id: startDate, label: startDate, days };
};

const WEEKS: WeekData[] = [
  { ...generateWeek('23 févr. — 2 mars', 280), label: '23 févr. — 2 mars' },
  { ...generateWeek('16 — 22 févr.', 260), label: '16 — 22 févr.' },
  { ...generateWeek('9 — 15 févr.', 310), label: '9 — 15 févr.' },
  { ...generateWeek('2 — 8 févr.', 230), label: '2 — 8 févr.' },
  { ...generateWeek('27 janv. — 1 févr.', 290), label: '27 janv. — 1 févr.' },
  { ...generateWeek('20 — 26 janv.', 250), label: '20 — 26 janv.' },
  { ...generateWeek('13 — 19 janv.', 270), label: '13 — 19 janv.' },
  { ...generateWeek('6 — 12 janv.', 200), label: '6 — 12 janv.' },
];

const weekTotal = (w: WeekData) => w.days.reduce((s, d) => s + d.courses + d.livraisons + d.club, 0);
const weekCourses = (w: WeekData) => w.days.reduce((s, d) => s + d.courses, 0);
const weekLivraisons = (w: WeekData) => w.days.reduce((s, d) => s + d.livraisons, 0);
const weekClub = (w: WeekData) => w.days.reduce((s, d) => s + d.club, 0);
const dayTotal = (d: DayEarnings) => d.courses + d.livraisons + d.club;

const formatCHF = (v: number) => v.toLocaleString('fr-CH');

/* ── Bar chart component ── */
const WeekBarChart: React.FC<{ week: WeekData; compact?: boolean }> = ({ week, compact = false }) => {
  const maxDay = Math.max(...week.days.map(dayTotal), 1);
  const barHeight = compact ? 60 : 140;

  return (
    <div className="flex items-end justify-between gap-1.5" style={{ height: barHeight }}>
      {week.days.map((day, i) => {
        const total = dayTotal(day);
        const pct = total / maxDay;
        const h = Math.max(pct * barHeight, 4);
        const courseH = (day.courses / (total || 1)) * h;
        const livH = (day.livraisons / (total || 1)) * h;
        const clubH = (day.club / (total || 1)) * h;

        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="relative w-full flex flex-col items-center justify-end" style={{ height: barHeight }}>
              {/* Stacked bar */}
              <div className="w-full max-w-[28px] rounded-t-md overflow-hidden flex flex-col-reverse" style={{ height: h }}>
                <div className="bg-primary" style={{ height: courseH }} />
                <div className="bg-[hsl(var(--caby-blue))]" style={{ height: livH }} />
                <div className="bg-[hsl(var(--caby-green))]" style={{ height: clubH }} />
              </div>
            </div>
            {!compact && (
              <span className="text-[10px] font-semibold text-muted-foreground">{day.label}</span>
            )}
            {!compact && (
              <span className="text-[10px] font-bold text-foreground tabular-nums">{total}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ── Mini bar chart for past weeks ── */
const MiniBarChart: React.FC<{ week: WeekData }> = ({ week }) => {
  const maxDay = Math.max(...week.days.map(dayTotal), 1);
  return (
    <div className="flex items-end gap-[2px] h-6">
      {week.days.map((day, i) => {
        const h = Math.max((dayTotal(day) / maxDay) * 24, 2);
        return <div key={i} className="w-[3px] rounded-sm bg-primary/60" style={{ height: h }} />;
      })}
    </div>
  );
};

/* ── Main page ── */
const DriverEarningsPage: React.FC = () => {
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(0);
  const currentWeek = WEEKS[selectedWeekIdx];
  const total = weekTotal(currentWeek);

  // Monthly stats (sum first 4 weeks)
  const monthlyTotal = WEEKS.slice(0, 4).reduce((s, w) => s + weekTotal(w), 0);
  const prevMonthTotal = WEEKS.slice(4, 8).reduce((s, w) => s + weekTotal(w), 0);
  const monthlyPctChange = prevMonthTotal > 0 ? Math.round(((monthlyTotal - prevMonthTotal) / prevMonthTotal) * 100) : 0;
  const monthlyGoal = 6000;
  const monthlyPct = Math.min((monthlyTotal / monthlyGoal) * 100, 100);

  const prevWeek = () => setSelectedWeekIdx(i => Math.min(i + 1, WEEKS.length - 1));
  const nextWeek = () => setSelectedWeekIdx(i => Math.max(i - 1, 0));

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border px-5 pt-12 pb-5">
        <h1 className="text-xl font-bold text-foreground mb-4">Gains</h1>

        {/* Monthly objective */}
        <div className="bg-background rounded-2xl p-4 mb-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Objectif mars</span>
            </div>
            <div className="flex items-center gap-1.5">
              {monthlyPctChange >= 0 ? (
                <ArrowUp className="w-3.5 h-3.5 text-[hsl(var(--caby-green))]" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 text-destructive" />
              )}
              <span className={`text-xs font-bold ${monthlyPctChange >= 0 ? 'text-[hsl(var(--caby-green))]' : 'text-destructive'}`}>
                {monthlyPctChange >= 0 ? '+' : ''}{monthlyPctChange}% vs février
              </span>
            </div>
          </div>
          <div className="flex items-end justify-between mb-2">
            <p className="text-2xl font-black text-foreground tabular-nums">
              {formatCHF(monthlyTotal)} <span className="text-sm font-medium text-muted-foreground">/ {formatCHF(monthlyGoal)} CHF</span>
            </p>
          </div>
          <div className="w-full h-2 rounded-full bg-border overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
              initial={{ width: 0 }}
              animate={{ width: `${monthlyPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Next payout */}
        <div className="flex items-center gap-3 bg-[hsl(var(--caby-green))]/10 border border-[hsl(var(--caby-green))]/20 rounded-xl px-4 py-3">
          <Calendar className="w-4 h-4 text-[hsl(var(--caby-green))]" />
          <div>
            <p className="text-xs font-semibold text-[hsl(var(--caby-green))]">Prochain versement</p>
            <p className="text-sm font-bold text-foreground">Vendredi 7 mars — ~{formatCHF(Math.round(monthlyTotal * 0.25))} CHF</p>
          </div>
        </div>
      </div>

      {/* Week selector */}
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between mb-1">
          <button onClick={prevWeek} disabled={selectedWeekIdx >= WEEKS.length - 1} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center disabled:opacity-30">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-semibold">{currentWeek.label}</p>
          </div>
          <button onClick={nextWeek} disabled={selectedWeekIdx <= 0} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center disabled:opacity-30">
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Big total */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedWeekIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mb-5"
          >
            <p className="text-4xl font-black text-foreground tabular-nums">
              {formatCHF(total)} <span className="text-lg font-medium text-muted-foreground">CHF</span>
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Bar chart */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedWeekIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-card rounded-2xl border border-border p-4 mb-4"
          >
            <WeekBarChart week={currentWeek} />

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
                <span className="text-[10px] text-muted-foreground font-medium">Courses</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[hsl(var(--caby-blue))]" />
                <span className="text-[10px] text-muted-foreground font-medium">Livraisons</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[hsl(var(--caby-green))]" />
                <span className="text-[10px] text-muted-foreground font-medium">Club</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Breakdown */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedWeekIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-2xl border border-border p-4 mb-6 space-y-3"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Décomposition</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <Car className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Courses passagers</span>
              </div>
              <span className="text-sm font-bold text-foreground tabular-nums">{formatCHF(weekCourses(currentWeek))} CHF</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--caby-blue))]/15 flex items-center justify-center">
                  <Package className="w-4 h-4 text-[hsl(var(--caby-blue))]" />
                </div>
                <span className="text-sm font-medium text-foreground">Livraisons colis</span>
              </div>
              <span className="text-sm font-bold text-foreground tabular-nums">{formatCHF(weekLivraisons(currentWeek))} CHF</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--caby-green))]/15 flex items-center justify-center">
                  <Users className="w-4 h-4 text-[hsl(var(--caby-green))]" />
                </div>
                <span className="text-sm font-medium text-foreground">Commissions Club</span>
              </div>
              <span className="text-sm font-bold text-foreground tabular-nums">{formatCHF(weekClub(currentWeek))} CHF</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Past weeks */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Semaines précédentes</p>
        <div className="space-y-2 mb-8">
          {WEEKS.map((week, idx) => {
            if (idx === selectedWeekIdx) return null;
            const wTotal = weekTotal(week);
            return (
              <button
                key={week.label}
                onClick={() => setSelectedWeekIdx(idx)}
                className="w-full flex items-center gap-4 bg-card border border-border rounded-xl px-4 py-3 active:scale-[0.98] transition-transform text-left"
              >
                <MiniBarChart week={week} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{week.label}</p>
                  <p className="text-[10px] text-muted-foreground">
                    🚗 {formatCHF(weekCourses(week))} · 📦 {formatCHF(weekLivraisons(week))} · 🤝 {formatCHF(weekClub(week))}
                  </p>
                </div>
                <span className="text-sm font-bold text-foreground tabular-nums">{formatCHF(wTotal)} CHF</span>
              </button>
            );
          })}
        </div>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default DriverEarningsPage;
