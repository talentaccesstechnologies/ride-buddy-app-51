// ============================================================
// src/components/van/RiderIncidentButton.tsx
// Bouton discret de signalement côté passager
// À intégrer dans VanSelectPage ou page de confirmation
// ============================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, X, Send, ChevronDown } from 'lucide-react';
import { useDriverConduct, INCIDENT_CATALOG, type IncidentCategory } from '@/hooks/useDriverConduct';

const GOLD = '#C9A84C';

interface RiderIncidentButtonProps {
  driverId: string;
  riderId: string;
  slotId?: string;
  bookingId?: string;
}

export const RiderIncidentButton: React.FC<RiderIncidentButtonProps> = ({
  driverId, riderId, slotId, bookingId,
}) => {
  const { reportIncident, isLoading } = useDriverConduct();
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory | null>(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Seules les infractions visibles par le rider (pas les internes)
  const riderCategories: IncidentCategory[] = [
    'aggression', 'solicitation', 'cash_payment',
    'late_10min', 'dirty_vehicle', 'no_charger',
    'loud_music', 'luggage_refusal',
    'late_5min', 'dress_code', 'rough_driving',
  ];

  const handleSubmit = async () => {
    if (!selectedCategory) return;
    const ok = await reportIncident({
      driverId,
      slotId,
      bookingId,
      reportedBy: riderId,
      reporterRole: 'rider',
      category: selectedCategory,
      description,
    });
    if (ok) {
      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setSelectedCategory(null);
        setDescription('');
      }, 2500);
    }
  };

  return (
    <>
      {/* Bouton discret */}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 10px', borderRadius: 8,
          background: 'none', border: '1px solid #E5E7EB',
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 11, color: '#9CA3AF',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#F97316'; (e.currentTarget as HTMLButtonElement).style.color = '#F97316'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLButtonElement).style.color = '#9CA3AF'; }}
      >
        <Flag style={{ width: 11, height: 11 }} />
        Signaler un problème
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              padding: '0 0 20px 0',
            }}
            onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              style={{
                background: '#fff', borderRadius: '20px 20px 16px 16px',
                width: '100%', maxWidth: 500,
                padding: '20px 16px',
                maxHeight: '80vh', overflow: 'auto',
              }}
            >
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📝</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>Merci pour votre signalement</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Notre équipe examinera votre déclaration sous 24h.</div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Signaler un problème</h3>
                    <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                      <X style={{ width: 18, height: 18, color: '#9CA3AF' }} />
                    </button>
                  </div>

                  <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 12, lineHeight: 1.5 }}>
                    Votre signalement est anonyme et sera examiné par notre équipe avant toute action.
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                    {riderCategories.map(cat => {
                      const meta = INCIDENT_CATALOG[cat];
                      const tierColor = meta.tier === 1 ? '#EF4444' : meta.tier === 2 ? '#F97316' : GOLD;
                      const isSelected = selectedCategory === cat;
                      return (
                        <button key={cat}
                          onClick={() => setSelectedCategory(isSelected ? null : cat)}
                          style={{
                            padding: '10px 12px', borderRadius: 10, textAlign: 'left',
                            border: `1.5px solid ${isSelected ? tierColor : '#E5E7EB'}`,
                            background: isSelected ? (meta.tier === 1 ? '#FEF2F2' : meta.tier === 2 ? '#FFF7ED' : '#FFFBEB') : '#fff',
                            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: meta.tier === 1 ? '#FEF2F2' : meta.tier === 2 ? '#FFF7ED' : '#FFFBEB', color: tierColor, border: `1px solid ${tierColor}` }}>T{meta.tier}</span>
                            <span style={{ fontSize: 12, fontWeight: isSelected ? 700 : 400, color: '#1A1A1A' }}>{meta.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedCategory && (
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Décrivez brièvement ce qu'il s'est passé (optionnel)..."
                      rows={3}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontFamily: 'inherit', fontSize: 12, color: '#1A1A1A', boxSizing: 'border-box', resize: 'none', outline: 'none', marginBottom: 12 }}
                    />
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={!selectedCategory || isLoading}
                    style={{
                      width: '100%', padding: '12px 0', borderRadius: 10,
                      background: selectedCategory ? '#1E293B' : '#E5E7EB',
                      border: 'none', cursor: selectedCategory ? 'pointer' : 'not-allowed',
                      fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                      color: selectedCategory ? '#fff' : '#9CA3AF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <Send style={{ width: 13, height: 13 }} />
                    {isLoading ? 'Envoi...' : 'Envoyer le signalement'}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RiderIncidentButton;
