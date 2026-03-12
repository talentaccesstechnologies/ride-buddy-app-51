import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, X, Car, Bike, Truck, Users } from 'lucide-react';

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

const SERVICE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  standard: { label: 'Ride', icon: <Car className="w-3 h-3" />, color: 'hsl(var(--caby-gold))' },
  premium: { label: 'Premium', icon: <Car className="w-3 h-3" />, color: 'hsl(var(--caby-gold))' },
  xl: { label: 'Van', icon: <Truck className="w-3 h-3" />, color: 'hsl(var(--caby-blue))' },
  moto: { label: 'Moto', icon: <Bike className="w-3 h-3" />, color: 'hsl(var(--caby-green))' },
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
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference * (1 - progress);

  const initials = ride.clientName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
        className={`relative w-full max-w-lg bg-black/95 rounded-t-3xl shadow-2xl overflow-hidden ${ride.isPrivateClient ? 'ring-2 ring-[hsl(var(--caby-gold))]' : ''}`}
        style={{ maxHeight: '45vh' }}
      >
        <div className="h-1 w-full" style={{ background: service.color }} />

        <div className="p-4 flex flex-col h-full">
          {/* Header: client + countdown - une ligne */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              {ride.clientPhoto ? (
                <img
                  src={ride.clientPhoto}
                  alt={ride.clientName}
                  className="w-10 h-10 rounded-full object-cover border border-white/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{initials}</span>
                </div>
              )}
              {ride.isPrivateClient && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[hsl(var(--caby-gold))] flex items-center justify-center">
                  <span className="text-[8px] font-bold text-black">★</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white truncate">{ride.clientName}</h3>
              <div className="flex items-center gap-1.5">
                <span style={{ color: service.color }}>{service.icon}</span>
                <span className="text-xs font-medium text-white/70">{service.label}</span>
                {ride.clientRating && (
                  <span className="text-xs text-white/50">· {ride.clientRating.toFixed(1)}★</span>
                )}
              </div>
            </div>

            <div className="relative w-10 h-10 flex-shrink-0">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" />
                <circle
                  cx="20" cy="20" r="18"
                  stroke={secondsLeft <= 5 ? 'hsl(var(--caby-red))' : 'hsl(var(--caby-green))'}
                  strokeWidth="3" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${
                secondsLeft <= 5 ? 'text-red-400' : 'text-white'
              }`}>
                {secondsLeft}
              </span>
            </div>
          </div>

          {/* Route condensée */}
          <div className="flex items-start gap-2 mb-3 text-sm">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[hsl(var(--caby-green))]/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3 h-3 text-[hsl(var(--caby-green))]" />
                </div>
                <span className="text-white/90 truncate text-xs">{ride.pickupAddress}</span>
              </div>
              <div className="flex items-center gap-1.5 ml-0.5">
                <div className="w-1 h-4 border-l border-dashed border-white/30" />
                <span className="text-[10px] text-white/50">{ride.distanceFromDriver.toFixed(1)} km</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-3 h-3 text-red-400" />
                </div>
                <span className="text-white/90 truncate text-xs">{ride.dropoffAddress}</span>
              </div>
            </div>
          </div>

          {/* Prix en grand - centre */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1">Prix estimé</p>
              <p className="text-4xl font-bold text-[hsl(var(--caby-gold))] tabular-nums">
                {ride.estimatedPrice.toFixed(0)} <span className="text-xl font-medium">CHF</span>
              </p>
              <p className="text-xs text-white/40 mt-1">{ride.estimatedDistance.toFixed(1)} km · {ride.estimatedDuration} min</p>
            </div>
          </div>

          {/* Boutons en bas - collés */}
          <div className="flex gap-2 mt-3 pt-2 border-t border-white/10">
            <button
              onClick={() => onRefuse(ride.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-semibold text-sm active:scale-[0.97] transition-transform"
            >
              <X className="w-4 h-4" />
              Refuser
            </button>
            
            {ride.isPrivateClient && onClub && (
              <button
                onClick={() => onClub(ride.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[hsl(var(--caby-gold))]/20 hover:bg-[hsl(var(--caby-gold))]/30 border border-[hsl(var(--caby-gold))]/50 text-[hsl(var(--caby-gold))] font-semibold text-sm active:scale-[0.97] transition-transform"
              >
                <Users className="w-4 h-4" />
                Club
              </button>
            )}
            
            <button
              onClick={() => onAccept(ride.id)}
              className="flex-[1.5] flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[hsl(var(--caby-green))] text-black font-bold text-sm active:scale-[0.97] transition-transform shadow-lg shadow-[hsl(var(--caby-green))]/30"
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
