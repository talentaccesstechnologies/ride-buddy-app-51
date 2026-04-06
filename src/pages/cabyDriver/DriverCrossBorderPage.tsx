import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Upload, Check, Car, FileText, MapPin, Clock, DollarSign, Users, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VEHICLE_TYPES, PRICING_RULES, CROSS_BORDER_COMMISSION, ALL_CB_CITIES, crossBorderRoutes, findCBRoute, formatDurationCB, type CrossBorderVehicle } from '@/lib/crossBorderData';

type OnboardingStep = 'intro' | 'vehicle' | 'documents' | 'route' | 'pricing' | 'done';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const DriverCrossBorderPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>('intro');

  // Step 1 — Vehicle
  const [vehicleType, setVehicleType] = useState<CrossBorderVehicle>('berline');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [fuel, setFuel] = useState<'essence' | 'diesel' | 'hybride' | 'electrique'>('essence');
  const [seats, setSeats] = useState(3);
  const [photoUploaded, setPhotoUploaded] = useState(false);

  // Step 2 — Documents
  const [vtcUploaded, setVtcUploaded] = useState(false);
  const [licenseUploaded, setLicenseUploaded] = useState(false);
  const [insuranceUploaded, setInsuranceUploaded] = useState(false);

  // Step 3 — Route
  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4]); // Mon-Fri
  const [departureTime, setDepartureTime] = useState('07:00');
  const [returnTime, setReturnTime] = useState('18:00');
  const [seatsOffered, setSeatsOffered] = useState(3);

  // Step 4 — Pricing
  const [pricePerSeat, setPricePerSeat] = useState(0);

  const vt = VEHICLE_TYPES.find(v => v.key === vehicleType)!;
  const selectedCBRoute = findCBRoute(routeFrom, routeTo);
  const suggestedPrice = selectedCBRoute?.suggestedPrice[vehicleType] || 0;
  const rules = PRICING_RULES[vehicleType];

  const fullVanRevenue = pricePerSeat * vt.seats;
  const driverShare = Math.round(fullVanRevenue * (1 - CROSS_BORDER_COMMISSION));

  // ── INTRO ──
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-14">
          <button onClick={() => navigate('/caby/driver/profile')} className="flex items-center gap-1 text-muted-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Profil
          </button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌍</span>
              <h1 className="text-2xl font-bold">Devenir chauffeur Cross-Border</h1>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Rentabilisez vos trajets frontaliers quotidiens. Berline, SUV, monospace ou VAN — tous les véhicules sont bienvenus.
            </p>

            <div className="space-y-3 mb-6">
              {[
                { icon: '🚗', title: 'Tous véhicules acceptés', desc: 'Berline, SUV, monospace, VAN' },
                { icon: '💰', title: 'Commission 15%', desc: 'Moins que le standard Caby (20%)' },
                { icon: '📅', title: 'Vos horaires', desc: 'Définissez vos jours et heures habituels' },
                { icon: '💶', title: 'Prix en CHF + EUR', desc: 'Conversion automatique pour vos passagers' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3 rounded-xl bg-card border border-border p-4">
                  <span className="text-lg mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={() => setStep('vehicle')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-12">
              Commencer l'inscription
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── STEP 1: VEHICLE ──
  if (step === 'vehicle') {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-14">
          <button onClick={() => setStep('intro')} className="flex items-center gap-1 text-muted-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Car className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold">Étape 1 — Mon véhicule</h2>
          </div>
          <div className="flex gap-1 mb-6">{[1,2,3,4].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= 1 ? 'bg-blue-500' : 'bg-muted'}`} />)}</div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Type de véhicule</label>
              <div className="grid grid-cols-2 gap-2">
                {VEHICLE_TYPES.map(v => (
                  <button key={v.key} onClick={() => { setVehicleType(v.key); setSeats(v.seats); }}
                    className={`rounded-xl p-3 text-left border transition-colors ${vehicleType === v.key ? 'border-blue-500 bg-blue-500/10' : 'border-border bg-card'}`}>
                    <span className="text-lg">{v.icon}</span>
                    <p className="text-sm font-bold mt-1">{v.label}</p>
                    <p className="text-[10px] text-muted-foreground">{v.seats} sièges · {v.examples.split(',')[0]}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Marque</label>
                <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Tesla" className="w-full h-10 rounded-xl bg-muted/30 border border-border px-3 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Modèle</label>
                <input value={model} onChange={e => setModel(e.target.value)} placeholder="Model Y" className="w-full h-10 rounded-xl bg-muted/30 border border-border px-3 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Année</label>
                <input value={year} onChange={e => setYear(e.target.value)} placeholder="2023" className="w-full h-10 rounded-xl bg-muted/30 border border-border px-3 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Motorisation</label>
                <select value={fuel} onChange={e => setFuel(e.target.value as any)} className="w-full h-10 rounded-xl bg-muted/30 border border-border px-3 text-sm">
                  <option value="essence">Essence</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybride">Hybride</option>
                  <option value="electrique">Électrique ⚡</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Photo du véhicule (obligatoire)</label>
              <button onClick={() => setPhotoUploaded(true)}
                className={`w-full h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 ${photoUploaded ? 'border-emerald-500 bg-emerald-500/10' : 'border-border'}`}>
                {photoUploaded ? <Check className="w-5 h-5 text-emerald-400" /> : <Camera className="w-5 h-5 text-muted-foreground" />}
                <span className="text-xs text-muted-foreground">{photoUploaded ? 'Photo ajoutée ✓' : 'Ajouter une photo'}</span>
              </button>
            </div>

            <Button onClick={() => setStep('documents')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-12">
              Suivant → Documents
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 2: DOCUMENTS ──
  if (step === 'documents') {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-14">
          <button onClick={() => setStep('vehicle')} className="flex items-center gap-1 text-muted-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold">Étape 2 — Mes documents</h2>
          </div>
          <div className="flex gap-1 mb-6">{[1,2,3,4].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= 2 ? 'bg-blue-500' : 'bg-muted'}`} />)}</div>

          <div className="space-y-4">
            {[
              { label: 'Carte VTC française (recto/verso)', uploaded: vtcUploaded, set: setVtcUploaded },
              { label: 'Permis de conduire', uploaded: licenseUploaded, set: setLicenseUploaded },
              { label: 'Attestation assurance', uploaded: insuranceUploaded, set: setInsuranceUploaded },
            ].map(doc => (
              <button key={doc.label} onClick={() => doc.set(true)}
                className={`w-full flex items-center gap-3 rounded-xl border p-4 ${doc.uploaded ? 'border-emerald-500 bg-emerald-500/5' : 'border-border bg-card'}`}>
                {doc.uploaded ? <Check className="w-5 h-5 text-emerald-400" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                <div className="text-left flex-1">
                  <p className="text-sm font-bold">{doc.label}</p>
                  <p className="text-[10px] text-muted-foreground">{doc.uploaded ? 'Document ajouté ✓' : 'Cliquer pour ajouter'}</p>
                </div>
              </button>
            ))}

            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-400">
              Validation Caby sous 24h après soumission de tous les documents.
            </div>

            <Button onClick={() => setStep('route')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-12">
              Suivant → Mon trajet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 3: ROUTE ──
  if (step === 'route') {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-14">
          <button onClick={() => setStep('documents')} className="flex items-center gap-1 text-muted-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold">Étape 3 — Mon trajet habituel</h2>
          </div>
          <div className="flex gap-1 mb-6">{[1,2,3,4].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= 3 ? 'bg-blue-500' : 'bg-muted'}`} />)}</div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ville de départ</label>
              <select value={routeFrom} onChange={e => { setRouteFrom(e.target.value); setRouteTo(''); }}
                className="w-full h-12 rounded-xl bg-muted/30 border border-border px-4 text-sm">
                <option value="">Choisir</option>
                {ALL_CB_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ville d'arrivée</label>
              <select value={routeTo} onChange={e => setRouteTo(e.target.value)}
                className="w-full h-12 rounded-xl bg-muted/30 border border-border px-4 text-sm">
                <option value="">Choisir</option>
                {ALL_CB_CITIES.filter(c => c !== routeFrom).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {selectedCBRoute && (
              <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-xs">
                <p className="font-bold text-blue-400">{routeFrom} → {routeTo} · {formatDurationCB(selectedCBRoute.duration)}</p>
                <p className="text-muted-foreground mt-1">Prix suggéré : CHF {selectedCBRoute.suggestedPrice[vehicleType]}/siège</p>
              </div>
            )}

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Jours habituels</label>
              <div className="flex gap-1.5 flex-wrap">
                {DAYS.map((d, i) => (
                  <button key={d} onClick={() => setSelectedDays(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                    className={`px-3 py-2 rounded-lg text-xs font-bold ${selectedDays.includes(i) ? 'bg-blue-600 text-white' : 'bg-muted/30 text-muted-foreground'}`}>
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Heure aller</label>
                <input type="time" value={departureTime} onChange={e => setDepartureTime(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/30 border border-border px-3 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Heure retour</label>
                <input type="time" value={returnTime} onChange={e => setReturnTime(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/30 border border-border px-3 text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Sièges à disposition</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setSeatsOffered(Math.max(1, seatsOffered - 1))} className="w-10 h-10 rounded-xl bg-muted/30 border border-border flex items-center justify-center text-lg font-bold">-</button>
                <span className="text-lg font-bold w-8 text-center">{seatsOffered}</span>
                <button onClick={() => setSeatsOffered(Math.min(vt.seats, seatsOffered + 1))} className="w-10 h-10 rounded-xl bg-muted/30 border border-border flex items-center justify-center text-lg font-bold">+</button>
                <span className="text-xs text-muted-foreground">/ {vt.seats} max ({vt.label})</span>
              </div>
            </div>

            <Button onClick={() => { setPricePerSeat(suggestedPrice || rules.min); setStep('pricing'); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-12">
              Suivant → Mon tarif
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 4: PRICING ──
  if (step === 'pricing') {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-14">
          <button onClick={() => setStep('route')} className="flex items-center gap-1 text-muted-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold">Étape 4 — Mon tarif</h2>
          </div>
          <div className="flex gap-1 mb-6">{[1,2,3,4].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= 4 ? 'bg-blue-500' : 'bg-muted'}`} />)}</div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Prix par siège (CHF {rules.min} — {rules.max})</label>
              <input type="range" min={rules.min} max={rules.max} value={pricePerSeat}
                onChange={e => setPricePerSeat(Number(e.target.value))}
                className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>CHF {rules.min}</span>
                <span className="text-xl font-black text-foreground">CHF {pricePerSeat}</span>
                <span>CHF {rules.max}</span>
              </div>
            </div>

            {suggestedPrice > 0 && (
              <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-xs">
                <p className="text-blue-400 font-bold">Prix suggéré Caby : CHF {suggestedPrice}/siège</p>
              </div>
            )}

            <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Simulation de revenus</p>
              <div className="flex justify-between text-sm">
                <span>Vous gagnez par siège</span>
                <span className="font-bold">CHF {pricePerSeat}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Commission Caby (15%)</span>
                <span className="text-red-400">-CHF {Math.round(pricePerSeat * CROSS_BORDER_COMMISSION)}</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-sm">
                  <span className="font-bold">{vt.label} plein ({vt.seats} sièges)</span>
                  <span className="font-bold">CHF {fullVanRevenue}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-emerald-400 font-bold">Votre part</span>
                  <span className="text-xl font-black text-emerald-400">CHF {driverShare}</span>
                </div>
              </div>
            </div>

            <Button onClick={() => setStep('done')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-12">
              Valider mon inscription
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── DONE ──
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-14 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <h2 className="text-xl font-bold mb-2">Inscription envoyée !</h2>
          <p className="text-sm text-muted-foreground mb-6">Vos documents seront vérifiés sous 24h. Vous recevrez une notification dès validation.</p>

          <div className="rounded-2xl bg-card border border-border p-4 text-left space-y-2 mb-6">
            {[
              ['Véhicule', `${vt.icon} ${vt.label} — ${brand} ${model}`],
              ['Trajet', `${routeFrom} → ${routeTo}`],
              ['Jours', selectedDays.map(d => DAYS[d].slice(0, 3)).join(', ')],
              ['Horaires', `${departureTime} aller · ${returnTime} retour`],
              ['Prix/siège', `CHF ${pricePerSeat}`],
              ['Sièges', `${seatsOffered} / ${vt.seats}`],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{l}</span>
                <span className="font-bold">{v}</span>
              </div>
            ))}
          </div>

          <Button onClick={() => navigate('/caby/driver/profile')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-12">
            Retour au profil
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default DriverCrossBorderPage;
