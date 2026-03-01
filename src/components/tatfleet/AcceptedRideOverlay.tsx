import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Clock, Phone, MessageSquare, Route, CheckCircle2, Car } from 'lucide-react';
import { RadarCourse } from '@/types/radar.types';
import { APP_CONFIG } from '@/config/app.config';

interface AcceptedRideOverlayProps {
  course: RadarCourse;
  onComplete: () => void;
}

const AcceptedRideOverlay: React.FC<AcceptedRideOverlayProps> = ({ course, onComplete }) => {
  const [step, setStep] = useState(0); // 0=assigned, 1=en route, 2=arrived, 3=in progress, 4=complete
  const [secondsLeft, setSecondsLeft] = useState(10);

  const steps = [
    { label: 'Course assignée', icon: <CheckCircle2 className="w-6 h-6" />, duration: 2 },
    { label: 'En route vers le client', icon: <Car className="w-6 h-6" />, duration: 2 },
    { label: 'Arrivé au point de prise en charge', icon: <MapPin className="w-6 h-6" />, duration: 2 },
    { label: 'Course en cours...', icon: <Route className="w-6 h-6" />, duration: 2 },
    { label: 'Course terminée !', icon: <CheckCircle2 className="w-6 h-6" />, duration: 2 },
  ];

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

  const progress = ((10 - secondsLeft) / 10) * 100;
  const isComplete = step === 4;

  const initials = course.clientDisplayName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-background"
    >
      {/* Progress bar */}
      <div className="w-full h-1 bg-border">
        <motion.div
          className="h-full bg-[hsl(var(--caby-green))]"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isComplete ? 'bg-[hsl(var(--caby-green))]/20 text-[hsl(var(--caby-green))]' : 'bg-primary/20 text-primary'
          }`}>
            {steps[step].icon}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{steps[step].label}</p>
            <p className="text-xs text-muted-foreground">{secondsLeft}s restantes</p>
          </div>
        </motion.div>
      </div>

      {/* Step indicators */}
      <div className="px-5 mb-4">
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                i <= step ? 'bg-[hsl(var(--caby-green))]' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main card */}
      <div className="flex-1 px-5 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-3xl p-5 mb-4"
        >
          {/* Client */}
          <div className="flex items-center gap-4 mb-5">
            {course.clientAvatarUrl ? (
              <img src={course.clientAvatarUrl} alt={course.clientDisplayName} className="w-14 h-14 rounded-full object-cover border-2 border-border" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">{initials}</span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">{course.clientDisplayName}</h3>
              {course.clientRating && (
                <p className="text-sm text-muted-foreground">⭐ {course.clientRating.toFixed(1)}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-[hsl(var(--caby-green))]/15 flex items-center justify-center">
                <Phone className="w-4 h-4 text-[hsl(var(--caby-green))]" />
              </button>
              <button className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary" />
              </button>
            </div>
          </div>

          {/* Route */}
          <div className="space-y-3 mb-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-full bg-[hsl(var(--caby-green))]/15 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-[hsl(var(--caby-green))]" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Prise en charge</p>
                <p className="text-sm font-medium text-foreground">{course.pickupAddress}</p>
              </div>
            </div>
            <div className="ml-4 border-l-2 border-dashed border-border h-3" />
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center flex-shrink-0">
                <Navigation className="w-4 h-4 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Destination</p>
                <p className="text-sm font-medium text-foreground">{course.dropoffAddress}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-background rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase text-muted-foreground font-semibold">Distance</p>
              <p className="text-lg font-bold text-foreground">{course.estimatedDistance.toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">km</p>
            </div>
            <div className="bg-background rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase text-muted-foreground font-semibold">Durée</p>
              <p className="text-lg font-bold text-foreground">~{course.estimatedDuration}</p>
              <p className="text-[10px] text-muted-foreground">min</p>
            </div>
            <div className="bg-background rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase text-muted-foreground font-semibold">Prix</p>
              <p className="text-lg font-bold text-primary">{course.estimatedPrice.toFixed(0)}</p>
              <p className="text-[10px] text-muted-foreground">{APP_CONFIG.DEFAULT_CURRENCY}</p>
            </div>
          </div>
        </motion.div>

        {/* Live status animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`rounded-2xl p-4 text-center mb-4 ${
              isComplete
                ? 'bg-[hsl(var(--caby-green))]/10 border border-[hsl(var(--caby-green))]/30'
                : 'bg-primary/10 border border-primary/20'
            }`}
          >
            {step === 0 && <p className="text-sm font-semibold text-primary">✅ Course assignée — Démarrez votre navigation</p>}
            {step === 1 && (
              <div>
                <p className="text-sm font-semibold text-primary">🚗 En route vers {course.clientDisplayName}</p>
                <p className="text-xs text-muted-foreground mt-1">Temps estimé : 3 min</p>
              </div>
            )}
            {step === 2 && (
              <div>
                <p className="text-sm font-semibold text-primary">📍 Vous êtes arrivé</p>
                <p className="text-xs text-muted-foreground mt-1">Le client a été notifié de votre arrivée</p>
              </div>
            )}
            {step === 3 && (
              <div>
                <p className="text-sm font-semibold text-primary">🛣️ Course en cours</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {course.estimatedDistance.toFixed(1)} km restants · ~{course.estimatedDuration} min
                  </span>
                </div>
              </div>
            )}
            {step === 4 && (
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--caby-green))]">🎉 Course terminée !</p>
                <p className="text-2xl font-black text-primary mt-2">+{course.estimatedPrice.toFixed(0)} {APP_CONFIG.DEFAULT_CURRENCY}</p>
                <p className="text-xs text-muted-foreground mt-1">Gain ajouté à votre solde du jour</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action */}
      <div className="px-5 pb-5 pt-2">
        <button
          onClick={onComplete}
          className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${
            isComplete
              ? 'bg-[hsl(var(--caby-green))] text-white shadow-lg shadow-[hsl(var(--caby-green))]/30'
              : 'bg-card border border-border text-muted-foreground'
          }`}
        >
          {isComplete ? 'Retour au Radar' : 'Simulation en cours...'}
        </button>
      </div>
    </motion.div>
  );
};

export default AcceptedRideOverlay;
