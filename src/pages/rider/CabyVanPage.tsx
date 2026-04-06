import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Leaf, Users, Clock, MapPin, Luggage, Bike, QrCode, ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  cabyVanRoutes, ROUTES, ALL_CITIES, findRoute, getDestinationsFromWithFilter, generateSlotsForRoute,
  formatDuration, SEGMENT_META, ROUTE_FILTER_META, getCitiesForFilter,
  type VanSlot, type VanRoute, type RouteFilter,
} from '@/lib/cabyVanPricing';
import BottomNav from '@/components/rider/BottomNav';

type Step = 'hero' | 'search' | 'results' | 'seat' | 'confirm';

const badgeIcon: Record<string, string> = { green: '🟢', orange: '🟠', red: '🔴' };
const badgeColor: Record<string, string> = {
  green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  orange: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const SeatBar: React.FC<{ total: number; taken: number }> = ({ total, taken }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: total }, (_, i) => (
      <div key={i} className={`h-3 flex-1 rounded-sm ${i < taken ? 'bg-muted/60' : 'bg-[hsl(43,75%,52%)]'}`} />
    ))}
  </div>
);

const SeatButton: React.FC<{ seat: number; taken: boolean; selected: boolean; onSelect: (s: number) => void }> = ({ seat, taken, selected, onSelect }) => (
  <button
    disabled={taken}
    onClick={() => onSelect(seat)}
    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold transition-all
      ${taken ? 'bg-muted/50 text-muted-foreground border border-border cursor-not-allowed' : ''}
      ${!taken && !selected ? 'bg-[hsl(43,75%,52%)]/20 text-[hsl(43,75%,52%)] border border-[hsl(43,75%,52%)]/30 hover:bg-[hsl(43,75%,52%)]/30' : ''}
      ${selected ? 'bg-emerald-500 text-white border border-emerald-400 scale-110 shadow-lg' : ''}
    `}
  >
    {taken ? <X className="w-3 h-3" /> : seat}
  </button>
);

// Group routes for hero
const HERO_GROUPS: { title: string; icon: string; routes: VanRoute[] }[] = [
  { title: 'AXE ROMAND', icon: '🏙️', routes: cabyVanRoutes.filter(r => r.id <= 5) },
  { title: 'AXE PLATEAU', icon: '💼', routes: cabyVanRoutes.filter(r => r.id >= 6 && r.id <= 12) },
  { title: 'AXE ALÉMANIQUE', icon: '🇨🇭', routes: cabyVanRoutes.filter(r => r.id >= 13 && r.id <= 18) },
  { title: 'LONGUE DISTANCE', icon: '⭐', routes: cabyVanRoutes.filter(r => r.id >= 19 && r.id <= 21) },
  { title: 'SKI SUISSE', icon: '🎿', routes: cabyVanRoutes.filter(r => r.id >= 22 && r.id <= 28) },
  { title: 'SKI FRANCE', icon: '🎿🇫🇷', routes: cabyVanRoutes.filter(r => r.id >= 29 && r.id <= 33) },
  { title: 'TRANSFRONTALIER', icon: '🌍', routes: cabyVanRoutes.filter(r => r.id >= 34 && r.id <= 37) },
];

const CabyVanPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('hero');
  const [filter, setFilter] = useState<RouteFilter>('all');

  const [from, setFrom] = useState('Genève');
  const [to, setTo] = useState('');
  const [dateAller, setDateAller] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [roundTrip, setRoundTrip] = useState(false);
  const [dateRetour, setDateRetour] = useState('');

  const [selectedSlot, setSelectedSlot] = useState<VanSlot | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [baggage, setBaggage] = useState<'small' | 'large' | 'special'>('small');

  const selectedRoute = useMemo(() => (from && to ? findRoute(from, to) : undefined), [from, to]);
  const cities = useMemo(() => getCitiesForFilter(filter), [filter]);
  const destinations = useMemo(() => getDestinationsFromWithFilter(from, filter), [from, filter]);

  const depDate = useMemo(() => dateAller ? new Date(dateAller) : undefined, [dateAller]);
  const slots = useMemo(() => selectedRoute ? generateSlotsForRoute(selectedRoute, depDate) : [], [selectedRoute, depDate]);

  const takenSeats = useMemo(() => {
    if (!selectedSlot) return [];
    return Array.from({ length: selectedSlot.seatsTaken }, (_, i) => i + 1);
  }, [selectedSlot]);

  const baggageCost = baggage === 'large' ? 5 : baggage === 'special' ? 15 : 0;
  const totalPrice = selectedSlot ? selectedSlot.basePrice + baggageCost : 0;

  const handleSearch = () => { if (from && to && from !== to && selectedRoute) setStep('results'); };
  const handleSelectSlot = (slot: VanSlot) => { setSelectedSlot(slot); setSelectedSeat(null); setStep('seat'); };

  const isTransfrontalier = (r: VanRoute) => r.flag.includes('🇫🇷') || r.flag.includes('🇩🇪');

  // ── HERO ──
  if (step === 'hero') {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(43,75%,52%)]/15 via-background to-background" />
          <div className="relative px-5 pt-14 pb-8">
            <button onClick={() => navigate('/caby/services')} className="flex items-center gap-1 text-muted-foreground mb-6">
              <ArrowLeft className="w-4 h-4" /> Services
            </button>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🚐</span>
                <h1 className="text-2xl font-bold tracking-tight">Caby Van</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Longue Distance</span>
              </div>
              <p className="text-xl font-bold mt-4">Voyagez malin. Écolo. Confortable.</p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Réservez un siège, pas un taxi. Moins cher que le train, plus confortable qu'Uber.</p>

              <div className="mt-6 flex flex-col gap-2">
                {[
                  { label: 'CFF 2ème classe', price: 78, strike: true },
                  { label: 'Uber', price: 220, strike: true },
                  { label: 'Caby Van', price: 22, highlight: true },
                ].map((c) => (
                  <div key={c.label} className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${c.highlight ? 'bg-[hsl(43,75%,52%)]/15 border border-[hsl(43,75%,52%)]/30' : 'bg-muted/30'}`}>
                    <span className={`text-sm ${c.highlight ? 'font-bold' : 'text-muted-foreground'}`}>{c.label}</span>
                    <span className={`text-sm font-bold ${c.strike ? 'line-through text-muted-foreground' : ''} ${c.highlight ? 'text-[hsl(43,75%,52%)]' : ''}`}>
                      {c.highlight ? `dès CHF ${c.price} ✓` : `CHF ${c.price}`}
                    </span>
                  </div>
                ))}
              </div>

              <Button onClick={() => setStep('search')} className="w-full mt-6 bg-[hsl(43,75%,52%)] hover:bg-[hsl(43,75%,45%)] text-black font-bold rounded-xl h-12">
                Réserver un siège
              </Button>
            </motion.div>

            <div className="mt-8 flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
              <Leaf className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <p className="text-xs text-emerald-300">La communauté Caby Van a économisé <span className="font-bold">12.4 tonnes de CO₂</span> ce mois</p>
            </div>

            {HERO_GROUPS.map(group => (
              <div key={group.title} className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <span>{group.icon}</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(43,75%,52%)]">{group.title}</h3>
                  <div className="flex-1 h-px bg-[hsl(43,75%,52%)]/20" />
                </div>
                <div className="space-y-2">
                  {group.routes.map(r => (
                    <button key={r.id} onClick={() => { setFrom(r.from); setTo(r.to); setStep('search'); }}
                      className="w-full flex items-center justify-between rounded-xl bg-card border border-border p-3 text-left">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm">{r.flag}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{r.from} ↔ {r.to}</p>
                          <p className="text-[10px] text-muted-foreground">{formatDuration(r.duration)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {r.seasonal && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">❄️</span>}
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${SEGMENT_META[r.segment]?.color}`}>{SEGMENT_META[r.segment]?.label}</span>
                        <span className="text-sm font-black text-[hsl(43,75%,52%)]">CHF {r.basePrice}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-8 rounded-xl bg-muted/30 border border-border p-4 text-center text-xs text-muted-foreground">
              <p className="font-bold text-sm text-foreground mb-1">37 destinations · Bidirectionnelles</p>
              <p>Suisse · France · Allemagne</p>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── SEARCH ──
  if (step === 'search') {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-14">
          <button onClick={() => setStep('hero')} className="flex items-center gap-1 text-muted-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <h2 className="text-xl font-bold mb-4">Rechercher un trajet</h2>

          {/* Filter tabs */}
          <div className="flex gap-1.5 mb-5 flex-wrap">
            {ROUTE_FILTER_META.map(f => (
              <button key={f.key} onClick={() => { setFilter(f.key); setTo(''); }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${filter === f.key ? 'bg-[hsl(43,75%,52%)] text-black' : 'bg-muted/30 text-muted-foreground'}`}>
                <span>{f.icon}</span>{f.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ville de départ</label>
              <select value={from} onChange={(e) => { setFrom(e.target.value); setTo(''); }} className="w-full h-12 rounded-xl bg-muted/30 border border-border px-4 text-sm">
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex justify-center -my-1">
              <button onClick={() => { const t = from; setFrom(to || from); setTo(t); }} className="w-8 h-8 rounded-full bg-[hsl(43,75%,52%)]/20 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-[hsl(43,75%,52%)] rotate-90" />
              </button>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ville d'arrivée</label>
              <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full h-12 rounded-xl bg-muted/30 border border-border px-4 text-sm">
                <option value="">Choisir une destination</option>
                {destinations.map(c => {
                  const r = findRoute(from, c);
                  return (
                    <option key={c} value={c}>
                      {c}{r?.seasonal ? ' ❄️' : ''}{r && isTransfrontalier(r) ? ' 🌍' : ''} — {r ? formatDuration(r.duration) : ''} · CHF {r?.basePrice}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedRoute && (
              <div className="rounded-xl bg-[hsl(43,75%,52%)]/10 border border-[hsl(43,75%,52%)]/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Clock className="w-4 h-4 text-[hsl(43,75%,52%)]" />
                    <span className="text-sm font-medium">{formatDuration(selectedRoute.duration)}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${SEGMENT_META[selectedRoute.segment]?.color}`}>{SEGMENT_META[selectedRoute.segment]?.label}</span>
                    {selectedRoute.seasonal && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">❄️ Saisonnier</span>}
                    {isTransfrontalier(selectedRoute) && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">🌍 Transfrontalier</span>}
                  </div>
                  <span className="text-sm font-bold ml-2">dès CHF {selectedRoute.basePrice}</span>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Date aller</label>
              <input type="date" value={dateAller} onChange={(e) => setDateAller(e.target.value)} className="w-full h-12 rounded-xl bg-muted/30 border border-border px-4 text-sm" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Aller-retour</span>
              <button onClick={() => setRoundTrip(!roundTrip)} className={`w-11 h-6 rounded-full transition-colors ${roundTrip ? 'bg-[hsl(43,75%,52%)]' : 'bg-muted'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${roundTrip ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {roundTrip && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Date retour</label>
                <input type="date" value={dateRetour} onChange={(e) => setDateRetour(e.target.value)} className="w-full h-12 rounded-xl bg-muted/30 border border-border px-4 text-sm" />
              </div>
            )}

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Passagers</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-10 h-10 rounded-xl bg-muted/30 border border-border flex items-center justify-center text-lg font-bold">-</button>
                <span className="text-lg font-bold w-8 text-center">{passengers}</span>
                <button onClick={() => setPassengers(Math.min(7, passengers + 1))} className="w-10 h-10 rounded-xl bg-muted/30 border border-border flex items-center justify-center text-lg font-bold">+</button>
                <Users className="w-4 h-4 text-muted-foreground ml-1" />
              </div>
            </div>

            <Button onClick={handleSearch} disabled={!selectedRoute} className="w-full mt-4 bg-[hsl(43,75%,52%)] hover:bg-[hsl(43,75%,45%)] text-black font-bold rounded-xl h-12 disabled:opacity-40">
              Rechercher
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── RESULTS ──
  if (step === 'results' && selectedRoute) {
    const co2Saved = Math.round(selectedRoute.duration * 0.12 * 10) / 10;
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-14">
          <button onClick={() => setStep('search')} className="flex items-center gap-1 text-muted-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Modifier
          </button>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <MapPin className="w-4 h-4 text-[hsl(43,75%,52%)]" />
            <h2 className="text-lg font-bold">{from} → {to}</h2>
            <span className="text-sm">{selectedRoute.flag}</span>
            {selectedRoute.seasonal && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">❄️ Saisonnier</span>}
            {isTransfrontalier(selectedRoute) && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">🌍</span>}
          </div>
          <p className="text-xs text-muted-foreground mb-6">{dateAller || "Aujourd'hui"} · {passengers} passager{passengers > 1 ? 's' : ''} · {formatDuration(selectedRoute.duration)}</p>

          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Créneaux disponibles</h3>
          <div className="space-y-3">
            {slots.map((slot, idx) => {
              const seatsLeft = slot.seatsTotal - slot.seatsTaken;
              return (
                <motion.button key={slot.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectSlot(slot)} className="w-full text-left rounded-2xl bg-card border border-border p-4 space-y-2.5">
                  {/* Row 1: Time + label */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{badgeIcon[slot.badge]}</span>
                      <span className="font-bold">{slot.departure}</span>
                      <span className="text-muted-foreground text-xs">→ {slot.arrivalEstimate}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor[slot.badge]}`}>{slot.label}</span>
                  </div>

                  {/* Row 2: Price + reason */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-black">CHF {slot.basePrice}</p>
                      <p className="text-[10px] text-muted-foreground">{slot.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{seatsLeft} siège{seatsLeft > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Row 3: Seat bar */}
                  <SeatBar total={slot.seatsTotal} taken={slot.seatsTaken} />

                  {/* Row 4: CO2 */}
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                    <Leaf className="w-3 h-3" />
                    <span>{co2Saved} kg de CO₂ économisés vs voiture solo</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Custom time (business routes only) */}
          {selectedRoute.duration > 60 && selectedRoute.duration <= 180 && (
            <div className="mt-6 rounded-2xl border border-dashed border-[hsl(43,75%,52%)]/30 p-4 text-center">
              <Clock className="w-5 h-5 text-[hsl(43,75%,52%)] mx-auto mb-2" />
              <p className="text-sm font-bold">Choisissez votre heure exacte</p>
              <p className="text-xs text-muted-foreground mt-1">Disponible entre 10h et 16h · prix dynamique</p>
              <input type="time" min="10:00" max="16:00" className="mt-3 h-10 rounded-xl bg-muted/30 border border-border px-4 text-sm" />
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── SEAT SELECTION ──
  if (step === 'seat' && selectedSlot && selectedRoute) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-14">
          <button onClick={() => setStep('results')} className="flex items-center gap-1 text-muted-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Créneaux
          </button>
          <div className="rounded-2xl bg-card border border-border p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">{from} → {to}</p>
                <p className="text-xs text-muted-foreground">{selectedSlot.departure} → {selectedSlot.arrivalEstimate} · {dateAller || "Aujourd'hui"}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black">CHF {selectedSlot.basePrice}</p>
                <p className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border inline-block ${badgeColor[selectedSlot.badge]}`}>{selectedSlot.reason}</p>
              </div>
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Choisissez votre siège</h3>
          <div className="rounded-2xl bg-card border border-border p-6 mb-6">
            <div className="relative mx-auto" style={{ width: 200 }}>
              <div className="border-2 border-muted rounded-3xl p-4 pt-10 pb-6">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground font-bold">AVANT ▲</div>
                <div className="flex justify-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center text-xs text-muted-foreground border border-border">🚐</div>
                </div>
                <div className="flex justify-center gap-3 mb-3">{[1, 2].map(s => <SeatButton key={s} seat={s} taken={takenSeats.includes(s)} selected={selectedSeat === s} onSelect={setSelectedSeat} />)}</div>
                <div className="flex justify-center gap-3 mb-3">{[3, 4, 5].map(s => <SeatButton key={s} seat={s} taken={takenSeats.includes(s)} selected={selectedSeat === s} onSelect={setSelectedSeat} />)}</div>
                <div className="flex justify-center gap-3">{[6, 7].map(s => <SeatButton key={s} seat={s} taken={takenSeats.includes(s)} selected={selectedSeat === s} onSelect={setSelectedSeat} />)}</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-[10px]">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-muted border border-border" /> Occupé</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[hsl(43,75%,52%)]" /> Disponible</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500" /> Votre siège</span>
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Bagage</h3>
          <div className="flex gap-2 mb-6">
            {([
              { key: 'small' as const, label: 'Cabine', sub: 'Inclus', icon: <Luggage className="w-4 h-4" />, cost: 0 },
              { key: 'large' as const, label: 'Grande valise', sub: '+CHF 5', icon: <Luggage className="w-5 h-5" />, cost: 5 },
              { key: 'special' as const, label: 'Skis/Vélo', sub: '+CHF 15', icon: <Bike className="w-4 h-4" />, cost: 15 },
            ]).map(b => (
              <button key={b.key} onClick={() => setBaggage(b.key)}
                className={`flex-1 rounded-xl p-3 text-center border transition-colors ${baggage === b.key ? 'border-[hsl(43,75%,52%)] bg-[hsl(43,75%,52%)]/10' : 'border-border bg-card'}`}>
                <div className="flex justify-center mb-1">{b.icon}</div>
                <p className="text-xs font-bold">{b.label}</p>
                <p className="text-[10px] text-muted-foreground">{b.sub}</p>
              </button>
            ))}
          </div>

          {/* Toggle aller-retour from seat view */}
          {roundTrip && (
            <div className="rounded-2xl bg-card border border-border p-4 mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Retour — {to} → {from}</p>
              <p className="text-xs text-muted-foreground">{dateRetour || 'Date non sélectionnée'}</p>
              <p className="text-xs text-[hsl(43,75%,52%)] mt-1">Prix retour calculé dynamiquement à la confirmation</p>
            </div>
          )}

          <div className="rounded-2xl bg-[hsl(43,75%,52%)]/10 border border-[hsl(43,75%,52%)]/30 p-4 mb-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Trajet</span><span className="font-bold">{from} → {to}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Horaire</span><span className="font-bold">{selectedSlot.departure} → {selectedSlot.arrivalEstimate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Siège</span><span className="font-bold">{selectedSeat ? `N°${selectedSeat}` : '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Bagage</span><span className="font-bold">{baggage === 'small' ? 'Cabine' : baggage === 'large' ? 'Grande valise' : 'Skis/Vélo'}</span></div>
              <div className="border-t border-[hsl(43,75%,52%)]/20 pt-2 flex justify-between">
                <span className="font-medium">Total</span>
                <span className="text-2xl font-black">CHF {totalPrice}</span>
              </div>
            </div>
            {baggageCost > 0 && <p className="text-[10px] text-muted-foreground mt-1">Inclut supplément bagage +CHF {baggageCost}</p>}
          </div>

          <Button onClick={() => setStep('confirm')} disabled={!selectedSeat} className="w-full bg-[hsl(43,75%,52%)] hover:bg-[hsl(43,75%,45%)] text-black font-bold rounded-xl h-12 disabled:opacity-40">
            Confirmer et payer
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── CONFIRMATION ──
  if (step === 'confirm' && selectedSlot && selectedRoute) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-14 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-400" />
          </motion.div>
          <h2 className="text-xl font-bold mb-1">Réservation confirmée !</h2>
          <p className="text-sm text-muted-foreground mb-6">Votre e-ticket a été envoyé par email</p>

          <div className="rounded-2xl bg-card border border-border overflow-hidden text-left">
            <div className="bg-[hsl(43,75%,52%)]/10 px-5 py-3 border-b border-border">
              <p className="text-xs font-bold uppercase tracking-wider text-[hsl(43,75%,52%)]">E-Ticket Caby Van</p>
            </div>
            <div className="p-5 space-y-3">
              {[
                ['Trajet', `${from} → ${to}`],
                ['Date', dateAller || "Aujourd'hui"],
                ['Départ', selectedSlot.departure],
                ['Arrivée estimée', selectedSlot.arrivalEstimate],
                ['Durée', formatDuration(selectedRoute.duration)],
                ['Siège', `N°${selectedSeat}`],
                ['Chauffeur', 'David M. · GE 482 317'],
                ['Point RDV', from === 'Genève' ? 'Gare Cornavin, Sortie C' : `Gare de ${from}`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-bold">{value}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-border pt-3 flex justify-between text-sm">
                <span className="text-muted-foreground">Total payé</span>
                <span className="text-xl font-black">CHF {totalPrice}</span>
              </div>
            </div>
            <div className="border-t border-dashed border-border p-5 flex flex-col items-center">
              <div className="w-32 h-32 rounded-xl bg-white flex items-center justify-center">
                <QrCode className="w-20 h-20 text-black" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Présentez ce QR code au chauffeur</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
            <Leaf className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-emerald-300 text-left">🌿 Trajet partagé — vous économisez <span className="font-bold">{Math.round(selectedRoute.duration * 0.12 * 10) / 10} kg de CO₂</span> vs voiture solo</p>
          </div>

          <Button onClick={() => navigate('/caby/services')} variant="outline" className="w-full mt-4 rounded-xl h-12">
            Retour aux services
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return null;
};

export default CabyVanPage;
