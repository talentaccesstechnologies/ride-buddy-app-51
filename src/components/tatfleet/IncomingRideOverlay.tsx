import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, X, Car, Bike, Truck } from 'lucide-react';

export interface IncomingRide {
  id: string;
  clientName: string;
  clientPhoto?: string;
  pickupAddress: string;
  dropoffAddress: string;
  distanceFromDriver: number; // km
  estimatedPrice: number;
  serviceType: 'standard' | 'premium' | 'xl' | 'moto';
  estimatedDuration: number; // minutes
  estimatedDistance: number; // km
}

const SERVICE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  standard: { label: 'Caby Ride', icon: <Car className="w-4 h-4" />, color: 'hsl(var(--caby-gold))' },
  premium: { label: 'Caby Premium', icon: <Car className="w-4 h-4" />, color: 'hsl(var(--caby-gold))' },
  xl: { label: 'Caby Van', icon: <Truck className="w-4 h-4" />, color: 'hsl(var(--caby-blue))' },
  moto: { label: 'Caby Moto', icon: <Bike className="w-4 h-4" />, color: 'hsl(var(--caby-green))' },
};

const COUNTDOWN_SECONDS = 20;

interface Props {
  ride: IncomingRide;
  onAccept: (id: string) => void;
  onRefuse: (id: string) => void;
  onExpire: (id: string) => void;
}

const IncomingRideOverlay: React.FC<Props> = ({ ride, onAccept, onRefuse, onExpire }) => {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const service = SERVICE_LABELS[ride.serviceType] || SERVICE_LABELS.standard;

  // Countdown
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
  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference * (1 - progress);

  const initials = ride.clientName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Card */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-md mx-4 mb-4 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background: service.color }} />

        <div className="p-5">
          {/* Header: client + countdown */}
          <div className="flex items-center gap-4 mb-5">
            {/* Avatar */}
            <div className="relative">
              {ride.clientPhoto ? (
                <img
                  src={ride.clientPhoto}
                  alt={ride.clientName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{initials}</span>
                </div>
              )}
            </div>

            {/* Name + service */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground truncate">{ride.clientName}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span style={{ color: service.color }}>{service.icon}</span>
                <span className="text-xs font-semibold" style={{ color: service.color }}>{service.label}</span>
              </div>
            </div>

            {/* Countdown circle */}
            <div className="relative w-14 h-14 flex-shrink-0">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="44" stroke="hsl(var(--border))" strokeWidth="4" fill="none" />
                <circle
                  cx="48" cy="48" r="44"
                  stroke={secondsLeft <= 5 ? 'hsl(var(--caby-red))' : 'hsl(var(--caby-green))'}
                  strokeWidth="4" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${
                secondsLeft <= 5 ? 'text-destructive' : 'text-foreground'
              }`}>
                {secondsLeft}s
              </span>
            </div>
          </div>

          {/* Route info */}
          <div className="space-y-3 mb-5">
            {/* Pickup */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-full bg-[hsl(var(--caby-green))]/15 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-[hsl(var(--caby-green))]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Départ</p>
                <p className="text-sm font-medium text-foreground truncate">{ride.pickupAddress}</p>
                <p className="text-xs text-primary font-semibold mt-0.5">À {ride.distanceFromDriver.toFixed(1)} km de vous</p>
              </div>
            </div>

            {/* Dotted line */}
            <div className="ml-4 border-l-2 border-dashed border-border h-3" />

            {/* Dropoff */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center flex-shrink-0">
                <Navigation className="w-4 h-4 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Destination</p>
                <p className="text-sm font-medium text-foreground truncate">{ride.dropoffAddress}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {ride.estimatedDistance.toFixed(1)} km · ~{ride.estimatedDuration} min
                </p>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 mb-5 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Prix estimé</p>
            <p className="text-3xl font-bold text-primary tabular-nums">
              {ride.estimatedPrice.toFixed(0)} <span className="text-base font-medium">CHF</span>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => onRefuse(ride.id)}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-secondary border border-border text-muted-foreground font-bold text-sm active:scale-[0.97] transition-transform"
            >
              <X className="w-4 h-4" />
              Refuser
            </button>
            <button
              onClick={() => onAccept(ride.id)}
              className="flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl bg-[hsl(var(--caby-green))] text-white font-bold text-sm active:scale-[0.97] transition-transform shadow-lg shadow-[hsl(var(--caby-green))]/30"
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
