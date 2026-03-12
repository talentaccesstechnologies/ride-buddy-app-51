import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, X, Car, Bike, Truck, Users, Star } from 'lucide-react';

export interface IncomingRide {
  id: string;
  clientName: string;
  clientPhoto?: string;
  clientRating?: number;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  distanceFromDriver: number;
  estimatedPrice: number;
  serviceType: 'standard' | 'premium' | 'xl' | 'moto';
  estimatedDuration: number;
  estimatedDistance: number;
  isPrivateClient?: boolean;
}

const SERVICE_LABELS: Record<string, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
  standard: { label: 'Ride', icon: <Car className="w-3 h-3" />, bg: 'bg-[hsl(var(--caby-gold))]/20', text: 'text-[hsl(var(--caby-gold))]' },
  premium: { label: 'Premium', icon: <Car className="w-3 h-3" />, bg: 'bg-[hsl(var(--caby-gold))]/20', text: 'text-[hsl(var(--caby-gold))]' },
  xl: { label: 'Van', icon: <Truck className="w-3 h-3" />, bg: 'bg-[hsl(var(--caby-blue))]/20', text: 'text-[hsl(var(--caby-blue))]' },
  moto: { label: 'Moto', icon: <Bike className="w-3 h-3" />, bg: 'bg-[hsl(var(--caby-green))]/20', text: 'text-[hsl(var(--caby-green))]' },
};

const COUNTDOWN_SECONDS = 20;

interface Props {
  ride: IncomingRide;
  onAccept: (id: string) => void;
  onRefuse: (id: string) => void;
  onClub?: (id: string) => void;
  onExpire: (id: string) => void;
}

const IncomingRideOverlay: React.FC<Props> = ({ ride, onAccept, onRefuse, onClub, onExpire }) => {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const service = SERVICE_LABELS[ride.serviceType] || SERVICE_LABELS.standard;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          onExpire(ride.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [ride.id, onExpire]);

  const progress = secondsLeft / COUNTDOWN_SECONDS;
  const circumference = 2 * Math.PI * 14;
  const strokeDashoffset = circumference * (1 - progress);

  const firstName = ride.clientName.split(' ')[0];
  const initials = firstName[0]?.toUpperCase() || '?';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
    >
      <div className="absolute inset-0 bg-black/30" />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
        className={`relative w-full max-w-md bg-black rounded-t-3xl shadow-2xl overflow-hidden ${
          ride.isPrivateClient ? 'ring-2 ring-[hsl(var(--caby-gold))]' : ''
        }`}
        style={{ height: '320px', maxHeight: '320px' }}
      >
        {/* Accent bar */}
        <div className="h-1 w-full" style={{ background: service.text.replace('text-', '').replace('[', '').replace(']', '') }} />

        <div className="p-4 flex flex-col h-full">
          {/* Ligne 1: Photo + Prénom + Service + Note + Compte à rebours */}
          <div className="flex items-center gap-2 mb-2">
            <div className="relative">
              {ride.clientPhoto ? (
                <img src={ride.clientPhoto} alt={ride.clientName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{initials}</span>
                </div>
              )}
            </div>
            <span className="text-sm font-bold text-white">{firstName}</span>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${service.bg} ${service.text}`}>
              {service.icon}
              <span className="text-[10px] font-medium">{service.label}</span>
            </div>
            {ride.clientRating && (
              <div className="flex items-center gap-0.5 text-white/70">
                <Star className="w-3 h-3 fill-[hsl(var(--caby-gold))] text-[hsl(var(--caby-gold))]" />
                <span className="text-xs">{ride.clientRating.toFixed(1)}</span>
              </div>
            )}
            <div className="ml-auto relative w-8 h-8 flex-shrink-0">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" fill="none" />
                <circle
                  cx="16" cy="16" r="14"
                  stroke={secondsLeft <= 5 ? '#ef4444' : '#22c55e'}
                  strokeWidth="2.5" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${
                secondsLeft <= 5 ? 'text-red-400' : 'text-white'
              }`}>
                {secondsLeft}
              </span>
            </div>
          </div>

          {/* Ligne 2: Départ */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-3 h-3 text-green-400" />
            </div>
            <span className="text-xs text-white/80 truncate flex-1">{ride.pickupAddress}</span>
            <span className="text-[10px] text-white/50">{ride.distanceFromDriver.toFixed(1)} km</span>
          </div>

          {/* Ligne 3: Destination */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <Navigation className="w-3 h-3 text-red-400" />
            </div>
            <span className="text-xs text-white/80 truncate flex-1">{ride.dropoffAddress}</span>
            <span className="text-[10px] text-white/50">{ride.estimatedDuration} min</span>
          </div>

          {/* Ligne 4: Prix centré */}
          <div className="flex-1 flex items-center justify-center py-1">
            <div className="text-center">
              <p className="text-5xl font-bold text-[hsl(var(--caby-gold))] tabular-nums leading-none">
                {ride.estimatedPrice.toFixed(0)}
                <span className="text-xl font-medium ml-1">CHF</span>
              </p>
              <p className="text-[10px] text-white/40 mt-1">{ride.estimatedDistance.toFixed(1)} km · {ride.estimatedDuration} min</p>
            </div>
          </div>

          {/* Ligne 5: Boutons - collés au prix, pas d'espace */}
          <div className="flex gap-2 pt-0">
            <button
              onClick={() => onRefuse(ride.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-white/15 hover:bg-white/20 text-white font-semibold text-xs active:scale-[0.97] transition-transform"
            >
              <X className="w-4 h-4" />
              Refuser
            </button>
            
            {ride.isPrivateClient && onClub && (
              <button
                onClick={() => onClub(ride.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[hsl(var(--caby-gold))]/25 hover:bg-[hsl(var(--caby-gold))]/35 border border-[hsl(var(--caby-gold))]/50 text-[hsl(var(--caby-gold))] font-semibold text-xs active:scale-[0.97] transition-transform"
              >
                <Users className="w-4 h-4" />
                Club
              </button>
            )}
            
            <button
              onClick={() => onAccept(ride.id)}
              className="flex-[1.5] flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[hsl(var(--caby-green))] text-black font-bold text-sm active:scale-[0.97] transition-transform"
            >
              Accepter
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default IncomingRideOverlay;
