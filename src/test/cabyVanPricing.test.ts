// ============================================
// CABY VAN PRICING — TESTS DE ROBUSTESSE
// 35 cas limites couvrant les 5 risques critiques
// Exécution : npx vitest run
// ============================================

import { describe, it, expect } from 'vitest';
import {
  calculateFullPrice,
  validatePricingInputs,
  validateBookingPrice,
  calculateVanViability,
  calculateDriverEarnings,
  shouldVanDepart,
} from '@/utils/cabyVanPricing';

// ── HELPERS ──────────────────────────────────

const future = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000);

const past = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000);

const future_days = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000);

const JAN_2026 = new Date('2026-01-15T08:00:00'); // Ski, janvier, rush
const JUL_2026 = new Date('2026-07-15T14:00:00'); // Été, heures creuses

// ============================================
// GROUPE 1 — VALIDATION DES ENTRÉES (Risque #2)
// ============================================

describe('validatePricingInputs — entrées invalides', () => {

  it('❌ base_price = 0 doit être rejeté', () => {
    const err = validatePricingInputs(0, 3, 7, future(24));
    expect(err).not.toBeNull();
    expect(err?.field).toBe('basePrice');
  });

  it('❌ base_price négatif doit être rejeté', () => {
    const err = validatePricingInputs(-50, 3, 7, future(24));
    expect(err).not.toBeNull();
    expect(err?.field).toBe('basePrice');
  });

  it('❌ base_price > 999 doit être rejeté', () => {
    const err = validatePricingInputs(1500, 3, 7, future(24));
    expect(err).not.toBeNull();
    expect(err?.field).toBe('basePrice');
  });

  it('❌ base_price NaN doit être rejeté', () => {
    const err = validatePricingInputs(NaN, 3, 7, future(24));
    expect(err).not.toBeNull();
  });

  it('❌ seatsSold > totalSeats doit être rejeté (race condition)', () => {
    const err = validatePricingInputs(65, 8, 7, future(24));
    expect(err).not.toBeNull();
    expect(err?.field).toBe('seatsSold');
  });

  it('❌ seatsSold négatif doit être rejeté', () => {
    const err = validatePricingInputs(65, -1, 7, future(24));
    expect(err).not.toBeNull();
  });

  it('❌ totalSeats = 0 doit être rejeté', () => {
    const err = validatePricingInputs(65, 0, 0, future(24));
    expect(err).not.toBeNull();
  });

  it('❌ departureTime invalide (Invalid Date)', () => {
    const err = validatePricingInputs(65, 3, 7, new Date('invalid'));
    expect(err).not.toBeNull();
    expect(err?.field).toBe('departureTime');
  });

  it('✅ entrées valides = pas d\'erreur', () => {
    const err = validatePricingInputs(65, 3, 7, future(24));
    expect(err).toBeNull();
  });

});

// ============================================
// GROUPE 2 — DÉPART DANS LE PASSÉ (Risque #3)
// ============================================

describe('calculateFullPrice — départ passé', () => {

  it('❌ départ il y a 2h doit retourner isPastDeparture=true', () => {
    const result = calculateFullPrice(65, 3, 7, past(2));
    expect(result.isPastDeparture).toBe(true);
    expect(result.currentPrice).toBe(0);
    expect(result.priceError).not.toBeNull();
  });

  it('❌ départ il y a 24h doit être bloqué', () => {
    const result = calculateFullPrice(65, 3, 7, past(24));
    expect(result.isPastDeparture).toBe(true);
    expect(result.currentPrice).toBe(0);
  });

  it('✅ tolérance 30min — départ il y a 20min = OK (retard de saisie)', () => {
    const result = calculateFullPrice(65, 3, 7, past(0.3));
    expect(result.isPastDeparture).toBe(false);
    expect(result.currentPrice).toBeGreaterThan(0);
  });

  it('✅ départ dans 1h = prix normal calculé', () => {
    const result = calculateFullPrice(65, 3, 7, future(1));
    expect(result.isPastDeparture).toBe(false);
    expect(result.currentPrice).toBeGreaterThan(0);
    expect(result.priceError).toBeNull();
  });

});

// ============================================
// GROUPE 3 — PLAFOND ET PLANCHER (Intégrité)
// ============================================

describe('calculateFullPrice — clamps prix', () => {

  it('✅ prix jamais en dessous du plancher (60% × saisonnalité)', () => {
    // Cas extrême : earlybird + creuses + été
    const dep = new Date('2026-08-15T12:00:00');
    const booking = new Date(dep.getTime() - 20 * 24 * 60 * 60 * 1000);
    const result = calculateFullPrice(65, 0, 7, dep, booking);
    const minExpected = 65 * 0.60 * 0.90; // saison été = 0.90
    expect(result.currentPrice).toBeGreaterThanOrEqual(Math.round(minExpected));
  });

  it('✅ prix jamais au-dessus du plafond (140% × saisonnalité)', () => {
    const result = calculateFullPrice(65, 6, 7, JAN_2026);
    const maxExpected = 65 * 1.40 * 1.30; // janvier = 1.30
    expect(result.currentPrice).toBeLessThanOrEqual(Math.round(maxExpected));
  });

  it('✅ lastSeat + janvier + vendredi soir = plafonné pas infini', () => {
    const vendredi_soir = new Date('2026-01-16T17:30:00'); // vendredi 17h30
    const result = calculateFullPrice(65, 6, 7, vendredi_soir);
    expect(result.currentPrice).toBeLessThanOrEqual(Math.round(65 * 1.40 * 1.30));
    expect(result.currentPrice).toBeGreaterThan(0);
  });

  it('✅ base_price élevé (CHF 150 ski premium) = clamps respectés', () => {
    const result = calculateFullPrice(150, 3, 7, JAN_2026);
    expect(result.currentPrice).toBeGreaterThanOrEqual(Math.round(150 * 0.60 * 1.30));
    expect(result.currentPrice).toBeLessThanOrEqual(Math.round(150 * 1.40 * 1.30));
  });

});

// ============================================
// GROUPE 4 — PALIERS DE REMPLISSAGE
// ============================================

describe('calculateFullPrice — paliers seatTier', () => {

  it('✅ 0/7 sièges = earlybird', () => {
    const r = calculateFullPrice(65, 0, 7, future_days(3));
    expect(r.seatTier).toBe('earlybird');
  });

  it('✅ 2/7 sièges (28%) = earlybird', () => {
    const r = calculateFullPrice(65, 2, 7, future_days(3));
    expect(r.seatTier).toBe('earlybird');
  });

  it('✅ 3/7 sièges (43%) = standard', () => {
    const r = calculateFullPrice(65, 3, 7, future_days(3));
    expect(r.seatTier).toBe('standard');
  });

  it('✅ 5/7 sièges (71%) = peak', () => {
    const r = calculateFullPrice(65, 5, 7, future_days(3));
    expect(r.seatTier).toBe('peak');
  });

  it('✅ 6/7 sièges = lastseat', () => {
    const r = calculateFullPrice(65, 6, 7, future_days(3));
    expect(r.seatTier).toBe('lastseat');
  });

  it('✅ 7/7 sièges (van plein) = lastseat, pas d\'explosion', () => {
    const r = calculateFullPrice(65, 7, 7, future_days(3));
    expect(r.seatTier).toBe('lastseat');
    expect(r.currentPrice).toBeGreaterThan(0);
    expect(r.currentPrice).toBeLessThanOrEqual(Math.round(65 * 1.40));
  });

  it('✅ prix croissants avec le remplissage', () => {
    const dep = future_days(3);
    const p0 = calculateFullPrice(65, 0, 7, dep).currentPrice;
    const p3 = calculateFullPrice(65, 3, 7, dep).currentPrice;
    const p5 = calculateFullPrice(65, 5, 7, dep).currentPrice;
    const p6 = calculateFullPrice(65, 6, 7, dep).currentPrice;
    expect(p0).toBeLessThanOrEqual(p3);
    expect(p3).toBeLessThanOrEqual(p5);
    expect(p5).toBeLessThanOrEqual(p6);
  });

});

// ============================================
// GROUPE 5 — LAST MINUTE
// ============================================

describe('calculateFullPrice — last minute', () => {

  it('✅ départ dans 1h + van vide = discount 50%+', () => {
    const r = calculateFullPrice(65, 0, 7, future(1));
    expect(r.isLastMinute).toBe(true);
    expect(r.discount).toBeGreaterThanOrEqual(50);
  });

  it('✅ départ dans 1h + van à 80% = pas de discount (trop plein)', () => {
    const r = calculateFullPrice(65, 6, 7, future(1));
    expect(r.isLastMinute).toBe(false);
  });

  it('✅ départ dans 4h + van vide = discount 40%', () => {
    const r = calculateFullPrice(65, 0, 7, future(4));
    expect(r.discount).toBe(40);
  });

  it('✅ prix last-minute jamais en dessous du plancher', () => {
    const r = calculateFullPrice(65, 0, 7, future(0.5));
    expect(r.currentPrice).toBeGreaterThanOrEqual(Math.round(65 * 0.60));
  });

});

// ============================================
// GROUPE 6 — VALIDATION PRIX RÉSERVATION (Risque #4)
// ============================================

describe('validateBookingPrice — tamper detection', () => {

  it('❌ prix client CHF 1 = rejeté (manipulation URL)', () => {
    const check = validateBookingPrice(65, 3, 7, future_days(3), 1);
    expect(check.isValid).toBe(false);
    expect(check.reason).not.toBeNull();
  });

  it('❌ prix client 0 = rejeté', () => {
    const check = validateBookingPrice(65, 3, 7, future_days(3), 0);
    expect(check.isValid).toBe(false);
  });

  it('✅ prix client = prix serveur exact = valide', () => {
    const dep    = future_days(3);
    const server = calculateFullPrice(65, 3, 7, dep).currentPrice;
    const check  = validateBookingPrice(65, 3, 7, dep, server);
    expect(check.isValid).toBe(true);
  });

  it('✅ prix client dans tolérance 5% = valide', () => {
    const dep    = future_days(3);
    const server = calculateFullPrice(65, 3, 7, dep).currentPrice;
    const check  = validateBookingPrice(65, 3, 7, dep, Math.round(server * 1.04));
    expect(check.isValid).toBe(true);
  });

  it('❌ prix client +20% au-dessus = rejeté (overflow)', () => {
    const dep    = future_days(3);
    const server = calculateFullPrice(65, 3, 7, dep).currentPrice;
    const check  = validateBookingPrice(65, 3, 7, dep, Math.round(server * 1.20));
    expect(check.isValid).toBe(false);
  });

  it('❌ base_price = 0 → validation prix échoue proprement', () => {
    const check = validateBookingPrice(0, 3, 7, future_days(3), 50);
    expect(check.isValid).toBe(false);
    expect(check.serverPrice).toBe(0);
  });

});

// ============================================
// GROUPE 7 — VIABILITÉ ET DÉCISION DÉPART
// ============================================

describe('calculateVanViability + shouldVanDepart', () => {

  it('✅ 0 siège vendu = non viable, subvention = garantie totale', () => {
    const v = calculateVanViability(65, 0, 7, 'business', future_days(1));
    expect(v.isViable).toBe(false);
    expect(v.cabySubsidy).toBeGreaterThan(0);
  });

  it('✅ 3 sièges business = viable, pas de subvention', () => {
    const v = calculateVanViability(65, 3, 7, 'business', future_days(1));
    expect(v.isViable).toBe(true);
    expect(v.cabySubsidy).toBe(0);
  });

  it('✅ van ski a besoin de 4 sièges minimum', () => {
    const v = calculateVanViability(90, 3, 7, 'ski', JAN_2026);
    expect(v.isViable).toBe(false); // 3 < 4 pour ski
    const v2 = calculateVanViability(90, 4, 7, 'ski', JAN_2026);
    expect(v2.isViable).toBe(true);
  });

  it('✅ shouldVanDepart — départ dans 1h toujours true', () => {
    const d = shouldVanDepart(0, 7, 'business', future(1));
    expect(d.shouldDepart).toBe(true); // chauffeur déjà en route
  });

  it('✅ shouldVanDepart — 0 siège, 30h avant = false', () => {
    const d = shouldVanDepart(0, 7, 'business', future_days(1.5));
    expect(d.shouldDepart).toBe(false);
  });

  it('✅ driver earnings — bonus ponctualité inclus', () => {
    const e = calculateDriverEarnings(65, 5, 7, 'business', future_days(1), true);
    expect(e.punctualityBonus).toBeGreaterThan(0);
    expect(e.finalDriverPayout).toBeGreaterThanOrEqual(e.minimumGuarantee);
  });

});
