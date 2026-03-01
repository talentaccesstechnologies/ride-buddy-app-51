import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

export type DriverMode = 'ride' | 'colis';

export interface QueuedMission {
  id: string;
  type: DriverMode;
  label: string;
  price: number;
  acceptedAt: number; // timestamp
}

export type ToleranceState = 'ok' | 'warn' | 'expired' | null;

interface ModeSwitchSuggestion {
  targetMode: DriverMode;
  message: string;
  detail: string;
}

export interface UseDriverModeReturn {
  mode: DriverMode;
  setMode: (m: DriverMode) => void;
  toggleMode: () => void;
  queuedMission: QueuedMission | null;
  acceptQueuedMission: (mission: QueuedMission) => void;
  clearQueuedMission: () => void;
  toleranceState: ToleranceState;
  confirmQueuedMission: () => void;
  modeSuggestion: ModeSwitchSuggestion | null;
  dismissSuggestion: () => void;
  acceptSuggestion: () => void;
  checkModeSuggestion: () => void;
}

const TOLERANCE_WARN_MS = 5 * 60 * 1000;
const TOLERANCE_EXPIRE_MS = 8 * 60 * 1000;

export function useDriverMode(isOnline: boolean): UseDriverModeReturn {
  const [mode, setModeState] = useState<DriverMode>('ride');
  const [queuedMission, setQueuedMission] = useState<QueuedMission | null>(null);
  const [toleranceState, setToleranceState] = useState<ToleranceState>(null);
  const [modeSuggestion, setModeSuggestion] = useState<ModeSwitchSuggestion | null>(null);
  const toleranceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const suggestionDismissedRef = useRef(false);

  const setMode = useCallback((m: DriverMode) => {
    setModeState(m);
    setQueuedMission(null);
    setToleranceState(null);
    toast.info(m === 'ride' ? 'Mode Passagers activé 🚗' : 'Mode Colis activé 📦');
  }, []);

  const toggleMode = useCallback(() => {
    setModeState(prev => {
      const next = prev === 'ride' ? 'colis' : 'ride';
      toast.info(next === 'ride' ? 'Mode Passagers activé 🚗' : 'Mode Colis activé 📦');
      return next;
    });
    setQueuedMission(null);
    setToleranceState(null);
  }, []);

  const acceptQueuedMission = useCallback((mission: QueuedMission) => {
    setQueuedMission({ ...mission, acceptedAt: Date.now() });
    setToleranceState('ok');
  }, []);

  const clearQueuedMission = useCallback(() => {
    setQueuedMission(null);
    setToleranceState(null);
  }, []);

  const confirmQueuedMission = useCallback(() => {
    // Reset timer on confirmation
    if (queuedMission) {
      setQueuedMission({ ...queuedMission, acceptedAt: Date.now() });
      setToleranceState('ok');
      toast.success('Mission confirmée');
    }
  }, [queuedMission]);

  // Tolerance timer
  useEffect(() => {
    if (!queuedMission) {
      if (toleranceTimerRef.current) clearInterval(toleranceTimerRef.current);
      return;
    }

    toleranceTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - queuedMission.acceptedAt;
      if (elapsed >= TOLERANCE_EXPIRE_MS) {
        setQueuedMission(null);
        setToleranceState('expired');
        toast.error('Mission réattribuée', {
          description: 'Nouvelle proposition dans 30 secondes',
        });
        setTimeout(() => setToleranceState(null), 3000);
      } else if (elapsed >= TOLERANCE_WARN_MS) {
        setToleranceState('warn');
      }
    }, 1000);

    return () => { if (toleranceTimerRef.current) clearInterval(toleranceTimerRef.current); };
  }, [queuedMission]);

  // Time-based mode suggestions
  const checkModeSuggestion = useCallback(() => {
    if (!isOnline || suggestionDismissedRef.current) return;
    const hour = new Date().getHours();

    if (mode === 'ride' && hour >= 10 && hour < 15) {
      setModeSuggestion({
        targetMode: 'colis',
        message: 'Peu de courses disponibles',
        detail: 'Passer en Mode Colis ? 4 livraisons disponibles près de vous',
      });
    } else if (mode === 'colis' && hour >= 16 && hour < 20) {
      setModeSuggestion({
        targetMode: 'ride',
        message: 'Rush du soir détecté',
        detail: 'Repasser en Mode Ride ? 6 courses passagers en attente',
      });
    }
  }, [isOnline, mode]);

  const dismissSuggestion = useCallback(() => {
    setModeSuggestion(null);
    suggestionDismissedRef.current = true;
    // Allow re-suggestion after 15 min
    setTimeout(() => { suggestionDismissedRef.current = false; }, 15 * 60 * 1000);
  }, []);

  const acceptSuggestion = useCallback(() => {
    if (modeSuggestion) {
      setMode(modeSuggestion.targetMode);
      setModeSuggestion(null);
      suggestionDismissedRef.current = true;
    }
  }, [modeSuggestion, setMode]);

  return {
    mode, setMode, toggleMode,
    queuedMission, acceptQueuedMission, clearQueuedMission,
    toleranceState, confirmQueuedMission,
    modeSuggestion, dismissSuggestion, acceptSuggestion, checkModeSuggestion,
  };
}
