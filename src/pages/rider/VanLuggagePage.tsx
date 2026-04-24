import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Info, Minus, Plus } from 'lucide-react';
import BookingStepper from '@/components/van/BookingStepper';
import BookingSidebar, { BookingItem } from '@/components/van/BookingSidebar';
import { Checkbox } from '@/components/ui/checkbox';
import bagBackpack from '@/assets/luggage-backpack.jpg';
import bagCabin from '@/assets/luggage-cabin.jpg';
import bagOversize from '@/assets/luggage-oversize.jpg';
import bagSki from '@/assets/luggage-ski.jpg';
import bagBike from '@/assets/luggage-bike.jpg';
import {
  MobileInstructionBar,
  MobileSectionHeader,
} from '@/components/van/EasyJetMobileUI';

const GOLD = '#C9A84C';

const SPECIAL_EQUIPMENT = [
  { id: 'ski', img: bagSki, label: 'Skis / Snowboard', price: 15, desc: 'Housse rigide ou souple, max 200 cm' },
  { id: 'bike', img: bagBike, label: 'Vélo pliant', price: 15, desc: 'Plié et rangé dans une housse' },
  { id: 'oversize', img: bagOversize, label: 'Valise oversize', price: 20, desc: 'Pour bagages > 55×40×20 cm' },
];

export default function VanLuggagePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const from = params.get('from') || 'Genève';
  const to = params.get('to') || 'Zurich';
  const price = parseFloat(params.get('price') || '54');
  const packPrice = parseFloat(params.get('packPrice') || '0');
  const seatPrice = parseFloat(params.get('seatPrice') || '0');
  const passengers = parseInt(params.get('passengers') || '1');

  // Mobile : compteur global de grands bagages
  const [largeBagCount, setLargeBagCount] = useState(0);
  const [largeBag, setLargeBag] = useState<boolean[]>(Array(passengers).fill(false));
  const [specials, setSpecials] = useState<Record<string, number>>({});
  const [sameForAll, setSameForAll] = useState(false);

  const luggageTotal =
    largeBagCount * 8 + largeBag.filter(Boolean).length * 8;
  const specialsTotal = Object.entries(specials).reduce(
    (sum, [id, qty]) => sum + qty * (SPECIAL_EQUIPMENT.find(e => e.id === id)?.price || 0), 0
  );

  const items: BookingItem[] = [{ label: `Trajet ${from} → ${to}`, amount: price }];
  if (packPrice > 0) items.push({ label: 'Formule choisie', amount: packPrice });
  if (seatPrice > 0) items.push({ label: 'Siège choisi', amount: seatPrice });
  if (luggageTotal > 0) items.push({ label: `Grande valise ×${largeBagCount + largeBag.filter(Boolean).length}`, amount: luggageTotal });
  if (specialsTotal > 0) items.push({ label: 'Équipement spécial', amount: specialsTotal });

  const forward = () => {
    const p = new URLSearchParams(params);
    p.set('luggagePrice', String(luggageTotal + specialsTotal));
    navigate(`/caby/van/options?${p}`);
  };

  const toggleLargeBag = (i: number) => {
    if (sameForAll) setLargeBag(Array(passengers).fill(!largeBag[i]));
    else {
      const copy = [...largeBag];
      copy[i] = !copy[i];
      setLargeBag(copy);
    }
  };

  // Stepper +/- mobile
  const QtyStepper: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
    <div className="flex items-center">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value === 0}
        className="w-10 h-10 flex items-center justify-center rounded-l border border-r-0 border-gray-300 disabled:opacity-40"
        style={{ background: '#F3F4F6' }}
      >
        <Minus className="w-4 h-4 text-gray-700" />
      </button>
      <div className="w-10 h-10 flex items-center justify-center border-y border-gray-300 bg-white text-[15px] font-bold text-gray-900">
        {value}
      </div>
      <button
        onClick={() => onChange(value + 1)}
        className="w-10 h-10 flex items-center justify-center rounded-r text-white"
        style={{ background: GOLD }}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <BookingStepper currentStep={5} />

      {/* ── MOBILE (easyJet-style) ────────────────────────────── */}
      <MobileSectionHeader title="Hold Luggage & Sports Equipment" onBack={() => navigate(-1)} />
      <MobileInstructionBar
        text="Tell us what you'd like to bring with you"
        ctaLabel="Skip bags >"
        onCta={forward}
      />

      <div className="md:hidden bg-white">
        {/* Save up to 15% banner */}
        <div className="mx-4 mt-4 rounded-md bg-gray-100 p-3 flex items-start gap-3">
          <span className="text-2xl">🧳</span>
          <p className="text-[13px] text-gray-800 leading-snug">
            <strong>Save up to 15%!</strong> Add your hold bags now.
          </p>
        </div>

        <div className="px-4 pt-5 pb-4">
          <p className="text-[14px] font-bold text-gray-900 mb-3">On each flight you're taking…</p>

          {/* Petit bagage = inclus */}
          <div className="border border-gray-200 rounded-lg p-3 mb-3 flex items-center gap-3">
            <img src={bagBackpack} alt="" className="w-14 h-14 object-contain" />
            <div className="flex-1">
              <p className="text-[14px] font-bold text-gray-900">Small under-seat bag</p>
              <p className="text-[12px] text-green-600 font-medium">Included for all passengers</p>
            </div>
            <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </span>
          </div>

          {/* Grande valise (compteur) */}
          <div className="border border-gray-200 rounded-lg p-3 mb-3 flex items-center gap-3">
            <img src={bagCabin} alt="" className="w-14 h-14 object-contain" />
            <div className="flex-1">
              <p className="text-[14px] font-bold text-gray-900">Large hold bag</p>
              <p className="text-[12px] text-gray-600">CHF 8.00 per flight*</p>
            </div>
            <QtyStepper value={largeBagCount} onChange={setLargeBagCount} />
          </div>

          {/* Best value */}
          <div className="bg-[#1A1A1A] text-white text-center text-[12px] font-bold py-1.5 rounded-t-lg mt-4">
            Best value for your trip
          </div>
          <div className="border border-gray-200 border-t-0 rounded-b-lg p-3 flex items-center gap-3">
            <img src={bagOversize} alt="" className="w-14 h-14 object-contain" />
            <div className="flex-1">
              <p className="text-[14px] font-bold text-gray-900">Oversize hold bag</p>
              <p className="text-[12px] text-gray-600">CHF 20.00 per flight*</p>
            </div>
            <QtyStepper
              value={specials.oversize || 0}
              onChange={(v) => setSpecials(s => ({ ...s, oversize: v }))}
            />
          </div>

          {/* Sports equipment */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[14px] font-bold text-gray-900">Add sports equipment</span>
              <Info className="w-3.5 h-3.5 text-gray-400" />
            </div>
            {SPECIAL_EQUIPMENT.filter(e => e.id !== 'oversize').map(eq => (
              <div key={eq.id} className="border border-gray-200 rounded-lg p-3 mb-3 flex items-center gap-3">
                <img src={eq.img} alt="" className="w-14 h-14 object-contain" />
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-gray-900">{eq.label}</p>
                  <p className="text-[12px] text-gray-600">CHF {eq.price.toFixed(2)} per flight*</p>
                </div>
                <QtyStepper
                  value={specials[eq.id] || 0}
                  onChange={(v) => setSpecials(s => ({ ...s, [eq.id]: v }))}
                />
              </div>
            ))}
          </div>

          <p className="text-[11px] text-gray-500 mt-2 mb-4">
            * Price per piece, per flight. Subject to availability in the vehicle's trunk.
          </p>
        </div>

        <BookingSidebar
          from={from} to={to}
          departureDate={params.get('date') || undefined}
          departureTime={params.get('time') || '07:00'}
          arrivalTime={params.get('arrivalTime') || '10:00'}
          returnDate={params.get('returnDate') || undefined}
          returnTime={params.get('returnTime') || undefined}
          returnArrivalTime={params.get('returnArrivalTime') || undefined}
          items={items}
          onContinue={forward}
        />
      </div>

      {/* ── DESKTOP (inchangé) ─────────────────────────────────── */}
      <div className="hidden md:block">
        <div className="bg-gray-900 text-white">
          <div className="max-w-6xl mx-auto px-4 py-5 flex items-start justify-between gap-4">
            <div>
              <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm hover:underline mb-2" style={{ color: GOLD }}>
                ← Retour
              </button>
              <h1 className="text-2xl font-bold">Vos bagages à bord</h1>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{from} → {to}</p>
            </div>
            <button onClick={forward} className="text-sm font-semibold hover:underline whitespace-nowrap" style={{ color: GOLD }}>
              Passer à l'étape suivante →
            </button>
          </div>
        </div>
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <h2 className="text-base font-semibold text-gray-900">Êtes-vous satisfait de votre franchise de bagages ?</h2>
            <p className="text-xs text-gray-500 mt-1">
              Chaque passager bénéficie d'un petit bagage gratuit. Ajoutez une grande valise ou des équipements spéciaux selon vos besoins.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex">
                  <div className="w-1/3 bg-gray-50 flex items-center justify-center p-3">
                    <img src={bagBackpack} alt="Petit bagage" className="w-full h-auto object-contain max-h-32" />
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-bold text-base text-gray-900">Petit bagage sous le siège</h3>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-green-600 mt-1.5">
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </span>
                      Inclus pour tous les passagers
                    </p>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                      Sac à dos, sac à main ou ordinateur portable rangé sous le siège.
                    </p>
                    <p className="text-[11px] font-semibold mt-2" style={{ color: GOLD }}>Taille max : 40 × 30 × 20 cm</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleLargeBag(0)}
                  className="bg-white rounded-2xl border-2 overflow-hidden flex text-left"
                  style={{ borderColor: largeBag[0] ? GOLD : '#e5e7eb' }}
                >
                  <div className="w-1/3 bg-gray-50 flex items-center justify-center p-3">
                    <img src={bagCabin} alt="Grande valise" className="w-full h-auto object-contain max-h-32" />
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-bold text-base text-gray-900">Grande valise</h3>
                    <p className="text-sm font-bold mt-1.5" style={{ color: GOLD }}>
                      {largeBag[0] ? '✓ Ajoutée' : '8.00 CHF par personne'}
                    </p>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">Idéal pour valise cabine. Rangée dans le coffre.</p>
                    <p className="text-[11px] font-semibold mt-2" style={{ color: GOLD }}>Taille max : 55 × 40 × 20 cm</p>
                  </div>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">Sélectionner votre franchise par passager</h2>
                  {passengers > 1 && (
                    <label className="flex items-center gap-2 text-xs cursor-pointer text-gray-700">
                      <Checkbox checked={sameForAll} onCheckedChange={v => setSameForAll(!!v)} />
                      Identique pour tous
                    </label>
                  )}
                </div>
                {Array.from({ length: passengers }).map((_, i) => (
                  <div key={i} className={`${i > 0 ? 'border-t border-gray-100 pt-4 mt-4' : ''}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-bold">{i + 1}</div>
                      <span className="text-sm font-semibold text-gray-900">Passager {i + 1}</span>
                    </div>
                    <div className="space-y-2 ml-9">
                      <div className="flex items-center gap-3 py-2">
                        <img src={bagBackpack} alt="" className="w-8 h-8 object-contain rounded" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Petit bagage sous le siège</p>
                          <p className="text-xs text-green-600 font-medium">Inclus pour tous les passagers</p>
                        </div>
                        <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </span>
                      </div>
                      <div className="flex items-center gap-3 py-2">
                        <img src={bagCabin} alt="" className="w-8 h-8 object-contain rounded" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Grande valise</p>
                          <p className="text-xs text-gray-500">+8.00 CHF — coffre</p>
                        </div>
                        <button
                          onClick={() => toggleLargeBag(i)}
                          className={`text-xs font-bold px-4 py-1.5 rounded-full ${largeBag[i] ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                          style={largeBag[i] ? { backgroundColor: GOLD } : undefined}
                        >
                          {largeBag[i] ? '✓ Ajoutée' : 'Ajouter'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-900 mb-1">Équipements spéciaux</h2>
                <p className="text-xs text-gray-500 mb-4">Pour les bagages volumineux ou de sport.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {SPECIAL_EQUIPMENT.map(eq => {
                    const qty = specials[eq.id] || 0;
                    return (
                      <button
                        key={eq.id}
                        onClick={() => setSpecials(s => ({ ...s, [eq.id]: (s[eq.id] || 0) > 0 ? 0 : 1 }))}
                        className="border-2 rounded-xl overflow-hidden text-left"
                        style={{
                          borderColor: qty ? GOLD : '#e5e7eb',
                          backgroundColor: qty ? '#FDFAF4' : 'white',
                        }}
                      >
                        <div className="bg-gray-50 aspect-[4/3] flex items-center justify-center p-2">
                          <img src={eq.img} alt={eq.label} className="w-full h-full object-contain" />
                        </div>
                        <div className="p-3">
                          <p className="font-semibold text-sm text-gray-900">{eq.label}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{eq.desc}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-bold" style={{ color: GOLD }}>+{eq.price.toFixed(2)} CHF</span>
                            {qty > 0 && <span className="text-[11px] font-bold" style={{ color: GOLD }}>✓ Ajouté</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-72">
              <BookingSidebar
                from={from} to={to}
                departureDate={params.get('date') || undefined}
                departureTime={params.get('time') || '07:00'}
                arrivalTime={params.get('arrivalTime') || '10:00'}
                returnDate={params.get('returnDate') || undefined}
                returnTime={params.get('returnTime') || undefined}
                returnArrivalTime={params.get('returnArrivalTime') || undefined}
                items={items}
                onContinue={forward}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
