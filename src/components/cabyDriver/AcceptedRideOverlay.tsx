import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Clock, Phone, MessageSquare, Route, CheckCircle2, Car, X } from 'lucide-react';
import { RadarCourse } from '@/types/radar.types';
import { APP_CONFIG } from '@/config/app.config';

interface AcceptedRideOverlayProps {
  course: RadarCourse;
  onComplete: () => void;
}

const STEPS = [
  { label: 'Course assignée', icon: <CheckCircle2 className="w-5 h-5" />, duration: 2 },
  { label: 'En route vers le client', icon: <Car className="w-5 h-5" />, duration: 2 },
  { label: 'Arrivé au point de prise en charge', icon: <MapPin className="w-5 h-5" />, duration: 2 },
  { label: 'Course en cours...', icon: <Route className="w-5 h-5" />, duration: 2 },
  { label: 'Course terminée !', icon: <CheckCircle2 className="w-5 h-5" />, duration: 2 },
];

const AcceptedRideOverlay: React.FC<AcceptedRideOverlayProps> = ({ course, onComplete }) => {
  const [step, setStep] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const stepTimers = [0, 2000, 4000, 6000, 8000];
    const timers = stepTimers.map((delay, i) =>
      setTimeout(() => setStep(i), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const isComplete = step === 4;

  const initials = course.clientDisplayName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed bottom-16 left-0 right-0 z-40 px-3 pb-3"
    >
      <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[55vh]">
        {/* Step progress bar */}
        <div className="flex gap-1 p-2 pb-0">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                i <= step ? 'bg-[hsl(var(--caby-green))]' : 'bg-border'
              }`}
            />
          ))}
        </div>

        <div className="p-4">
          {/* Header: step label + close */}
          <div className="flex items-center justify-between mb-3">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isComplete ? 'bg-[hsl(var(--caby-green))]/20 text-[hsl(var(--caby-green))]' : 'bg-primary/20 text-primary'
              }`}>
                {STEPS[step].icon}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{STEPS[step].label}</p>
                <p className="text-[10px] text-muted-foreground">{secondsLeft}s</p>
              </div>
            </motion.div>
            <button onClick={onComplete} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Client + Route compact */}
          <div className="flex items-center gap-3 mb-3">
            {course.clientAvatarUrl ? (
              <img src={course.clientAvatarUrl} alt={course.clientDisplayName} className="w-10 h-10 rounded-full object-cover border border-border" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{initials}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{course.clientDisplayName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{course.dropoffAddress}</p>
            </div>
            <div className="flex gap-1.5">
              <button className="w-8 h-8 rounded-full bg-[hsl(var(--caby-green))]/15 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5 text-[hsl(var(--caby-green))]" />
              </button>
              <button className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-background rounded-xl py-2 text-center">
              <p className="text-[9px] uppercase text-muted-foreground font-semibold">Distance</p>
              <p className="text-sm font-bold text-foreground">{course.estimatedDistance.toFixed(1)} km</p>
            </div>
            <div className="bg-background rounded-xl py-2 text-center">
              <p className="text-[9px] uppercase text-muted-foreground font-semibold">Durée</p>
              <p className="text-sm font-bold text-foreground">~{course.estimatedDuration} min</p>
            </div>
            <div className="bg-background rounded-xl py-2 text-center">
              <p className="text-[9px] uppercase text-muted-foreground font-semibold">Prix</p>
              <p className="text-sm font-bold text-primary">{course.estimatedPrice.toFixed(0)} {APP_CONFIG.DEFAULT_CURRENCY}</p>
            </div>
          </div>

          {/* Live status */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`rounded-xl p-2.5 text-center text-xs font-semibold ${
                isComplete
                  ? 'bg-[hsl(var(--caby-green))]/10 text-[hsl(var(--caby-green))] border border-[hsl(var(--caby-green))]/30'
                  : 'bg-primary/10 text-primary border border-primary/20'
              }`}
            >
              {step === 0 && '✅ Démarrez votre navigation'}
              {step === 1 && `🚗 En route vers ${course.clientDisplayName}`}
              {step === 2 && '📍 Vous êtes arrivé — client notifié'}
              {step === 3 && `🛣️ ${course.estimatedDistance.toFixed(1)} km restants`}
              {step === 4 && `🎉 +${course.estimatedPrice.toFixed(0)} ${APP_CONFIG.DEFAULT_CURRENCY} ajoutés`}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default AcceptedRideOverlay;
