// ============================================================
// src/pages/driver/VanPreDeparturePage.tsx
// Checklist pré-départ + signalement incident + score
// Route : /caby/driver/van-checklist?slotId=xxx
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Star, TrendingUp, ChevronDown, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DriverBottomNav from '@/components/cabyDriver/DriverBottomNav';
import {
  useDriverConduct,
  CHECKLIST_ITEMS,
  INCIDENT_CATALOG,
  type PreDepartureCheck,
  type IncidentCategory,
  type DriverLevel,
} from '@/hooks/useDriverConduct';

const GOLD = '#C9A84C';

// TODO: remplacer par le vrai ID depuis AuthContext
const MOCK_DRIVER_ID = 'DRIVER_ID_PLACEHOLDER';

// ── Score gauge ───────────────────────────────────────────────
const ScoreGauge: React.FC<{ score: number; level: DriverLevel; getLevelColor: (l: DriverLevel) => string; getLevelLabel: (l: DriverLevel) => string }> = ({ score, level, getLevelColor, getLevelLabel }) => {
  const color = getLevelColor(level);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: 100, height: 100 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="8" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: '#1A1A1A' }}>{Math.round(score)}</span>
          <span style={{ fontSize: 9, color: '#9CA3AF' }}>/100</span>
        </div>
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{getLevelLabel(level)}</span>
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────
const VanPreDeparturePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const slotId = searchParams.get('slotId') || '';
  const { score, isLoading, submitChecklist, reportIncident, loadScore, refreshScore, getLevelColor, getLevelLabel } = useDriverConduct();

  const [activeTab, setActiveTab] = useState<'checklist' | 'incident' | 'score'>('checklist');

  // Checklist state
  const [checks, setChecks] = useState<PreDepartureCheck>({
    no_warning_lights: false, ac_working: false, fuel_full: false,
    tires_ok: false, vehicle_clean_ext: false, vehicle_clean_int: false,
    no_personal_items: false, water_bottles: false, chargers_usb_c: false,
    chargers_lightning: false, dress_code_ok: false,
  });
  const [checkSubmitted, setCheckSubmitted] = useState(false);

  // Incident state
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory | null>(null);
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentBookingId, setIncidentBookingId] = useState('');
  const [incidentSubmitted, setIncidentSubmitted] = useState(false);
  const [showTier, setShowTier] = useState<1 | 2 | 3 | null>(null);

  useEffect(() => {
    loadScore(MOCK_DRIVER_ID);
  }, [loadScore]);

  const allChecked = Object.values(checks).every(Boolean);
  const checkedCount = Object.values(checks).filter(Boolean).length;
  const totalItems = CHECKLIST_ITEMS.length;

  // Grouper les items par catégorie
  const categories = [...new Set(CHECKLIST_ITEMS.map(i => i.category))];

  const handleSubmitChecklist = async () => {
    const ok = await submitChecklist(MOCK_DRIVER_ID, slotId, checks);
    setCheckSubmitted(true);
    if (ok) await refreshScore(MOCK_DRIVER_ID);
  };

  const handleSubmitIncident = async () => {
    if (!selectedCategory) return;
    const ok = await reportIncident({
      driverId: MOCK_DRIVER_ID,
      slotId: slotId || undefined,
      bookingId: incidentBookingId || undefined,
      reportedBy: MOCK_DRIVER_ID,
      reporterRole: 'driver',
      category: selectedCategory,
      description: incidentDesc || undefined,
    });
    if (ok) {
      setIncidentSubmitted(true);
      setSelectedCategory(null);
      setIncidentDesc('');
      await refreshScore(MOCK_DRIVER_ID);
    }
  };

  const tierColors = { 1: '#EF4444', 2: '#F97316', 3: GOLD };
  const tierBg = { 1: '#FEF2F2', 2: '#FFF7ED', 3: '#FFFBEB' };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F2', paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ background: '#1E293B', padding: '16px 16px 0', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 4 }}>
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, flex: 1 }}>Code de conduite Caby</h1>
          {score && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: getLevelColor(score.level) }}>{Math.round(score.score)}/100</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{getLevelLabel(score.level)}</div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {[
            { key: 'checklist', label: '✅ Pré-départ', badge: `${checkedCount}/${totalItems}` },
            { key: 'incident', label: '⚠️ Signaler', badge: null },
            { key: 'score', label: '📊 Mon score', badge: null },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              style={{ flex: 1, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: activeTab === tab.key ? '#fff' : 'rgba(255,255,255,0.4)', borderBottom: `2px solid ${activeTab === tab.key ? GOLD : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              {tab.label}
              {tab.badge && (
                <span style={{ background: activeTab === tab.key ? GOLD : 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 20 }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>

        {/* ══ CHECKLIST ══ */}
        {activeTab === 'checklist' && (
          <div>
            {checkSubmitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>{allChecked ? '✅' : '⚠️'}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>
                  {allChecked ? 'Checklist complète !' : 'Checklist incomplète'}
                </div>
                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
                  {checkedCount}/{totalItems} points validés
                </div>
                <Button onClick={() => setCheckSubmitted(false)} variant="outline" className="rounded-xl">
                  Refaire la checklist
                </Button>
              </motion.div>
            ) : (
              <div>
                {/* Barre de progression */}
                <div style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', marginBottom: 16, border: '1.5px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>Progression</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: allChecked ? '#22C55E' : GOLD }}>{checkedCount}/{totalItems}</span>
                  </div>
                  <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${checkedCount / totalItems * 100}%`, background: allChecked ? '#22C55E' : GOLD, borderRadius: 3, transition: 'width 0.3s ease' }} />
                  </div>
                </div>

                {/* Items par catégorie */}
                {categories.map(cat => (
                  <div key={cat} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>{cat}</div>
                    <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #E5E7EB', overflow: 'hidden' }}>
                      {CHECKLIST_ITEMS.filter(i => i.category === cat).map((item, idx, arr) => (
                        <button key={item.key}
                          onClick={() => setChecks(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                          style={{ width: '100%', padding: '12px 14px', background: checks[item.key] ? '#F0FDF4' : '#fff', border: 'none', borderBottom: idx < arr.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', transition: 'background 0.15s' }}>
                          <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${checks[item.key] ? '#22C55E' : '#D1D5DB'}`, background: checks[item.key] ? '#22C55E' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                            {checks[item.key] && <span style={{ color: '#fff', fontSize: 12, fontWeight: 900 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: checks[item.key] ? 600 : 400, color: checks[item.key] ? '#166534' : '#374151' }}>
                            {item.label}
                          </span>
                          {item.required && !checks[item.key] && (
                            <span style={{ marginLeft: 'auto', fontSize: 9, color: '#EF4444', fontWeight: 700, background: '#FEF2F2', padding: '1px 5px', borderRadius: 4 }}>obligatoire</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <Button
                  onClick={handleSubmitChecklist}
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl text-white font-bold mt-4"
                  style={{ backgroundColor: allChecked ? '#22C55E' : GOLD, opacity: isLoading ? 0.6 : 1 }}
                >
                  {allChecked ? '✅ Valider la checklist — Prêt à partir !' : `Soumettre (${checkedCount}/${totalItems})`}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ══ SIGNALER UN INCIDENT ══ */}
        {activeTab === 'incident' && (
          <div>
            {incidentSubmitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>Incident signalé</div>
                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>Notre équipe examinera le signalement sous 24h</div>
                <Button onClick={() => setIncidentSubmitted(false)} variant="outline" className="rounded-xl">Signaler un autre incident</Button>
              </motion.div>
            ) : (
              <div>
                <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 12, lineHeight: 1.5 }}>
                  Signalez un incident que vous avez observé ou vécu. Toutes les déclarations sont vérifiées avant action.
                </div>

                {/* Filtres par tier */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {([1, 2, 3] as const).map(t => (
                    <button key={t} onClick={() => setShowTier(showTier === t ? null : t)}
                      style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: `1.5px solid ${showTier === t ? tierColors[t] : '#E5E7EB'}`, background: showTier === t ? tierBg[t] : '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 700, color: showTier === t ? tierColors[t] : '#6B7280' }}>
                      Tier {t}
                    </button>
                  ))}
                </div>

                {/* Liste des infractions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {(Object.entries(INCIDENT_CATALOG) as [IncidentCategory, any][])
                    .filter(([, meta]) => !showTier || meta.tier === showTier)
                    .map(([cat, meta]) => (
                      <button key={cat}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                        style={{ padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${selectedCategory === cat ? tierColors[meta.tier as 1|2|3] : '#E5E7EB'}`, background: selectedCategory === cat ? tierBg[meta.tier as 1|2|3] : '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: tierBg[meta.tier as 1|2|3], color: tierColors[meta.tier as 1|2|3], border: `1px solid ${tierColors[meta.tier as 1|2|3]}`, flexShrink: 0 }}>T{meta.tier}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', flex: 1 }}>{meta.label}</span>
                          {meta.fineAmount > 0 && (
                            <span style={{ fontSize: 10, color: '#EF4444', fontWeight: 700 }}>CHF {meta.fineAmount}</span>
                          )}
                        </div>
                        {selectedCategory === cat && (
                          <div style={{ marginTop: 4, fontSize: 11, color: '#6B7280' }}>{meta.description}</div>
                        )}
                      </button>
                    ))}
                </div>

                {selectedCategory && (
                  <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #E5E7EB', padding: '12px 14px', marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>Référence réservation (optionnel)</div>
                    <input type="text" value={incidentBookingId} onChange={e => setIncidentBookingId(e.target.value)}
                      placeholder="ID de la réservation concernée"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontFamily: 'inherit', fontSize: 12, color: '#1A1A1A', boxSizing: 'border-box', marginBottom: 10, outline: 'none' }} />
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>Détails supplémentaires</div>
                    <textarea value={incidentDesc} onChange={e => setIncidentDesc(e.target.value)}
                      placeholder="Décrivez l'incident en quelques mots..."
                      rows={3}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontFamily: 'inherit', fontSize: 12, color: '#1A1A1A', boxSizing: 'border-box', resize: 'none', outline: 'none' }} />
                  </div>
                )}

                <Button
                  onClick={handleSubmitIncident}
                  disabled={!selectedCategory || isLoading}
                  className="w-full h-12 rounded-xl text-white font-bold"
                  style={{ backgroundColor: selectedCategory ? tierColors[INCIDENT_CATALOG[selectedCategory].tier as 1|2|3] : '#9CA3AF' }}
                >
                  <Send style={{ width: 14, height: 14, marginRight: 6 }} />
                  {selectedCategory ? `Signaler — ${INCIDENT_CATALOG[selectedCategory].label}` : 'Choisissez une infraction'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ══ SCORE ══ */}
        {activeTab === 'score' && (
          <div>
            {!score ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
                <div style={{ fontSize: 32, marginBottom: 8, animation: 'pulse 1.5s infinite' }}>📊</div>
                <div style={{ fontSize: 13 }}>Chargement du score...</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Score principal */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E5E7EB', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  <ScoreGauge score={score.score} level={score.level} getLevelColor={getLevelColor} getLevelLabel={getLevelLabel} />

                  <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'Ponctualité', value: `${Math.round(score.punctuality_rate)}%`, icon: '⏱️' },
                      { label: 'Checklist', value: `${Math.round(score.check_rate)}%`, icon: '✅' },
                      { label: 'Note moyenne', value: `${score.avg_rating}/5`, icon: '⭐' },
                      { label: 'Commission', value: `${Math.round(score.effective_commission * 100)}%`, icon: '💰' },
                    ].map(item => (
                      <div key={item.label} style={{ textAlign: 'center', padding: '8px', background: '#F9F9F9', borderRadius: 10 }}>
                        <div style={{ fontSize: 16 }}>{item.icon}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#1A1A1A', marginTop: 2 }}>{item.value}</div>
                        <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 1 }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Incidents du mois */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E5E7EB', padding: '14px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 10 }}>Incidents ce mois — {score.month}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {[
                      { tier: 1, count: score.tier1_count, color: '#EF4444', bg: '#FEF2F2', label: 'Tier 1' },
                      { tier: 2, count: score.tier2_count, color: '#F97316', bg: '#FFF7ED', label: 'Tier 2' },
                      { tier: 3, count: score.tier3_count, color: GOLD, bg: '#FFFBEB', label: 'Tier 3' },
                    ].map(item => (
                      <div key={item.tier} style={{ textAlign: 'center', padding: '8px', background: item.count > 0 ? item.bg : '#F9F9F9', borderRadius: 10, border: item.count > 0 ? `1.5px solid ${item.color}` : '1.5px solid #E5E7EB' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: item.count > 0 ? item.color : '#9CA3AF' }}>{item.count}</div>
                        <div style={{ fontSize: 9, color: item.count > 0 ? item.color : '#9CA3AF', fontWeight: 600 }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Impact commission */}
                {score.penalty > 0 && (
                  <div style={{ background: '#FEF2F2', borderRadius: 12, border: '1.5px solid #FECACA', padding: '12px 14px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#991B1B', marginBottom: 4 }}>⚠️ Pénalité commission active</div>
                    <div style={{ fontSize: 11, color: '#7F1D1D', lineHeight: 1.5 }}>
                      +{Math.round(score.penalty * 100)}% de commission supplémentaire ce mois suite aux incidents.
                      Commission effective : <strong>{Math.round(score.effective_commission * 100)}%</strong> au lieu de 20%.
                    </div>
                  </div>
                )}

                {/* Bonus */}
                {score.bonus > 0 && (
                  <div style={{ background: '#F0FDF4', borderRadius: 12, border: '1.5px solid #BBF7D0', padding: '12px 14px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 4 }}>🏆 Bonus excellence</div>
                    <div style={{ fontSize: 11, color: '#14532D', lineHeight: 1.5 }}>
                      Score ≥ 95/100 — Bonus de <strong>CHF {score.bonus}</strong> ajouté à votre paiement mensuel.
                    </div>
                  </div>
                )}

                {/* Comment améliorer */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E5E7EB', padding: '14px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>💡 Comment améliorer votre score</div>
                  {[
                    score.punctuality_rate < 95 && '⏱️ Soyez à l\'heure — chaque retard coûte 0.2 pts',
                    score.check_rate < 100 && '✅ Complétez toutes les checklists avant chaque départ',
                    score.avg_rating < 4.8 && '⭐ Travaillez l\'expérience passager pour améliorer votre note',
                    score.tier3_count > 0 && '🟡 Évitez les infractions Tier 3 — même mineures elles pénalisent',
                  ].filter(Boolean).map((tip, i) => (
                    <div key={i} style={{ fontSize: 11, color: '#6B7280', padding: '4px 0', borderTop: i > 0 ? '1px solid #F3F4F6' : 'none' }}>
                      {tip}
                    </div>
                  ))}
                  {score.score >= 95 && (
                    <div style={{ fontSize: 11, color: '#22C55E', fontWeight: 600 }}>
                      🎉 Excellent ! Continuez comme ça pour maintenir votre niveau Gold.
                    </div>
                  )}
                </div>

                <Button onClick={() => refreshScore(MOCK_DRIVER_ID)} variant="outline" className="w-full rounded-xl h-10 text-sm">
                  Actualiser le score
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default VanPreDeparturePage;
