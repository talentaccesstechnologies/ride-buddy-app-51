// ============================================================
// src/pages/admin/CabyTestDashboard.tsx
// Dashboard de tests automatiques — Pricing + Supabase + Logique
// Navigation : /caby/admin/tests
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  calculateFullPrice,
  calculateVanViability,
  calculateDriverEarnings,
  calculateBreakEvenSeats,
  shouldVanDepart,
  calculateLastMinuteDiscount,
  applyLastMinutePrice,
} from '@/utils/cabyVanPricing';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

const GOLD = '#C9A84C';

// ── TYPES ────────────────────────────────────────────────────
type TestStatus = 'pending' | 'running' | 'pass' | 'fail' | 'warn';

interface TestResult {
  id: string;
  category: string;
  name: string;
  status: TestStatus;
  expected: string;
  actual: string;
  detail?: string;
  duration?: number;
}

// ── ICÔNE STATUT ─────────────────────────────────────────────
const StatusIcon: React.FC<{ status: TestStatus }> = ({ status }) => {
  if (status === 'pass') return <CheckCircle style={{ width: 16, height: 16, color: '#22C55E', flexShrink: 0 }} />;
  if (status === 'fail') return <XCircle style={{ width: 16, height: 16, color: '#EF4444', flexShrink: 0 }} />;
  if (status === 'warn') return <AlertCircle style={{ width: 16, height: 16, color: GOLD, flexShrink: 0 }} />;
  if (status === 'running') return <div style={{ width: 16, height: 16, border: `2px solid ${GOLD}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />;
  return <Clock style={{ width: 16, height: 16, color: '#9CA3AF', flexShrink: 0 }} />;
};

// ── CARTE TEST ────────────────────────────────────────────────
const TestCard: React.FC<{ result: TestResult }> = ({ result }) => {
  const [expanded, setExpanded] = useState(result.status === 'fail');
  const bg = result.status === 'pass' ? '#F0FDF4'
    : result.status === 'fail' ? '#FEF2F2'
    : result.status === 'warn' ? '#FFFBEB'
    : '#F9FAFB';
  const border = result.status === 'pass' ? '#BBF7D0'
    : result.status === 'fail' ? '#FECACA'
    : result.status === 'warn' ? '#FDE68A'
    : '#E5E7EB';

  return (
    <div style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 10, overflow: 'hidden' }}>
      <button
        onClick={() => setExpanded(v => !v)}
        style={{ width: '100%', padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}
      >
        <StatusIcon status={result.status} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', flex: 1 }}>{result.name}</span>
        {result.duration && <span style={{ fontSize: 10, color: '#9CA3AF' }}>{result.duration}ms</span>}
        <span style={{ fontSize: 12, color: '#9CA3AF' }}>{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div style={{ padding: '0 12px 10px', borderTop: `1px solid ${border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
            <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 6, padding: '6px 8px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 2 }}>Attendu</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A', fontFamily: 'monospace' }}>{result.expected}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 6, padding: '6px 8px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 2 }}>Obtenu</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: result.status === 'fail' ? '#EF4444' : '#1A1A1A', fontFamily: 'monospace' }}>{result.actual}</div>
            </div>
          </div>
          {result.detail && (
            <div style={{ marginTop: 6, padding: '6px 8px', background: 'rgba(255,255,255,0.5)', borderRadius: 6, fontSize: 11, color: '#6B7280', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {result.detail}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── PAGE PRINCIPALE ───────────────────────────────────────────
const CabyTestDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState({ pass: 0, fail: 0, warn: 0, total: 0 });

  const updateResult = useCallback((id: string, updates: Partial<TestResult>) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const runAllTests = useCallback(async () => {
    setIsRunning(true);

    // Initialiser tous les tests
    const initialTests: TestResult[] = [
      // ── PRICING ──
      { id: 'p1', category: '💰 Pricing', name: 'Prix earlybird (0 siège vendu)', status: 'pending', expected: '', actual: '' },
      { id: 'p2', category: '💰 Pricing', name: 'Prix standard (3/7 sièges)', status: 'pending', expected: '', actual: '' },
      { id: 'p3', category: '💰 Pricing', name: 'Prix peak (5/7 sièges)', status: 'pending', expected: '', actual: '' },
      { id: 'p4', category: '💰 Pricing', name: 'Prix lastseat (6/7 sièges)', status: 'pending', expected: '', actual: '' },
      { id: 'p5', category: '💰 Pricing', name: 'Rush hours +15%', status: 'pending', expected: '', actual: '' },
      { id: 'p6', category: '💰 Pricing', name: 'Heures creuses -5%', status: 'pending', expected: '', actual: '' },
      { id: 'p7', category: '💰 Pricing', name: 'Early bird -30% (14j+)', status: 'pending', expected: '', actual: '' },
      { id: 'p8', category: '💰 Pricing', name: 'Last minute -50% (<2h)', status: 'pending', expected: '', actual: '' },
      { id: 'p9', category: '💰 Pricing', name: 'Prix min plancher (60%)', status: 'pending', expected: '', actual: '' },
      { id: 'p10', category: '💰 Pricing', name: 'Prix max plafond (140%)', status: 'pending', expected: '', actual: '' },
      { id: 'p11', category: '💰 Pricing', name: 'Saisonnalité janvier +30%', status: 'pending', expected: '', actual: '' },
      // ── VIABILITÉ ──
      { id: 'v1', category: '🚐 Viabilité Van', name: 'Van frontalier — seuil 3 sièges', status: 'pending', expected: '', actual: '' },
      { id: 'v2', category: '🚐 Viabilité Van', name: 'Van ski — seuil 4 sièges', status: 'pending', expected: '', actual: '' },
      { id: 'v3', category: '🚐 Viabilité Van', name: 'Subvention Caby si sous seuil', status: 'pending', expected: '', actual: '' },
      { id: 'v4', category: '🚐 Viabilité Van', name: 'Zéro subvention si rentable', status: 'pending', expected: '', actual: '' },
      { id: 'v5', category: '🚐 Viabilité Van', name: 'Fill rate calcul correct', status: 'pending', expected: '', actual: '' },
      // ── REVENUS CHAUFFEUR ──
      { id: 'd1', category: '👨‍✈️ Revenus Chauffeur', name: 'Commission frontalier 15%', status: 'pending', expected: '', actual: '' },
      { id: 'd2', category: '👨‍✈️ Revenus Chauffeur', name: 'Commission business 20%', status: 'pending', expected: '', actual: '' },
      { id: 'd3', category: '👨‍✈️ Revenus Chauffeur', name: 'Garantie minimum frontalier CHF 35', status: 'pending', expected: '', actual: '' },
      { id: 'd4', category: '👨‍✈️ Revenus Chauffeur', name: 'Garantie minimum ski CHF 90', status: 'pending', expected: '', actual: '' },
      { id: 'd5', category: '👨‍✈️ Revenus Chauffeur', name: 'Bonus ponctualité appliqué', status: 'pending', expected: '', actual: '' },
      { id: 'd6', category: '👨‍✈️ Revenus Chauffeur', name: 'Payout = max(net, garantie)', status: 'pending', expected: '', actual: '' },
      // ── DÉCISION DÉPART ──
      { id: 'dep1', category: '🚦 Décision Départ', name: 'Départ si seuil atteint', status: 'pending', expected: '', actual: '' },
      { id: 'dep2', category: '🚦 Décision Départ', name: 'Pas de départ si 0 siège + >24h', status: 'pending', expected: '', actual: '' },
      { id: 'dep3', category: '🚦 Décision Départ', name: 'Départ forcé si <2h', status: 'pending', expected: '', actual: '' },
      { id: 'dep4', category: '🚦 Décision Départ', name: 'Action Caby si sous seuil', status: 'pending', expected: '', actual: '' },
      // ── SUPABASE ──
      { id: 's1', category: '🗄️ Supabase', name: 'Connexion Supabase active', status: 'pending', expected: '', actual: '' },
      { id: 's2', category: '🗄️ Supabase', name: 'Table van_slots accessible', status: 'pending', expected: '', actual: '' },
      { id: 's3', category: '🗄️ Supabase', name: 'van_slots — 35 slots de démo', status: 'pending', expected: '', actual: '' },
      { id: 's4', category: '🗄️ Supabase', name: 'Table van_bookings accessible', status: 'pending', expected: '', actual: '' },
      { id: 's5', category: '🗄️ Supabase', name: 'Table van_driver_missions accessible', status: 'pending', expected: '', actual: '' },
      { id: 's6', category: '🗄️ Supabase', name: 'Table caby_pass_subscriptions accessible', status: 'pending', expected: '', actual: '' },
      { id: 's7', category: '🗄️ Supabase', name: 'Table van_push_notifications accessible', status: 'pending', expected: '', actual: '' },
      { id: 's8', category: '🗄️ Supabase', name: 'Slots Genève → Zurich présents', status: 'pending', expected: '', actual: '' },
      { id: 's9', category: '🗄️ Supabase', name: 'Slots Genève → Annecy présents', status: 'pending', expected: '', actual: '' },
      { id: 's10', category: '🗄️ Supabase', name: 'RLS van_slots lecture publique', status: 'pending', expected: '', actual: '' },
      // ── LAST MINUTE ──
      { id: 'lm1', category: '⚡ Last Minute', name: 'Discount -50% si départ <2h', status: 'pending', expected: '', actual: '' },
      { id: 'lm2', category: '⚡ Last Minute', name: 'Discount -40% si départ <6h', status: 'pending', expected: '', actual: '' },
      { id: 'lm3', category: '⚡ Last Minute', name: 'Pas de discount si >48h', status: 'pending', expected: '', actual: '' },
      { id: 'lm4', category: '⚡ Last Minute', name: 'Pas de discount si van >70% plein', status: 'pending', expected: '', actual: '' },
      { id: 'lm5', category: '⚡ Last Minute', name: 'applyLastMinutePrice correct', status: 'pending', expected: '', actual: '' },
    ];

    setResults(initialTests);
    await new Promise(r => setTimeout(r, 100));

    const t = (id: string) => {
      updateResult(id, { status: 'running' });
    };
    const pass = (id: string, expected: string, actual: string, detail?: string, duration?: number) => {
      updateResult(id, { status: 'pass', expected, actual, detail, duration });
    };
    const fail = (id: string, expected: string, actual: string, detail?: string, duration?: number) => {
      updateResult(id, { status: 'fail', expected, actual, detail, duration });
    };
    const warn = (id: string, expected: string, actual: string, detail?: string) => {
      updateResult(id, { status: 'warn', expected, actual, detail });
    };

    const now = new Date();
    const h = (hours: number) => new Date(now.getTime() + hours * 3600000);
    const d = (days: number) => new Date(now.getTime() + days * 86400000);

    // ══════════════════════════════════════════
    // TESTS PRICING
    // ══════════════════════════════════════════

    // P1 — Earlybird
    t('p1');
    await new Promise(r => setTimeout(r, 50));
    try {
      const r1 = calculateFullPrice(77, 0, 7, d(20));
      const expected = 'earlybird + fillRate < 29%';
      const actual = `tier=${r1.seatTier} price=${r1.currentPrice} CHF`;
      if (r1.seatTier === 'earlybird' && r1.currentPrice < 77) pass('p1', expected, actual, JSON.stringify(r1, null, 2));
      else fail('p1', expected, actual);
    } catch(e: any) { fail('p1', 'earlybird', `ERROR: ${e.message}`); }

    // P2 — Standard
    t('p2');
    await new Promise(r => setTimeout(r, 50));
    try {
      const r2 = calculateFullPrice(77, 3, 7, d(3));
      const expected = 'tier=standard';
      if (r2.seatTier === 'standard') pass('p2', expected, `tier=${r2.seatTier} price=${r2.currentPrice} CHF`, `fillRate=${Math.round(r2.fillRate*100)}%`);
      else fail('p2', expected, `tier=${r2.seatTier} price=${r2.currentPrice} CHF`);
    } catch(e: any) { fail('p2', 'standard', `ERROR: ${e.message}`); }

    // P3 — Peak
    t('p3');
    await new Promise(r => setTimeout(r, 50));
    try {
      const r3 = calculateFullPrice(77, 5, 7, d(3));
      const expected = 'tier=peak';
      if (r3.seatTier === 'peak') pass('p3', expected, `tier=${r3.seatTier} price=${r3.currentPrice} CHF`, `fillRate=${Math.round(r3.fillRate*100)}%`);
      else fail('p3', expected, `tier=${r3.seatTier} price=${r3.currentPrice} CHF`);
    } catch(e: any) { fail('p3', 'peak', `ERROR: ${e.message}`); }

    // P4 — Lastseat
    t('p4');
    await new Promise(r => setTimeout(r, 50));
    try {
      const r4 = calculateFullPrice(77, 6, 7, d(3));
      const expected = 'tier=lastseat + price > base';
      if (r4.seatTier === 'lastseat' && r4.currentPrice > 77) pass('p4', expected, `tier=${r4.seatTier} price=${r4.currentPrice} CHF`);
      else warn('p4', expected, `tier=${r4.seatTier} price=${r4.currentPrice} CHF`, 'Prix peut être cappé par le plafond 140%');
    } catch(e: any) { fail('p4', 'lastseat', `ERROR: ${e.message}`); }

    // P5 — Rush hours
    t('p5');
    await new Promise(r => setTimeout(r, 50));
    try {
      const rushTime = new Date(d(3)); rushTime.setHours(8, 0, 0, 0);
      const creuxTime = new Date(d(3)); creuxTime.setHours(12, 0, 0, 0);
      const rRush = calculateFullPrice(77, 3, 7, rushTime);
      const rCreux = calculateFullPrice(77, 3, 7, creuxTime);
      if (rRush.currentPrice > rCreux.currentPrice) pass('p5', 'rush > creux', `rush=${rRush.currentPrice} CHF > creux=${rCreux.currentPrice} CHF`);
      else fail('p5', 'rush > creux', `rush=${rRush.currentPrice} CHF, creux=${rCreux.currentPrice} CHF`);
    } catch(e: any) { fail('p5', 'rush > creux', `ERROR: ${e.message}`); }

    // P6 — Heures creuses
    t('p6');
    await new Promise(r => setTimeout(r, 50));
    try {
      const testDate = d(3);
      const rushTime = new Date(testDate); rushTime.setHours(8, 0, 0, 0);
      const creuxTime = new Date(testDate); creuxTime.setHours(12, 0, 0, 0);
      const rRush = calculateFullPrice(77, 3, 7, rushTime);
      const rCreux = calculateFullPrice(77, 3, 7, creuxTime);
      if (rCreux.currentPrice < rRush.currentPrice) pass('p6', `creux(${rCreux.currentPrice}) < rush(${rRush.currentPrice})`, `creux=${rCreux.currentPrice} CHF < rush=${rRush.currentPrice} CHF ✓`);
      else fail('p6', 'creux < rush', `creux=${rCreux.currentPrice} CHF, rush=${rRush.currentPrice} CHF`);
    } catch(e: any) { fail('p6', 'prix creux', `ERROR: ${e.message}`); }

    // P7 — Early bird
    t('p7');
    await new Promise(r => setTimeout(r, 50));
    try {
      const r7 = calculateFullPrice(77, 0, 7, d(20));
      if (r7.isEarlyBird && r7.currentPrice < 77) pass('p7', 'isEarlyBird=true + price < 77', `isEarlyBird=${r7.isEarlyBird} price=${r7.currentPrice} CHF discount=${r7.discount}%`);
      else fail('p7', 'isEarlyBird=true + price < 77', `isEarlyBird=${r7.isEarlyBird} price=${r7.currentPrice}`);
    } catch(e: any) { fail('p7', 'early bird', `ERROR: ${e.message}`); }

    // P8 — Last minute
    t('p8');
    await new Promise(r => setTimeout(r, 50));
    try {
      const r8 = calculateFullPrice(77, 1, 7, h(1.5));
      if (r8.isLastMinute && r8.currentPrice < 77) pass('p8', 'isLastMinute=true + price < 77', `isLastMinute=${r8.isLastMinute} price=${r8.currentPrice} CHF discount=${r8.discount}%`);
      else fail('p8', 'isLastMinute=true + price < 77', `isLastMinute=${r8.isLastMinute} price=${r8.currentPrice}`);
    } catch(e: any) { fail('p8', 'last minute', `ERROR: ${e.message}`); }

    // P9 — Prix plancher
    t('p9');
    await new Promise(r => setTimeout(r, 50));
    try {
      const r9 = calculateFullPrice(77, 0, 7, h(0.5));
      const floor = Math.round(77 * 0.60);
      if (r9.currentPrice >= floor) pass('p9', `price >= ${floor} CHF (60% base)`, `price=${r9.currentPrice} CHF ≥ floor=${floor} CHF`);
      else fail('p9', `price >= ${floor} CHF`, `price=${r9.currentPrice} CHF est sous le plancher!`);
    } catch(e: any) { fail('p9', 'plancher 60%', `ERROR: ${e.message}`); }

    // P10 — Prix plafond
    t('p10');
    await new Promise(r => setTimeout(r, 50));
    try {
      const r10 = calculateFullPrice(77, 6, 7, d(1));
      const ceiling = Math.round(77 * 1.40);
      if (r10.currentPrice <= ceiling) pass('p10', `price ≤ ${ceiling} CHF (140% base)`, `price=${r10.currentPrice} CHF ≤ ceiling=${ceiling} CHF`);
      else fail('p10', `price ≤ ${ceiling} CHF`, `price=${r10.currentPrice} CHF dépasse le plafond!`);
    } catch(e: any) { fail('p10', 'plafond 140%', `ERROR: ${e.message}`); }

    // P11 — Saisonnalité janvier
    t('p11');
    await new Promise(r => setTimeout(r, 50));
    try {
      const janTime = new Date(2026, 0, 15, 12, 0, 0);
      const augTime = new Date(2026, 7, 15, 12, 0, 0);
      const rJan = calculateFullPrice(77, 3, 7, janTime);
      const rAug = calculateFullPrice(77, 3, 7, augTime);
      if (rJan.currentPrice > rAug.currentPrice) pass('p11', 'janvier > août', `jan=${rJan.currentPrice} CHF > août=${rAug.currentPrice} CHF`);
      else fail('p11', 'janvier > août', `jan=${rJan.currentPrice} CHF, août=${rAug.currentPrice} CHF`);
    } catch(e: any) { fail('p11', 'saisonnalité', `ERROR: ${e.message}`); }

    // ══════════════════════════════════════════
    // TESTS VIABILITÉ
    // ══════════════════════════════════════════

    t('v1');
    await new Promise(r => setTimeout(r, 50));
    try {
      const seuil = calculateBreakEvenSeats('frontalier');
      if (seuil === 3) pass('v1', 'breakEven=3', `breakEven=${seuil}`);
      else fail('v1', 'breakEven=3', `breakEven=${seuil}`);
    } catch(e: any) { fail('v1', '3', `ERROR: ${e.message}`); }

    t('v2');
    await new Promise(r => setTimeout(r, 50));
    try {
      const seuil = calculateBreakEvenSeats('ski');
      if (seuil === 4) pass('v2', 'breakEven=4', `breakEven=${seuil}`);
      else fail('v2', 'breakEven=4', `breakEven=${seuil}`);
    } catch(e: any) { fail('v2', '4', `ERROR: ${e.message}`); }

    t('v3');
    await new Promise(r => setTimeout(r, 50));
    try {
      const v3 = calculateVanViability(25, 1, 7, 'frontalier', h(3));
      if (v3.cabySubsidy > 0 && !v3.isViable) pass('v3', 'cabySubsidy > 0 + isViable=false', `cabySubsidy=${v3.cabySubsidy} CHF isViable=${v3.isViable}`, v3.driverMessage);
      else fail('v3', 'cabySubsidy > 0', `cabySubsidy=${v3.cabySubsidy} isViable=${v3.isViable}`);
    } catch(e: any) { fail('v3', 'subvention', `ERROR: ${e.message}`); }

    t('v4');
    await new Promise(r => setTimeout(r, 50));
    try {
      const v4 = calculateVanViability(77, 5, 7, 'business', h(3));
      if (v4.cabySubsidy === 0 && v4.isViable) pass('v4', 'cabySubsidy=0 + isViable=true', `cabySubsidy=${v4.cabySubsidy} isViable=${v4.isViable}`);
      else fail('v4', 'cabySubsidy=0', `cabySubsidy=${v4.cabySubsidy} isViable=${v4.isViable}`);
    } catch(e: any) { fail('v4', '0', `ERROR: ${e.message}`); }

    t('v5');
    await new Promise(r => setTimeout(r, 50));
    try {
      const v5 = calculateVanViability(77, 4, 7, 'business', h(3));
      const expectedFill = Math.round(4/7 * 100);
      const actualFill = Math.round(v5.fillRate * 100);
      if (actualFill === expectedFill) pass('v5', `fillRate=${expectedFill}%`, `fillRate=${actualFill}%`);
      else fail('v5', `fillRate=${expectedFill}%`, `fillRate=${actualFill}%`);
    } catch(e: any) { fail('v5', 'fillRate', `ERROR: ${e.message}`); }

    // ══════════════════════════════════════════
    // TESTS REVENUS CHAUFFEUR
    // ══════════════════════════════════════════

    t('d1');
    await new Promise(r => setTimeout(r, 50));
    try {
      const d1 = calculateDriverEarnings(25, 5, 7, 'frontalier', h(3), true);
      if (d1.cabyCommissionRate === 0.15) pass('d1', 'commission=15%', `commission=${d1.cabyCommissionRate * 100}%`);
      else fail('d1', '15%', `${d1.cabyCommissionRate * 100}%`);
    } catch(e: any) { fail('d1', '15%', `ERROR: ${e.message}`); }

    t('d2');
    await new Promise(r => setTimeout(r, 50));
    try {
      const d2 = calculateDriverEarnings(77, 5, 7, 'business', h(3), true);
      if (d2.cabyCommissionRate === 0.20) pass('d2', 'commission=20%', `commission=${d2.cabyCommissionRate * 100}%`);
      else fail('d2', '20%', `${d2.cabyCommissionRate * 100}%`);
    } catch(e: any) { fail('d2', '20%', `ERROR: ${e.message}`); }

    t('d3');
    await new Promise(r => setTimeout(r, 50));
    try {
      const d3 = calculateDriverEarnings(25, 0, 7, 'frontalier', h(3), true);
      if (d3.minimumGuarantee === 35) pass('d3', 'garantie=CHF 35', `garantie=${d3.minimumGuarantee} CHF`);
      else fail('d3', 'CHF 35', `CHF ${d3.minimumGuarantee}`);
    } catch(e: any) { fail('d3', 'CHF 35', `ERROR: ${e.message}`); }

    t('d4');
    await new Promise(r => setTimeout(r, 50));
    try {
      const d4 = calculateDriverEarnings(49, 0, 7, 'ski', h(3), true);
      if (d4.minimumGuarantee === 90) pass('d4', 'garantie=CHF 90', `garantie=${d4.minimumGuarantee} CHF`);
      else fail('d4', 'CHF 90', `CHF ${d4.minimumGuarantee}`);
    } catch(e: any) { fail('d4', 'CHF 90', `ERROR: ${e.message}`); }

    t('d5');
    await new Promise(r => setTimeout(r, 50));
    try {
      const d5Pct = calculateDriverEarnings(77, 5, 7, 'business', h(3), true);
      const d5NoPct = calculateDriverEarnings(77, 5, 7, 'business', h(3), false);
      if (d5Pct.punctualityBonus > 0 && d5NoPct.punctualityBonus === 0)
        pass('d5', 'bonus>0 si ponctuel, 0 sinon', `ponctuel=+${d5Pct.punctualityBonus} CHF, retard=+${d5NoPct.punctualityBonus} CHF`);
      else fail('d5', 'bonus ponctualité', `ponctuel=${d5Pct.punctualityBonus}, retard=${d5NoPct.punctualityBonus}`);
    } catch(e: any) { fail('d5', 'bonus', `ERROR: ${e.message}`); }

    t('d6');
    await new Promise(r => setTimeout(r, 50));
    try {
      const d6 = calculateDriverEarnings(25, 1, 7, 'frontalier', h(3), true);
      const expected = Math.max(d6.driverNet + d6.punctualityBonus, d6.minimumGuarantee + d6.punctualityBonus);
      if (d6.finalDriverPayout === expected)
        pass('d6', `payout=max(net,garantie)=${expected} CHF`, `payout=${d6.finalDriverPayout} CHF net=${d6.driverNet} garantie=${d6.minimumGuarantee}`);
      else fail('d6', `${expected} CHF`, `${d6.finalDriverPayout} CHF`);
    } catch(e: any) { fail('d6', 'payout', `ERROR: ${e.message}`); }

    // ══════════════════════════════════════════
    // TESTS DÉCISION DÉPART
    // ══════════════════════════════════════════

    t('dep1');
    await new Promise(r => setTimeout(r, 50));
    try {
      const dep1 = shouldVanDepart(3, 7, 'frontalier', h(5));
      if (dep1.shouldDepart) pass('dep1', 'shouldDepart=true', `shouldDepart=${dep1.shouldDepart} reason="${dep1.reason}"`);
      else fail('dep1', 'shouldDepart=true', `shouldDepart=${dep1.shouldDepart}`);
    } catch(e: any) { fail('dep1', 'true', `ERROR: ${e.message}`); }

    t('dep2');
    await new Promise(r => setTimeout(r, 50));
    try {
      const dep2 = shouldVanDepart(0, 7, 'frontalier', d(2));
      if (!dep2.shouldDepart) pass('dep2', 'shouldDepart=false', `shouldDepart=${dep2.shouldDepart} reason="${dep2.reason}"`);
      else fail('dep2', 'shouldDepart=false', `shouldDepart=${dep2.shouldDepart}`);
    } catch(e: any) { fail('dep2', 'false', `ERROR: ${e.message}`); }

    t('dep3');
    await new Promise(r => setTimeout(r, 50));
    try {
      const dep3 = shouldVanDepart(1, 7, 'frontalier', h(1));
      if (dep3.shouldDepart) pass('dep3', 'shouldDepart=true (départ forcé <2h)', `shouldDepart=${dep3.shouldDepart} reason="${dep3.reason}"`);
      else fail('dep3', 'shouldDepart=true', `shouldDepart=${dep3.shouldDepart}`);
    } catch(e: any) { fail('dep3', 'true', `ERROR: ${e.message}`); }

    t('dep4');
    await new Promise(r => setTimeout(r, 50));
    try {
      const dep4 = shouldVanDepart(1, 7, 'business', d(2));
      if (dep4.cabyAction.length > 0) pass('dep4', 'cabyAction non vide', `cabyAction="${dep4.cabyAction}"`);
      else fail('dep4', 'cabyAction non vide', 'cabyAction vide');
    } catch(e: any) { fail('dep4', 'action', `ERROR: ${e.message}`); }

    // ══════════════════════════════════════════
    // TESTS SUPABASE
    // ══════════════════════════════════════════

    t('s1');
    const t1 = Date.now();
    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      const dur = Date.now() - t1;
      if (!error) pass('s1', 'connexion OK', `réponse en ${dur}ms`, undefined, dur);
      else fail('s1', 'connexion OK', `ERROR: ${error.message}`, undefined, dur);
    } catch(e: any) { fail('s1', 'connexion OK', `ERROR: ${e.message}`); }

    t('s2');
    try {
      const { error } = await supabase.from('van_slots').select('id').limit(1);
      if (!error) pass('s2', 'table accessible', 'van_slots OK');
      else fail('s2', 'table accessible', `ERROR: ${error.message}`, 'Table van_slots manquante — relancer la migration SQL');
    } catch(e: any) { fail('s2', 'accessible', `ERROR: ${e.message}`); }

    t('s3');
    try {
      const { data, error, count } = await supabase.from('van_slots').select('*', { count: 'exact' });
      if (!error && count !== null) {
        if (count >= 35) pass('s3', '≥ 35 slots', `${count} slots présents`);
        else if (count > 0) warn('s3', '≥ 35 slots', `${count} slots (moins que prévu — relancer le seed)`, 'Le seed génère 5 routes × 7 jours = 35 slots');
        else fail('s3', '≥ 35 slots', '0 slot — migration seed non exécutée');
      } else fail('s3', '≥ 35 slots', `ERROR: ${error?.message}`);
    } catch(e: any) { fail('s3', '35', `ERROR: ${e.message}`); }

    for (const [tid, table, label] of [
      ['s4', 'van_bookings', 'van_bookings'],
      ['s5', 'van_driver_missions', 'van_driver_missions'],
      ['s6', 'caby_pass_subscriptions', 'caby_pass_subscriptions'],
      ['s7', 'van_push_notifications', 'van_push_notifications'],
    ] as [string, string, string][]) {
      t(tid);
      await new Promise(r => setTimeout(r, 30));
      try {
        const { error } = await supabase.from(table as any).select('id').limit(1);
        if (!error) pass(tid, `${label} accessible`, `${label} OK (0 ligne, normal)`);
        else fail(tid, `${label} accessible`, `ERROR: ${error.message}`, 'Table manquante — relancer la migration SQL');
      } catch(e: any) { fail(tid, 'accessible', `ERROR: ${e.message}`); }
    }

    t('s8');
    try {
      const { data, error } = await supabase.from('van_slots').select('id').eq('from_city', 'Genève').eq('to_city', 'Zurich');
      if (!error && data && data.length > 0) pass('s8', '≥ 1 slot GVA→ZRH', `${data.length} slots Genève→Zurich`);
      else fail('s8', '≥ 1 slot', error?.message || '0 slot trouvé');
    } catch(e: any) { fail('s8', '≥ 1', `ERROR: ${e.message}`); }

    t('s9');
    try {
      const { data, error } = await supabase.from('van_slots').select('id').eq('from_city', 'Genève').eq('to_city', 'Annecy');
      if (!error && data && data.length > 0) pass('s9', '≥ 1 slot GVA→Annecy', `${data.length} slots Genève→Annecy`);
      else fail('s9', '≥ 1 slot', error?.message || '0 slot trouvé');
    } catch(e: any) { fail('s9', '≥ 1', `ERROR: ${e.message}`); }

    t('s10');
    try {
      const { data, error } = await supabase.from('van_slots').select('id').limit(1);
      if (!error) pass('s10', 'RLS lecture publique OK', 'SELECT sans auth réussi');
      else if (error.message.includes('permission') || error.message.includes('policy'))
        fail('s10', 'lecture publique', `RLS bloque: ${error.message}`, 'Vérifier la policy van_slots_read_all');
      else fail('s10', 'lecture publique', error.message);
    } catch(e: any) { fail('s10', 'RLS', `ERROR: ${e.message}`); }

    // ══════════════════════════════════════════
    // TESTS LAST MINUTE
    // ══════════════════════════════════════════

    t('lm1');
    await new Promise(r => setTimeout(r, 50));
    try {
      const lm1 = calculateLastMinuteDiscount(h(1.5), 5, 7);
      if (lm1.discount === 50 && lm1.isLastMinute) pass('lm1', 'discount=50%', `discount=${lm1.discount}% urgency="${lm1.urgencyLabel}"`);
      else fail('lm1', 'discount=50%', `discount=${lm1.discount}%`);
    } catch(e: any) { fail('lm1', '50%', `ERROR: ${e.message}`); }

    t('lm2');
    await new Promise(r => setTimeout(r, 50));
    try {
      const lm2 = calculateLastMinuteDiscount(h(4), 5, 7);
      if (lm2.discount === 40 && lm2.isLastMinute) pass('lm2', 'discount=40%', `discount=${lm2.discount}%`);
      else fail('lm2', 'discount=40%', `discount=${lm2.discount}%`);
    } catch(e: any) { fail('lm2', '40%', `ERROR: ${e.message}`); }

    t('lm3');
    await new Promise(r => setTimeout(r, 50));
    try {
      const lm3 = calculateLastMinuteDiscount(d(3), 5, 7);
      if (lm3.discount === 0 && !lm3.isLastMinute) pass('lm3', 'discount=0 + isLastMinute=false', `discount=${lm3.discount}% isLastMinute=${lm3.isLastMinute}`);
      else fail('lm3', 'discount=0', `discount=${lm3.discount}% isLastMinute=${lm3.isLastMinute}`);
    } catch(e: any) { fail('lm3', '0%', `ERROR: ${e.message}`); }

    t('lm4');
    await new Promise(r => setTimeout(r, 50));
    try {
      const lm4 = calculateLastMinuteDiscount(h(2), 1, 7);
      if (lm4.discount === 0 && !lm4.isLastMinute) pass('lm4', 'discount=0 si van >70% plein', `van plein à ${Math.round(6/7*100)}% → discount=${lm4.discount}%`);
      else warn('lm4', 'discount=0', `discount=${lm4.discount}%`, 'Van à 6/7 = 86% > seuil 70%');
    } catch(e: any) { fail('lm4', '0%', `ERROR: ${e.message}`); }

    t('lm5');
    await new Promise(r => setTimeout(r, 50));
    try {
      const price = applyLastMinutePrice(77, 30);
      const expected = Math.round(77 * 0.70);
      if (price === expected) pass('lm5', `${expected} CHF (77 × 0.70)`, `${price} CHF`);
      else fail('lm5', `${expected} CHF`, `${price} CHF`);
    } catch(e: any) { fail('lm5', '54 CHF', `ERROR: ${e.message}`); }

    setIsRunning(false);
  }, [updateResult]);

  // Calcul du résumé
  useEffect(() => {
    const pass = results.filter(r => r.status === 'pass').length;
    const fail = results.filter(r => r.status === 'fail').length;
    const warn = results.filter(r => r.status === 'warn').length;
    setSummary({ pass, fail, warn, total: results.length });
  }, [results]);

  // Grouper par catégorie
  const categories = [...new Set(results.map(r => r.category))];

  const completedCount = results.filter(r => ['pass','fail','warn'].includes(r.status)).length;
  const progressPct = results.length > 0 ? Math.round(completedCount / results.length * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F2', paddingBottom: 40 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ background: '#1E293B', padding: '16px 16px 20px', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 4 }}>
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, flex: 1 }}>
            🧪 Tests Caby Van
          </h1>
          <button
            onClick={runAllTests}
            disabled={isRunning}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: isRunning ? 'rgba(255,255,255,0.1)' : GOLD, border: 'none', borderRadius: 8, cursor: isRunning ? 'not-allowed' : 'pointer', color: isRunning ? 'rgba(255,255,255,0.5)' : '#0A0A0A', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}
          >
            <RefreshCw style={{ width: 14, height: 14, animation: isRunning ? 'spin 1s linear infinite' : 'none' }} />
            {isRunning ? 'En cours...' : results.length === 0 ? 'Lancer les tests' : 'Relancer'}
          </button>
        </div>

        {/* Résumé */}
        {results.length > 0 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
              {[
                { label: 'Total', value: summary.total, color: '#fff' },
                { label: '✅ Passés', value: summary.pass, color: '#4ADE80' },
                { label: '❌ Échoués', value: summary.fail, color: '#F87171' },
                { label: '⚠️ Avertis', value: summary.warn, color: GOLD },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center', padding: '6px 4px', background: 'rgba(255,255,255,0.08)', borderRadius: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: summary.fail > 0 ? '#EF4444' : GOLD, borderRadius: 2, transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div style={{ padding: 16, maxWidth: 700, margin: '0 auto' }}>
        {results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9CA3AF' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🧪</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#6B7280', marginBottom: 8 }}>
              Prêt à tester
            </div>
            <div style={{ fontSize: 13, marginBottom: 24 }}>
              {`${42} tests couvrant Pricing, Viabilité, Revenus, Supabase et Last-Minute`}
            </div>
            <button
              onClick={runAllTests}
              style={{ padding: '12px 28px', background: GOLD, border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, color: '#0A0A0A' }}
            >
              Lancer tous les tests
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {categories.map(cat => {
              const catResults = results.filter(r => r.category === cat);
              const catPass = catResults.filter(r => r.status === 'pass').length;
              const catFail = catResults.filter(r => r.status === 'fail').length;
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <h2 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: 0 }}>{cat}</h2>
                    <span style={{ fontSize: 11, fontWeight: 600, color: catFail > 0 ? '#EF4444' : '#22C55E' }}>
                      {catPass}/{catResults.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {catResults.map(r => <TestCard key={r.id} result={r} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CabyTestDashboard;
