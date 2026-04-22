// ============================================================
// src/hooks/useNoShow.ts
// Hook no-show — côté chauffeur et côté rider
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const GRACE_MINUTES = 10;
const COMPENSATION_PCT = 60;

export interface NoShowResult {
  success: boolean;
  compensation_amt: number;
  compensation_pct: number;
  seat_relisted: boolean;
  rider_no_show_count: number;
  action_taken: 'warned' | 'suspended' | 'none';
  message: string;
  error?: string;
}

export interface NoShowStatus {
  canDeclare: boolean;
  minutesUntilAvailable: number;
  gracePeriodActive: boolean;
  graceExpiresAt: Date | null;
}

// ── Calcule si le chauffeur peut déclarer un no-show ────────
export function getNoShowStatus(departureTime: Date): NoShowStatus {
  const now = new Date();
  const depMs = departureTime.getTime();
  const nowMs = now.getTime();
  const diffMin = (depMs - nowMs) / 60000;

  // Peut déclarer si on est à moins de 10min du départ ou après
  const canDeclare = diffMin <= GRACE_MINUTES;
  const minutesUntilAvailable = canDeclare ? 0 : Math.ceil(diffMin - GRACE_MINUTES);

  // Période de grâce : entre H+0 et H+10min
  const graceStart = depMs;
  const graceEnd = depMs + GRACE_MINUTES * 60000;
  const gracePeriodActive = nowMs >= graceStart && nowMs <= graceEnd;
  const graceExpiresAt = gracePeriodActive ? new Date(graceEnd) : null;

  return { canDeclare, minutesUntilAvailable, gracePeriodActive, graceExpiresAt };
}

// ── Hook principal ───────────────────────────────────────────
export interface UseNoShowReturn {
  // Chauffeur
  declareNoShow: (bookingId: string, driverId: string) => Promise<NoShowResult | null>;
  noShowStatus: NoShowStatus | null;
  computeStatus: (departureTime: Date) => void;
  isLoading: boolean;

  // Rider
  riderNoShowCount: number | null;
  isSuspended: boolean;
  suspendedUntil: Date | null;
  loadRiderStatus: (riderId: string) => Promise<void>;
}

export function useNoShow(): UseNoShowReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [noShowStatus, setNoShowStatus] = useState<NoShowStatus | null>(null);
  const [riderNoShowCount, setRiderNoShowCount] = useState<number | null>(null);
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspendedUntil, setSuspendedUntil] = useState<Date | null>(null);

  const computeStatus = useCallback((departureTime: Date) => {
    setNoShowStatus(getNoShowStatus(departureTime));
  }, []);

  // Déclarer un no-show (appel de la fonction Supabase)
  const declareNoShow = useCallback(async (
    bookingId: string,
    driverId: string
  ): Promise<NoShowResult | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('declare_van_no_show', {
        p_booking_id: bookingId,
        p_driver_id: driverId,
      });

      if (error) {
        toast.error('Erreur no-show', { description: error.message });
        return null;
      }

      const result = data as NoShowResult;

      if (!result.success) {
        toast.error(result.error || 'Impossible de déclarer le no-show');
        return null;
      }

      // Toast selon l'action
      if (result.action_taken === 'suspended') {
        toast.error('Passager suspendu 30 jours', {
          description: `3ème no-show — compte suspendu · Compensation CHF ${result.compensation_amt}`,
          duration: 6000,
        });
      } else if (result.action_taken === 'warned') {
        toast.warning('Passager averti', {
          description: `2ème no-show — avertissement envoyé · Compensation CHF ${result.compensation_amt}`,
          duration: 5000,
        });
      } else {
        toast.success('No-show enregistré', {
          description: `Siège remis en vente · Compensation CHF ${result.compensation_amt} (${COMPENSATION_PCT}%)`,
        });
      }

      return result;
    } catch (e: any) {
      toast.error('Erreur', { description: e.message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger le statut no-show du rider
  const loadRiderStatus = useCallback(async (riderId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('no_show_count, is_suspended, suspended_until')
        .eq('id', riderId)
        .single();

      if (error || !data) return;

      setRiderNoShowCount((data as any).no_show_count || 0);
      setIsSuspended((data as any).is_suspended || false);
      setSuspendedUntil(
        (data as any).suspended_until ? new Date((data as any).suspended_until) : null
      );
    } catch (e) {
      // silencieux
    }
  }, []);

  return {
    declareNoShow, noShowStatus, computeStatus, isLoading,
    riderNoShowCount, isSuspended, suspendedUntil, loadRiderStatus,
  };
}
