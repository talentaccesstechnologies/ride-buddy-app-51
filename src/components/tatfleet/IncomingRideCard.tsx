import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Check, X, Share2, Clock, Star, Car, Bike, Truck, Users } from 'lucide-react';
import { RadarCourse } from '@/types/radar.types';
import { APP_CONFIG } from '@/config/app.config';

const SERVICE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  standard: { label: 'Caby Ride', icon: <Car className="w-4 h-4" />, color: 'hsl(var(--caby-gold))' },
  premium: { label: 'Caby Premium', icon: <Car className="w-4 h-4" />, color: 'hsl(var(--caby-gold))' },
  van: { label: 'Caby Van', icon: <Truck className="w-4 h-4" />, color: 'hsl(var(--caby-blue))' },
  xl: { label: 'Caby Van', icon: <Truck className="w-4 h-4" />, color: 'hsl(var(--caby-blue))' },
  moto: { label: 'Caby Moto', icon: <Bike className="w-4 h-4" />, color: 'hsl(var(--caby-green))' },
};

const COUNTDOWN_SECONDS = 20;

interface IncomingRideCardProps {
  course: RadarCourse;
  isPrivateClient: boolean;
  onAccept: (id: string) => void;
  onRefuse: (id: string) => void;
  onShareToClub: (id: string) => void;
  onExpire: (id: string) => void;
  isTop: boolean;
  index: number;
}

const IncomingRideCard: React.FC<IncomingRideCardProps> = ({
  course,
  isPrivateClient,
  onAccept,
  onRefuse,
  onShareToClub,
  onExpire,
  isTop,
  index,
}) => {
  const [exitDir, setExitDir] = useState<'left' | 'right' | 'up' | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [expired, setExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-15, 0, 15]);

  // Swipe overlays
  const acceptOpacity = useTransform(x, [0, 80, 150], [0, 0.6, 1]);
  const refuseOpacity = useTransform(x, [-150, -80, 0], [1, 0.6, 0]);
  const shareOpacity = useTransform(y, [-150, -80, 0], [1, 0.6, 0]);

  const acceptGlow = useTransform(x, [0, 150], ['inset 0 0 0 0 rgba(34,197,94,0)', 'inset 0 0 80px 0 rgba(34,197,94,0.2)']);
  const refuseGlow = useTransform(x, [-150, 0], ['inset 0 0 80px 0 rgba(239,68,68,0.2)', 'inset 0 0 0 0 rgba(239,68,68,0)']);
  const shareGlow = useTransform(y, [-150, 0], ['inset 0 0 80px 0 rgba(212,168,83,0.2)', 'inset 0 0 0 0 rgba(212,168,83,0)']);

  const service = SERVICE_CONFIG[course.vehicleTypeRequired] || SERVICE_CONFIG.standard;

  // Countdown
  useEffect(() => {
    if (!isTop) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTop, course.id]);

  // Handle expire
  useEffect(() => {
    if (expired) {
      setTimeout(() => onExpire(course.id), 600);
    }
  }, [expired, course.id, onExpire]);

  const progress = secondsLeft / COUNTDOWN_SECONDS;
  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference * (1 - progress);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    const vx = info.velocity.x;
    const vy = info.velocity.y;

    // Up swipe (share to club) — only if private client
    if (isPrivateClient && (info.offset.y < -threshold || vy < -500)) {
      setExitDir('up');
      setTimeout(() => onShareToClub(course.id), 300);
      return;
    }
    // Right swipe (accept)
    if (info.offset.x > threshold || vx > 500) {
      setExitDir('right');
      setTimeout(() => onAccept(course.id), 300);
      return;
    }
    // Left swipe (refuse)
    if (info.offset.x < -threshold || vx < -500) {
      setExitDir('left');
      setTimeout(() => onRefuse(course.id), 300);
      return;
    }
  };

  const stackScale = 1 - index * 0.04;
  const stackY = index * 8;

  const initials = course.clientDisplayName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Exit animation
  if (exitDir) {
    const exitAnims = {
      left: { x: -600, rotate: -20, opacity: 0 },
      right: { x: 600, rotate: 20, opacity: 0 },
      up: { y: -600, opacity: 0 },
    };
    return (
      <motion.div
        className="absolute inset-0 z-50"
        animate={exitAnims[exitDir]}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    );
  }

  // Expired animation
  if (expired) {
    return (
      <motion.div
        className="absolute inset-0 z-50 flex items-center justify-center"
        animate={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-card rounded-3xl p-8 text-center border border-border">
          <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-bold">Course transmise</p>
          <p className="text-xs text-muted-foreground mt-1">
            {isPrivateClient ? 'Redistribuée au Club' : 'Passée au chauffeur suivant'}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: isTop ? x : 0,
        y: isTop ? y : 0,
        rotate: isTop ? rotate : 0,
        scale: stackScale,
        zIndex: 10 - index,
      }}
      drag={isTop ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.85}
      onDragEnd={isTop ? handleDragEnd : undefined}
      initial={{ scale: stackScale, y: stackY, opacity: index < 3 ? 1 : 0 }}
      animate={{ scale: stackScale, y: stackY, opacity: index < 3 ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      whileDrag={{ cursor: 'grabbing' }}
    >
      {/* Swipe overlays */}
      {isTop && (
        <>
          <motion.div className="absolute inset-0 rounded-3xl pointer-events-none z-10" style={{ boxShadow: acceptGlow }} />
          <motion.div className="absolute inset-0 rounded-3xl pointer-events-none z-10" style={{ boxShadow: refuseGlow }} />
          {isPrivateClient && (
            <motion.div className="absolute inset-0 rounded-3xl pointer-events-none z-10" style={{ boxShadow: shareGlow }} />
          )}

          {/* Accept badge */}
          <motion.div
            className="absolute top-6 left-5 z-20 flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-[hsl(var(--caby-green))] bg-[hsl(var(--caby-green))]/90 text-black font-black text-sm uppercase tracking-wider"
            style={{ opacity: acceptOpacity, rotate: -12 }}
          >
            <Check className="w-4 h-4" strokeWidth={3} />
            ACCEPTER
          </motion.div>

          {/* Refuse badge */}
          <motion.div
            className="absolute top-6 right-5 z-20 flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-[hsl(var(--caby-red))] bg-[hsl(var(--caby-red))]/90 text-white font-black text-sm uppercase tracking-wider"
            style={{ opacity: refuseOpacity, rotate: 12 }}
          >
            REFUSER
            <X className="w-4 h-4" strokeWidth={3} />
          </motion.div>

          {/* Share badge (only private) */}
          {isPrivateClient && (
            <motion.div
              className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-primary bg-primary/90 text-black font-black text-sm uppercase tracking-wider"
              style={{ opacity: shareOpacity }}
            >
              <Users className="w-4 h-4" strokeWidth={3} />
              PARTAGER AU CLUB
            </motion.div>
          )}
        </>
      )}

      {/* Card content */}
      <div className={`h-full bg-card rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col ${isTop ? 'cursor-grab active:cursor-grabbing' : ''}`}>
        
        {/* Service accent bar */}
        <div className="h-1 w-full" style={{ background: service.color }} />

        <div className="flex-1 p-5 flex flex-col">
          
          {/* Header: Avatar + Name + Countdown */}
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {course.clientAvatarUrl ? (
                <img
                  src={course.clientAvatarUrl}
                  alt={course.clientDisplayName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{initials}</span>
                </div>
              )}
              {isPrivateClient && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px]">
                  ⭐
                </div>
              )}
            </div>

            {/* Name + service + rating */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground truncate">{course.clientDisplayName}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span style={{ color: service.color }}>{service.icon}</span>
                <span className="text-xs font-semibold" style={{ color: service.color }}>{service.label}</span>
                {course.clientRating && (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    {course.clientRating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Countdown */}
            {isTop && (
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" stroke="hsl(var(--border))" strokeWidth="3" fill="none" />
                  <circle
                    cx="50" cy="50" r="46"
                    stroke={secondsLeft <= 5 ? 'hsl(var(--caby-red))' : 'hsl(var(--caby-green))'}
                    strokeWidth="3" fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${secondsLeft <= 5 ? 'text-destructive' : 'text-foreground'}`}>
                  {secondsLeft}s
                </span>
              </div>
            )}
          </div>

          {/* Route */}
          <div className="space-y-2.5 mb-4">
            {/* Pickup */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-full bg-[hsl(var(--caby-green))]/15 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-[hsl(var(--caby-green))]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Départ</p>
                <p className="text-sm font-medium text-foreground truncate">{course.pickupAddress}</p>
                <p className="text-xs text-[hsl(var(--caby-green))] font-semibold mt-0.5">
                  À {(Math.random() * 3 + 0.5).toFixed(1)} km · {Math.floor(Math.random() * 5 + 2)} min
                </p>
              </div>
            </div>

            <div className="ml-4 border-l-2 border-dashed border-border h-3" />

            {/* Dropoff */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center flex-shrink-0">
                <Navigation className="w-4 h-4 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Destination</p>
                <p className="text-sm font-medium text-foreground truncate">{course.dropoffAddress}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {course.estimatedDistance.toFixed(1)} km · ~{course.estimatedDuration} min
                </p>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 mb-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Prix estimé</p>
            <p className="text-3xl font-black text-primary tabular-nums">
              {course.estimatedPrice.toFixed(0)} <span className="text-base font-medium">{APP_CONFIG.DEFAULT_CURRENCY}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <Clock className="w-3 h-3 inline mr-1" />
              ~{course.estimatedDuration} min · {course.estimatedDistance.toFixed(1)} km
            </p>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action buttons */}
          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={(e) => { e.stopPropagation(); setExitDir('left'); setTimeout(() => onRefuse(course.id), 300); }}
              className="w-14 h-14 rounded-full bg-[hsl(var(--caby-red))] flex items-center justify-center active:scale-90 transition-transform shadow-lg shadow-[hsl(var(--caby-red))]/20"
            >
              <X className="w-6 h-6 text-white" strokeWidth={3} />
            </button>

            {isPrivateClient && (
              <button
                onClick={(e) => { e.stopPropagation(); setExitDir('up'); setTimeout(() => onShareToClub(course.id), 300); }}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-primary to-primary/80 text-black font-black text-xs uppercase tracking-wider active:scale-95 transition-transform shadow-lg shadow-primary/30"
              >
                <Share2 className="w-4 h-4" />
                Club
              </button>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); setExitDir('right'); setTimeout(() => onAccept(course.id), 300); }}
              className="w-14 h-14 rounded-full bg-[hsl(var(--caby-green))] flex items-center justify-center active:scale-90 transition-transform shadow-lg shadow-[hsl(var(--caby-green))]/20"
            >
              <Check className="w-6 h-6 text-white" strokeWidth={3} />
            </button>
          </div>

          {/* Swipe hints */}
          <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-muted-foreground">
            <span>← Refuser</span>
            {isPrivateClient && <span>↑ Club</span>}
            <span>Accepter →</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default IncomingRideCard;
