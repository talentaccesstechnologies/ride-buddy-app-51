// ============================================================
// src/pages/driver/VanNotificationsPage.tsx
// Notifications push chauffeur — missions van
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bell, BellOff, Check, Zap, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DriverBottomNav from '@/components/cabyDriver/DriverBottomNav';
import { useVanDriverMissions, type VanNotification } from '@/hooks/useVanDriverMissions';

const GOLD = '#C9A84C';

// ── Icône par type de notification ───────────────────────────
const NotifIcon: React.FC<{ type: VanNotification['type'] }> = ({ type }) => {
  const config = {
    van_under_threshold: { icon: Zap,         color: '#F97316', bg: '#FFF7ED' },
    last_minute_promo:   { icon: TrendingUp,  color: '#EF4444', bg: '#FEF2F2' },
    departure_reminder:  { icon: Clock,       color: GOLD,      bg: '#FFFBEB' },
    payout_ready:        { icon: DollarSign,  color: '#22C55E', bg: '#F0FDF4' },
  }[type];

  const Icon = config.icon;
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: config.bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon style={{ width: 18, height: 18, color: config.color }} />
    </div>
  );
};

// ── Carte notification ────────────────────────────────────────
const NotifCard: React.FC<{
  notif: VanNotification;
  onMarkRead: (id: string) => void;
}> = ({ notif, onMarkRead }) => {
  const isUnread = !notif.read_at;
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'À l\'instant';
    if (mins < 60) return `Il y a ${mins} min`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `Il y a ${h}h`;
    return `Il y a ${Math.floor(h / 24)}j`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{
        background: isUnread ? '#FFFCF5' : '#fff',
        border: `1.5px solid ${isUnread ? '#E8C96A' : '#E5E7EB'}`,
        borderRadius: 14, padding: '12px 14px',
        display: 'flex', gap: 12, alignItems: 'flex-start',
        position: 'relative',
      }}
    >
      {/* Pastille non-lu */}
      {isUnread && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 8, height: 8, borderRadius: '50%',
          background: GOLD,
        }} />
      )}

      <NotifIcon type={notif.type} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>
          {notif.title}
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
          {notif.body}
        </div>
        <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>
          {timeAgo(notif.created_at)}
        </div>
      </div>

      {isUnread && (
        <button
          onClick={() => onMarkRead(notif.id)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px', borderRadius: 8, flexShrink: 0,
            color: '#9CA3AF', marginTop: 2,
          }}
          title="Marquer comme lu"
        >
          <Check style={{ width: 14, height: 14 }} />
        </button>
      )}
    </motion.div>
  );
};

// ── MISSIONS ACCORDÉON ───────────────────────────────────────
const MissionCard: React.FC<{
  mission: any;
  onStart: (id: string) => void;
  onComplete: (id: string, isPunctual: boolean) => void;
}> = ({ mission, onStart, onComplete }) => {
  const [expanded, setExpanded] = useState(false);
  const slot = mission.van_slots;
  if (!slot) return null;

  const dep = new Date(slot.departure_time);
  const depLabel = `${dep.getHours().toString().padStart(2,'0')}:${dep.getMinutes().toString().padStart(2,'0')}`;
  const statusColor = mission.status === 'completed' ? '#22C55E'
    : mission.status === 'in_progress' ? '#3B82F6'
    : GOLD;
  const statusLabel = mission.status === 'completed' ? 'Terminé'
    : mission.status === 'in_progress' ? 'En cours'
    : 'Planifié';

  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: `1.5px solid ${mission.viability.statusColor === 'green' ? '#D1FAE5' : mission.viability.statusColor === 'orange' ? '#FDE68A' : '#FECACA'}`,
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', padding: '12px 14px', background: 'none',
          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div style={{ textAlign: 'left', flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>
            {slot.from_city} → {slot.to_city}
          </div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>
            {depLabel} · {slot.seats_sold}/{slot.seats_total} sièges
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A' }}>
              CHF {mission.earnings.finalDriverPayout}
            </div>
            <div style={{ fontSize: 9, color: statusColor, fontWeight: 600 }}>
              {statusLabel}
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#9CA3AF', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>▾</div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', borderTop: '1px solid #F3F4F6' }}
          >
            <div style={{ padding: '10px 14px 14px' }}>
              {/* Barre remplissage */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.round(mission.viability.fillRate * 100)}%`,
                    background: mission.viability.statusColor === 'green' ? '#22C55E'
                      : mission.viability.statusColor === 'orange' ? GOLD : '#EF4444',
                    borderRadius: 2,
                  }} />
                </div>
              </div>

              {/* Grille revenus */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
                {[
                  { label: 'Brut', value: `CHF ${mission.earnings.grossRevenue}`, color: '#1A1A1A' },
                  { label: `Com. ${Math.round(mission.earnings.cabyCommissionRate * 100)}%`, value: `-CHF ${mission.earnings.cabyCommission}`, color: '#EF4444' },
                  { label: 'Net garanti', value: `CHF ${mission.earnings.finalDriverPayout}`, color: '#22C55E' },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center', padding: '6px 4px', background: '#F9F9F9', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: item.color }}>{item.value}</div>
                    <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 1 }}>{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Subvention Caby */}
              {mission.viability.cabySubsidy > 0 && (
                <div style={{ padding: '6px 10px', background: '#FFF7ED', borderRadius: 8, marginBottom: 8, fontSize: 11, color: '#92400E', fontWeight: 600 }}>
                  🛡️ Caby complète de CHF {mission.viability.cabySubsidy} — garantie activée
                </div>
              )}

              {/* Bonus ponctualité */}
              {mission.earnings.punctualityBonus > 0 && (
                <div style={{ padding: '6px 10px', background: '#F0FDF4', borderRadius: 8, marginBottom: 8, fontSize: 11, color: '#166534', fontWeight: 600 }}>
                  ⚡ +CHF {mission.earnings.punctualityBonus} bonus ponctualité
                </div>
              )}

              {/* Actions selon statut */}
              {mission.status === 'scheduled' && (
                <Button
                  onClick={() => onStart(mission.id)}
                  className="w-full h-9 rounded-xl text-white text-sm font-bold"
                  style={{ backgroundColor: GOLD }}
                >
                  Démarrer la mission
                </Button>
              )}
              {mission.status === 'in_progress' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    onClick={() => onComplete(mission.id, true)}
                    className="flex-1 h-9 rounded-xl text-white text-sm font-bold"
                    style={{ backgroundColor: '#22C55E' }}
                  >
                    ✓ Terminer — à l'heure
                  </Button>
                  <Button
                    onClick={() => onComplete(mission.id, false)}
                    variant="outline"
                    className="flex-1 h-9 rounded-xl text-sm font-bold border-gray-300"
                  >
                    Terminer — retard
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── PAGE PRINCIPALE ──────────────────────────────────────────
const VanNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'missions' | 'notifications'>('missions');

  // TODO: remplacer par l'ID du chauffeur connecté depuis le contexte Auth
  const driverId = 'DRIVER_ID_PLACEHOLDER';

  const {
    missions, notifications, totalGuaranteed, totalGross,
    unreadCount, isLoading, refresh,
    markRead, markMissionStarted, markMissionCompleted,
  } = useVanDriverMissions(driverId === 'DRIVER_ID_PLACEHOLDER' ? null : driverId);

  const unreadNotifs = notifications.filter(n => !n.read_at);
  const readNotifs = notifications.filter(n => n.read_at);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Header */}
      <div style={{
        background: '#1E293B', padding: '16px 16px 0',
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 4 }}
          >
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>
            Tableau Van
          </h1>

          {/* Revenus résumé */}
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>CHF {totalGuaranteed}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>garanti aujourd'hui</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {[
            { key: 'missions', label: 'Mes missions', count: missions.length },
            { key: 'notifications', label: 'Notifications', count: unreadCount },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                flex: 1, padding: '10px 0', background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13, fontWeight: 600,
                color: activeTab === tab.key ? '#fff' : 'rgba(255,255,255,0.4)',
                borderBottom: `2px solid ${activeTab === tab.key ? GOLD : 'transparent'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  background: activeTab === tab.key ? GOLD : 'rgba(255,255,255,0.15)',
                  color: '#fff', fontSize: 10, fontWeight: 700,
                  padding: '1px 6px', borderRadius: 20,
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div style={{ padding: '16px', maxWidth: 600, margin: '0 auto' }}>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
            <div style={{ fontSize: 24, marginBottom: 8, animation: 'pulse 1.5s infinite' }}>⏳</div>
            <div style={{ fontSize: 13 }}>Chargement des missions...</div>
          </div>
        ) : activeTab === 'missions' ? (
          <>
            {/* Résumé financier */}
            {missions.length > 0 && (
              <div style={{
                background: '#fff', borderRadius: 14,
                border: '1.5px solid #E5E7EB',
                padding: '14px', marginBottom: 16,
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}>
                <div style={{ textAlign: 'center', padding: '8px', background: '#F9F9F9', borderRadius: 10 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#1A1A1A' }}>CHF {totalGross}</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF' }}>Revenu brut</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px', background: '#F0FDF4', borderRadius: 10 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#166534' }}>CHF {totalGuaranteed}</div>
                  <div style={{ fontSize: 10, color: '#22C55E', fontWeight: 600 }}>Net garanti</div>
                </div>
              </div>
            )}

            {/* Liste missions */}
            {missions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🚐</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#6B7280' }}>Aucune mission van aujourd'hui</div>
                <div style={{ fontSize: 12, marginTop: 6 }}>Vos missions apparaîtront ici</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {missions.map(m => (
                  <MissionCard
                    key={m.id}
                    mission={m}
                    onStart={markMissionStarted}
                    onComplete={markMissionCompleted}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Notifications non lues */}
            {unreadNotifs.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                  Non lues ({unreadNotifs.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <AnimatePresence>
                    {unreadNotifs.map(n => (
                      <NotifCard key={n.id} notif={n} onMarkRead={markRead} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Notifications lues */}
            {readNotifs.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                  Lues
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {readNotifs.map(n => (
                    <NotifCard key={n.id} notif={n} onMarkRead={markRead} />
                  ))}
                </div>
              </div>
            )}

            {notifications.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
                <BellOff style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: 0.4 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: '#6B7280' }}>Aucune notification</div>
                <div style={{ fontSize: 12, marginTop: 6 }}>Les alertes van apparaîtront ici</div>
              </div>
            )}
          </>
        )}
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default VanNotificationsPage;
