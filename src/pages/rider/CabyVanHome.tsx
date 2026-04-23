// ============================================================
// src/pages/rider/CabyVanHome.tsx
// Home Van — 5 onglets : Home / Book / Trips / Pass / Tracker
// Route principale : /caby (remplace l'ancienne Index.tsx)
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { calculateFullPrice } from '@/utils/cabyVanPricing';
import { useAuth } from '@/contexts/AuthContext';

const GOLD = '#C9A84C';
const DARK = '#1E293B';

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

type Tab = 'home' | 'book' | 'trips' | 'pass' | 'tracker';

// ── Types ───────────────────────────────────────────────────
interface FlashDeal {
  id: string;
  route: string;
  from: string;
  to: string;
  departureTime: Date;
  originalPrice: number;
  flashPrice: number;
  discountPct: number;
  seatsLeft: number;
  expiresAt: Date;
  slotId: string;
}

interface UpcomingTrip {
  id: string;
  route: string;
  date: string;
  time: string;
  seat: string;
  price: number;
  status: 'confirmed' | 'delayed' | 'cancelled';
  delayMsg?: string;
  daysUntil: number;
  bookingRef: string;
}

interface ActiveTrip {
  route: string;
  date: string;
  time: string;
  driver: string;
  driverScore: string;
  seat: string;
  ref: string;
  progressPct: number;
  etaLabel: string;
  onTime: boolean;
}

// ── Données simulées ─────────────────────────────────────────
const MOCK_UPCOMING: UpcomingTrip[] = [
  { id: 'u1', route: 'Genève → Annecy', date: 'Mar. 28 avr.', time: '07:30', seat: '2A', price: 22, status: 'confirmed', daysUntil: 1, bookingRef: 'AN28' },
  { id: 'u2', route: 'Genève → Lyon', date: 'Jeu. 30 avr.', time: '09:00', seat: '5C', price: 49, status: 'confirmed', daysUntil: 3, bookingRef: 'LY30' },
  { id: 'u3', route: 'Genève → Zurich', date: 'Sam. 3 mai', time: '17:00', seat: '4B', price: 77, status: 'delayed', delayMsg: 'Trafic frontalier détecté · Suivi actif', daysUntil: 6, bookingRef: 'ZH03' },
  { id: 'u4', route: 'Genève → Verbier', date: 'Dim. 4 mai', time: '08:00', seat: '1A', price: 49, status: 'cancelled', daysUntil: 7, bookingRef: 'VB04' },
];

const MOCK_ACTIVE: ActiveTrip = {
  route: 'Genève → Zurich', date: "Auj.", time: '07:00',
  driver: 'Ahmed M.', driverScore: '4.9 · Gold',
  seat: '3B', ref: 'K4X9', progressPct: 35,
  etaLabel: 'Arrivée ~10:05', onTime: true,
};

const MOCK_HISTORY = [
  { id: 'h1', route: 'Genève → Annecy', date: 'Mer. 23 avr.', price: 22, status: 'completed' as const },
  { id: 'h2', route: 'Genève → Lyon', date: 'Lun. 14 avr.', price: 49, status: 'completed' as const },
];

const POPULAR_ROUTES = [
  { city: 'Zurich', price: 66 },
  { city: 'Annecy', price: 22 },
  { city: 'Verbier', price: 49 },
  { city: 'Lyon', price: 49 },
];

// ── Hook flash deal depuis Supabase ──────────────────────────
function useFlashDeals() {
  const [deals, setDeals] = useState<FlashDeal[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const now = new Date();
        const in3h = new Date(now.getTime() + 3 * 3600000);
        const { data } = await supabase
          .from('van_slots')
          .select('*')
          .eq('status', 'open')
          .gte('departure_time', now.toISOString())
          .lte('departure_time', in3h.toISOString())
          .order('departure_time', { ascending: true })
          .limit(3);

        if (!data || data.length === 0) {
          // Fallback simulé
          setDeals([{
            id: 'demo-1',
            route: 'Genève → Verbier',
            from: 'Genève', to: 'Verbier',
            departureTime: new Date(now.getTime() + 107 * 60000),
            originalPrice: 55,
            flashPrice: 32,
            discountPct: 42,
            seatsLeft: 1,
            expiresAt: new Date(now.getTime() + 18 * 60000),
            slotId: '',
          }]);
          return;
        }

        const flashDeals = data
          .map((s: any) => {
            const pricing = calculateFullPrice(
              s.base_price, s.seats_sold, s.seats_total,
              new Date(s.departure_time), now
            );
            if (!pricing.isLastMinute || s.seats_sold >= s.seats_total) return null;
            const seatsLeft = s.seats_total - s.seats_sold;
            return {
              id: s.id,
              route: `${s.from_city} → ${s.to_city}`,
              from: s.from_city, to: s.to_city,
              departureTime: new Date(s.departure_time),
              originalPrice: pricing.originalPrice,
              flashPrice: pricing.currentPrice,
              discountPct: pricing.discount,
              seatsLeft,
              expiresAt: new Date(now.getTime() + 18 * 60000),
              slotId: s.id,
            };
          })
          .filter(Boolean) as FlashDeal[];

        setDeals(flashDeals.length > 0 ? [flashDeals[0]] : [{
          id: 'demo-1',
          route: 'Genève → Verbier',
          from: 'Genève', to: 'Verbier',
          departureTime: new Date(now.getTime() + 107 * 60000),
          originalPrice: 55, flashPrice: 32, discountPct: 42,
          seatsLeft: 1,
          expiresAt: new Date(now.getTime() + 18 * 60000),
          slotId: '',
        }]);
      } catch {
        setDeals([{
          id: 'demo-1', route: 'Genève → Verbier',
          from: 'Genève', to: 'Verbier',
          departureTime: new Date(Date.now() + 107 * 60000),
          originalPrice: 55, flashPrice: 32, discountPct: 42,
          seatsLeft: 1,
          expiresAt: new Date(Date.now() + 18 * 60000),
          slotId: '',
        }]);
      }
    };
    load();
  }, []);

  return deals;
}

// ── Compte à rebours ──────────────────────────────────────────
function useCountdown(expiresAt: Date | null) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!expiresAt) return;
    const update = () => setSecs(Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000)));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt?.getTime()]);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  return { secs, label: `${mm}:${ss}` };
}

// ── TAB ICONS (style easyJet : trait épais, contour) ────────
const icons: Record<Tab, JSX.Element> = {
  home: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V11z" stroke="currentColor" strokeLinejoin="round"/></svg>,
  book: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M2 13l3-1 6-7 2 1-3 6 5-1 2-3 1.5 0.5-2 4 4 1c1 0.3 1 1.5-1 2L4 17c-1 0.2-1.5-0.3-2-1.5L2 13z" stroke="currentColor" strokeLinejoin="round" fill="currentColor" fillOpacity="0.001"/></svg>,
  trips: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2"><rect x="4" y="7" width="16" height="13" rx="2" stroke="currentColor"/><path d="M9 7V4h6v3" stroke="currentColor" strokeLinecap="round"/><path d="M4 12h16" stroke="currentColor"/></svg>,
  pass: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4V8z" stroke="currentColor" strokeLinejoin="round"/><path d="M15 6v12" stroke="currentColor" strokeDasharray="2 2"/></svg>,
  tracker: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M2 13l3-1 6-7 2 1-3 6 5-1 2-3 1.5 0.5-2 4 4 1c1 0.3 1 1.5-1 2L4 17c-1 0.2-1.5-0.3-2-1.5L2 13z" stroke="currentColor" strokeLinejoin="round"/><circle cx="19" cy="19" r="3.5" stroke="currentColor" fill="#fff"/><path d="M19 17.5V19l1 1" stroke="currentColor" strokeLinecap="round"/></svg>,
};

// ── COMPOSANTS PARTAGÉS ──────────────────────────────────────

const SectionTitle: React.FC<{ children: React.ReactNode; action?: string; onAction?: () => void }> = ({ children, action, onAction }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
    <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{children}</span>
    {action && <button onClick={onAction} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: GOLD, fontWeight: 600 }}>{action}</button>}
  </div>
);

const FillBar: React.FC<{ pct: number; color?: string }> = ({ pct, color = GOLD }) => (
  <div style={{ height: 3, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.3s ease' }} />
  </div>
);

// ── FLASH DEAL CARD ──────────────────────────────────────────
const FlashDealCard: React.FC<{ deal: FlashDeal; onBook: () => void }> = ({ deal, onBook }) => {
  const { label } = useCountdown(deal.expiresAt);
  const depMin = Math.floor((deal.departureTime.getTime() - Date.now()) / 60000);
  const depLabel = depMin >= 60
    ? `${Math.floor(depMin / 60)}h ${String(depMin % 60).padStart(2, '0')}m`
    : `${depMin} min`;

  return (
    <div style={{ border: `1.5px solid #EF4444`, borderRadius: 14, padding: '11px 13px', background: '#FEF2F2', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', animation: 'cabyPulse 1s infinite' }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: '#A32D2D', letterSpacing: '0.5px' }}>
          OFFRE FLASH · {deal.seatsLeft} SIÈGE{deal.seatsLeft > 1 ? 'S' : ''}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#A32D2D', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#7F1D1D' }}>{deal.route}</div>
          <div style={{ fontSize: 11, color: '#A32D2D' }}>Départ dans {depLabel}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#A32D2D', textDecoration: 'line-through', opacity: 0.7 }}>
            CHF {deal.originalPrice}
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#7F1D1D', lineHeight: 1.1 }}>CHF {deal.flashPrice}</div>
          <div style={{ fontSize: 10, fontWeight: 700, background: '#EF4444', color: '#fff', padding: '1px 6px', borderRadius: 6, display: 'inline-block' }}>
            -{deal.discountPct}%
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={onBook}
          style={{ flex: 1, background: '#EF4444', border: 'none', borderRadius: 9, padding: '10px 0', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'inherit' }}
        >
          Réserver ce siège →
        </button>
        <button style={{ width: 38, height: 38, border: '0.5px solid #FECACA', borderRadius: 9, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="#A32D2D" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

// ── ONGLET HOME (hero gold pleine largeur style easyJet) ─────
const TabHome: React.FC<{ deals: FlashDeal[]; onNavigate: (tab: Tab) => void; onBookDeal: (deal: FlashDeal) => void }> = ({ deals, onNavigate, onBookDeal }) => (
  <div>
    {/* HERO gold pleine largeur avec illustration */}
    <div style={{
      background: `linear-gradient(180deg, ${GOLD} 0%, #B89540 100%)`,
      padding: '24px 18px 90px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Décor : silhouette van + montagnes */}
      <svg width="100%" height="140" viewBox="0 0 360 140" style={{ position: 'absolute', bottom: 60, left: 0, opacity: 0.18 }}>
        <path d="M0 120 L60 70 L100 95 L160 50 L220 80 L280 40 L360 90 L360 140 L0 140 Z" fill="#fff"/>
        <path d="M0 130 L80 100 L140 115 L200 90 L260 110 L360 85 L360 140 L0 140 Z" fill="#fff" opacity="0.5"/>
      </svg>
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 4, fontWeight: 600 }}>Genève · Suisse & Europe</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 6, letterSpacing: '-0.5px' }}>
          Van partagé<br/>premium
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 0 }}>
          Votre siège. Votre trajet. Votre prix.
        </div>
      </div>
    </div>

    {/* CTA blancs encadrés flottants (style "BOOK FLIGHTS / BOOK HOLIDAYS") */}
    <div style={{ padding: '0 18px', marginTop: -64, position: 'relative', zIndex: 2 }}>
      <button
        onClick={() => onNavigate('book')}
        style={{
          width: '100%', background: '#fff', border: `2px solid ${GOLD}`,
          borderRadius: 8, padding: '18px 20px', marginBottom: 12,
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M2 14l3-1 6-7 2 1-3 6 5-1 2-3 1.5 0.5-2 4 4 1c1 0.3 1 1.5-1 2L4 18c-1 0.2-1.5-0.3-2-1.5L2 14z" fill={GOLD}/>
        </svg>
        <span style={{ fontSize: 16, fontWeight: 800, color: '#4A4A4A', letterSpacing: 1 }}>RÉSERVER UN VAN</span>
      </button>
      <button
        onClick={() => onNavigate('pass')}
        style={{
          width: '100%', background: '#fff', border: `2px solid ${GOLD}`,
          borderRadius: 8, padding: '18px 20px',
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4V8z" fill={GOLD}/>
        </svg>
        <span style={{ fontSize: 16, fontWeight: 800, color: '#4A4A4A', letterSpacing: 1 }}>CABY PASS</span>
      </button>
    </div>

    {/* Bannière promo grande "GROS POURCENTAGE" style easyJet */}
    <div style={{ padding: '20px 18px 0' }}>
      <button
        onClick={() => onNavigate('book')}
        style={{
          width: '100%', background: GOLD, border: 'none', borderRadius: 12,
          padding: '28px 24px', cursor: 'pointer', fontFamily: 'inherit',
          textAlign: 'left', position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, opacity: 0.12, fontSize: 50, lineHeight: 1, letterSpacing: 8, color: '#fff', userSelect: 'none', padding: 8 }}>
          ✈ ✈ ✈ ✈<br/>✈ ✈ ✈ ✈
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: 1, marginBottom: 4 }}>JUSQU'À</div>
          <div style={{ fontSize: 64, fontWeight: 900, color: '#fff', lineHeight: 0.9, letterSpacing: '-2px' }}>30%</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginTop: 4 }}>SUR LE LAST-MINUTE</div>
        </div>
      </button>
    </div>

    {/* Flash deal */}
    {deals.length > 0 && (
      <div style={{ padding: '16px 18px 0' }}>
        {deals.map(deal => (
          <FlashDealCard key={deal.id} deal={deal} onBook={() => onBookDeal(deal)} />
        ))}
      </div>
    )}

    {/* Pourquoi Caby Van */}
    <div style={{ padding: '16px 18px 0' }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', marginBottom: 12 }}>Pourquoi Caby Van ?</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
        {[
          { bg: GOLD, label: 'Prix garanti', sub: 'Transparent et juste', icon: 'clock' },
          { bg: DARK, label: 'Van premium', sub: 'Chauffeur certifié Caby', icon: 'lock' },
          { bg: '#22C55E', label: 'Ponctuel', sub: 'Toujours à l\'heure', icon: 'check' },
          { bg: '#3B82F6', label: 'Code conduite', sub: 'Standard premium', icon: 'star' },
        ].map(item => (
          <div key={item.label} style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: 12, padding: '14px 12px' }}>
            <div style={{ width: 32, height: 32, background: item.bg, borderRadius: 8, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.icon === 'clock' && <svg width="16" height="16" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="#fff" strokeWidth="1.4"/><path d="M6.5 4.5v2l1.5 1" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg>}
              {item.icon === 'lock' && <svg width="16" height="16" viewBox="0 0 13 13" fill="none"><rect x="2" y="6" width="9" height="6" rx="1.5" stroke="#fff" strokeWidth="1.4"/><path d="M4.5 6V4.5a2 2 0 014 0V6" stroke="#fff" strokeWidth="1.4"/></svg>}
              {item.icon === 'check' && <svg width="16" height="16" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              {item.icon === 'star' && <svg width="16" height="16" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5l1.5 3h3L8.5 6.5l1 3-3-2-3 2 1-3L2 4.5h3z" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round"/></svg>}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 11, color: '#888780' }}>{item.sub}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Routes populaires */}
    <div style={{ padding: '16px 18px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>Routes populaires</div>
        <button onClick={() => onNavigate('book')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: GOLD, fontWeight: 700 }}>Tout voir →</button>
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }} className="caby-tab-scroll">
        {POPULAR_ROUTES.map((r, i) => (
          <button
            key={r.city}
            onClick={() => onNavigate('book')}
            style={{
              background: i === 0 ? GOLD : '#fff',
              border: i === 0 ? 'none' : '0.5px solid #E5E7EB',
              borderRadius: 12, padding: '14px 18px',
              flexShrink: 0, textAlign: 'left', cursor: 'pointer',
              minWidth: 110, fontFamily: 'inherit',
            }}
          >
            <div style={{ fontSize: 11, color: i === 0 ? 'rgba(255,255,255,0.85)' : '#888780', marginBottom: 4, fontWeight: 600 }}>dès</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: i === 0 ? '#fff' : '#1A1A1A', marginBottom: 4 }}>CHF {r.price}</div>
            <div style={{ fontSize: 12, color: i === 0 ? 'rgba(255,255,255,0.95)' : GOLD, fontWeight: 700 }}>→ {r.city}</div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

// ── ONGLET BOOK ──────────────────────────────────────────────
const TabBook: React.FC<{ onSearch: (from: string, to: string, date: string) => void; deals: FlashDeal[]; onBookDeal: (deal: FlashDeal) => void }> = ({ onSearch, deals, onBookDeal }) => {
  const [from, setFrom] = useState('Genève');
  const [to, setTo] = useState('Zurich');
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);

  return (
    <div style={{ background: '#fff', minHeight: '100%' }}>
      {/* Formulaire easyJet-like : labels flottants gold sur cadres outlined */}
      <div style={{ padding: '20px 18px 8px' }}>
        {[
          { label: 'From', value: from, onChange: setFrom, placeholder: 'Ville de départ', icon: 'plane', clearable: true },
          { label: 'To', value: to, onChange: setTo, placeholder: 'Ville, gare, aéroport', icon: 'pin', clearable: false },
        ].map((field) => (
          <div
            key={field.label}
            style={{
              position: 'relative',
              border: `1.5px solid ${GOLD}`,
              borderRadius: 8,
              padding: '18px 14px 12px',
              marginBottom: 12,
              background: '#fff',
              minHeight: 60,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{
              position: 'absolute', top: -8, left: 14,
              background: '#fff', padding: '0 6px',
              fontSize: 13, fontWeight: 600, color: GOLD,
            }}>
              {field.label}
            </span>
            {field.icon === 'plane' ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M2 14l3-1 6-7 2 1-3 6 5-1 2-3 1.5 0.5-2 4 4 1c1 0.3 1 1.5-1 2L4 18c-1 0.2-1.5-0.3-2-1.5L2 14z" fill={GOLD}/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z" fill={GOLD}/>
                <circle cx="12" cy="9" r="2.5" fill="#fff"/>
              </svg>
            )}
            <input
              value={field.value}
              onChange={e => field.onChange(e.target.value)}
              placeholder={field.placeholder}
              style={{
                border: 'none', outline: 'none',
                fontSize: 17, fontWeight: 600,
                flex: 1, background: 'transparent',
                color: field.value ? '#1A1A1A' : '#9CA3AF',
                fontFamily: 'inherit', minWidth: 0,
              }}
            />
            {field.clearable && field.value && (
              <button
                onClick={() => field.onChange('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: GOLD, flexShrink: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        ))}

        {/* When */}
        <div style={{
          position: 'relative',
          border: `1.5px solid ${GOLD}`,
          borderRadius: 8,
          padding: '18px 14px 12px',
          marginBottom: 12,
          background: '#fff',
          minHeight: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ position: 'absolute', top: -8, left: 14, background: '#fff', padding: '0 6px', fontSize: 13, fontWeight: 600, color: GOLD }}>
            When
          </span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <rect x="3" y="5" width="18" height="16" rx="2" stroke={GOLD} strokeWidth="2"/>
            <path d="M3 10h18M8 3v4M16 3v4" stroke={GOLD} strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{
              border: 'none', outline: 'none',
              fontSize: 17, fontWeight: 600, flex: 1,
              background: 'transparent', color: '#1A1A1A',
              fontFamily: 'inherit', minWidth: 0,
            }}
          />
        </div>

        {/* Who */}
        <div style={{
          position: 'relative',
          border: `1.5px solid ${GOLD}`,
          borderRadius: 8,
          padding: '18px 14px 12px',
          marginBottom: 18,
          background: '#fff',
          minHeight: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ position: 'absolute', top: -8, left: 14, background: '#fff', padding: '0 6px', fontSize: 13, fontWeight: 600, color: GOLD }}>
            Who
          </span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="8" r="4" fill={GOLD}/>
            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" fill={GOLD}/>
          </svg>
          <span style={{ fontSize: 17, fontWeight: 600, color: '#1A1A1A', flex: 1 }}>1 adulte</span>
        </div>

        {/* CTA pleine largeur style easyJet */}
        <button
          onClick={() => onSearch(from, to, date)}
          style={{
            width: '100%', background: GOLD, border: 'none',
            borderRadius: 8, padding: '18px 0',
            cursor: 'pointer', fontSize: 17, fontWeight: 700,
            color: '#fff', fontFamily: 'inherit',
            boxShadow: '0 2px 8px rgba(201,168,76,0.3)',
          }}
        >
          Voir les trajets
        </button>
      </div>

      {/* Bannière promo style "Big Orange Sale" */}
      <div style={{ margin: '20px 18px', background: GOLD, borderRadius: 12, padding: '24px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15, fontSize: 60, lineHeight: 1, letterSpacing: 8, color: '#fff', userSelect: 'none' }}>
          ✈ ✈ ✈<br/>✈ ✈ ✈<br/>✈ ✈ ✈
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 1, marginBottom: 6 }}>JUSQU'À</div>
          <div style={{ fontSize: 56, fontWeight: 900, color: '#fff', lineHeight: 0.9, marginBottom: 4 }}>30%</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 10 }}>DE RÉDUCTION</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', lineHeight: 1.4 }}>
            Sur les trajets last-minute. Réservez maintenant.
          </div>
        </div>
      </div>

      {/* Prochains départs */}
      <div style={{ padding: '4px 18px 16px' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', marginBottom: 12 }}>Prochains départs</div>

        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>Genève → Zurich</div>
              <div style={{ fontSize: 12, color: '#888780' }}>07:00 · 4 sièges</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>CHF 66</div>
          </div>
          <FillBar pct={43} />
        </div>

        {deals.map(deal => (
          <FlashDealCard key={deal.id} deal={deal} onBook={() => onBookDeal(deal)} />
        ))}

        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>Genève → Annecy</div>
              <div style={{ fontSize: 12, color: '#888780' }}>07:30 · 2 sièges restants</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>CHF 25</div>
          </div>
          <FillBar pct={71} color="#EF4444" />
        </div>

        <div style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>Genève → Lyon</div>
              <div style={{ fontSize: 12, color: '#888780' }}>09:00 · 5 sièges</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>CHF 49</div>
          </div>
          <FillBar pct={29} color="#22C55E" />
        </div>
      </div>
    </div>
  );
};

// ── ONGLET TRIPS ─────────────────────────────────────────────
const TabTrips: React.FC = () => (
  <div style={{ padding: 16 }}>
    <SectionTitle>Mes réservations</SectionTitle>

    {/* Trajet actif */}
    <div style={{ background: DARK, borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>TRAJET EN COURS</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{MOCK_ACTIVE.route}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
        {MOCK_ACTIVE.date} · {MOCK_ACTIVE.time} · CHF 66
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {[{ label: 'Siège', value: MOCK_ACTIVE.seat, color: '#fff' }, { label: 'Statut', value: 'Confirmé', color: '#22C55E' }, { label: 'Réf.', value: MOCK_ACTIVE.ref, color: GOLD }].map(i => (
          <div key={i.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 7, padding: '7px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{i.label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: i.color }}>{i.value}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Historique */}
    <div style={{ fontSize: 11, fontWeight: 700, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Historique</div>
    {MOCK_HISTORY.map(h => (
      <div key={h.id} style={{ background: '#fff', border: '0.5px solid #E5E7EB', borderRadius: 11, padding: '10px 12px', marginBottom: 6, opacity: 0.7 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{h.route}</div>
            <div style={{ fontSize: 10, color: '#888780' }}>{h.date}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: '#1A1A1A' }}>CHF {h.price}</div>
            <div style={{ fontSize: 10, color: '#22C55E' }}>Complété</div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ── ONGLET PASS ──────────────────────────────────────────────
const TabPass: React.FC<{ onSubscribe: (plan: string) => void }> = ({ onSubscribe }) => (
  <div style={{ padding: 16 }}>
    <SectionTitle>Caby Pass</SectionTitle>

    {/* Abonnement actif */}
    <div style={{ background: '#FFFBEB', border: '0.5px solid #FDE68A', borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
      <div style={{ fontSize: 10, color: '#854F0B', marginBottom: 4 }}>ABONNEMENT ACTIF</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: '#633806', marginBottom: 2 }}>Pass Flex</div>
      <div style={{ fontSize: 12, color: '#854F0B', marginBottom: 12 }}>Toutes routes Grand Genève · CHF 449/mois</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ background: 'rgba(201,168,76,0.12)', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#854F0B' }}>Trajets ce mois</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#633806' }}>12</div>
        </div>
        <div style={{ background: 'rgba(201,168,76,0.12)', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#854F0B' }}>Renouvellement</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#633806' }}>27 mai</div>
        </div>
      </div>
    </div>

    <div style={{ fontSize: 12, fontWeight: 600, color: '#888780', marginBottom: 8 }}>Changer de formule</div>

    {[
      { id: 'essentiel', name: 'Essentiel', sub: '1 route fixe', price: 299, active: false },
      { id: 'flex', name: 'Flex', sub: 'Toutes routes Grand Genève', price: 449, active: true },
      { id: 'premium', name: 'Premium', sub: 'Ski + international', price: 599, active: false },
    ].map(plan => (
      <div
        key={plan.id}
        style={{
          background: '#fff',
          border: plan.active ? `1.5px solid ${GOLD}` : '0.5px solid #E5E7EB',
          borderRadius: 12, padding: '12px 14px', marginBottom: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: plan.active ? '#633806' : '#1A1A1A' }}>{plan.name}</div>
          <div style={{ fontSize: 11, color: plan.active ? '#854F0B' : '#888780' }}>{plan.sub}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: plan.active ? '#633806' : '#1A1A1A' }}>CHF {plan.price}/mois</div>
          {plan.active && (
            <div style={{ fontSize: 10, background: GOLD, color: '#fff', padding: '1px 7px', borderRadius: 6, display: 'inline-block', marginTop: 2 }}>Actif</div>
          )}
        </div>
      </div>
    ))}
  </div>
);

// ── ONGLET TRACKER ───────────────────────────────────────────
const TabTracker: React.FC = () => {
  const [progress, setProgress] = useState(35);
  useEffect(() => { const t = setTimeout(() => setProgress(42), 800); return () => clearTimeout(t); }, []);

  const statusConfig = {
    confirmed: { label: 'Confirmé', bg: '#F0FDF4', color: '#166534' },
    delayed:   { label: '⚡ Retard possible', bg: '#FEF3C7', color: '#92400E' },
    cancelled: { label: 'Annulé', bg: '#FEF2F2', color: '#991B1B' },
  };

  return (
    <div style={{ padding: 16 }}>
      <SectionTitle>Tracker</SectionTitle>

      {/* Trajet actif EN ROUTE */}
      <div style={{ background: DARK, borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', animation: 'cabyPulse 1.2s infinite' }} />
          <span style={{ fontSize: 10, color: '#22C55E', fontWeight: 700, letterSpacing: '0.4px' }}>EN ROUTE</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{MOCK_ACTIVE.route}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 12 }}>
          {MOCK_ACTIVE.date} {MOCK_ACTIVE.time} · Chauffeur {MOCK_ACTIVE.driver}
        </div>
        {/* Barre progression */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: GOLD, borderRadius: 2, transition: 'width 1.5s ease' }} />
          </div>
          <div style={{ width: 9, height: 9, borderRadius: 2, background: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Genève</span>
          <span style={{ fontSize: 10, color: GOLD, fontWeight: 600 }}>{MOCK_ACTIVE.etaLabel}</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Zurich</span>
        </div>
        {/* Infos chauffeur */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>AM</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{MOCK_ACTIVE.driver}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{MOCK_ACTIVE.driverScore}</div>
          </div>
          <div style={{ fontSize: 10, color: '#22C55E', background: 'rgba(34,197,94,0.15)', padding: '2px 8px', borderRadius: 8 }}>À l'heure</div>
        </div>
        <div style={{ background: 'rgba(34,197,94,0.12)', borderRadius: 7, padding: '6px 9px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5l2.5 2.5 5-5" stroke="#22C55E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ fontSize: 10, color: '#22C55E' }}>Départ à l'heure — aucune perturbation</span>
        </div>
      </div>

      {/* Trajets futurs */}
      <div style={{ fontSize: 11, fontWeight: 700, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Trajets à venir</div>

      {MOCK_UPCOMING.map(trip => {
        const cfg = statusConfig[trip.status];
        const isDelayed = trip.status === 'delayed';
        const isCancelled = trip.status === 'cancelled';
        return (
          <div
            key={trip.id}
            style={{
              background: isDelayed ? '#FFFBEB' : '#fff',
              border: isDelayed ? '0.5px solid #FDE68A' : isCancelled ? '0.5px solid #E5E7EB' : '0.5px solid #E5E7EB',
              borderRadius: 12, padding: '11px 13px', marginBottom: 7,
              opacity: isCancelled ? 0.5 : 1,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: isDelayed ? '#633806' : '#1A1A1A' }}>{trip.route}</div>
                <div style={{ fontSize: 10, color: isDelayed ? '#854F0B' : '#888780' }}>{trip.date} · {trip.time}</div>
              </div>
              <div style={{ background: cfg.bg, color: cfg.color, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 8 }}>
                {cfg.label}
              </div>
            </div>
            {isDelayed && trip.delayMsg && (
              <div style={{ fontSize: 10, color: '#92400E', marginBottom: 5 }}>{trip.delayMsg}</div>
            )}
            {!isCancelled && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: '#888780' }}>
                  {trip.daysUntil === 1 ? 'Dans 21h' : `Dans ${trip.daysUntil} jours`} · Siège {trip.seat}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>CHF {trip.price}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── DRAWER MENU ──────────────────────────────────────────────
const DrawerMenu: React.FC<{ isOpen: boolean; onClose: () => void; user: any; onSignOut: () => void }> = ({ isOpen, onClose, user, onSignOut }) => {
  const navigate = useNavigate();
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'CG';
  const menuItems = [
    { label: 'Mon profil', path: '/caby/account' },
    { label: 'Paiement & factures', path: '/caby/account/billing' },
    { label: 'Notifications', path: '/caby/account/notifications' },
    { label: 'Help & extras', path: '/caby/account/extras', gold: true },
    { label: 'Centre d\'aide', path: '/caby/help' },
    { label: 'Conditions générales', path: '/caby/legal/terms' },
    { label: 'Protection des données', path: '/caby/legal/privacy' },
    { label: 'Code de conduite', path: '/caby/legal/conduct' },
    { label: 'À propos de Caby', path: '/caby/about' },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }}
        />
      )}
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '72%', maxWidth: 280,
        background: '#fff', zIndex: 101,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s ease',
        display: 'flex', flexDirection: 'column',
        boxShadow: isOpen ? '-4px 0 20px rgba(0,0,0,0.15)' : 'none',
      }}>
        {/* Header */}
        <div style={{ background: DARK, padding: '48px 16px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Menu</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
        {/* User */}
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '0.5px solid #E5E7EB' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: GOLD }}>{initials}</span>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>
              {user?.user_metadata?.full_name || 'Mon compte'}
            </div>
            <div style={{ fontSize: 11, color: '#888780' }}>{user?.email || ''}</div>
          </div>
        </div>
        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {menuItems.map(item => (
            <button
              key={item.label}
              onClick={() => { navigate(item.path); onClose(); }}
              style={{
                width: '100%', padding: '11px 16px', background: 'none',
                border: 'none', borderBottom: '0.5px solid #F3F4F6',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: 13, color: item.gold ? GOLD : '#1A1A1A',
                fontWeight: item.gold ? 600 : 400, textAlign: 'left',
              }}
            >
              {item.label}
              <span style={{ color: '#888780', fontSize: 14 }}>›</span>
            </button>
          ))}
        </div>
        {/* Sign out */}
        <button
          onClick={onSignOut}
          style={{ padding: '14px 16px', background: 'none', border: 'none', borderTop: '0.5px solid #E5E7EB', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', fontSize: 13, color: '#EF4444' }}
        >
          Se déconnecter
        </button>
      </div>
    </>
  );
};

// ── PAGE PRINCIPALE ──────────────────────────────────────────
const CabyVanHome: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const deals = useFlashDeals();

  const handleSearch = useCallback((from: string, to: string, date: string) => {
    const p = new URLSearchParams({ from, to, date });
    navigate(`/caby/van/select?${p}`);
  }, [navigate]);

  const handleBookDeal = useCallback((deal: FlashDeal) => {
    const p = new URLSearchParams({
      from: deal.from, to: deal.to,
      date: deal.departureTime.toISOString().slice(0, 10),
      ...(deal.slotId ? { slotId: deal.slotId } : {}),
    });
    navigate(`/caby/van/select?${p}`);
  }, [navigate]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/auth/login');
  }, [signOut, navigate]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'book', label: 'Book' },
    { id: 'trips', label: 'Trips' },
    { id: 'pass', label: 'Pass' },
    { id: 'tracker', label: 'Tracker' },
  ];

  return (
    <>
      <style>{`
        @keyframes cabyPulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
        .caby-tab-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#F4F4F2', display: 'flex', flexDirection: 'column' }}>

        {/* TOPBAR pleine couleur gold style easyJet */}
        <div style={{
          background: GOLD,
          padding: '46px 18px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
            {activeTab === 'home' && 'Caby Van'}
            {activeTab === 'book' && 'Réserver'}
            {activeTab === 'trips' && 'Mes trajets'}
            {activeTab === 'pass' && 'Caby Pass'}
            {activeTab === 'tracker' && 'Tracker'}
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}
            aria-label="Menu"
          >
            <div style={{ width: 22, height: 2.5, background: '#fff', borderRadius: 2 }} />
            <div style={{ width: 22, height: 2.5, background: '#fff', borderRadius: 2 }} />
            <div style={{ width: 22, height: 2.5, background: '#fff', borderRadius: 2 }} />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }} className="caby-tab-scroll">
          {activeTab === 'home' && <TabHome deals={deals} onNavigate={setActiveTab} onBookDeal={handleBookDeal} />}
          {activeTab === 'book' && <TabBook onSearch={handleSearch} deals={deals} onBookDeal={handleBookDeal} />}
          {activeTab === 'trips' && <TabTrips />}
          {activeTab === 'pass' && <TabPass onSubscribe={(plan) => navigate(`/caby/van/pass?plan=${plan}`)} />}
          {activeTab === 'tracker' && <TabTracker />}
        </div>

        {/* BOTTOM NAV style easyJet : icône active colorée + label */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#fff',
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          paddingBottom: 'env(safe-area-inset-bottom)',
          zIndex: 50,
        }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 4, padding: '10px 0 8px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: isActive ? GOLD : '#9CA3AF',
                  fontFamily: 'inherit', transition: 'color 0.15s',
                }}
              >
                <span style={{ display: 'flex', color: 'currentColor' }}>
                  {icons[tab.id]}
                </span>
                <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? '#1A1A1A' : '#6B7280' }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* DRAWER */}
        <DrawerMenu
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          user={user}
          onSignOut={handleSignOut}
        />
      </div>
    </>
  );
};

export default CabyVanHome;
