// ============================================================
// src/lib/vanSupabase.ts
// Toutes les fonctions CRUD Supabase pour Caby Van
// ============================================================

import { supabase } from '@/integrations/supabase/client';
import {
  calculateFullPrice,
  calculateVanViability,
  calculateDriverEarnings,
  type RouteSegment,
  type AncillaryOptions,
} from '@/utils/cabyVanPricing';

// ── TYPES ────────────────────────────────────────────────────

export interface VanSlotDB {
  id: string;
  route_id: number;
  from_city: string;
  to_city: string;
  departure_time: string;
  arrival_time: string;
  base_price: number;
  seats_total: number;
  seats_sold: number;
  segment: RouteSegment;
  status: 'open' | 'full' | 'cancelled' | 'completed';
  driver_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface VanBookingDB {
  id: string;
  slot_id: string;
  rider_id: string;
  seat_number: number | null;
  price_paid: number;
  original_price: number;
  discount_pct: number;
  is_last_minute: boolean;
  seat_tier: string;
  ancillaries: Partial<AncillaryOptions>;
  ancillary_total: number;
  insurance_fee: number;
  pickup_label: string | null;
  pickup_address: string | null;
  dropoff_label: string | null;
  dropoff_address: string | null;
  passenger_name: string | null;
  passenger_email: string | null;
  passenger_phone: string | null;
  passenger_flight_no: string | null;
  bag_count: number;
  payment_method: 'card' | 'twint' | 'applepay';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  stripe_payment_id: string | null;
  qr_code: string | null;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  created_at: string;
  van_slots?: VanSlotDB;
}

export interface VanDriverMissionDB {
  id: string;
  slot_id: string;
  driver_id: string;
  segment: RouteSegment;
  base_price: number;
  seats_sold: number;
  seats_total: number;
  gross_revenue: number;
  caby_commission: number;
  driver_net: number;
  driver_guarantee: number;
  caby_subsidy: number;
  punctuality_bonus: number;
  final_payout: number;
  is_punctual: boolean;
  departure_time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  van_slots?: VanSlotDB;
}

export interface CabyPassSubscriptionDB {
  id: string;
  rider_id: string;
  plan: 'essentiel' | 'flex' | 'premium';
  price_chf: number;
  route_restriction: string | null;
  starts_at: string;
  ends_at: string;
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  trips_used: number;
}

export interface CreateBookingPayload {
  slot_id: string;
  rider_id: string;
  seat_number?: number;
  ancillaries?: Partial<AncillaryOptions>;
  pickup_label?: string;
  pickup_address?: string;
  dropoff_label?: string;
  dropoff_address?: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  passenger_flight_no?: string;
  bag_count?: number;
  payment_method?: 'card' | 'twint' | 'applepay';
}

// ── VAN SLOTS ────────────────────────────────────────────────

/**
 * Récupère les slots disponibles pour une route et une date
 */
export async function getVanSlots(
  fromCity: string,
  toCity: string,
  date: Date
): Promise<VanSlotDB[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('van_slots')
    .select('*')
    .eq('from_city', fromCity)
    .eq('to_city', toCity)
    .gte('departure_time', startOfDay.toISOString())
    .lte('departure_time', endOfDay.toISOString())
    .neq('status', 'cancelled')
    .order('departure_time', { ascending: true });

  if (error) throw new Error(`getVanSlots: ${error.message}`);
  return data as VanSlotDB[];
}

/**
 * Récupère un slot par ID avec pricing temps réel
 */
export async function getVanSlotWithPricing(slotId: string) {
  const { data, error } = await supabase
    .from('van_slots')
    .select('*')
    .eq('id', slotId)
    .single();

  if (error) throw new Error(`getVanSlotWithPricing: ${error.message}`);
  const slot = data as VanSlotDB;

  const pricing = calculateFullPrice(
    slot.base_price,
    slot.seats_sold,
    slot.seats_total,
    new Date(slot.departure_time)
  );

  return { slot, pricing };
}

/**
 * S'abonner aux changements temps réel d'un slot (Supabase Realtime)
 */
export function subscribeToSlot(
  slotId: string,
  onUpdate: (slot: VanSlotDB) => void
) {
  return supabase
    .channel(`van_slot_${slotId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'van_slots', filter: `id=eq.${slotId}` },
      (payload) => onUpdate(payload.new as VanSlotDB)
    )
    .subscribe();
}

/**
 * S'abonner aux changements de tous les slots d'une route
 */
export function subscribeToRouteSlots(
  fromCity: string,
  toCity: string,
  onUpdate: (slot: VanSlotDB) => void
) {
  return supabase
    .channel(`van_route_${fromCity}_${toCity}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'van_slots',
        filter: `from_city=eq.${fromCity}`,
      },
      (payload) => {
        const slot = (payload.new || payload.old) as VanSlotDB;
        if (slot.to_city === toCity) onUpdate(slot);
      }
    )
    .subscribe();
}

// ── VAN BOOKINGS ─────────────────────────────────────────────

/**
 * Crée une réservation avec calcul du prix temps réel
 */
export async function createVanBooking(
  payload: CreateBookingPayload
): Promise<VanBookingDB> {
  // 1. Récupérer le slot
  const { slot, pricing } = await getVanSlotWithPricing(payload.slot_id);

  if (slot.status === 'full') throw new Error('Ce créneau est complet');
  if (slot.status === 'cancelled') throw new Error('Ce créneau a été annulé');

  // 2. Calculer les ancillaires
  const ancillaries = payload.ancillaries || {};
  const ancillaryTotal = Object.entries(ancillaries).reduce((sum, [key, val]) => {
    if (!val) return sum;
    const prices: Record<string, number> = {
      seatChoice: 5, largeLuggage: 8, skisBike: 15,
      priorityPickup: 6, wifi: 4, flexCancellation: 9, drinkIncluded: 5,
    };
    return sum + (prices[key] || 0);
  }, 0);

  const INSURANCE_FEE = 2.50;
  const totalPrice = pricing.currentPrice + ancillaryTotal + INSURANCE_FEE;

  // 3. Générer un QR code simple
  const qrCode = `CABY-VAN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // 4. Insérer la réservation
  const { data, error } = await supabase
    .from('van_bookings')
    .insert({
      slot_id: payload.slot_id,
      rider_id: payload.rider_id,
      seat_number: payload.seat_number || null,
      price_paid: pricing.currentPrice,
      original_price: pricing.originalPrice,
      discount_pct: pricing.discount,
      is_last_minute: pricing.isLastMinute,
      seat_tier: pricing.seatTier,
      ancillaries: ancillaries,
      ancillary_total: ancillaryTotal,
      insurance_fee: INSURANCE_FEE,
      pickup_label: payload.pickup_label || null,
      pickup_address: payload.pickup_address || null,
      dropoff_label: payload.dropoff_label || null,
      dropoff_address: payload.dropoff_address || null,
      passenger_name: payload.passenger_name,
      passenger_email: payload.passenger_email,
      passenger_phone: payload.passenger_phone,
      passenger_flight_no: payload.passenger_flight_no || null,
      bag_count: payload.bag_count || 1,
      payment_method: payload.payment_method || 'card',
      payment_status: 'pending',
      qr_code: qrCode,
      status: 'confirmed',
    })
    .select('*, van_slots(*)')
    .single();

  if (error) throw new Error(`createVanBooking: ${error.message}`);
  return data as VanBookingDB;
}

/**
 * Récupère les réservations d'un rider
 */
export async function getRiderBookings(riderId: string): Promise<VanBookingDB[]> {
  const { data, error } = await supabase
    .from('van_bookings')
    .select('*, van_slots(*)')
    .eq('rider_id', riderId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`getRiderBookings: ${error.message}`);
  return data as VanBookingDB[];
}

/**
 * Annule une réservation avec calcul du remboursement
 */
export async function cancelVanBooking(
  bookingId: string,
  riderId: string
): Promise<{ refundAmount: number; reason: string }> {
  const { data: booking, error: fetchError } = await supabase
    .from('van_bookings')
    .select('*, van_slots(*)')
    .eq('id', bookingId)
    .eq('rider_id', riderId)
    .single();

  if (fetchError) throw new Error('Réservation introuvable');

  const b = booking as VanBookingDB;
  const departureTime = new Date(b.van_slots!.departure_time);
  const hoursUntil = (departureTime.getTime() - Date.now()) / (1000 * 60 * 60);

  let refundPct = 0;
  let reason = '';
  if (hoursUntil >= 24) {
    refundPct = 100;
    reason = 'Annulation >24h — remboursement intégral';
  } else if (hoursUntil >= 6) {
    refundPct = 50;
    reason = 'Annulation 6-24h — remboursement 50%';
  } else {
    refundPct = 0;
    reason = 'Annulation <6h — non remboursable';
  }

  const refundAmount = Math.round(b.price_paid * refundPct / 100 * 100) / 100;

  const { error: updateError } = await supabase
    .from('van_bookings')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason,
      refund_amount: refundAmount,
      payment_status: refundAmount > 0 ? 'refunded' : 'paid',
    })
    .eq('id', bookingId);

  if (updateError) throw new Error(`cancelVanBooking: ${updateError.message}`);
  return { refundAmount, reason };
}

/**
 * Confirme le paiement après Stripe
 */
export async function confirmVanPayment(
  bookingId: string,
  stripePaymentId: string
): Promise<void> {
  const { error } = await supabase
    .from('van_bookings')
    .update({
      payment_status: 'paid',
      stripe_payment_id: stripePaymentId,
    })
    .eq('id', bookingId);

  if (error) throw new Error(`confirmVanPayment: ${error.message}`);
}

// ── VAN DRIVER MISSIONS ──────────────────────────────────────

/**
 * Récupère les missions van du chauffeur pour aujourd'hui
 */
export async function getDriverVanMissions(
  driverId: string
): Promise<VanDriverMissionDB[]> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('van_driver_missions')
    .select('*, van_slots(*)')
    .eq('driver_id', driverId)
    .gte('departure_time', startOfDay.toISOString())
    .lte('departure_time', endOfDay.toISOString())
    .order('departure_time', { ascending: true });

  if (error) throw new Error(`getDriverVanMissions: ${error.message}`);
  return data as VanDriverMissionDB[];
}

/**
 * Recalcule et met à jour les revenus d'une mission
 */
export async function updateMissionEarnings(missionId: string): Promise<void> {
  const { data: mission, error: fetchError } = await supabase
    .from('van_driver_missions')
    .select('*, van_slots(*)')
    .eq('id', missionId)
    .single();

  if (fetchError) throw new Error('Mission introuvable');

  const m = mission as VanDriverMissionDB;
  const slot = m.van_slots!;

  const earnings = calculateDriverEarnings(
    slot.base_price,
    slot.seats_sold,
    slot.seats_total,
    slot.segment as RouteSegment,
    new Date(slot.departure_time),
    m.is_punctual
  );

  const viability = calculateVanViability(
    slot.base_price,
    slot.seats_sold,
    slot.seats_total,
    slot.segment as RouteSegment,
    new Date(slot.departure_time)
  );

  const { error: updateError } = await supabase
    .from('van_driver_missions')
    .update({
      seats_sold: slot.seats_sold,
      gross_revenue: earnings.grossRevenue,
      caby_commission: earnings.cabyCommission,
      driver_net: earnings.driverNet,
      driver_guarantee: earnings.minimumGuarantee,
      caby_subsidy: viability.cabySubsidy,
      punctuality_bonus: earnings.punctualityBonus,
      final_payout: earnings.finalDriverPayout,
    })
    .eq('id', missionId);

  if (updateError) throw new Error(`updateMissionEarnings: ${updateError.message}`);
}

/**
 * S'abonner aux missions du chauffeur en temps réel
 */
export function subscribeToDriverMissions(
  driverId: string,
  onUpdate: (missions: VanDriverMissionDB[]) => void
) {
  return supabase
    .channel(`driver_missions_${driverId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'van_driver_missions',
        filter: `driver_id=eq.${driverId}`,
      },
      async () => {
        const missions = await getDriverVanMissions(driverId);
        onUpdate(missions);
      }
    )
    .subscribe();
}

// ── CABY PASS ────────────────────────────────────────────────

export const CABY_PASS_PLANS = [
  {
    id: 'essentiel' as const,
    name: 'Essentiel',
    price: 299,
    trips: 'Illimité sur 1 route',
    features: ['Réservation prioritaire', 'Badge Abonné', 'Siège garanti'],
    popular: false,
  },
  {
    id: 'flex' as const,
    name: 'Flex',
    price: 449,
    trips: 'Illimité toutes routes Grand Genève',
    features: ['Tout Essentiel', 'Toutes routes frontalières', 'Annulation gratuite'],
    popular: true,
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: 599,
    trips: 'Illimité toutes routes',
    features: ['Tout Flex', 'Siège premium (avant)', 'Bagages illimités', 'Accès ski & longue distance'],
    popular: false,
  },
];

/**
 * Récupère l'abonnement actif du rider
 */
export async function getActiveSubscription(
  riderId: string
): Promise<CabyPassSubscriptionDB | null> {
  const { data, error } = await supabase
    .from('caby_pass_subscriptions')
    .select('*')
    .eq('rider_id', riderId)
    .eq('status', 'active')
    .gte('ends_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`getActiveSubscription: ${error.message}`);
  return data as CabyPassSubscriptionDB | null;
}

/**
 * Souscrit à un plan Caby Pass (avant Stripe)
 */
export async function subscribeToCabyPass(
  riderId: string,
  plan: 'essentiel' | 'flex' | 'premium',
  routeRestriction?: string
): Promise<CabyPassSubscriptionDB> {
  const planData = CABY_PASS_PLANS.find(p => p.id === plan)!;
  const startsAt = new Date();
  const endsAt = new Date();
  endsAt.setMonth(endsAt.getMonth() + 1);

  const { data, error } = await supabase
    .from('caby_pass_subscriptions')
    .insert({
      rider_id: riderId,
      plan,
      price_chf: planData.price,
      route_restriction: routeRestriction || null,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      renewal_date: endsAt.toISOString(),
      status: 'active',
    })
    .select()
    .single();

  if (error) throw new Error(`subscribeToCabyPass: ${error.message}`);
  return data as CabyPassSubscriptionDB;
}

/**
 * Annule un abonnement Caby Pass
 */
export async function cancelCabyPass(subscriptionId: string): Promise<void> {
  const { error } = await supabase
    .from('caby_pass_subscriptions')
    .update({ status: 'cancelled' })
    .eq('id', subscriptionId);

  if (error) throw new Error(`cancelCabyPass: ${error.message}`);
}

// ── PUSH NOTIFICATIONS ───────────────────────────────────────

/**
 * Récupère les notifications van non lues du chauffeur
 */
export async function getDriverVanNotifications(driverId: string) {
  const { data, error } = await supabase
    .from('van_push_notifications')
    .select('*')
    .eq('driver_id', driverId)
    .is('read_at', null)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(`getDriverVanNotifications: ${error.message}`);
  return data;
}

/**
 * Marque une notification comme lue
 */
export async function markVanNotificationRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('van_push_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) throw new Error(`markVanNotificationRead: ${error.message}`);
}

/**
 * S'abonner aux nouvelles notifications chauffeur
 */
export function subscribeToDriverNotifications(
  driverId: string,
  onNew: (notification: any) => void
) {
  return supabase
    .channel(`van_notifs_${driverId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'van_push_notifications',
        filter: `driver_id=eq.${driverId}`,
      },
      (payload) => onNew(payload.new)
    )
    .subscribe();
}
