// ============================================================
// src/pages/rider/VanRdvPage.tsx
// Étape RDV — Choix du point de rendez-vous
// Step 1 dans le tunnel (après sélection du créneau)
// Route : /caby/van/rdv
// Utilisé sur MOBILE et DESKTOP
// ============================================================

import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Star, ChevronRight, Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BookingStepper from '@/components/van/BookingStepper';
import {
  getPickupPoints, getPremiumPickupFee, PREMIUM_PICKUP_FEE,
  type PickupPoint,
} from '@/lib/pickupPoints';
import PlacesAutocomplete from '@/components/shared/PlacesAutocomplete';

const GOLD = '#C9A84C';

// ── Carte point de RDV ───────────────────────────────────────
const PickupCard: React.FC<{
  point: PickupPoint;
  isSelected: boolean;
  onSelect: () => void;
  type: 'pickup' | 'dropoff';
}> = ({ point, isSelected, onSelect, type }) => {
  const isPremium = point.isPremium;

  return (
    <button
      onClick={onSelect}
      style={{
        width: '100%',
        background: isSelected
          ? isPremium ? '#FFFBEB' : '#F0FDF4'
          : '#fff',
        border: `1.5px solid ${
          isSelected
            ? isPremium ? GOLD : '#22C55E'
            : '#E5E7EB'
        }`,
        borderRadius: 12,
        padding: '12px 14px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        transition: 'all 0.15s',
        marginBottom: 8,
      }}
    >
      {/* Indicateur sélection */}
      <div style={{
        width: 20, height: 20,
        borderRadius: '50%',
        border: `2px solid ${isSelected ? (isPremium ? GOLD : '#22C55E') : '#D1D5DB'}`,
        background: isSelected ? (isPremium ? GOLD : '#22C55E') : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 2,
      }}>
        {isSelected && <Check style={{ width: 11, height: 11, color: '#fff' }} />}
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{
            fontSize: 13, fontWeight: 700,
            color: isSelected ? (isPremium ? '#633806' : '#166534') : '#1A1A1A',
          }}>
            {point.label}
          </span>
          {point.isOfficialStop && (
            <span style={{
              fontSize: 9, fontWeight: 700,
              background: '#EFF6FF', color: '#1D4ED8',
              padding: '1px 5px', borderRadius: 6,
              flexShrink: 0,
            }}>
              ● Officiel
            </span>
          )}
          {isPremium && (
            <span style={{
              fontSize: 9, fontWeight: 700,
              background: '#FFFBEB', color: '#92400E',
              padding: '1px 5px', borderRadius: 6,
              border: `1px solid ${GOLD}`,
              flexShrink: 0,
            }}>
              +CHF {PREMIUM_PICKUP_FEE}
            </span>
          )}
        </div>

        {point.description && (
          <div style={{ fontSize: 11, color: '#6B7280', marginBottom: point.landmark ? 3 : 0 }}>
            {point.description}
          </div>
        )}

        {point.landmark && isSelected && (
          <div style={{
            fontSize: 11, color: '#854F0B',
            background: '#FFFBEB', borderRadius: 6,
            padding: '4px 8px', marginTop: 4,
            display: 'flex', alignItems: 'flex-start', gap: 4,
          }}>
            <MapPin style={{ width: 11, height: 11, marginTop: 1, flexShrink: 0 }} />
            <span>{point.landmark}</span>
          </div>
        )}

        {point.walkingMinutes !== undefined && point.walkingMinutes > 0 && (
          <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock style={{ width: 10, height: 10 }} />
            {point.walkingMinutes} min à pied depuis le centre
          </div>
        )}
      </div>

      <ChevronRight style={{ width: 14, height: 14, color: '#9CA3AF', flexShrink: 0, marginTop: 4 }} />
    </button>
  );
};

// ── Section (pickup ou dropoff) ───────────────────────────────
const PointSection: React.FC<{
  title: string;
  city: string;
  selected: string;
  onSelect: (label: string, address: string) => void;
  type: 'pickup' | 'dropoff';
  customValue: string;
  onCustomChange: (v: string) => void;
}> = ({ title, city, selected, onSelect, type, customValue, onCustomChange }) => {
  const points = useMemo(() => getPickupPoints(city), [city]);
  const selectedPoint = points.find(p => p.label === selected);
  const isCustomSelected = selectedPoint?.isCustom;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: type === 'pickup' ? '#22C55E' : '#EF4444',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{title}</span>
        <span style={{ fontSize: 11, color: '#888780' }}>— {city}</span>
      </div>

      {points.map(point => (
        <PickupCard
          key={point.label}
          point={point}
          isSelected={selected === point.label}
          onSelect={() => onSelect(point.label, point.address)}
          type={type}
        />
      ))}

      {/* Champ adresse personnalisée */}
      <AnimatePresence>
        {isCustomSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginTop: 4 }}
          >
            <div style={{
              background: '#FFFBEB', border: `1.5px solid ${GOLD}`,
              borderRadius: 10, padding: '10px 12px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#92400E', marginBottom: 6 }}>
                📍 Votre adresse exacte
              </div>
              <PlacesAutocomplete
                value={customValue}
                onChange={onCustomChange}
                onPlaceSelect={(place) => onCustomChange(place.address)}
                placeholder={
                  type === 'pickup'
                    ? "Votre adresse, hôtel, chalet..."
                    : "Adresse de destination finale..."
                }
              />
              <div style={{ fontSize: 10, color: '#B45309', marginTop: 6, display: 'flex', gap: 4 }}>
                <Info style={{ width: 10, height: 10, marginTop: 1, flexShrink: 0 }} />
                Supplément +CHF {PREMIUM_PICKUP_FEE} appliqué — le van vient jusqu'à vous
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── PAGE PRINCIPALE ──────────────────────────────────────────
const VanRdvPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const from = searchParams.get('from') || 'Genève';
  const to = searchParams.get('to') || 'Zurich';
  const price = parseFloat(searchParams.get('price') || '0');

  const [pickupLabel, setPickupLabel] = useState(
    searchParams.get('pickupLabel') || ''
  );
  const [pickupAddress, setPickupAddress] = useState(
    searchParams.get('pickupAddress') || ''
  );
  const [pickupCustom, setPickupCustom] = useState('');

  const [dropoffLabel, setDropoffLabel] = useState(
    searchParams.get('dropoffLabel') || ''
  );
  const [dropoffAddress, setDropoffAddress] = useState(
    searchParams.get('dropoffAddress') || ''
  );
  const [dropoffCustom, setDropoffCustom] = useState('');

  const premiumFee = getPremiumPickupFee(pickupLabel, dropoffLabel);
  const totalWithFee = price + premiumFee;

  const pickupPoints = getPickupPoints(from);
  const dropoffPoints = getPickupPoints(to);

  const selectedPickup = pickupPoints.find(p => p.label === pickupLabel);
  const selectedDropoff = dropoffPoints.find(p => p.label === dropoffLabel);

  const isCustomPickup = selectedPickup?.isCustom;
  const isCustomDropoff = selectedDropoff?.isCustom;

  const canContinue =
    pickupLabel !== '' &&
    dropoffLabel !== '' &&
    (!isCustomPickup || pickupCustom.trim() !== '') &&
    (!isCustomDropoff || dropoffCustom.trim() !== '');

  const handleContinue = () => {
    const p = new URLSearchParams(searchParams);
    p.set('pickupLabel', pickupLabel);
    p.set('pickupAddress', isCustomPickup ? pickupCustom : pickupAddress);
    p.set('dropoffLabel', dropoffLabel);
    p.set('dropoffAddress', isCustomDropoff ? dropoffCustom : dropoffAddress);
    if (premiumFee > 0) p.set('premiumPickupFee', String(premiumFee));
    navigate(`/caby/van/pack?${p}`);
  };

  const basketAmount = totalWithFee > 0 ? totalWithFee : undefined;

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F2', paddingBottom: 100 }}>
      <BookingStepper currentStep={1} basketAmount={basketAmount} />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px' }}>

        {/* En-tête */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
            Points de rendez-vous
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
            Choisissez où vous rejoindrez le van et où il vous déposera.
            Les points officiels Caby sont signalés par un panneau orange.
          </p>
        </div>

        {/* Explication Blacklane-style */}
        <div style={{
          background: '#EFF6FF', border: '0.5px solid #BFDBFE',
          borderRadius: 10, padding: '10px 12px', marginBottom: 20,
          display: 'flex', gap: 8,
        }}>
          <Info style={{ width: 14, height: 14, color: '#1D4ED8', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF', marginBottom: 2 }}>
              Comment ça marche ?
            </div>
            <div style={{ fontSize: 11, color: '#1D4ED8', lineHeight: 1.5 }}>
              Votre chauffeur vous envoie une notification à <strong>H-10 min</strong>.
              Rejoignez le point de RDV dans les <strong>5 minutes</strong> suivant l'heure de départ.
              Un panneau CABY orange est toujours visible aux points officiels.
            </div>
          </div>
        </div>

        {/* Points de prise en charge */}
        <div style={{
          background: '#fff', borderRadius: 14,
          border: '0.5px solid #E5E7EB', padding: '16px',
          marginBottom: 16,
        }}>
          <PointSection
            title="Prise en charge"
            city={from}
            selected={pickupLabel}
            onSelect={(label, address) => {
              setPickupLabel(label);
              setPickupAddress(address);
              setPickupCustom('');
            }}
            type="pickup"
            customValue={pickupCustom}
            onCustomChange={setPickupCustom}
          />

          {/* Ligne de séparation trajet */}
          {pickupLabel && dropoffLabel && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 0', margin: '4px 0',
            }}>
              <div style={{ flex: 1, height: 1, borderTop: '1px dashed #E5E7EB' }} />
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                {from} → {to}
              </span>
              <div style={{ flex: 1, height: 1, borderTop: '1px dashed #E5E7EB' }} />
            </div>
          )}

          <PointSection
            title="Dépose"
            city={to}
            selected={dropoffLabel}
            onSelect={(label, address) => {
              setDropoffLabel(label);
              setDropoffAddress(address);
              setDropoffCustom('');
            }}
            type="dropoff"
            customValue={dropoffCustom}
            onCustomChange={setDropoffCustom}
          />
        </div>

        {/* Récapitulatif prix */}
        {canContinue && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#fff', borderRadius: 14,
              border: '0.5px solid #E5E7EB', padding: '14px 16px',
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 10 }}>
              Récapitulatif
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>
                📍 {pickupLabel}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: premiumFee > 0 ? 6 : 0 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>
                🏁 {dropoffLabel}
              </span>
            </div>
            {premiumFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '0.5px solid #F3F4F6', marginTop: 6 }}>
                <span style={{ fontSize: 12, color: '#92400E', fontWeight: 600 }}>
                  Supplément pickup à domicile
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>
                  +CHF {premiumFee}
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Politique RDV */}
        <div style={{
          background: '#F9F8F5', borderRadius: 10,
          border: '0.5px solid #E5E7EB', padding: '10px 12px',
          marginBottom: 20, fontSize: 11, color: '#6B7280',
          lineHeight: 1.6,
        }}>
          <strong style={{ color: '#1A1A1A' }}>Politique de rendez-vous Caby :</strong>{' '}
          Si le passager n'est pas au point de RDV dans les 5 minutes suivant
          l'heure de départ, le chauffeur peut partir. Aucun remboursement ne
          sera effectué (no-show). Activez les notifications pour recevoir
          l'alerte H-10 min du chauffeur.
        </div>

        {/* CTA */}
        <Button
          disabled={!canContinue}
          onClick={handleContinue}
          className="w-full h-12 rounded-xl text-white font-bold text-sm disabled:opacity-40 shadow-lg"
          style={{ backgroundColor: canContinue ? GOLD : undefined }}
        >
          Confirmer les points de RDV →
        </Button>

      </div>

      <BottomNav />
    </div>
  );
};

export default VanRdvPage;
