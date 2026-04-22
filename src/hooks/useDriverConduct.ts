// ============================================================
// src/hooks/useDriverConduct.ts
// Hook scoring chauffeur — checklist, incidents, score
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ── TYPES ────────────────────────────────────────────────────

export type IncidentTier = 1 | 2 | 3;
export type IncidentCategory =
  | 'subcontracting' | 'cash_payment' | 'data_breach' | 'solicitation' | 'aggression'
  | 'late_10min' | 'dirty_vehicle' | 'no_charger' | 'loud_music' | 'luggage_refusal'
  | 'late_5min' | 'dress_code' | 'rough_driving';

export type DriverLevel = 'gold' | 'silver' | 'bronze' | 'suspended';

export interface IncidentMeta {
  tier: IncidentTier;
  label: string;
  description: string;
  fineAmount: number;
  commissionImpact: number;
}

export interface PreDepartureCheck {
  no_warning_lights: boolean;
  ac_working: boolean;
  fuel_full: boolean;
  tires_ok: boolean;
  vehicle_clean_ext: boolean;
  vehicle_clean_int: boolean;
  no_personal_items: boolean;
  water_bottles: boolean;
  chargers_usb_c: boolean;
  chargers_lightning: boolean;
  dress_code_ok: boolean;
}

export interface DriverScore {
  score: number;
  level: DriverLevel;
  tier1_count: number;
  tier2_count: number;
  tier3_count: number;
  check_rate: number;
  punctuality_rate: number;
  avg_rating: number;
  effective_commission: number;
  penalty: number;
  bonus: number;
  month: string;
}

// ── CATALOGUE DES INFRACTIONS ────────────────────────────────

export const INCIDENT_CATALOG: Record<IncidentCategory, IncidentMeta> = {
  // Tier 1
  subcontracting: { tier: 1, label: 'Sous-traitance non autorisée', description: 'Course effectuée par un chauffeur non enregistré', fineAmount: 1000, commissionImpact: 0.10 },
  cash_payment:   { tier: 1, label: 'Demande de paiement cash', description: 'Paiement cash demandé au passager hors plateforme', fineAmount: 500, commissionImpact: 0.10 },
  data_breach:    { tier: 1, label: 'Violation données passager', description: 'Divulgation ou utilisation abusive des données client', fineAmount: 500, commissionImpact: 0.10 },
  solicitation:   { tier: 1, label: 'Démarchage client', description: 'Contact client hors plateforme pour courses privées', fineAmount: 300, commissionImpact: 0.10 },
  aggression:     { tier: 1, label: 'Comportement agressif', description: 'Comportement hostile ou agressif envers un passager', fineAmount: 500, commissionImpact: 0.10 },
  // Tier 2
  late_10min:     { tier: 2, label: 'Retard > 10 minutes', description: 'Arrivée au pickup avec plus de 10 minutes de retard', fineAmount: 50, commissionImpact: 0.02 },
  dirty_vehicle:  { tier: 2, label: 'Véhicule non propre', description: 'Véhicule intérieur ou extérieur en mauvais état', fineAmount: 50, commissionImpact: 0.02 },
  no_charger:     { tier: 2, label: 'Chargeurs manquants', description: 'Absence des chargeurs USB-C ou Lightning obligatoires', fineAmount: 30, commissionImpact: 0.01 },
  loud_music:     { tier: 2, label: 'Musique trop forte', description: 'Musique forte sans accord des passagers', fineAmount: 30, commissionImpact: 0.01 },
  luggage_refusal:{ tier: 2, label: 'Refus aide bagages', description: 'Refus d\'aider le passager avec ses bagages', fineAmount: 30, commissionImpact: 0.01 },
  // Tier 3
  late_5min:      { tier: 3, label: 'Retard 5-10 minutes', description: 'Arrivée au pickup avec 5 à 10 minutes de retard', fineAmount: 0, commissionImpact: 0 },
  dress_code:     { tier: 3, label: 'Tenue non soignée', description: 'Non-respect du code vestimentaire Caby', fineAmount: 0, commissionImpact: 0 },
  rough_driving:  { tier: 3, label: 'Conduite brusque', description: 'Démarrages/arrêts brusques signalés par un passager', fineAmount: 0, commissionImpact: 0 },
};

// ── CHECKLIST ITEMS ──────────────────────────────────────────

export const CHECKLIST_ITEMS: { key: keyof PreDepartureCheck; label: string; category: string; required: boolean }[] = [
  { key: 'no_warning_lights', label: 'Aucun voyant d\'alarme', category: 'Véhicule', required: true },
  { key: 'ac_working',        label: 'Climatisation fonctionnelle', category: 'Véhicule', required: true },
  { key: 'fuel_full',         label: 'Réservoir plein / batterie chargée', category: 'Véhicule', required: true },
  { key: 'tires_ok',          label: 'Pneus en bon état', category: 'Véhicule', required: true },
  { key: 'vehicle_clean_ext', label: 'Extérieur propre', category: 'Propreté', required: true },
  { key: 'vehicle_clean_int', label: 'Intérieur impeccable', category: 'Propreté', required: true },
  { key: 'no_personal_items', label: 'Affaires personnelles hors de vue', category: 'Propreté', required: true },
  { key: 'water_bottles',     label: '2 bouteilles d\'eau (plate + gazeuse)', category: 'Équipements', required: true },
  { key: 'chargers_usb_c',    label: 'Chargeur USB-C disponible', category: 'Équipements', required: true },
  { key: 'chargers_lightning',label: 'Chargeur Lightning disponible', category: 'Équipements', required: true },
  { key: 'dress_code_ok',     label: 'Tenue soignée et appropriée', category: 'Tenue', required: true },
];

// ── HOOK ─────────────────────────────────────────────────────

export interface UseDriverConductReturn {
  score: DriverScore | null;
  isLoading: boolean;
  // Checklist
  submitChecklist: (driverId: string, slotId: string, checks: PreDepartureCheck) => Promise<boolean>;
  // Incidents
  reportIncident: (params: {
    driverId: string;
    slotId?: string;
    bookingId?: string;
    reportedBy: string;
    reporterRole: 'rider' | 'driver' | 'admin' | 'system';
    category: IncidentCategory;
    description?: string;
  }) => Promise<boolean>;
  // Score
  loadScore: (driverId: string, month?: string) => Promise<void>;
  refreshScore: (driverId: string) => Promise<void>;
  getLevelColor: (level: DriverLevel) => string;
  getLevelLabel: (level: DriverLevel) => string;
}

export function useDriverConduct(): UseDriverConductReturn {
  const [score, setScore] = useState<DriverScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getLevelColor = (level: DriverLevel) => ({
    gold: '#C9A84C',
    silver: '#9CA3AF',
    bronze: '#B45309',
    suspended: '#EF4444',
  }[level]);

  const getLevelLabel = (level: DriverLevel) => ({
    gold: '🥇 Gold',
    silver: '🥈 Silver',
    bronze: '🥉 Bronze',
    suspended: '🚫 Suspendu',
  }[level]);

  // Soumettre la checklist pré-départ
  const submitChecklist = useCallback(async (
    driverId: string,
    slotId: string,
    checks: PreDepartureCheck
  ): Promise<boolean> => {
    const failedItems = CHECKLIST_ITEMS
      .filter(item => !checks[item.key])
      .map(item => item.key);

    const { error } = await supabase
      .from('van_predeparture_checks')
      .insert({
        driver_id: driverId,
        slot_id: slotId,
        ...checks,
        failed_items: failedItems,
      });

    if (error) {
      toast.error('Erreur checklist', { description: error.message });
      return false;
    }

    if (failedItems.length === 0) {
      toast.success('✅ Checklist validée — vous êtes prêt à partir !');
    } else {
      toast.warning(`${failedItems.length} point${failedItems.length > 1 ? 's' : ''} à corriger`, {
        description: 'Checklist incomplète — corrigez les points manquants',
      });
    }

    return failedItems.length === 0;
  }, []);

  // Signaler un incident
  const reportIncident = useCallback(async (params: {
    driverId: string;
    slotId?: string;
    bookingId?: string;
    reportedBy: string;
    reporterRole: 'rider' | 'driver' | 'admin' | 'system';
    category: IncidentCategory;
    description?: string;
  }): Promise<boolean> => {
    const meta = INCIDENT_CATALOG[params.category];
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('van_driver_incidents')
        .insert({
          driver_id: params.driverId,
          slot_id: params.slotId || null,
          booking_id: params.bookingId || null,
          reported_by: params.reportedBy,
          reporter_role: params.reporterRole,
          tier: meta.tier,
          category: params.category,
          description: params.description || meta.description,
          commission_impact: meta.commissionImpact,
          fine_amount: meta.fineAmount,
          status: params.reporterRole === 'admin' ? 'confirmed' : 'pending',
        });

      if (error) {
        toast.error('Erreur signalement', { description: error.message });
        return false;
      }

      const tierLabels = { 1: '🔴 Tier 1 — Grave', 2: '🟠 Tier 2', 3: '🟡 Tier 3' };
      toast.success('Incident signalé', {
        description: `${tierLabels[meta.tier]} — ${meta.label}`,
      });

      // Recalculer le score
      await supabase.rpc('compute_driver_score', { p_driver_id: params.driverId });

      return true;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger le score du chauffeur
  const loadScore = useCallback(async (driverId: string, month?: string) => {
    setIsLoading(true);
    try {
      const m = month || new Date().toISOString().substring(0, 7);
      const { data, error } = await supabase
        .from('van_driver_scores')
        .select('*')
        .eq('driver_id', driverId)
        .eq('month', m)
        .maybeSingle();

      if (error) return;

      if (data) {
        setScore({
          score: (data as any).composite_score,
          level: (data as any).level,
          tier1_count: (data as any).tier1_count,
          tier2_count: (data as any).tier2_count,
          tier3_count: (data as any).tier3_count,
          check_rate: (data as any).check_rate,
          punctuality_rate: (data as any).punctuality_rate,
          avg_rating: (data as any).avg_rating,
          effective_commission: (data as any).effective_commission_rate,
          penalty: (data as any).commission_penalty,
          bonus: (data as any).bonus_amount,
          month: (data as any).month,
        });
      } else {
        // Premier calcul
        const { data: computed } = await supabase.rpc('compute_driver_score', {
          p_driver_id: driverId,
          p_month: m,
        });
        if (computed) setScore(computed as DriverScore);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshScore = useCallback(async (driverId: string) => {
    const m = new Date().toISOString().substring(0, 7);
    const { data } = await supabase.rpc('compute_driver_score', {
      p_driver_id: driverId,
      p_month: m,
    });
    if (data) setScore(data as DriverScore);
  }, []);

  return {
    score, isLoading,
    submitChecklist, reportIncident,
    loadScore, refreshScore,
    getLevelColor, getLevelLabel,
  };
}
