import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GoogleMap, Circle, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { Wifi, WifiOff, Package, Locate, Car, TrendingUp, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { APP_CONFIG } from '@/config/app.config';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { useDriverMode } from '@/hooks/useDriverMode';
import { RadarCourse } from '@/types/radar.types';
import DriverBottomNav from '@/components/cabyDriver/DriverBottomNav';
import DriverDashboardSheet from '@/components/cabyDriver/DriverDashboardSheet';
import IncomingRideCard from '@/components/cabyDriver/IncomingRideCard';
import AcceptedRideOverlay from '@/components/cabyDriver/AcceptedRideOverlay';
import ActiveRidePanel from '@/components/cabyDriver/ActiveRidePanel';
import ModeSwitchSuggestion from '@/components/cabyDriver/ModeSwitchSuggestion';
import QueueToleranceOverlay from '@/components/cabyDriver/QueueToleranceOverlay';
import SOSButton from '@/components/cabyDriver/SOSButton';
import { type IncomingRide } from '@/components/cabyDriver/IncomingRideOverlay';
import {
  calculateVanViability,
  calculateDriverEarnings,
  shouldVanDepart,
  type RouteSegment,
} from '@/utils/cabyVanPricing';

const RADAR_RADIUS_M = 5000;
const GOLD = '#C9A84C';
const containerStyle: React.CSSProperties = { width: '100%', height: '100%', colorScheme: 'light' };

// ── A : Types pour les vans du jour ────────────────────────
interface VanMission {
  id: string;
  route: string;
  departureTime: Date;
  basePrice: number;
  seatsSold: number;
  totalSeats: number;
  segment: RouteSegment;
}

// ── A : Vans simulés pour le dashboard chauffeur ───────────
const getTodayVanMissions = (): VanMission[] => {
  const now = new Date();
  const h = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000);
  return [
    { id: 'vm-1', route: 'Genève → Zurich',   departureTime: h(2),  basePrice: 77, seatsSold: 5, totalSeats: 7, segment: 'business' },
    { id: 'vm-2', route: 'Genève → Annecy',   departureTime: h(6),  basePrice: 25, seatsSold: 2, totalSeats: 7, segment: 'frontalier' },
    { id: 'vm-3', route: 'Genève → Verbier',  departureTime: h(10), basePrice: 49, seatsSold: 4, totalSeats: 7, segment: 'ski' },
  ];
};

// ── A : Panneau revenus van ─────────────────────────────────
const VanEarningsPanel: React.FC<{ missions: VanMission[] }> = ({ missions }) => {
  const [expanded, setExpanded] = useState(false);

  const items = missions.map(m => {
    const viability   = calculateVanViability(m.basePrice, m.seatsSold, m.totalSeats, m.segment, m.departureTime);
    const earnings    = calculateDriverEarnings(m.basePrice, m.seatsSold, m.totalSeats, m.segment, m.departureTime, true);
    const departure   = shouldVanDepart(m.seatsSold, m.totalSeats, m.segment, m.departureTime);
    return { mission: m, viability, earnings, departure };
  });

  const totalGuaranteed = items.reduce((sum, i) => sum + i.earnings.finalDriverPayout, 0);

  return (
    <div style={{
      margin: '12px 16px 0',
      background: '#fff',
      borderRadius: 16,
      border: '1.5px solid #E0DDD5',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '12px 16px',
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp style={{ width: 16, height: 16, color: GOLD }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>
            Mes vans du jour
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#fff',
            background: GOLD, borderRadius: 20, padding: '2px 7px',
          }}>
            {missions.length}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#1A1A1A' }}>
            CHF {totalGuaranteed}
          </div>
          <div style={{ fontSize: 9, color: '#888780', fontWeight: 500 }}>
            garanti min.
          </div>
        </div>
      </button>

      {/* Détail par van */}
      {expanded && (
        <div style={{ borderTop: '1px solid #E0DDD5' }}>
          {items.map(({ mission, viability, earnings, departure }) => (
            <div key={mission.id} style={{
              padding: '10px 16px',
              borderBottom: '1px solid #F3F2EF',
            }}>
              {/* Route + heure */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>
                    {mission.route}
                  </div>
                  <div style={{ fontSize: 10, color: '#888780' }}>
                    {mission.departureTime.getHours().toString().padStart(2,'0')}:{mission.departureTime.getMinutes().toString().padStart(2,'0')} · {mission.seatsSold}/{mission.totalSeats} sièges
                  </div>
                </div>
                {/* Badge statut */}
                <div style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  background: viability.statusColor === 'green' ? '#DCFCE7'
                    : viability.statusColor === 'orange' ? '#FEF3C7' : '#FEE2E2',
                  color: viability.statusColor === 'green' ? '#166534'
                    : viability.statusColor === 'orange' ? '#92400E' : '#991B1B',
                }}>
                  {viability.statusColor === 'green' ? '✓ Rentable'
                    : viability.statusColor === 'orange' ? '⚡ Garantie Caby'
                    : '⚠️ Sous seuil'}
                </div>
              </div>

              {/* Barre de remplissage */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.round(viability.fillRate * 100)}%`,
                    background: viability.statusColor === 'green' ? '#22C55E'
                      : viability.statusColor === 'orange' ? GOLD : '#EF4444',
                    borderRadius: 2,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>

              {/* Revenus */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                <div style={{ textAlign: 'center', padding: '4px 0', background: '#F9F9F9', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#1A1A1A' }}>
                    CHF {earnings.grossRevenue}
                  </div>
                  <div style={{ fontSize: 9, color: '#888780' }}>Brut</div>
                </div>
                <div style={{ textAlign: 'center', padding: '4px 0', background: '#F9F9F9', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#EF4444' }}>
                    -CHF {earnings.cabyCommission}
                  </div>
                  <div style={{ fontSize: 9, color: '#888780' }}>
                    Com. {Math.round(earnings.cabyCommissionRate * 100)}%
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '4px 0', background: '#DCFCE7', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#166534' }}>
                    CHF {earnings.finalDriverPayout}
                  </div>
                  <div style={{ fontSize: 9, color: '#166534' }}>Net garanti</div>
                </div>
              </div>

              {/* Subvention Caby si applicable */}
              {viability.cabySubsidy > 0 && (
                <div style={{
                  marginTop: 6, padding: '4px 8px',
                  background: '#FFF7ED', borderRadius: 6,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Shield style={{ width: 10, height: 10, color: GOLD }} />
                  <span style={{ fontSize: 9, fontWeight: 600, color: '#92400E' }}>
                    Caby complète de CHF {viability.cabySubsidy} — garantie activée
                  </span>
                </div>
              )}

              {/* Bonus ponctualité */}
              {earnings.punctualityBonus > 0 && (
                <div style={{
                  marginTop: 4, padding: '4px 8px',
                  background: '#F0FDF4', borderRadius: 6,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Zap style={{ width: 10, height: 10, color: '#22C55E' }} />
                  <span style={{ fontSize: 9, fontWeight: 600, color: '#166534' }}>
                    +CHF {earnings.punctualityBonus} bonus ponctualité inclus
                  </span>
                </div>
              )}

              {/* Message action Caby */}
              {!departure.shouldDepart && (
                <div style={{
                  marginTop: 6, padding: '4px 8px',
                  background: '#FEF3C7', borderRadius: 6,
                }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: '#92400E' }}>
                    💡 {departure.cabyAction}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Total récap */}
          <div style={{ padding: '10px 16px', background: '#F9F8F5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#888780' }}>
                Total garanti aujourd'hui
              </span>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#1A1A1A' }}>
                CHF {totalGuaranteed}
              </span>
            </div>
            <div style={{ fontSize: 9, color: '#888780', marginTop: 2 }}>
              Hors bonus ponctualité et courses privées
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Partner points (inchangé) ───────────────────────────────
interface PartnerPoint {
  id: string; name: string; address: string; lat: number; lng: number;
  type: 'express' | 'laundry' | 'health'; emoji: string;
}

const PARTNER_POINTS: PartnerPoint[] = [
  { id: 'ex1', name: 'Caby Express — Cornavin', address: 'Pl. de Cornavin 7', lat: 46.2101, lng: 6.1427, type: 'express', emoji: '📦' },
  { id: 'ex2', name: 'Caby Express — Plainpalais', address: 'Bd Georges-Favon 24', lat: 46.2003, lng: 6.1420, type: 'express', emoji: '📦' },
  { id: 'ex3', name: 'Caby Express — Eaux-Vives', address: 'Rue de la Terrassière 12', lat: 46.2023, lng: 6.1610, type: 'express', emoji: '📦' },
  { id: 'la1', name: 'Caby Laundry — Carouge', address: 'Rue St-Joseph 10', lat: 46.1850, lng: 6.1396, type: 'laundry', emoji: '👕' },
  { id: 'la2', name: 'Caby Laundry — Servette', address: 'Rue de la Servette 45', lat: 46.2130, lng: 6.1310, type: 'laundry', emoji: '👕' },
  { id: 'he1', name: 'Caby Health — HUG', address: 'Rue Gabrielle-Perret-Gentil 4', lat: 46.1935, lng: 6.1490, type: 'health', emoji: '🏥' },
  { id: 'he2', name: 'Caby Health — Champel', address: 'Av. de Champel 25', lat: 46.1920, lng: 6.1560, type: 'health', emoji: '🏥' },
];

const MARKER_COLORS: Record<PartnerPoint['type'], string> = { express: '#F97316', laundry: '#3B82F6', health: '#EF4444' };

const createPartnerIcon = (type: PartnerPoint['type'], emoji: string): string => {
  const c = MARKER_COLORS[type];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50"><path d="M20 48 C20 48 2 30 2 18 C2 8 10 0 20 0 S38 8 38 18 C38 30 20 48 20 48Z" fill="${c}" stroke="white" stroke-width="2"/><text x="20" y="22" text-anchor="middle" font-size="16">${emoji}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const createDriverCarIcon = (heading: number = 0): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000" flood-opacity="0.35"/>
      </filter>
      <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#D4B45C"/>
        <stop offset="50%" stop-color="#C9A84C"/>
        <stop offset="100%" stop-color="#A8893A"/>
      </linearGradient>
      <linearGradient id="windshield" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a1a2e"/>
        <stop offset="100%" stop-color="#2d2d44"/>
      </linearGradient>
    </defs>
    <g transform="rotate(${heading}, 24, 24)" filter="url(#shadow)">
      <rect x="14" y="6" width="20" height="36" rx="8" ry="8" fill="url(#carBody)" stroke="#B8993F" stroke-width="0.8"/>
      <rect x="16.5" y="16" width="15" height="14" rx="4" ry="4" fill="url(#windshield)" opacity="0.9"/>
      <rect x="17.5" y="12" width="13" height="6" rx="3" ry="2" fill="url(#windshield)" opacity="0.85"/>
      <rect x="17.5" y="30" width="13" height="5" rx="3" ry="2" fill="url(#windshield)" opacity="0.75"/>
      <rect x="16" y="7" width="5" height="2.5" rx="1" fill="#FFF8DC" opacity="0.95"/>
      <rect x="27" y="7" width="5" height="2.5" rx="1" fill="#FFF8DC" opacity="0.95"/>
      <rect x="16" y="38.5" width="5" height="2" rx="1" fill="#E74C3C" opacity="0.85"/>
      <rect x="27" y="38.5" width="5" height="2" rx="1" fill="#E74C3C" opacity="0.85"/>
      <ellipse cx="12.5" cy="18" rx="2" ry="1.2" fill="#C9A84C" stroke="#B8993F" stroke-width="0.4"/>
      <ellipse cx="35.5" cy="18" rx="2" ry="1.2" fill="#C9A84C" stroke="#B8993F" stroke-width="0.4"/>
    </g>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// ── DEMO DATA (inchangé) ────────────────────────────────────
const makeMeta = (source: string, sujet: string, desc: string) => ({
  date: new Date().toISOString(), source: source as any, sujet, lien: '', description: desc, eligible: true,
});

const DEMO_COURSES: RadarCourse[] = [
  { id: 'p1', type: 'private_client', source: 'qr_code', clientDisplayName: 'Sophie Laurent', clientIsProtected: false, clientRating: 4.9, clientAvatarUrl: undefined as unknown as string, pickupAddress: 'Rue du Rhône 48, Genève', pickupLat: 46.2017, pickupLng: 6.1468, dropoffAddress: 'Aéroport de Genève (GVA)', dropoffLat: 46.2381, dropoffLng: 6.1089, estimatedPrice: 72, estimatedDistance: 12.4, estimatedDuration: 18, vehicleTypeRequired: 'premium', expiresAt: new Date(), createdAt: new Date(), meta: makeMeta('qr_code', 'Course privée', 'Client QR') },
  { id: 'p2', type: 'private_client', source: 'qr_code', clientDisplayName: 'Marc Dupont', clientIsProtected: false, clientRating: 4.7, clientAvatarUrl: undefined as unknown as string, pickupAddress: 'Place Bel-Air, Genève', pickupLat: 46.2022, pickupLng: 6.1430, dropoffAddress: 'Hôpital Universitaire (HUG)', dropoffLat: 46.1929, dropoffLng: 6.1496, estimatedPrice: 18, estimatedDistance: 2.8, estimatedDuration: 7, vehicleTypeRequired: 'standard', expiresAt: new Date(), createdAt: new Date(), meta: makeMeta('qr_code', 'Course privée', 'Client fidèle') },
  { id: 'p3', type: 'private_client', source: 'phone', clientDisplayName: 'Émilie Favre', clientIsProtected: false, clientRating: 5.0, clientAvatarUrl: undefined as unknown as string, clientNote: 'VIP — Hôtel Président Wilson', pickupAddress: 'Hôtel Président Wilson, Quai Wilson', pickupLat: 46.2130, pickupLng: 6.1560, dropoffAddress: 'Centre commercial Balexert', dropoffLat: 46.2190, dropoffLng: 6.1100, estimatedPrice: 35, estimatedDistance: 6.1, estimatedDuration: 14, vehicleTypeRequired: 'premium', expiresAt: new Date(), createdAt: new Date(), meta: makeMeta('phone', 'Course privée', 'VIP') },
  { id: 'p4', type: 'private_client', source: 'qr_code', clientDisplayName: 'Jean-Pierre Morel', clientIsProtected: false, clientRating: 4.6, clientAvatarUrl: undefined as unknown as string, pickupAddress: 'Gare de Cornavin, Genève', pickupLat: 46.2100, pickupLng: 6.1420, dropoffAddress: 'Palexpo, Grand-Saconnex', dropoffLat: 46.2335, dropoffLng: 6.1120, estimatedPrice: 28, estimatedDistance: 5.3, estimatedDuration: 11, vehicleTypeRequired: 'standard', expiresAt: new Date(), createdAt: new Date(), meta: makeMeta('qr_code', 'Course privée', 'Client habituel') },
  { id: 'p5', type: 'private_client', source: 'qr_code', clientDisplayName: 'Nadia Benali', clientIsProtected: false, clientRating: 4.8, clientAvatarUrl: undefined as unknown as string, pickupAddress: 'Rue de la Servette 72, Genève', pickupLat: 46.2140, pickupLng: 6.1340, dropoffAddress: 'ONU — Palais des Nations', dropoffLat: 46.2265, dropoffLng: 6.1400, estimatedPrice: 22, estimatedDistance: 3.6, estimatedDuration: 9, vehicleTypeRequired: 'standard', expiresAt: new Date(), createdAt: new Date(), meta: makeMeta('qr_code', 'Course privée', 'Client régulier') },
  { id: 'g1', type: 'caby_direct', source: 'caby_app', clientDisplayName: 'Thomas R.', clientIsProtected: false, clientRating: 4.5, clientAvatarUrl: undefined as unknown as string, pickupAddress: 'Plainpalais, Genève', pickupLat: 46.1967, pickupLng: 6.1420, dropoffAddress: 'Carouge, Place du Marché', dropoffLat: 46.1835, dropoffLng: 6.1395, estimatedPrice: 15, estimatedDistance: 2.1, estimatedDuration: 6, vehicleTypeRequired: 'standard', expiresAt: new Date(), createdAt: new Date(), meta: makeMeta('caby_app', 'Caby Ride', 'Pool général') },
  { id: 'g2', type: 'caby_direct', source: 'caby_app', clientDisplayName: 'Laura M.', clientIsProtected: false, clientRating: 4.3, clientAvatarUrl: undefined as unknown as string, pickupAddress: 'Eaux-Vives, Genève', pickupLat: 46.2020, pickupLng: 6.1630, dropoffAddress: 'Champel, Av. de Champel 45', dropoffLat: 46.1910, dropoffLng: 6.1530, estimatedPrice: 19, estimatedDistance: 3.2, estimatedDuration: 8, vehicleTypeRequired: 'standard', expiresAt: new Date(), createdAt: new Date(), meta: makeMeta('caby_app', 'Caby Ride', 'Pool général') },
  { id: 'g3', type: 'caby_direct', source: 'caby_app', clientDisplayName: 'Ahmed K.', clientIsProtected: false, clientRating: 4.1, clientAvatarUrl: undefined as unknown as string, pickupAddress: 'Jonction, Bd Carl-Vogt', pickupLat: 46.1980, pickupLng: 6.1350, dropoffAddress: 'Vernier, Route de Meyrin 150', dropoffLat: 46.2170, dropoffLng: 6.0900, estimatedPrice: 25, estimatedDistance: 5.8, estimatedDuration: 13, vehicleTypeRequired: 'standard', expiresAt: new Date(), createdAt: new Date(), meta: makeMeta('caby_app', 'Caby Ride', 'Pool général') },
  { id: 'g4', type: 'caby_direct', source: 'caby_app', clientDisplayName: 'Isabelle C.', clientIsProtected: false, clientRating: 4.8, clientAvatarUrl: undefined as unknown as string, pickupAddress: 'Pâquis, Rue de Berne 12', pickupLat: 46.2110, pickupLng: 6.1480, dropoffAddress: 'Lancy, Ch. des Palettes 18', dropoffLat: 46.1820, dropoffLng: 6.1190, estimatedPrice: 32, estimatedDistance: 6.9, estimatedDuration: 15, vehicleTypeRequired: 'standard', expiresAt: new Date(), createdAt: new Date(), meta: makeMeta('caby_app', 'Caby Ride', 'Pool général') },
  { id: 'g5', type: 'caby_direct', source: 'caby_app', clientDisplayName: 'Nicolas B.', clientIsProtected: false, clientRating: 4.4, clientAvatarUrl: undefined as unknown as string, pickupAddress: 'Acacias, Rue des Acacias', pickupLat: 46.1920, pickupLng: 6.1330, dropoffAddress: 'Thônex, Rue de Genève 60', dropoffLat: 46.1950, dropoffLng: 6.1980, estimatedPrice: 28, estimatedDistance: 7.5, estimatedDuration: 17, vehicleTypeRequired: 'standard', expiresAt: new Date(), createdAt: new Date(), meta: makeMeta('caby_app', 'Caby Ride', 'Pool général') },
];

const DEMO_RIDE: IncomingRide = {
  id: 'sim-1', clientName: 'Sophie Müller',
  clientPhoto: undefined as unknown as string,
  pickupAddress: 'Gare des Eaux-Vives, Genève', pickupLat: 46.1985, pickupLng: 6.1615,
  dropoffAddress: 'Chemin du Rail 5, La Plaine, Dardagny', dropoffLat: 46.1780, dropoffLng: 6.0053,
  distanceFromDriver: 0.8, estimatedPrice: 52, serviceType: 'standard', estimatedDuration: 25, estimatedDistance: 18.6,
};

// ── PAGE PRINCIPALE ─────────────────────────────────────────
const DriverDashboardPage: React.FC = () => {
  const { isLoaded, loadError } = useGoogleMaps();
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(false);
  const driverMode = useDriverMode(isOnline);
  const isColisMode = driverMode.mode === 'colis';
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [driverHeading, setDriverHeading] = useState(0);
  const [mapZoom, setMapZoom] = useState(14);
  const prevPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const [hasMoved, setHasMoved] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<PartnerPoint | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [todayEarnings, setTodayEarnings] = useState(145);
  const [missionsCount] = useState(3);
  const [incomingRide, setIncomingRide] = useState<IncomingRide | null>(null);
  const [activeRide, setActiveRide] = useState<IncomingRide | null>(null);
  const [incomingCourses, setIncomingCourses] = useState<RadarCourse[]>([]);
  const [acceptedCourse, setAcceptedCourse] = useState<RadarCourse | null>(null);

  // A : Vans du jour
  const vanMissions = useMemo(() => getTodayVanMissions(), []);

  const mapRef = useRef<google.maps.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const simTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => setPosition({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setPosition(APP_CONFIG.DEFAULT_CENTER),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (!isOnline) {
      if (watchIdRef.current !== null) { clearInterval(watchIdRef.current); watchIdRef.current = null; }
      return;
    }
    const update = () => {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const newPos = { lat: p.coords.latitude, lng: p.coords.longitude };
          if (prevPositionRef.current) {
            const dLat = newPos.lat - prevPositionRef.current.lat;
            const dLng = newPos.lng - prevPositionRef.current.lng;
            if (Math.abs(dLat) > 0.00001 || Math.abs(dLng) > 0.00001) {
              const angle = (Math.atan2(dLng, dLat) * 180) / Math.PI;
              setDriverHeading(angle < 0 ? angle + 360 : angle);
            }
          }
          prevPositionRef.current = newPos;
          setPosition(newPos);
        },
        () => {}, { enableHighAccuracy: true, timeout: 8000 }
      );
    };
    const id = window.setInterval(update, APP_CONFIG.GPS_UPDATE_INTERVAL_MS);
    watchIdRef.current = id;
    return () => { clearInterval(id); watchIdRef.current = null; };
  }, [isOnline]);

  useEffect(() => {
    if (isOnline && incomingCourses.length === 0 && !activeRide && !acceptedCourse && driverMode.mode === 'ride') {
      simTimerRef.current = setTimeout(() => {
        const shuffled = [...DEMO_COURSES]
          .sort(() => Math.random() - 0.5)
          .map(c => ({
            ...c,
            expiresAt: new Date(Date.now() + (c.type === 'private_client' ? 30000 : 20000)),
            createdAt: new Date(),
          }));
        setIncomingCourses(shuffled);
      }, 3000);
    }
    return () => { if (simTimerRef.current) clearTimeout(simTimerRef.current); };
  }, [isOnline, incomingCourses.length, activeRide, acceptedCourse, driverMode.mode]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (position) map.panTo(position);
  }, [position]);

  const handleRecenter = useCallback(() => {
    if (mapRef.current && position) {
      mapRef.current.panTo(position);
      mapRef.current.setZoom(14);
      setHasMoved(false);
    }
  }, [position]);

  const toggleOnline = () => {
    const next = !isOnline;
    setIsOnline(next);
    if (!next) { setIncomingCourses([]); setIncomingRide(null); }
    toast[next ? 'success' : 'info'](next ? 'Radar activé' : 'Radar désactivé', {
      description: next ? 'Vous recevrez les courses à proximité' : undefined,
    });
  };

  const toggleColisMode = () => {
    if (driverMode.mode === 'ride') { navigate('/caby/driver/colis'); return; }
    driverMode.toggleMode();
    setSelectedPoint(null);
  };

  const handleCourseAccept = useCallback((courseId: string) => {
    const course = incomingCourses.find(c => c.id === courseId);
    if (!course) return;
    setIncomingCourses(prev => prev.filter(c => c.id !== courseId));
    setAcceptedCourse(course);
    if (mapRef.current) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: course.pickupLat, lng: course.pickupLng });
      bounds.extend({ lat: course.dropoffLat, lng: course.dropoffLng });
      if (position) bounds.extend(position);
      mapRef.current.fitBounds(bounds, { top: 60, bottom: 280, left: 40, right: 40 });
    }
  }, [incomingCourses, position]);

  const handleCourseRefuse = useCallback((courseId: string) => {
    setIncomingCourses(prev => prev.filter(c => c.id !== courseId));
    toast.info('Course refusée — passée au chauffeur suivant');
  }, []);

  const handleCourseShareToClub = useCallback((courseId: string) => {
    const course = incomingCourses.find(c => c.id === courseId);
    if (!course) return;
    const members = Math.floor(Math.random() * 8) + 3;
    toast.success('Envoyé à votre Club', {
      description: `${members} membres notifiés · Rétrocession ${(course.estimatedPrice * 0.10).toFixed(0)} ${APP_CONFIG.DEFAULT_CURRENCY}`,
      icon: '🏆',
    });
    setIncomingCourses(prev => prev.filter(c => c.id !== courseId));
  }, [incomingCourses]);

  const handleCourseExpire = useCallback((courseId: string) => {
    const course = incomingCourses.find(c => c.id === courseId);
    setIncomingCourses(prev => prev.filter(c => c.id !== courseId));
    if (course?.type === 'private_client') {
      toast.info('Course client privé redistribuée au Club', { icon: '🔄' });
    } else {
      toast.info('Course transmise au chauffeur suivant');
    }
  }, [incomingCourses]);

  const handleAcceptedComplete = useCallback(() => {
    if (acceptedCourse) setTodayEarnings(prev => prev + acceptedCourse.estimatedPrice);
    setAcceptedCourse(null);
  }, [acceptedCourse]);

  const handleAcceptRide = useCallback((id: string) => {
    if (incomingRide) setActiveRide(incomingRide);
    setIncomingRide(null);
    toast.success('Course acceptée !', { description: 'Navigation vers le client…' });
  }, [incomingRide]);

  const handleRideArrived = useCallback(() => { toast.success('Client notifié de votre arrivée'); }, []);

  const handleRideComplete = useCallback((price: number) => {
    setActiveRide(null);
    setTodayEarnings((prev) => prev + price);
    toast.success('Gains mis à jour !');
    setTimeout(() => driverMode.checkModeSuggestion(), 3000);
  }, [driverMode]);

  const triggerSimulation = useCallback(() => {
    if (!isOnline) { setIsOnline(true); toast.success('Radar activé'); }
    const shuffled = [...DEMO_COURSES]
      .sort(() => Math.random() - 0.5)
      .map(c => ({
        ...c,
        expiresAt: new Date(Date.now() + (c.type === 'private_client' ? 30000 : 20000)),
        createdAt: new Date(),
      }));
    setIncomingCourses(shuffled);
  }, [isOnline]);

  const handleRefuseRide = useCallback((id: string) => { setIncomingRide(null); toast.info('Course refusée'); }, []);
  const handleExpireRide = useCallback((id: string) => { setIncomingRide(null); toast.info('Temps écoulé — course transmise au chauffeur suivant'); }, []);

  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-20 px-6 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-lg font-bold text-foreground mb-2">Erreur Google Maps</h2>
        <p className="text-sm text-muted-foreground">{loadError.message}</p>
        <DriverBottomNav />
      </div>
    );
  }

  if (!isLoaded || !position) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="text-2xl mb-3 animate-pulse">🗺️</div>
          <div className="text-muted-foreground text-sm">
            {!isLoaded ? 'Chargement de Google Maps…' : 'Localisation en cours…'}
          </div>
        </div>
        <DriverBottomNav />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col">
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={position}
          zoom={14}
          onLoad={onMapLoad}
          onDragEnd={() => setHasMoved(true)}
          onZoomChanged={() => { if (mapRef.current) setMapZoom(mapRef.current.getZoom() || 14); }}
          options={{
            disableDefaultUI: true, zoomControl: false, gestureHandling: 'greedy',
            styles: [
              { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
              { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
            ],
          }}
        >
          {(() => {
            const size = mapZoom >= 18 ? 64 : mapZoom >= 16 ? 56 : mapZoom >= 14 ? 48 : mapZoom >= 12 ? 40 : 32;
            return (
              <Marker position={position} icon={{ url: createDriverCarIcon(driverHeading), scaledSize: new google.maps.Size(size, size), anchor: new google.maps.Point(size / 2, size / 2) }} zIndex={999} />
            );
          })()}

          {isOnline && !acceptedCourse && (
            <Circle center={position} radius={RADAR_RADIUS_M} options={{ fillColor: '#22C55E', fillOpacity: 0.06, strokeColor: '#22C55E', strokeOpacity: 0.3, strokeWeight: 2 }} />
          )}

          {acceptedCourse && (
            <>
              <Marker position={{ lat: acceptedCourse.pickupLat, lng: acceptedCourse.pickupLng }}
                icon={{ url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46"><path d="M18 44C18 44 2 28 2 16C2 7.2 9.2 0 18 0S34 7.2 34 16C34 28 18 44 18 44Z" fill="#22C55E" stroke="white" stroke-width="2"/><circle cx="18" cy="16" r="6" fill="white"/><text x="18" y="20" text-anchor="middle" font-size="10" font-weight="bold" fill="#22C55E">A</text></svg>')}`, scaledSize: new google.maps.Size(36, 46), anchor: new google.maps.Point(18, 46) }} zIndex={100} />
              <Marker position={{ lat: acceptedCourse.dropoffLat, lng: acceptedCourse.dropoffLng }}
                icon={{ url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46"><path d="M18 44C18 44 2 28 2 16C2 7.2 9.2 0 18 0S34 7.2 34 16C34 28 18 44 18 44Z" fill="#EF4444" stroke="white" stroke-width="2"/><circle cx="18" cy="16" r="6" fill="white"/><text x="18" y="20" text-anchor="middle" font-size="10" font-weight="bold" fill="#EF4444">B</text></svg>')}`, scaledSize: new google.maps.Size(36, 46), anchor: new google.maps.Point(18, 46) }} zIndex={100} />
              <Polyline path={[{ lat: acceptedCourse.pickupLat, lng: acceptedCourse.pickupLng }, { lat: acceptedCourse.dropoffLat, lng: acceptedCourse.dropoffLng }]} options={{ strokeColor: '#3B82F6', strokeOpacity: 0.9, strokeWeight: 5, geodesic: true }} />
            </>
          )}

          {isColisMode && PARTNER_POINTS.map((pt) => (
            <Marker key={pt.id} position={{ lat: pt.lat, lng: pt.lng }} icon={{ url: createPartnerIcon(pt.type, pt.emoji), scaledSize: new google.maps.Size(36, 45), anchor: new google.maps.Point(18, 45) }} onClick={() => setSelectedPoint(pt)} zIndex={10} />
          ))}

          {selectedPoint && (
            <InfoWindow position={{ lat: selectedPoint.lat, lng: selectedPoint.lng }} onCloseClick={() => setSelectedPoint(null)} options={{ pixelOffset: new google.maps.Size(0, -45) }}>
              <div style={{ padding: '4px 2px', minWidth: 180 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{selectedPoint.emoji} {selectedPoint.name}</div>
                <div style={{ fontSize: 11, color: '#666' }}>{selectedPoint.address}</div>
                <div style={{ marginTop: 6, fontSize: 10, fontWeight: 600, color: MARKER_COLORS[selectedPoint.type], textTransform: 'uppercase' }}>
                  {selectedPoint.type === 'express' && 'Caby Express · Colis'}
                  {selectedPoint.type === 'laundry' && 'Caby Laundry · Pressing'}
                  {selectedPoint.type === 'health' && 'Health Logistix · Labo'}
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {!acceptedCourse && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20">
            <button onClick={toggleOnline} className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg backdrop-blur-md border transition-all active:scale-95 ${isOnline ? 'bg-[hsl(var(--caby-green))]/90 border-[hsl(var(--caby-green))]/50 text-white' : 'bg-white/90 border-gray-200 text-gray-600'}`}>
              {isOnline ? (<><Wifi className="w-4 h-4" /><span className="text-sm font-bold">EN LIGNE</span><span className="w-2 h-2 rounded-full bg-white animate-pulse" /></>) : (<><WifiOff className="w-4 h-4" /><span className="text-sm font-bold">HORS LIGNE</span></>)}
            </button>
          </div>
        )}

        {isOnline && !acceptedCourse && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20">
            <span className="text-[10px] font-semibold text-green-700 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-green-300 shadow-sm">
              🟢 Zone active · 5 km
            </span>
          </div>
        )}

        {!acceptedCourse && (
          <div className="absolute top-14 right-4 z-20">
            <button onClick={toggleColisMode} className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full shadow-lg backdrop-blur-md border transition-all active:scale-95 ${isColisMode ? 'bg-[hsl(var(--caby-gold))] border-[hsl(var(--caby-gold))]/50 text-black' : 'bg-card/90 border-border text-muted-foreground'}`}>
              {isColisMode ? <Package className="w-4 h-4" /> : <Car className="w-4 h-4" />}
              <span className="text-xs font-bold">{isColisMode ? 'Colis' : 'Ride'}</span>
            </button>
          </div>
        )}

        {isColisMode && !acceptedCourse && (
          <div className="absolute top-28 right-4 z-20 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-3 space-y-1.5 border border-gray-200">
            <div className="flex items-center gap-2 text-[11px] font-medium text-gray-700"><span className="w-3 h-3 rounded-full bg-orange-500" /> Express</div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-gray-700"><span className="w-3 h-3 rounded-full bg-blue-500" /> Laundry</div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-gray-700"><span className="w-3 h-3 rounded-full bg-red-500" /> Health</div>
          </div>
        )}

        {hasMoved && !acceptedCourse && (
          <button onClick={handleRecenter} className="absolute bottom-[300px] right-4 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg flex items-center justify-center active:scale-95 transition-transform">
            <Locate className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* A : Panneau vans du jour — affiché quand le sheet n'est pas expanded */}
        {!acceptedCourse && !sheetExpanded && (
          <div className="absolute bottom-[220px] left-0 right-0 z-20 pointer-events-none">
            <div className="pointer-events-auto">
              <VanEarningsPanel missions={vanMissions} />
            </div>
          </div>
        )}

        {!acceptedCourse && (
          <DriverDashboardSheet
            isOnline={isOnline}
            isColisMode={isColisMode}
            missionsCount={isOnline ? missionsCount : 0}
            todayEarnings={todayEarnings}
            dailyGoal={400}
            expanded={sheetExpanded}
            onToggleExpand={() => setSheetExpanded((v) => !v)}
            onViewMissions={() => navigate('/caby/driver/colis')}
          />
        )}

        {!activeRide && !incomingRide && incomingCourses.length === 0 && !acceptedCourse && (
          <button onClick={triggerSimulation} className="absolute bottom-20 left-4 z-30 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border text-[10px] font-mono text-muted-foreground active:scale-95 transition-transform">
            🧪 Simuler courses
          </button>
        )}
      </div>

      <DriverBottomNav />

      <AnimatePresence>
        {incomingCourses.length > 0 && !acceptedCourse && (
          <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-3" style={{ height: '420px' }}>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-50">
              <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                {incomingCourses.length} course{incomingCourses.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="relative w-full h-full">
              {incomingCourses.slice(0, 3).map((course, index) => (
                <IncomingRideCard key={course.id} course={course} isPrivateClient={course.type === 'private_client'} isTop={index === 0} index={index} onAccept={handleCourseAccept} onRefuse={handleCourseRefuse} onShareToClub={handleCourseShareToClub} onExpire={handleCourseExpire} />
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {acceptedCourse && <AcceptedRideOverlay course={acceptedCourse} onComplete={handleAcceptedComplete} />}
      </AnimatePresence>

      {activeRide && position && (
        <ActiveRidePanel ride={activeRide} driverPosition={position} driverMode={driverMode.mode} simulate onArrived={handleRideArrived} onComplete={handleRideComplete} onCancel={() => { setActiveRide(null); toast.info('Course annulée'); }} onSimulatedPositionChange={(pos) => setPosition(pos)} onAcceptNextMission={(mission) => { driverMode.acceptQueuedMission(mission); toast.success('Mission suivante réservée !'); }} />
      )}

      <AnimatePresence>
        {driverMode.toleranceState && <QueueToleranceOverlay state={driverMode.toleranceState} mission={driverMode.queuedMission} onConfirm={driverMode.confirmQueuedMission} onDismiss={driverMode.clearQueuedMission} />}
      </AnimatePresence>

      <AnimatePresence>
        {driverMode.modeSuggestion && !activeRide && !incomingRide && <ModeSwitchSuggestion targetMode={driverMode.modeSuggestion.targetMode} message={driverMode.modeSuggestion.message} detail={driverMode.modeSuggestion.detail} onAccept={driverMode.acceptSuggestion} onDismiss={driverMode.dismissSuggestion} />}
      </AnimatePresence>

      {isOnline && <SOSButton />}
    </div>
  );
};

export default DriverDashboardPage;
