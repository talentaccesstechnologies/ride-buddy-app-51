import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BookingStepper from '@/components/van/BookingStepper';
import BookingSidebar, { BookingItem } from '@/components/van/BookingSidebar';
import { Checkbox } from '@/components/ui/checkbox';

const GOLD = '#C9A84C';

const SPECIAL_EQUIPMENT = [
  { id: 'ski', icon: '🎿', label: 'Skis / Snowboard', price: 15 },
  { id: 'bike', icon: '🚲', label: 'Vélo pliant', price: 15 },
  { id: 'oversize', icon: '🧳', label: 'Valise oversize', price: 20 },
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

  const [largeBag, setLargeBag] = useState<boolean[]>(Array(passengers).fill(false));
  const [specials, setSpecials] = useState<Record<string, boolean>>({});
  const [sameForAll, setSameForAll] = useState(false);

  const luggageTotal = largeBag.filter(Boolean).length * 8;
  const specialsTotal = Object.entries(specials).reduce(
    (sum, [id, sel]) => sum + (sel ? SPECIAL_EQUIPMENT.find(e => e.id === id)!.price : 0), 0
  );

  const items: BookingItem[] = [
    { label: `Trajet ${from} → ${to}`, amount: price },
  ];
  if (packPrice > 0) items.push({ label: 'Formule choisie', amount: packPrice });
  if (seatPrice > 0) items.push({ label: 'Siège choisi', amount: seatPrice });
  if (luggageTotal > 0) items.push({ label: `Grande valise ×${largeBag.filter(Boolean).length}`, amount: luggageTotal });
  if (specialsTotal > 0) items.push({ label: 'Équipement spécial', amount: specialsTotal });

  const forward = () => {
    const p = new URLSearchParams(params);
    p.set('luggagePrice', String(luggageTotal + specialsTotal));
    navigate(`/caby/van/options?${p}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <BookingStepper currentStep={4} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Vos bagages à bord</h1>
          <button onClick={forward} className="text-sm hover:underline" style={{ color: GOLD }}>
            Passer les bagages →
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            {/* Included vs add-on illustration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border p-5 text-center">
                <span className="text-4xl">🎒</span>
                <h3 className="font-semibold mt-2">Petit bagage</h3>
                <p className="text-green-600 text-sm font-medium mt-1">✓ Inclus pour tous</p>
                <p className="text-xs text-gray-500 mt-1">Max. 40×30×20 cm — Sous le siège</p>
              </div>
              <div className="bg-white rounded-xl border p-5 text-center">
                <span className="text-4xl">🧳</span>
                <h3 className="font-semibold mt-2">Grande valise</h3>
                <p className="text-sm font-medium mt-1" style={{ color: GOLD }}>+CHF 8 par personne</p>
                <p className="text-xs text-gray-500 mt-1">Max. 55×40×20 cm — Dans le coffre</p>
              </div>
            </div>

            {/* Per passenger */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-semibold mb-4">Par passager</h2>

              {Array.from({ length: passengers }).map((_, i) => (
                <div key={i} className="mb-4 last:mb-0">
                  <p className="font-medium text-sm mb-2">👤 Passager {i + 1}</p>
                  <div className="space-y-2 ml-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span>🎒</span>
                      <span className="flex-1">Petit bagage sous siège</span>
                      <span className="text-green-600 text-xs font-medium">Inclus ✓</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span>🧳</span>
                      <span className="flex-1">Grande valise</span>
                      <button
                        onClick={() => {
                          if (sameForAll) {
                            const newVal = !largeBag[i];
                            setLargeBag(Array(passengers).fill(newVal));
                          } else {
                            const copy = [...largeBag];
                            copy[i] = !copy[i];
                            setLargeBag(copy);
                          }
                        }}
                        className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                          largeBag[i] ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        style={largeBag[i] ? { backgroundColor: GOLD } : undefined}
                      >
                        {largeBag[i] ? 'Ajouté ✓' : 'Ajouter +CHF 8'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {passengers > 1 && (
                <label className="flex items-center gap-2 mt-3 text-sm cursor-pointer">
                  <Checkbox checked={sameForAll} onCheckedChange={v => setSameForAll(!!v)} />
                  Identique pour tous les passagers
                </label>
              )}
            </div>

            {/* Special equipment */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-semibold mb-4">Équipements spéciaux</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SPECIAL_EQUIPMENT.map(eq => (
                  <button
                    key={eq.id}
                    onClick={() => setSpecials(s => ({ ...s, [eq.id]: !s[eq.id] }))}
                    className={`border-2 rounded-xl p-4 text-center transition-all ${
                      specials[eq.id] ? 'shadow-md' : 'hover:shadow-sm'
                    }`}
                    style={{
                      borderColor: specials[eq.id] ? GOLD : '#e5e7eb',
                      backgroundColor: specials[eq.id] ? '#FDFAF4' : 'white',
                    }}
                  >
                    <span className="text-3xl">{eq.icon}</span>
                    <p className="font-medium text-sm mt-2">{eq.label}</p>
                    <p className="text-xs mt-1" style={{ color: GOLD }}>+CHF {eq.price}</p>
                  </button>
                ))}
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
  );
}
