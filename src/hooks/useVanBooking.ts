// ============================================================
// src/hooks/useVanBooking.ts
// Hook React pour le tunnel de réservation van complet
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  createVanBooking,
  getVanSlotWithPricing,
  cancelVanBooking,
  subscribeToSlot,
  type VanSlotDB,
  type VanBookingDB,
  type CreateBookingPayload,
} from '@/lib/vanSupabase';
import {
  calculateFullPrice,
  calculateAncillaryTotal,
  type PricingResult,
  type AncillaryOptions,
} from '@/utils/cabyVanPricing';

// ── TYPES ────────────────────────────────────────────────────

export type BookingStep =
  | 'idle'
  | 'loading_slot'
  | 'seat_selection'
  | 'extras'
  | 'passenger_info'
  | 'payment'
  | 'confirming'
  | 'confirmed'
  | 'error';

export interface PassengerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  flightNo: string;
  bagCount: number;
}

export interface UseVanBookingReturn {
  // Slot + pricing
  slot: VanSlotDB | null;
  pricing: PricingResult | null;
  liveSeatsLeft: number;

  // Sélections
  selectedSeat: number | null;
  ancillaries: Partial<AncillaryOptions>;
  passengerInfo: PassengerInfo;
  pickupLabel: string;
  pickupAddress: string;
  dropoffLabel: string;
  dropoffAddress: string;
  paymentMethod: 'card' | 'twint' | 'applepay';

  // Totaux
  totalPrice: number;
  ancillaryTotal: number;
  insuranceFee: number;

  // État
  step: BookingStep;
  booking: VanBookingDB | null;
  error: string | null;
  isLoading: boolean;

  // Actions
  loadSlot: (slotId: string) => Promise<void>;
  selectSeat: (seat: number) => void;
  setAncillaries: (a: Partial<AncillaryOptions>) => void;
  setPassengerInfo: (info: Partial<PassengerInfo>) => void;
  setPickup: (label: string, address: string) => void;
  setDropoff: (label: string, address: string) => void;
  setPaymentMethod: (m: 'card' | 'twint' | 'applepay') => void;
  goToStep: (step: BookingStep) => void;
  confirmBooking: (riderId: string) => Promise<VanBookingDB | null>;
  cancelCurrentBooking: (riderId: string) => Promise<void>;
  reset: () => void;
}

const INSURANCE_FEE = 2.50;

const DEFAULT_PASSENGER: PassengerInfo = {
  firstName: '', lastName: '', email: '', phone: '', flightNo: '', bagCount: 1,
};

// ── HOOK ─────────────────────────────────────────────────────

export function useVanBooking(): UseVanBookingReturn {
  const navigate = useNavigate();

  const [slot, setSlot] = useState<VanSlotDB | null>(null);
  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [liveSeatsLeft, setLiveSeatsLeft] = useState(7);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [ancillaries, setAncillariesState] = useState<Partial<AncillaryOptions>>({});
  const [passengerInfo, setPassengerInfoState] = useState<PassengerInfo>(DEFAULT_PASSENGER);
  const [pickupLabel, setPickupLabel] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffLabel, setDropoffLabel] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [paymentMethod, setPaymentMethodState] = useState<'card' | 'twint' | 'applepay'>('card');
  const [step, setStep] = useState<BookingStep>('idle');
  const [booking, setBooking] = useState<VanBookingDB | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Totaux calculés
  const ancillaryTotal = calculateAncillaryTotal(ancillaries);
  const totalPrice = pricing
    ? pricing.currentPrice + ancillaryTotal + INSURANCE_FEE
    : 0;

  // Realtime : écoute les changements de seats_sold
  useEffect(() => {
    if (!slot) return;
    const channel = subscribeToSlot(slot.id, (updatedSlot) => {
      setSlot(updatedSlot);
      setLiveSeatsLeft(updatedSlot.seats_total - updatedSlot.seats_sold);
      // Recalculer le prix si le remplissage change
      const newPricing = calculateFullPrice(
        updatedSlot.base_price,
        updatedSlot.seats_sold,
        updatedSlot.seats_total,
        new Date(updatedSlot.departure_time)
      );
      setPricing(newPricing);
      // Alerte si dernier siège pris pendant la réservation
      if (updatedSlot.seats_sold >= updatedSlot.seats_total && step !== 'confirmed') {
        toast.error('Ce créneau vient de se remplir', {
          description: 'Votre siège a été libéré. Choisissez un autre créneau.',
        });
      }
    });
    return () => { supabaseCleanup(channel); };
  }, [slot?.id, step]);

  // Charger un slot depuis Supabase
  const loadSlot = useCallback(async (slotId: string) => {
    setStep('loading_slot');
    setIsLoading(true);
    setError(null);
    try {
      const { slot: s, pricing: p } = await getVanSlotWithPricing(slotId);
      setSlot(s);
      setPricing(p);
      setLiveSeatsLeft(s.seats_total - s.seats_sold);
      setStep('seat_selection');
    } catch (err: any) {
      setError(err.message);
      setStep('error');
      toast.error('Impossible de charger ce créneau');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectSeat = useCallback((seat: number) => {
    setSelectedSeat(seat);
  }, []);

  const setAncillaries = useCallback((a: Partial<AncillaryOptions>) => {
    setAncillariesState(a);
  }, []);

  const setPassengerInfo = useCallback((info: Partial<PassengerInfo>) => {
    setPassengerInfoState(prev => ({ ...prev, ...info }));
  }, []);

  const setPickup = useCallback((label: string, address: string) => {
    setPickupLabel(label);
    setPickupAddress(address);
  }, []);

  const setDropoff = useCallback((label: string, address: string) => {
    setDropoffLabel(label);
    setDropoffAddress(address);
  }, []);

  const setPaymentMethod = useCallback((m: 'card' | 'twint' | 'applepay') => {
    setPaymentMethodState(m);
  }, []);

  const goToStep = useCallback((s: BookingStep) => {
    setStep(s);
  }, []);

  // Confirmer la réservation
  const confirmBooking = useCallback(async (riderId: string): Promise<VanBookingDB | null> => {
    if (!slot || !pricing) {
      toast.error('Aucun créneau sélectionné');
      return null;
    }
    if (!passengerInfo.firstName || !passengerInfo.email || !passengerInfo.phone) {
      toast.error('Informations passager incomplètes');
      return null;
    }

    setStep('confirming');
    setIsLoading(true);
    setError(null);

    try {
      const payload: CreateBookingPayload = {
        slot_id: slot.id,
        rider_id: riderId,
        seat_number: selectedSeat || undefined,
        ancillaries,
        pickup_label: pickupLabel || undefined,
        pickup_address: pickupAddress || undefined,
        dropoff_label: dropoffLabel || undefined,
        dropoff_address: dropoffAddress || undefined,
        passenger_name: `${passengerInfo.firstName} ${passengerInfo.lastName}`.trim(),
        passenger_email: passengerInfo.email,
        passenger_phone: passengerInfo.phone,
        passenger_flight_no: passengerInfo.flightNo || undefined,
        bag_count: passengerInfo.bagCount,
        payment_method: paymentMethod,
      };

      const newBooking = await createVanBooking(payload);
      setBooking(newBooking);
      setStep('confirmed');
      toast.success('Réservation confirmée !', {
        description: `E-ticket envoyé à ${passengerInfo.email}`,
      });
      return newBooking;
    } catch (err: any) {
      setError(err.message);
      setStep('error');
      toast.error('Erreur lors de la réservation', { description: err.message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [slot, pricing, selectedSeat, ancillaries, passengerInfo, pickupLabel, pickupAddress, dropoffLabel, dropoffAddress, paymentMethod]);

  // Annuler la réservation en cours
  const cancelCurrentBooking = useCallback(async (riderId: string) => {
    if (!booking) return;
    setIsLoading(true);
    try {
      const { refundAmount, reason } = await cancelVanBooking(booking.id, riderId);
      toast.success('Réservation annulée', {
        description: refundAmount > 0
          ? `Remboursement de CHF ${refundAmount} en cours`
          : reason,
      });
      reset();
    } catch (err: any) {
      toast.error("Impossible d'annuler", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [booking]);

  // Reset complet
  const reset = useCallback(() => {
    setSlot(null);
    setPricing(null);
    setSelectedSeat(null);
    setAncillariesState({});
    setPassengerInfoState(DEFAULT_PASSENGER);
    setPickupLabel('');
    setPickupAddress('');
    setDropoffLabel('');
    setDropoffAddress('');
    setPaymentMethodState('card');
    setStep('idle');
    setBooking(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    slot, pricing, liveSeatsLeft,
    selectedSeat, ancillaries, passengerInfo,
    pickupLabel, pickupAddress, dropoffLabel, dropoffAddress,
    paymentMethod, totalPrice, ancillaryTotal, insuranceFee: INSURANCE_FEE,
    step, booking, error, isLoading,
    loadSlot, selectSeat, setAncillaries, setPassengerInfo,
    setPickup, setDropoff, setPaymentMethod, goToStep,
    confirmBooking, cancelCurrentBooking, reset,
  };
}

// Helper pour cleanup Supabase channel
function supabaseCleanup(channel: any) {
  if (channel && typeof channel.unsubscribe === 'function') {
    channel.unsubscribe();
  }
}
