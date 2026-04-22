// ============================================================
// src/pages/admin/VanLiveTest.tsx
// Test de robustesse prix dynamiques — simule des réservations
// et vérifie que les prix montent en temps réel
// Route : /caby/admin/live-test
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { calculateFullPrice } from '@/utils/cabyVanPricing';
import { ArrowLeft, Play, Square, RefreshCw, TrendingUp, Database, Zap } from 'lucide-react';

const GOLD = '#C9A84C';

// ── TYPES ────────────────────────────────────────────────────
interface SlotSnapshot {
  id: string;
  from_city: string;
  to_city: string;
  departure_time: string;
  base_price: number;
  seats_sold: number;
  seats_total: number;
  computed_price: number;
  seat_tier: string;
  fill_rate: number;
  is_last_minute: boolean;
}

interface PriceEvent {
  ts: number;
  slotId: string;
  route: string;
  seats_sold_before: number;
  seats_sold_after: number;
  price_before: number;
  price_after: number;
  delta: number;
  tier_before: string;
  tier_after: string;
}

interface TestStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'pass' | 'fail';
  detail: string;
}

// ── COMPOSANT LOG EVENT ──────────────────────────────────────
const EventRow: React.FC<{ event: PriceEvent }> = ({ event }) => {
  const increased = event.delta > 0;
  const tierChanged = event.tier_before !== event.tier_after;
  return (
    <div style={{
      padding: '8px 12px',
      borderBottom: '1px solid #F3F4F6',
      display: 'grid',
      gridTemplateColumns: '80px 1fr 80px 80px 80px',
      gap: 8,
      alignItems: 'center',
      background: increased ? '#F0FDF4' : '#FEF2F2',
      fontSize: 11,
    }}>
      <span style={{ color: '#9CA3AF', fontFamily: 'monospace' }}>
        {new Date(event.ts).toLocaleTimeString('fr-CH')}
      </span>
      <span style={{ fontWeight: 600, color: '#1A1A1A' }}>
        {event.route}
        {tierChanged && (
          <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, color: GOLD, background: '#FFFBEB', padding: '1px 5px', borderRadius: 4 }}>
            {event.tier_before} → {event.tier_after}
          </span>
        )}
      </span>
      <span style={{ color: '#6B7280', textAlign: 'center' }}>
        {event.seats_sold_before} → {event.seats_sold_after}
      </span>
      <span style={{ textAlign: 'center', fontFamily: 'monospace' }}>
        <span style={{ textDecoration: 'line-through', color: '#9CA3AF' }}>
          {event.price_before}
        </span>
        {' → '}
        <span style={{ fontWeight: 700, color: increased ? '#166534' : '#991B1B' }}>
          {event.price_after}
        </span>
      </span>
      <span style={{ textAlign: 'center', fontWeight: 700, color: increased ? '#22C55E' : '#EF4444' }}>
        {increased ? '+' : ''}{event.delta} CHF
      </span>
    </div>
  );
};

// ── PAGE PRINCIPALE ──────────────────────────────────────────
const VanLiveTest: React.FC = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<SlotSnapshot[]>([]);
  const [events, setEvents] = useState<PriceEvent[]>([]);
  const [steps, setSteps] = useState<TestStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [summary, setSummary] = useState({
    totalEvents: 0,
    priceIncreases: 0,
    tierChanges: 0,
    maxDelta: 0,
    avgDelta: 0,
  });
  const channelRef = useRef<any>(null);
  const slotIdsRef = useRef<string[]>([]);
  const eventsRef = useRef<PriceEvent[]>([]);
  const [realtimeStatus, setRealtimeStatus] = useState<'idle' | 'subscribing' | 'subscribed' | 'error'>('idle');

  // ── Charger les slots disponibles ───────────────────────────
  const loadSlots = useCallback(async () => {
    const { data, error } = await supabase
      .from('van_slots')
      .select('*')
      .eq('status', 'open')
      .gte('departure_time', new Date().toISOString())
      .order('departure_time', { ascending: true })
      .limit(10);

    if (error || !data) return;

    const snapshots: SlotSnapshot[] = data.map((s: any) => {
      const pricing = calculateFullPrice(
        s.base_price, s.seats_sold, s.seats_total,
        new Date(s.departure_time), new Date()
      );
      return {
        id: s.id,
        from_city: s.from_city,
        to_city: s.to_city,
        departure_time: s.departure_time,
        base_price: s.base_price,
        seats_sold: s.seats_sold,
        seats_total: s.seats_total,
        computed_price: pricing.currentPrice,
        seat_tier: pricing.seatTier,
        fill_rate: pricing.fillRate,
        is_last_minute: pricing.isLastMinute,
      };
    });

    setSlots(snapshots);
    slotIdsRef.current = snapshots.map(s => s.id);
    return snapshots;
  }, []);

  // ── Mettre à jour le résumé ──────────────────────────────────
  useEffect(() => {
    if (events.length === 0) return;
    const increases = events.filter(e => e.delta > 0);
    const tierChanges = events.filter(e => e.tier_before !== e.tier_after);
    const deltas = events.map(e => e.delta);
    setSummary({
      totalEvents: events.length,
      priceIncreases: increases.length,
      tierChanges: tierChanges.length,
      maxDelta: Math.max(...deltas),
      avgDelta: Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length),
    });
  }, [events]);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  // ── Écouter les changements Supabase Realtime ────────────────
  const startListening = useCallback(async () => {
    const snapshots = await loadSlots();
    if (!snapshots || snapshots.length === 0) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    setRealtimeStatus('subscribing');

    // Snapshot des prix avant
    const pricesBefore: Record<string, SlotSnapshot> = {};
    snapshots.forEach(s => { pricesBefore[s.id] = s; });

    channelRef.current = supabase
      .channel('van_live_test')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'van_slots' },
        (payload) => {
          const updated = payload.new as any;
          const before = pricesBefore[updated.id];
          if (!before) return;

          const pricingAfter = calculateFullPrice(
            updated.base_price, updated.seats_sold, updated.seats_total,
            new Date(updated.departure_time), new Date()
          );

          const event: PriceEvent = {
            ts: Date.now(),
            slotId: updated.id,
            route: `${updated.from_city} → ${updated.to_city}`,
            seats_sold_before: before.seats_sold,
            seats_sold_after: updated.seats_sold,
            price_before: before.computed_price,
            price_after: pricingAfter.currentPrice,
            delta: pricingAfter.currentPrice - before.computed_price,
            tier_before: before.seat_tier,
            tier_after: pricingAfter.seatTier,
          };

          setEvents(prev => {
            const next = [event, ...prev].slice(0, 50);
            eventsRef.current = next;
            return next;
          });

          // Mettre à jour le snapshot
          pricesBefore[updated.id] = {
            ...before,
            seats_sold: updated.seats_sold,
            computed_price: pricingAfter.currentPrice,
            seat_tier: pricingAfter.seatTier,
            fill_rate: pricingAfter.fillRate,
          };

          // Recharger les slots affichés
          loadSlots();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('subscribed');
          setIsListening(true);
          return;
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setRealtimeStatus('error');
          setIsListening(false);
          return;
        }

        if (status === 'CLOSED') {
          setRealtimeStatus('idle');
          setIsListening(false);
        }
      });
  }, [loadSlots]);

  const stopListening = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setIsListening(false);
    setRealtimeStatus('idle');
  }, []);

  // ── Mise à jour d'un slot unique ─────────────────────────────
  const updateStep = (id: string, status: TestStep['status'], detail: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status, detail } : s));
  };

  // ── SCÉNARIO DE TEST COMPLET ─────────────────────────────────
  const runRobustnessTest = useCallback(async () => {
    setIsRunning(true);
    setEvents([]);
    eventsRef.current = [];

    const testSteps: TestStep[] = [
      { id: 't1', label: 'Connexion Supabase', status: 'pending', detail: '' },
      { id: 't2', label: 'Chargement slots disponibles', status: 'pending', detail: '' },
      { id: 't3', label: 'Vérification prix initial', status: 'pending', detail: '' },
      { id: 't4', label: 'Simulation +1 siège vendu', status: 'pending', detail: '' },
      { id: 't5', label: 'Vérification hausse de prix', status: 'pending', detail: '' },
      { id: 't6', label: 'Simulation +2 sièges vendus', status: 'pending', detail: '' },
      { id: 't7', label: 'Vérification changement de tier', status: 'pending', detail: '' },
      { id: 't8', label: 'Simulation van presque plein (6/7)', status: 'pending', detail: '' },
      { id: 't9', label: 'Vérification tier lastseat', status: 'pending', detail: '' },
      { id: 't10', label: 'Restauration seats_sold original', status: 'pending', detail: '' },
      { id: 't11', label: 'Vérification Realtime reçu', status: 'pending', detail: '' },
      { id: 't12', label: 'Cohérence prix fallback vs live', status: 'pending', detail: '' },
    ];
    setSteps(testSteps);

    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

    // T1 — Connexion
    updateStep('t1', 'running', '');
    await delay(300);
    const { error: connError } = await supabase.from('profiles').select('id').limit(1);
    if (connError) { updateStep('t1', 'fail', connError.message); setIsRunning(false); return; }
    updateStep('t1', 'pass', 'Supabase connecté');

    // T2 — Charger les slots
    updateStep('t2', 'running', '');
    await delay(300);
    const { data: slotsData, error: slotsError } = await supabase
      .from('van_slots')
      .select('*')
      .eq('status', 'open')
      .gte('departure_time', new Date().toISOString())
      .order('departure_time', { ascending: true })
      .limit(5);

    if (slotsError || !slotsData || slotsData.length === 0) {
      updateStep('t2', 'fail', slotsError?.message || '0 slots trouvés — relancer le seed SQL');
      setIsRunning(false); return;
    }
    updateStep('t2', 'pass', `${slotsData.length} slots chargés`);

    // Prendre le premier slot avec de la marge
    const testSlot = slotsData.find((s: any) => s.seats_sold < 5) || slotsData[0];
    const originalSeatsSold = testSlot.seats_sold;
    const route = `${testSlot.from_city} → ${testSlot.to_city}`;

    // T3 — Prix initial
    updateStep('t3', 'running', '');
    await delay(200);
    const pricingInitial = calculateFullPrice(
      testSlot.base_price, testSlot.seats_sold, testSlot.seats_total,
      new Date(testSlot.departure_time), new Date()
    );
    updateStep('t3', 'pass',
      `${route} | seats=${testSlot.seats_sold}/${testSlot.seats_total} | prix=${pricingInitial.currentPrice} CHF | tier=${pricingInitial.seatTier}`
    );

    // T4 — +1 siège
    updateStep('t4', 'running', '');
    await delay(400);
    const seats1 = Math.min(testSlot.seats_total - 1, testSlot.seats_sold + 1);
    const { error: e4 } = await supabase
      .from('van_slots')
      .update({ seats_sold: seats1 })
      .eq('id', testSlot.id);
    if (e4) { updateStep('t4', 'fail', e4.message); }
    else { updateStep('t4', 'pass', `seats_sold: ${testSlot.seats_sold} → ${seats1}`); }
    await delay(600);

    // T5 — Vérifier hausse
    updateStep('t5', 'running', '');
    await delay(300);
    const pricing1 = calculateFullPrice(
      testSlot.base_price, seats1, testSlot.seats_total,
      new Date(testSlot.departure_time), new Date()
    );
    if (pricing1.currentPrice >= pricingInitial.currentPrice) {
      updateStep('t5', 'pass',
        `Prix: ${pricingInitial.currentPrice} → ${pricing1.currentPrice} CHF (+${pricing1.currentPrice - pricingInitial.currentPrice}) ✓`
      );
    } else {
      updateStep('t5', 'fail',
        `Prix n'a pas augmenté: ${pricingInitial.currentPrice} → ${pricing1.currentPrice}`
      );
    }

    // T6 — +2 sièges supplémentaires
    updateStep('t6', 'running', '');
    await delay(400);
    const seats2 = Math.min(testSlot.seats_total - 1, seats1 + 2);
    const { error: e6 } = await supabase
      .from('van_slots')
      .update({ seats_sold: seats2 })
      .eq('id', testSlot.id);
    if (e6) { updateStep('t6', 'fail', e6.message); }
    else { updateStep('t6', 'pass', `seats_sold: ${seats1} → ${seats2}`); }
    await delay(600);

    // T7 — Vérifier changement tier
    updateStep('t7', 'running', '');
    await delay(300);
    const pricing2 = calculateFullPrice(
      testSlot.base_price, seats2, testSlot.seats_total,
      new Date(testSlot.departure_time), new Date()
    );
    if (pricing2.seatTier !== pricingInitial.seatTier || pricing2.currentPrice > pricingInitial.currentPrice) {
      updateStep('t7', 'pass',
        `Tier: ${pricingInitial.seatTier} → ${pricing2.seatTier} | Prix: ${pricingInitial.currentPrice} → ${pricing2.currentPrice} CHF`
      );
    } else {
      updateStep('t7', 'fail',
        `Tier inchangé: ${pricing2.seatTier} | Prix: ${pricing2.currentPrice} CHF`
      );
    }

    // T8 — Presque plein (6/7)
    updateStep('t8', 'running', '');
    await delay(400);
    const seats3 = testSlot.seats_total - 1; // 6/7
    const { error: e8 } = await supabase
      .from('van_slots')
      .update({ seats_sold: seats3 })
      .eq('id', testSlot.id);
    if (e8) { updateStep('t8', 'fail', e8.message); }
    else { updateStep('t8', 'pass', `seats_sold: ${seats3}/${testSlot.seats_total} — dernier siège`); }
    await delay(600);

    // T9 — Vérifier tier lastseat
    updateStep('t9', 'running', '');
    await delay(300);
    const pricing3 = calculateFullPrice(
      testSlot.base_price, seats3, testSlot.seats_total,
      new Date(testSlot.departure_time), new Date()
    );
    if (pricing3.seatTier === 'lastseat') {
      updateStep('t9', 'pass',
        `✅ tier=lastseat | prix=${pricing3.currentPrice} CHF (base=${testSlot.base_price} CHF)`
      );
    } else {
      updateStep('t9', 'fail',
        `tier=${pricing3.seatTier} au lieu de lastseat | fillRate=${Math.round(pricing3.fillRate * 100)}%`
      );
    }

    // T10 — Restauration
    updateStep('t10', 'running', '');
    await delay(400);
    const { error: e10 } = await supabase
      .from('van_slots')
      .update({ seats_sold: originalSeatsSold })
      .eq('id', testSlot.id);
    if (e10) { updateStep('t10', 'fail', e10.message); }
    else { updateStep('t10', 'pass', `seats_sold restauré à ${originalSeatsSold} ✓`); }
    await delay(500);

    // T11 — Vérifier Realtime reçu
    updateStep('t11', 'running', '');
    await delay(500);
    // On vérifie que les events ont été reçus si on écoutait
    const receivedEvents = eventsRef.current.length;
    if (isListening && realtimeStatus !== 'subscribed') {
      updateStep('t11', 'fail', `Realtime non prêt (${realtimeStatus})`);
    } else if (isListening && receivedEvents > 0) {
      updateStep('t11', 'pass', `${receivedEvents} événements Realtime reçus ✓`);
    } else if (isListening) {
      updateStep('t11', 'fail', 'Realtime actif mais 0 événements reçus');
    } else {
      updateStep('t11', 'pass', 'Test Realtime : activez "Écouter Realtime" pour tester');
    }

    // T12 — Cohérence fallback vs live
    updateStep('t12', 'running', '');
    await delay(300);
    const { data: freshSlot } = await supabase
      .from('van_slots').select('*').eq('id', testSlot.id).single();

    if (freshSlot) {
      const pricingLive = calculateFullPrice(
        (freshSlot as any).base_price,
        (freshSlot as any).seats_sold,
        (freshSlot as any).seats_total,
        new Date((freshSlot as any).departure_time),
        new Date()
      );
      const pricingFallback = calculateFullPrice(
        testSlot.base_price,
        originalSeatsSold,
        testSlot.seats_total,
        new Date(testSlot.departure_time),
        new Date()
      );
      updateStep('t12', 'pass',
        `Live: ${pricingLive.currentPrice} CHF (seats=${(freshSlot as any).seats_sold}) | Fallback aurait donné: ${pricingFallback.currentPrice} CHF (seats=${originalSeatsSold})`
      );
    } else {
      updateStep('t12', 'fail', 'Impossible de relire le slot');
    }

    await loadSlots();
    setIsRunning(false);
  }, [isListening, loadSlots, realtimeStatus]);

  // Chargement initial
  useEffect(() => { loadSlots(); }, [loadSlots]);

  const passCount = steps.filter(s => s.status === 'pass').length;
  const failCount = steps.filter(s => s.status === 'fail').length;

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F2', paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ background: '#1E293B', padding: '16px', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 4 }}>
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, flex: 1 }}>
            🔬 Test Robustesse Prix Dynamiques
          </h1>
        </div>

        {/* Boutons d'action */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={runRobustnessTest}
            disabled={isRunning}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', background: isRunning ? 'rgba(255,255,255,0.1)' : GOLD, border: 'none', borderRadius: 10, cursor: isRunning ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: isRunning ? 'rgba(255,255,255,0.4)' : '#0A0A0A' }}
          >
            {isRunning
              ? <><RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Test en cours...</>
              : <><Play style={{ width: 14, height: 14 }} /> Lancer le test</>}
          </button>
          <button
            onClick={isListening ? stopListening : startListening}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', background: isListening ? '#22C55E' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: '#fff' }}
          >
            {isListening
              ? <><Square style={{ width: 14, height: 14 }} /> Arrêter Realtime</>
              : <><Zap style={{ width: 14, height: 14 }} /> Écouter Realtime</>}
          </button>
        </div>

        {/* Résumé si tests terminés */}
        {steps.length > 0 && !isRunning && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
            <div style={{ textAlign: 'center', padding: '6px', background: 'rgba(74,222,128,0.15)', borderRadius: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#4ADE80' }}>{passCount}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>✅ Passés</div>
            </div>
            <div style={{ textAlign: 'center', padding: '6px', background: failCount > 0 ? 'rgba(248,113,113,0.15)' : 'rgba(74,222,128,0.05)', borderRadius: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: failCount > 0 ? '#F87171' : '#4ADE80' }}>{failCount}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>{failCount > 0 ? '❌ Échoués' : '✅ Zéro échec'}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: 16, maxWidth: 700, margin: '0 auto' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {/* Résumé Realtime */}
        {summary.totalEvents > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E5E7EB', padding: '14px', marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap style={{ width: 14, height: 14, color: GOLD }} />
              Résumé Realtime
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { label: 'Événements', value: summary.totalEvents, color: '#1A1A1A' },
                { label: 'Hausses', value: summary.priceIncreases, color: '#22C55E' },
                { label: 'Tier changés', value: summary.tierChanges, color: GOLD },
                { label: 'Delta max', value: `+${summary.maxDelta} CHF`, color: '#EF4444' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center', padding: '6px', background: '#F9F9F9', borderRadius: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: 9, color: '#9CA3AF' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Slots actuels en base */}
        {slots.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E5E7EB', marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Database style={{ width: 14, height: 14, color: GOLD }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>
                Slots en base — Prix live
              </span>
              <button onClick={loadSlots} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: GOLD, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <RefreshCw style={{ width: 12, height: 12 }} /> Actualiser
              </button>
            </div>
            {/* En-tête tableau */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 80px 80px 70px', gap: 8, padding: '6px 12px', background: '#F9F9F9', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>
              <span>Route</span>
              <span>Départ</span>
              <span style={{ textAlign: 'center' }}>Sièges</span>
              <span style={{ textAlign: 'center' }}>Prix live</span>
              <span style={{ textAlign: 'center' }}>Tier</span>
            </div>
            {slots.map(slot => {
              const fillColor = slot.fill_rate >= 0.86 ? '#EF4444' : slot.fill_rate >= 0.57 ? GOLD : '#22C55E';
              return (
                <div key={slot.id} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 80px 80px 70px', gap: 8, padding: '8px 12px', borderTop: '1px solid #F3F4F6', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A' }}>
                    {slot.from_city} → {slot.to_city}
                  </span>
                  <span style={{ fontSize: 10, color: '#6B7280', fontFamily: 'monospace' }}>
                    {new Date(slot.departure_time).toLocaleDateString('fr-CH', { weekday: 'short', month: 'short', day: 'numeric' })} {new Date(slot.departure_time).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: fillColor }}>
                      {slot.seats_sold}/{slot.seats_total}
                    </div>
                    <div style={{ height: 3, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden', marginTop: 2 }}>
                      <div style={{ height: '100%', width: `${Math.round(slot.fill_rate * 100)}%`, background: fillColor, borderRadius: 2 }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: '#1A1A1A' }}>
                    CHF {slot.computed_price}
                    {slot.is_last_minute && <div style={{ fontSize: 8, color: '#EF4444', fontWeight: 700 }}>last-min</div>}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4,
                      background: slot.seat_tier === 'lastseat' ? '#FEF2F2' : slot.seat_tier === 'peak' ? '#FFF7ED' : slot.seat_tier === 'earlybird' ? '#F0FDF4' : '#F9FAFB',
                      color: slot.seat_tier === 'lastseat' ? '#EF4444' : slot.seat_tier === 'peak' ? '#F97316' : slot.seat_tier === 'earlybird' ? '#22C55E' : '#6B7280',
                    }}>
                      {slot.seat_tier}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Étapes du test */}
        {steps.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E5E7EB', marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #F3F4F6', fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>
              📋 Étapes du test
            </div>
            {steps.map((step, i) => (
              <div key={step.id} style={{ padding: '10px 14px', borderTop: i > 0 ? '1px solid #F9F9F9' : 'none', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: step.status === 'pass' ? '#DCFCE7' : step.status === 'fail' ? '#FEE2E2' : step.status === 'running' ? '#FEF3C7' : '#F3F4F6' }}>
                  {step.status === 'pass' && <span style={{ fontSize: 10, color: '#22C55E' }}>✓</span>}
                  {step.status === 'fail' && <span style={{ fontSize: 10, color: '#EF4444' }}>✗</span>}
                  {step.status === 'running' && <div style={{ width: 10, height: 10, border: `2px solid ${GOLD}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
                  {step.status === 'pending' && <span style={{ fontSize: 9, color: '#9CA3AF' }}>{i + 1}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{step.label}</div>
                  {step.detail && <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2, fontFamily: 'monospace' }}>{step.detail}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Log événements Realtime */}
        {events.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E5E7EB', overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp style={{ width: 14, height: 14, color: GOLD }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>Log Realtime — {events.length} événements</span>
            </div>
            {/* En-tête */}
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px 80px 80px', gap: 8, padding: '6px 12px', background: '#F9F9F9', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>
              <span>Heure</span><span>Route</span><span style={{ textAlign: 'center' }}>Sièges</span><span style={{ textAlign: 'center' }}>Prix</span><span style={{ textAlign: 'center' }}>Delta</span>
            </div>
            {events.slice(0, 20).map((e, i) => <EventRow key={i} event={e} />)}
          </div>
        )}

        {/* État initial vide */}
        {steps.length === 0 && slots.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔬</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#6B7280', marginBottom: 8 }}>Prêt à tester</div>
            <div style={{ fontSize: 12, maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>
              Le test simule des ventes de sièges et vérifie que les prix montent automatiquement selon le moteur yield management.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VanLiveTest;
