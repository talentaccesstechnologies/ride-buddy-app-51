// ============================================================
// src/components/van/AbandonedCartBanner.tsx
// Bannière panier abandonné + compte à rebours prix garanti
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, ArrowRight, Zap, AlertTriangle } from 'lucide-react';
import { type AbandonedCart, type PriceGuarantee } from '@/hooks/useAbandonedCart';

const GOLD = '#C9A84C';
const MONTHS_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

// ── Compte à rebours prix garanti ────────────────────────────
export const PriceGuaranteeBanner: React.FC<{
  guarantee: PriceGuarantee;
  onDismiss: () => void;
}> = ({ guarantee, onDismiss }) => {
  const mm = String(Math.floor(guarantee.secondsLeft / 60)).padStart(2, '0');
  const ss = String(guarantee.secondsLeft % 60).padStart(2, '0');
  const pct = (guarantee.secondsLeft / (15 * 60)) * 100;
  const isUrgent = guarantee.secondsLeft < 180; // < 3 min

  if (!guarantee.isActive && !guarantee.hasExpired) return null;

  return (
    <AnimatePresence>
      {(guarantee.isActive || guarantee.hasExpired) && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{
            background: guarantee.hasExpired ? '#FEF2F2'
              : isUrgent ? '#FFF7ED' : '#FFFBEB',
            border: `1.5px solid ${guarantee.hasExpired ? '#FECACA' : isUrgent ? '#FED7AA' : '#FDE68A'}`,
            borderRadius: 12,
            padding: '10px 12px',
            marginBottom: 12,
          }}
        >
          {guarantee.hasExpired ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle style={{ width: 16, height: 16, color: '#EF4444', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#991B1B' }}>
                  Garantie de prix expirée
                </div>
                <div style={{ fontSize: 11, color: '#7F1D1D', marginTop: 2 }}>
                  Le prix de CHF {guarantee.price} n'est plus garanti. Vérifiez le prix actuel.
                </div>
              </div>
              <button onClick={onDismiss} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X style={{ width: 14, height: 14, color: '#9CA3AF' }} />
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Clock style={{ width: 14, height: 14, color: isUrgent ? '#F97316' : GOLD, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isUrgent ? '#92400E' : '#78350F' }}>
                    Prix garanti CHF {guarantee.price}
                  </div>
                  <div style={{ fontSize: 10, color: '#A16207' }}>
                    {isUrgent ? '⚠️ Expire bientôt — ' : 'Garanti encore '}
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: isUrgent ? '#EF4444' : GOLD }}>
                      {mm}:{ss}
                    </span>
                  </div>
                </div>
                <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <X style={{ width: 12, height: 12, color: '#9CA3AF' }} />
                </button>
              </div>
              {/* Barre de progression */}
              <div style={{ height: 3, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: isUrgent ? '#EF4444' : GOLD,
                  borderRadius: 2,
                  transition: 'width 1s linear, background 0.3s ease',
                }} />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Bannière panier abandonné ─────────────────────────────────
export const AbandonedCartBanner: React.FC<{
  cart: AbandonedCart;
  onRestore: () => void;
  onDismiss: () => void;
}> = ({ cart, onRestore, onDismiss }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const remaining = Math.max(0, cart.expiresAt - Date.now());
      if (remaining === 0) { onDismiss(); return; }
      const mins = Math.floor(remaining / 60000);
      setTimeLeft(`${mins} min`);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [cart.expiresAt, onDismiss]);

  const slot = cart.outbound;
  if (!slot) return null;

  const depDate = new Date(slot.date);
  const dateLabel = `${DAYS_FR[depDate.getDay()]}. ${depDate.getDate()} ${MONTHS_FR[depDate.getMonth()]}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        style={{
          background: '#fff',
          border: `1.5px solid ${GOLD}`,
          borderRadius: 14,
          overflow: 'hidden',
          marginBottom: 16,
          boxShadow: '0 4px 16px rgba(201,168,76,0.15)',
        }}
      >
        {/* Header doré */}
        <div style={{ background: GOLD, padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap style={{ width: 13, height: 13, color: '#fff' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.3px' }}>
              Votre siège est encore disponible
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {timeLeft && (
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                Expire dans {timeLeft}
              </span>
            )}
            <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
              <X style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.7)' }} />
            </button>
          </div>
        </div>

        {/* Corps */}
        <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Infos trajet */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>
              {slot.from} → {slot.to}
            </div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>
              {dateLabel} · {slot.departure} → {slot.arrival}
            </div>
            {cart.returnSlot && (
              <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>
                + Retour {cart.returnSlot.from} → {cart.returnSlot.to} · {cart.returnSlot.departure}
              </div>
            )}
            {cart.searchCount >= 3 && (
              <div style={{ marginTop: 4, fontSize: 10, fontWeight: 700, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertTriangle style={{ width: 10, height: 10 }} />
                {slot.seatsLeft <= 2
                  ? `⚠️ Plus que ${slot.seatsLeft} siège${slot.seatsLeft > 1 ? 's' : ''} — ce trajet se remplit vite`
                  : '🔥 Vous avez cherché ce trajet plusieurs fois'}
              </div>
            )}
          </div>

          {/* Prix + CTA */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#1A1A1A' }}>
              CHF {slot.price}
            </div>
            <button
              onClick={onRestore}
              style={{
                marginTop: 6, padding: '7px 14px',
                background: GOLD, border: 'none', borderRadius: 8,
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 12, fontWeight: 700, color: '#fff',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              Reprendre <ArrowRight style={{ width: 12, height: 12 }} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Message d'urgence si recherche répétée ────────────────────
export const UrgencyMessage: React.FC<{
  searchCount: number;
  route: string;
  seatsLeft: number;
}> = ({ searchCount, route, seatsLeft }) => {
  if (searchCount < 3) return null;

  const messages = [
    seatsLeft <= 1 && { text: `Dernier siège disponible sur ${route}`, icon: '🔴', color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
    seatsLeft <= 3 && { text: `Plus que ${seatsLeft} sièges sur ${route} — ce trajet se remplit`, icon: '🟠', color: '#F97316', bg: '#FFF7ED', border: '#FED7AA' },
    searchCount >= 5 && { text: `Vous avez consulté ce trajet ${searchCount} fois — les prix peuvent changer`, icon: '💡', color: GOLD, bg: '#FFFBEB', border: '#FDE68A' },
    { text: `Prix actuels valables pour les prochaines 15 min`, icon: '⏱️', color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
  ].find(Boolean) as { text: string; icon: string; color: string; bg: string; border: string } | undefined;

  if (!messages) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      style={{
        background: messages.bg,
        border: `1px solid ${messages.border}`,
        borderRadius: 8, padding: '7px 10px',
        marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 11, fontWeight: 600, color: messages.color,
      }}
    >
      <span>{messages.icon}</span>
      <span>{messages.text}</span>
    </motion.div>
  );
};

export default AbandonedCartBanner;
