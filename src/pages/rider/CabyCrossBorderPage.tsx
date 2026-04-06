import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Leaf, Users, Clock, MapPin, Luggage, QrCode, ArrowRight, Check, X, Star, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ALL_CB_CITIES, ALL_CB_ROUTES, findCBRoute, getCBDestinations, generateCBSlots,
  formatDurationCB, VEHICLE_TYPES, EUR_RATE, isValidCrossBorder,
  type CrossBorderRoute, type CrossBorderVehicle, type CBSlot,
} from '@/lib/crossBorderData';
import BottomNav from '@/components/rider/BottomNav';

type Step = 'hero' | 'search' | 'results' | 'seat' | 'confirm';
type CategoryFilter = 'all' | 'frontalier' | 'regional' | 'longue_distance' | 'italie';

const CATEGORY_TABS: { key: CategoryFilter; label: string; icon: string }[] = [
  { key: 'all', label: 'Tous', icon: '🌍' },
  { key: 'frontalier', label: 'Frontaliers', icon: '🚗' },
  { key: 'regional', label: 'Régional', icon: '🏔️' },
  { key: 'longue_distance', label: 'Longue distance', icon: '🛣️' },
  { key: 'italie', label: 'Italie', icon: '🇮🇹' },
];

const SeatButton: React.FC<{ seat: number; taken: boolean; selected: boolean; onSelect: (s: number) => void }> = ({ seat, taken, selected, onSelect }) => (
  <button disabled={taken} onClick={() => onSelect(seat)}
    className={`w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold transition-all
      ${taken ? 'bg-muted/50 text-muted-foreground border border-border cursor-not-allowed' : ''}
      ${!taken && !selected ? 'bg-[hsl(43,75%,52%)]/20 text-[hsl(43,75%,52%)] border border-[hsl(43,75%,52%)]/30 hover:bg-[hsl(43,75%,52%)]/30' : ''}
      ${selected ? 'bg-emerald-500 text-white border border-emerald-400 scale-110 shadow-lg' : ''}
    `}>
    {taken ? <X className="w-3 h-3" /> : seat}
  </button>
);

const CabyCrossBorderPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('hero');
  const [catFilter, setCatFilter] = useState<CategoryFilter>('all');
  const [vehicleFilter, setVehicleFilter] = useState<CrossBorderVehicle | 'all'>('all');

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dateAller, setDateAller] = useState('');
  const [passengers, setPassengers] = useState(1);

  const [selectedSlot, setSelectedSlot] = useState<CBSlot | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [baggage, setBaggage] = useState<'small' | 'large'>('small');

  const selectedRoute = useMemo(() => (from && to ? findCBRoute(from, to) : undefined), [from, to]);
  const destinations = useMemo(() => from ? getCBDestinations(from, catFilter) : [], [from, catFilter]);
  const slots = useMemo(() => selectedRoute ? generateCBSlots(selectedRoute, vehicleFilter) : [], [selectedRoute, vehicleFilter]);
  const isValid = useMemo(() => isValidCrossBorder(from, to), [from, to]);
  const validationError = useMemo(() => {
    if (from && to && !isValid) return 'Au moins un point doit être en France, Italie ou Allemagne.';
    return null;
  }, [from, to, isValid]);

  const baggageCost = baggage === 'large' ? 5 : 0;
  const totalPrice = selectedSlot ? selectedSlot.pricePerSeat + baggageCost : 0;
  const totalEur = Math.round(totalPrice * EUR_RATE);

  const takenSeats = useMemo(() => {
    if (!selectedSlot) return [];
    return Array.from({ length: selectedSlot.seatsTaken }, (_, i) => i + 1);
  }, [selectedSlot]);

  // VehicleType info for selected slot
  const slotVehicle = selectedSlot ? VEHICLE_TYPES.find(v => v.key === selectedSlot.vehicle) : null;

  // ── HERO ──
  if (step === 'hero') {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/15 via-background to-background" />
          <div className="relative px-5 pt-14 pb-8">
            <button onClick={() => navigate('/caby/services')} className="flex items-center gap-1 text-muted-foreground mb-6">
              <ArrowLeft className="w-4 h-4" /> Services
            </button>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🌍</span>
                <h1 className="text-2xl font-bold tracking-tight">Caby Cross-Border</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">🇪🇺 EU</span>
              </div>
              <p className="text-xl font-bold mt-4">Voyagez ensemble. France ↔ Suisse.</p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Covoiturage premium avec chauffeur professionnel certifié. Partagez le trajet, pas le prix d'un taxi.
              </p>

              <div className="flex gap-2 mt-5 flex-wrap">
                {[
                  { icon: '🌿', label: 'Écologique' },
                  { icon: '💰', label: 'Économique' },
                  { icon: '✓', label: 'Chauffeur certifié' },
                ].map(b => (
                  <span key={b.label} className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {b.icon} {b.label}
                  </span>
                ))}
              </div>

              <div className="mt-6 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Véhicules disponibles</p>
                {VEHICLE_TYPES.map(v => (
                  <div key={v.key} className="flex items-center justify-between rounded-xl bg-card border border-border p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{v.icon}</span>
                      <div>
                        <p className="text-sm font-bold">{v.label}</p>
                        <p className="text-[10px] text-muted-foreground">{v.examples}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[hsl(43,75%,52%)]">{v.seats} sièges</span>
                  </div>
                ))}
              </div>

              <Button onClick={() => setStep('search')} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-12">
                🌍 Rechercher un trajet Cross-Border
              </Button>
            </motion.div>

            {/* Route groups */}
            {[
              { title: 'FRONTALIERS QUOTIDIENS', cat: 'frontalier' as const, icon: '🚗' },
              { title: 'RÉGIONAL', cat: 'regional' as const, icon: '🏔️' },
              { title: 'LONGUE DISTANCE', cat: 'longue_distance' as const, icon: '🛣️' },
              { title: 'ITALIE VIA SIMPLON', cat: 'italie' as const, icon: '🇮🇹' },
            ].map(group => {
              const routes = ALL_CB_ROUTES.filter(r => r.category === group.cat && r.id <= 100);
              return (
                <div key={group.cat} className="mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{group.icon}</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">{group.title}</h3>
                    <div className="flex-1 h-px bg-blue-500/20" />
                  </div>
                  <div className="space-y-2">
                    {routes.map(r => (
                      <button key={r.id} onClick={() => { setFrom(r.from); setTo(r.to); setStep('search'); }}
                        className="w-full flex items-center justify-between rounded-xl bg-card border border-border p-3 text-left">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold truncate">{r.from} ↔ {r.to}</p>
                          <p className="text-[10px] text-muted-foreground">{formatDurationCB(r.duration)}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-black text-[hsl(43,75%,52%)]">dès CHF {r.suggestedPrice.berline}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="mt-8 rounded-xl bg-muted/30 border border-border p-4 text-center text-xs text-muted-foreground">
              <p className="font-bold text-sm text-foreground mb-1">{ALL_CB_ROUTES.length} routes bidirectionnelles</p>
              <p>France · Italie · Berline · SUV · Monospace · VAN</p>
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
          <h2 className="text-xl font-bold mb-4">🌍 Recherche Cross-Border</h2>

          {/* Category filter */}
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {CATEGORY_TABS.map(f => (
              <button key={f.key} onClick={() => { setCatFilter(f.key); setTo(''); }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${catFilter === f.key ? 'bg-blue-600 text-white' : 'bg-muted/30 text-muted-foreground'}`}>
                <span>{f.icon}</span>{f.label}
              </button>
            ))}
          </div>

          {/* Vehicle filter */}
          <div className="flex gap-1.5 mb-5 flex-wrap">
            <button onClick={() => setVehicleFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold ${vehicleFilter === 'all' ? 'bg-[hsl(43,75%,52%)] text-black' : 'bg-muted/30 text-muted-foreground'}`}>
              Tous véhicules
            </button>
            {VEHICLE_TYPES.map(v => (
              <button key={v.key} onClick={() => setVehicleFilter(v.key)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold ${vehicleFilter === v.key ? 'bg-[hsl(43,75%,52%)] text-black' : 'bg-muted/30 text-muted-foreground'}`}>
                {v.icon} {v.label} ({v.seats})
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ville de départ</label>
              <select value={from} onChange={(e) => { setFrom(e.target.value); setTo(''); }}
                className="w-full h-12 rounded-xl bg-muted/30 border border-border px-4 text-sm">
                <option value="">Choisir</option>
                {ALL_CB_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex justify-center -my-1">
              <button onClick={() => { const t = from; setFrom(to || from); setTo(t); }}
                className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-blue-400 rotate-90" />
              </button>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ville d'arrivée</label>
              <select value={to} onChange={(e) => setTo(e.target.value)}
                className="w-full h-12 rounded-xl bg-muted/30 border border-border px-4 text-sm">
                <option value="">Choisir</option>
                {destinations.map(c => {
                  const r = findCBRoute(from, c);
                  return <option key={c} value={c}>{c} — {r ? formatDurationCB(r.duration) : ''} · dès CHF {r?.suggestedPrice.berline}</option>;
                })}
              </select>
            </div>

            {validationError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-center gap-2">
                <Shield className="w-4 h-4 flex-shrink-0" />
                {validationError}
              </div>
            )}

            {selectedRoute && isValid && (
              <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">{formatDurationCB(selectedRoute.duration)}</span>
                </div>
                <span className="text-sm font-bold">dès CHF {selectedRoute.suggestedPrice.berline}/siège</span>
              </div>
            )}

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Date</label>
              <input type="date" value={dateAller} onChange={(e) => setDateAller(e.target.value)}
                className="w-full h-12 rounded-xl bg-muted/30 border border-border px-4 text-sm" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Passagers</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-10 h-10 rounded-xl bg-muted/30 border border-border flex items-center justify-center text-lg font-bold">-</button>
                <span className="text-lg font-bold w-8 text-center">{passengers}</span>
                <button onClick={() => setPassengers(Math.min(6, passengers + 1))} className="w-10 h-10 rounded-xl bg-muted/30 border border-border flex items-center justify-center text-lg font-bold">+</button>
                <Users className="w-4 h-4 text-muted-foreground ml-1" />
              </div>
            </div>

            <Button onClick={() => { if (selectedRoute && isValid) setStep('results'); }}
              disabled={!selectedRoute || !isValid}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-12 disabled:opacity-40">
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
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-14">
          <button onClick={() => setStep('search')} className="flex items-center gap-1 text-muted-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Modifier
          </button>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-blue-400" />
            <h2 className="text-lg font-bold">{from} → {to}</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">{dateAller || "Aujourd'hui"} · {passengers} passager{passengers > 1 ? 's' : ''} · {formatDurationCB(selectedRoute.duration)}</p>

          {/* Vehicle filter in results */}
          <div className="flex gap-1.5 mb-4 flex-wrap">
            <button onClick={() => setVehicleFilter('all')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold ${vehicleFilter === 'all' ? 'bg-[hsl(43,75%,52%)] text-black' : 'bg-muted/30 text-muted-foreground'}`}>
              Tous
            </button>
            {VEHICLE_TYPES.map(v => (
              <button key={v.key} onClick={() => setVehicleFilter(v.key)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${vehicleFilter === v.key ? 'bg-[hsl(43,75%,52%)] text-black' : 'bg-muted/30 text-muted-foreground'}`}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {slots.map((slot) => {
              const vt = VEHICLE_TYPES.find(v => v.key === slot.vehicle)!;
              const seatsLeft = slot.seatsTotal - slot.seatsTaken;
              if (seatsLeft <= 0) return null;
              const fillPct = (slot.seatsTaken / slot.seatsTotal) * 100;
              const eurPrice = Math.round(slot.pricePerSeat * EUR_RATE);
              const ratio = slot.pricePerSeat / selectedRoute.suggestedPrice[slot.vehicle];
              const badge = ratio <= 0.95 ? '🟢' : ratio <= 1.05 ? '🟠' : '🔴';

              return (
                <motion.button key={slot.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedSlot(slot); setSelectedSeat(null); setStep('seat'); }}
                  className="w-full text-left rounded-2xl bg-card border border-border p-4 space-y-3">
                  {/* Driver + vehicle info */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{slot.driverPhoto}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{slot.driverName}</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-[hsl(43,75%,52%)] fill-[hsl(43,75%,52%)]" />
                          <span className="text-[10px] font-bold">{slot.driverRating.toFixed(1)}</span>
                        </div>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">VTC Certifié 🇫🇷</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{vt.icon} {vt.label}</span>
                        {slot.isElectric && (
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ⚡ Zéro émission
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Time + price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{slot.departure}</span>
                      <span className="text-muted-foreground text-xs">→ {slot.arrival}</span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span>{badge}</span>
                        <span className="text-xl font-black">CHF {slot.pricePerSeat}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">≈ €{eurPrice}</p>
                    </div>
                  </div>

                  {/* Seats */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold">{seatsLeft} siège{seatsLeft > 1 ? 's' : ''} disponible{seatsLeft > 1 ? 's' : ''}</p>
                    <div className="w-20 flex gap-0.5">
                      {Array.from({ length: slot.seatsTotal }, (_, i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i < slot.seatsTaken ? 'bg-muted' : 'bg-[hsl(43,75%,52%)]'}`} />
                      ))}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-4 text-[10px] text-muted-foreground text-center px-4 flex items-center justify-center gap-1">
            🤝 Covoiturage — partage de frais entre particuliers · 🛡️ Couvert par assurance trajet Caby
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── SEAT SELECTION ──
  if (step === 'seat' && selectedSlot && selectedRoute) {
    const maxSeats = slotVehicle?.seats || 3;
    // Generate seat rows based on vehicle type
    const seatRows: number[][] = selectedSlot.vehicle === 'berline' ? [[1], [2, 3]]
      : selectedSlot.vehicle === 'suv' ? [[1, 2], [3, 4]]
      : selectedSlot.vehicle === 'monospace' ? [[1, 2], [3, 4, 5]]
      : [[1, 2], [3, 4], [5, 6]]; // van

    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-14">
          <button onClick={() => setStep('results')} className="flex items-center gap-1 text-muted-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Résultats
          </button>
          <div className="rounded-2xl bg-card border border-border p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">{from} → {to}</p>
                <p className="text-xs text-muted-foreground">{selectedSlot.departure} → {selectedSlot.arrival} · {slotVehicle?.icon} {slotVehicle?.label}</p>
                <p className="text-xs text-muted-foreground">{selectedSlot.driverName} · ⭐ {selectedSlot.driverRating.toFixed(1)}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black">CHF {selectedSlot.pricePerSeat}</p>
                <p className="text-[10px] text-muted-foreground">≈ €{Math.round(selectedSlot.pricePerSeat * EUR_RATE)}</p>
              </div>
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            {slotVehicle?.icon} {slotVehicle?.label} — Choisissez votre siège
          </h3>
          <div className="rounded-2xl bg-card border border-border p-6 mb-6">
            <div className="relative mx-auto" style={{ width: 180 }}>
              <div className="border-2 border-muted rounded-3xl p-4 pt-10 pb-6">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground font-bold">AVANT ▲</div>
                <div className="flex justify-start mb-4">
                  <div className="w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center text-xs text-muted-foreground border border-border">{slotVehicle?.icon}</div>
                </div>
                {seatRows.map((row, i) => (
                  <div key={i} className="flex justify-center gap-3 mb-3">
                    {row.map(s => <SeatButton key={s} seat={s} taken={takenSeats.includes(s)} selected={selectedSeat === s} onSelect={setSelectedSeat} />)}
                  </div>
                ))}
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
              { key: 'small' as const, label: 'Cabine', sub: 'Inclus', cost: 0 },
              { key: 'large' as const, label: 'Grande valise', sub: '+CHF 5', cost: 5 },
            ]).map(b => (
              <button key={b.key} onClick={() => setBaggage(b.key)}
                className={`flex-1 rounded-xl p-3 text-center border transition-colors ${baggage === b.key ? 'border-[hsl(43,75%,52%)] bg-[hsl(43,75%,52%)]/10' : 'border-border bg-card'}`}>
                <Luggage className="w-4 h-4 mx-auto mb-1" />
                <p className="text-xs font-bold">{b.label}</p>
                <p className="text-[10px] text-muted-foreground">{b.sub}</p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-blue-500/10 border border-blue-500/30 p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total</span>
              <div className="text-right">
                <span className="text-2xl font-black">CHF {totalPrice}</span>
                <p className="text-[10px] text-muted-foreground">≈ €{totalEur}</p>
              </div>
            </div>
            {baggageCost > 0 && <p className="text-[10px] text-muted-foreground mt-1">Inclut supplément bagage +CHF {baggageCost}</p>}
          </div>

          <Button onClick={() => setStep('confirm')} disabled={!selectedSeat}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-12 disabled:opacity-40">
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
          <p className="text-sm text-muted-foreground mb-6">Covoiturage Transfrontalier Caby</p>

          <div className="rounded-2xl bg-card border border-border overflow-hidden text-left">
            <div className="bg-blue-600/10 px-5 py-3 border-b border-border flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">E-Ticket Cross-Border</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">🇪🇺</span>
            </div>
            <div className="p-5 space-y-3">
              {[
                ['Trajet', `${from} → ${to}`],
                ['Date', dateAller || "Aujourd'hui"],
                ['Départ', selectedSlot.departure],
                ['Arrivée estimée', selectedSlot.arrival],
                ['Durée', formatDurationCB(selectedRoute.duration)],
                ['Véhicule', `${slotVehicle?.icon} ${slotVehicle?.label}`],
                ['Chauffeur', `${selectedSlot.driverName} · ⭐ ${selectedSlot.driverRating.toFixed(1)}`],
                ['Siège', `N°${selectedSeat}`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-bold">{value}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-border pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <div className="text-right">
                    <span className="text-xl font-black">CHF {totalPrice}</span>
                    <p className="text-[10px] text-muted-foreground">≈ €{totalEur}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-dashed border-border p-5 flex flex-col items-center">
              <div className="w-32 h-32 rounded-xl bg-white flex items-center justify-center">
                <QrCode className="w-20 h-20 text-black" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Présentez ce QR code au chauffeur</p>
            </div>
          </div>

          {selectedSlot.isElectric && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
              <Zap className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <p className="text-xs text-emerald-300 text-left">⚡ Trajet zéro émission — véhicule 100% électrique</p>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
            <Leaf className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-emerald-300 text-left">🌿 Trajet partagé — vous économisez <span className="font-bold">{Math.round(selectedRoute.duration * 0.12)} kg de CO₂</span> vs voiture solo</p>
          </div>

          <div className="mt-4 text-[10px] text-muted-foreground px-4">
            Service de covoiturage avec chauffeur professionnel certifié. Trajet transfrontalier France-Suisse.
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

export default CabyCrossBorderPage;
