import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { generateNearbyDrivers } from '@/lib/simulatedDrivers';
import { useMapAlerts } from '@/hooks/useMapAlerts';
import BottomNav from '@/components/rider/BottomNav';
import DriverOfMonthBanner from '@/components/shared/DriverOfMonthBanner';
import {
  Search, Car, Zap, Ambulance, Package, Bike, Building2,
  ChevronRight, MapPin, ShieldCheck, Truck, Heart
} from 'lucide-react';

const modeFilters = [
  { id: 'vtc', label: 'VTC', icon: Car },
  { id: 'express', label: 'Express', icon: Package },
  { id: 'sante', label: 'Santé', icon: Heart },
] as const;

const quickServices = [
  { id: 'moto', icon: Zap, title: 'Caby Moto', desc: 'Le plus rapide', badge: 'Rapide & Hygiénique', route: '/caby/search' },
  { id: 'care', icon: Ambulance, title: 'Caby Care', desc: 'Transport médical', badge: 'Certifié', route: '/caby/search' },
  { id: 'express', icon: Package, title: 'Caby Express', desc: 'Livraison colis', badge: 'Express 30 min', route: '/caby/express' },
  { id: 'tricycle', icon: Bike, title: 'Caby Tricycle', desc: 'Hyper-centre écolo', route: '/caby/search' },
  { id: 'ride', icon: Car, title: 'Caby Ride', desc: 'Course classique', badge: 'Populaire', route: '/caby/search' },
  { id: 'business', icon: Building2, title: 'Caby School/Pro', desc: 'Institutions & PME', route: '/caby/search' },
];

const RiderHome: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { latitude, longitude, loading } = useGeolocation();
  const { alerts } = useMapAlerts();

  const nearbyDrivers = useMemo(() => {
    if (latitude && longitude) return generateNearbyDrivers(latitude, longitude, 5);
    return [];
  }, [latitude, longitude]);

  const firstName = profile?.full_name?.split(' ')[0] || 'Passager';
  const driverCount = nearbyDrivers.length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Bonjour {firstName} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          On va chez <span className="text-primary font-medium">Talent Access Technologies SA</span> ?
        </p>
      </div>

      {/* Search bar */}
      <div className="px-5 mt-3">
        <button
          onClick={() => navigate('/caby/search')}
          className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-4 hover:border-primary/30 transition-colors"
        >
          <Search className="w-5 h-5 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">Où allez-vous ?</span>
        </button>
      </div>

      {/* Mode selector */}
      <div className="px-5 mt-5">
        <div className="flex gap-2">
          {modeFilters.map((mode, i) => (
            <button
              key={mode.id}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                i === 0
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground hover:border-primary/30'
              }`}
            >
              <mode.icon className="w-4 h-4" />
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mini map / driver count */}
      <div className="px-5 mt-5">
        <div className="relative bg-card border border-border rounded-2xl overflow-hidden h-28 flex items-center justify-between px-5">
          {/* Decorative radar circles */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
            <div className="w-24 h-24 rounded-full border border-primary" />
            <div className="absolute inset-2 rounded-full border border-primary/60" />
            <div className="absolute inset-5 rounded-full border border-primary/30" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--caby-green))] pulse-glow-green" />
              <span className="text-xs font-semibold text-[hsl(var(--caby-green))]">
                {loading ? '...' : `${driverCount} chauffeurs à proximité`}
              </span>
            </div>
            <p className="text-lg font-bold">Genève · Rive Droite</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {latitude ? `${latitude.toFixed(4)}, ${longitude?.toFixed(4)}` : 'Localisation...'}
            </p>
          </div>
          <MapPin className="w-8 h-8 text-primary relative z-10" />
        </div>
      </div>

      {/* Service grid */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Services
          </h2>
          <button
            onClick={() => navigate('/caby/services')}
            className="text-xs text-primary font-semibold flex items-center gap-1"
          >
            Tout voir <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {quickServices.map((s) => (
            <button
              key={s.id}
              onClick={() => s.route && navigate(s.route)}
              className="flex flex-col items-start gap-3 bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-bold text-sm">{s.title}</p>
                  {s.badge && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary leading-none">
                      {s.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Driver of the Month */}
      <div className="px-5 mt-5">
        <DriverOfMonthBanner
          driverName="Moussa D."
          city="Genève"
          month={new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date())}
        />
      </div>

      {/* Trust banner */}
      <div className="px-5 mt-5">
        <div className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4">
          <ShieldCheck className="w-7 h-7 text-primary flex-shrink-0" />
          <div>
            <p className="font-bold text-xs">Tous nos chauffeurs sont certifiés TATFleet</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Salariés · Assurés · Conformes LTVTC Genève
            </p>
          </div>
        </div>
      </div>

      {/* Footer branding */}
      <div className="text-center mt-6 mb-4">
        <p className="text-[9px] text-muted-foreground/40 tracking-widest uppercase">
          TATFleet LSE Certified · ENCRYPTED_STREAM_V2_ACTIVE
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default RiderHome;
