// ============================================================
// src/hooks/useVanDriverMissions.ts
// Hook temps réel pour les missions van du chauffeur
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  getDriverVanMissions,
  updateMissionEarnings,
  subscribeToDriverMissions,
  getDriverVanNotifications,
  markVanNotificationRead,
  subscribeToDriverNotifications,
  type VanDriverMissionDB,
} from '@/lib/vanSupabase';
import {
  calculateVanViability,
  calculateDriverEarnings,
  shouldVanDepart,
  type RouteSegment,
} from '@/utils/cabyVanPricing';

// ── TYPES ────────────────────────────────────────────────────

export interface MissionWithAnalytics extends VanDriverMissionDB {
  viability: ReturnType<typeof calculateVanViability>;
  earnings: ReturnType<typeof calculateDriverEarnings>;
  departure: ReturnType<typeof shouldVanDepart>;
}

export interface VanNotification {
  id: string;
  type: 'van_under_threshold' | 'last_minute_promo' | 'departure_reminder' | 'payout_ready';
  title: string;
  body: string;
  data: Record<string, any>;
  created_at: string;
  read_at: string | null;
}

export interface UseVanDriverMissionsReturn {
  missions: MissionWithAnalytics[];
  notifications: VanNotification[];
  totalGuaranteed: number;
  totalGross: number;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markRead: (notificationId: string) => Promise<void>;
  markMissionStarted: (missionId: string) => Promise<void>;
  markMissionCompleted: (missionId: string, isPunctual: boolean) => Promise<void>;
}

// ── HOOK ─────────────────────────────────────────────────────

export function useVanDriverMissions(driverId: string | null): UseVanDriverMissionsReturn {
  const [missions, setMissions] = useState<MissionWithAnalytics[]>([]);
  const [notifications, setNotifications] = useState<VanNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enrichit les missions avec les analytics
  const enrichMissions = useCallback((raw: VanDriverMissionDB[]): MissionWithAnalytics[] => {
    return raw.map(m => {
      const slot = m.van_slots!;
      const departureTime = new Date(slot.departure_time);
      const segment = slot.segment as RouteSegment;

      const viability = calculateVanViability(
        slot.base_price, slot.seats_sold, slot.seats_total, segment, departureTime
      );
      const earnings = calculateDriverEarnings(
        slot.base_price, slot.seats_sold, slot.seats_total, segment, departureTime, m.is_punctual
      );
      const departure = shouldVanDepart(
        slot.seats_sold, slot.seats_total, segment, departureTime
      );

      return { ...m, viability, earnings, departure };
    });
  }, []);

  // Charge les missions et notifications
  const refresh = useCallback(async () => {
    if (!driverId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [rawMissions, rawNotifs] = await Promise.all([
        getDriverVanMissions(driverId),
        getDriverVanNotifications(driverId),
      ]);
      setMissions(enrichMissions(rawMissions));
      setNotifications(rawNotifs as VanNotification[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [driverId, enrichMissions]);

  // Chargement initial + subscriptions temps réel
  useEffect(() => {
    if (!driverId) return;
    refresh();

    // Realtime missions
    const missionChannel = subscribeToDriverMissions(driverId, (updatedMissions) => {
      setMissions(enrichMissions(updatedMissions));
    });

    // Realtime notifications
    const notifChannel = subscribeToDriverNotifications(driverId, (newNotif) => {
      setNotifications(prev => [newNotif as VanNotification, ...prev]);
      // Toast selon le type
      const icons: Record<string, string> = {
        van_under_threshold: '⚡',
        last_minute_promo: '🔥',
        departure_reminder: '🕐',
        payout_ready: '💰',
      };
      toast(newNotif.title, {
        description: newNotif.body,
        icon: icons[newNotif.type] || '📢',
      });
    });

    return () => {
      if (missionChannel?.unsubscribe) missionChannel.unsubscribe();
      if (notifChannel?.unsubscribe) notifChannel.unsubscribe();
    };
  }, [driverId, refresh, enrichMissions]);

  // Totaux
  const totalGuaranteed = missions.reduce((sum, m) => sum + m.earnings.finalDriverPayout, 0);
  const totalGross = missions.reduce((sum, m) => sum + m.earnings.grossRevenue, 0);
  const unreadCount = notifications.filter(n => !n.read_at).length;

  // Marquer une notification comme lue
  const markRead = useCallback(async (notificationId: string) => {
    await markVanNotificationRead(notificationId);
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
    );
  }, []);

  // Démarrer une mission
  const markMissionStarted = useCallback(async (missionId: string) => {
    const { supabase } = await import('@/integrations/supabase/client');
    const { error } = await supabase
      .from('van_driver_missions')
      .update({ status: 'in_progress', started_at: new Date().toISOString() })
      .eq('id', missionId);
    if (error) toast.error('Impossible de démarrer la mission');
    else {
      toast.success('Mission démarrée — GPS actif');
      await refresh();
    }
  }, [refresh]);

  // Terminer une mission avec calcul final
  const markMissionCompleted = useCallback(async (missionId: string, isPunctual: boolean) => {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase
      .from('van_driver_missions')
      .update({ is_punctual: isPunctual })
      .eq('id', missionId);

    await updateMissionEarnings(missionId);

    const { error } = await supabase
      .from('van_driver_missions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', missionId);

    if (error) toast.error('Impossible de terminer la mission');
    else {
      const mission = missions.find(m => m.id === missionId);
      if (mission) {
        toast.success('Mission terminée !', {
          description: `CHF ${mission.earnings.finalDriverPayout} crédités${isPunctual ? ' + bonus ponctualité' : ''}`,
        });
      }
      await refresh();
    }
  }, [missions, refresh]);

  return {
    missions, notifications, totalGuaranteed, totalGross,
    unreadCount, isLoading, error,
    refresh, markRead, markMissionStarted, markMissionCompleted,
  };
}
