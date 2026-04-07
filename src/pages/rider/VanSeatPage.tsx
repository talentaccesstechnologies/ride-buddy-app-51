import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BookingStepper from '@/components/van/BookingStepper';
import BookingSidebar, { BookingItem } from '@/components/van/BookingSidebar';

const GOLD = '#C9A84C';

interface Seat {
  id: number;
  label: string;
  row: string;
  category: 'avant' | 'standard' | 'arriere';
  price: number;
  taken: boolean;
  window: boolean;
}

const SEATS: Seat[] = [
  { id: 1, label: '1', row: '1', category: 'avant', price: 8, taken: false, window: true },
  { id: 2, label: '2', row: '1', category: 'avant', price: 8, taken: true, window: false },
  { id: 3, label: '3', row: '2', category: 'standard', price: 5, taken: false, window: true },
  { id: 4, label: '4', row: '2', category: 'standard', price: 5, taken: false, window: false },
  { id: 5, label: '5', row: '3', category: 'standard', price: 5, taken: true, window: true },
  { id: 6, label: '6', row: '3', category: 'standard', price: 5, taken: false, window: false },
  { id: 7, label: '7', row: '4', category: 'arriere', price: 0, taken: false, window: false },
];

const CAT_COLORS = {
  avant: { bg: '#FEF3C7', border: GOLD, label: '🟡 Avant (+CHF 8)', desc: 'Meilleure vue, sortie rapide' },
  standard: { bg: '#D1FAE5', border: '#10B981', label: '🟢 Standard (+CHF 5)', desc: 'Confort standard' },
  arriere: { bg: '#F3F4F6', border: '#9CA3AF', label: '⬜ Arrière (Gratuit)', desc: 'Siège basique' },
};

export default function VanSeatPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const from = params.get('from') || 'Genève';
  const to = params.get('to') || 'Zurich';
  const price = parseFloat(params.get('price') || '54');
  const packPrice = parseFloat(params.get('packPrice') || '0');

  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [tab, setTab] = useState<'aller' | 'retour'>('aller');
  const hasReturn = !!params.get('returnDate');

  const seatPrice = selectedSeat ? SEATS.find(s => s.id === selectedSeat)?.price || 0 : 0;

  const items: BookingItem[] = [
    { label: `Trajet ${from} → ${to}`, amount: price },
  ];
  if (packPrice > 0) items.push({ label: 'Formule choisie', amount: packPrice });
  if (seatPrice > 0) items.push({ label: `Siège N°${selectedSeat}`, amount: seatPrice });

  const forward = () => {
    const p = new URLSearchParams(params);
    if (selectedSeat) p.set('seat', String(selectedSeat));
    if (seatPrice) p.set('seatPrice', String(seatPrice));
    navigate(`/caby/van/luggage?${p}`);
  };

  const trySkip = () => {
    if (!selectedSeat) {
      setShowSkipModal(true);
    } else {
      forward();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BookingStepper currentStep={3} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Où souhaitez-vous être assis ?</h1>
          <button onClick={trySkip} className="text-sm hover:underline" style={{ color: GOLD }}>
            Passer les sièges →
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            {hasReturn && (
              <div className="flex gap-2 mb-4">
                {(['aller', 'retour'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      tab === t ? 'text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                    style={tab === t ? { backgroundColor: GOLD } : undefined}
                  >
                    {t === 'aller' ? '🚐 Aller' : '🚐 Retour'}
                  </button>
                ))}
              </div>
            )}

            {/* Van layout */}
            <div className="bg-white rounded-xl border p-6 max-w-sm mx-auto">
              <div className="text-center mb-4">
                <span className="text-2xl">🚐</span>
                <p className="text-xs text-gray-400 mt-1">Avant du VAN</p>
              </div>

              {/* Driver */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="h-14 rounded-lg bg-gray-800 flex items-center justify-center text-white text-xs font-medium">
                  👤 Chauffeur
                </div>
                <div className="h-14" />
              </div>

              {/* Rows 1-3 */}
              {[
                [1, 2],
                [3, 4],
                [5, 6],
              ].map((row, ri) => (
                <div key={ri} className="grid grid-cols-2 gap-3 mb-2">
                  {row.map(id => {
                    const seat = SEATS.find(s => s.id === id)!;
                    const isSelected = selectedSeat === id;
                    const cat = CAT_COLORS[seat.category];
                    return (
                      <button
                        key={id}
                        disabled={seat.taken}
                        onClick={() => setSelectedSeat(isSelected ? null : id)}
                        className={`h-14 rounded-lg border-2 flex flex-col items-center justify-center text-sm font-medium transition-all ${
                          seat.taken
                            ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                            : isSelected
                            ? 'shadow-lg scale-105'
                            : 'hover:scale-102 cursor-pointer'
                        }`}
                        style={
                          seat.taken
                            ? undefined
                            : {
                                backgroundColor: isSelected ? cat.border : cat.bg,
                                borderColor: isSelected ? cat.border : cat.border + '60',
                                color: isSelected ? 'white' : '#374151',
                              }
                        }
                      >
                        <span>{seat.taken ? '⬛' : seat.id}</span>
                        {seat.window && !seat.taken && <span className="text-[9px]">🪟</span>}
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Row 4 - back */}
              <div className="mb-2">
                {(() => {
                  const seat = SEATS.find(s => s.id === 7)!;
                  const isSelected = selectedSeat === 7;
                  const cat = CAT_COLORS[seat.category];
                  return (
                    <button
                      disabled={seat.taken}
                      onClick={() => setSelectedSeat(isSelected ? null : 7)}
                      className={`w-full h-14 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all ${
                        seat.taken ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                      style={
                        seat.taken
                          ? undefined
                          : {
                              backgroundColor: isSelected ? cat.border : cat.bg,
                              borderColor: isSelected ? cat.border : cat.border + '60',
                              color: isSelected ? 'white' : '#374151',
                            }
                      }
                    >
                      {seat.taken ? '⬛' : '7 — Arrière'}
                    </button>
                  );
                })()}
              </div>

              <p className="text-center text-xs text-gray-400 mt-2">Arrière du VAN</p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
              {Object.values(CAT_COLORS).map(c => (
                <span key={c.label} className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }} />
                  {c.label}
                </span>
              ))}
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-gray-300 border border-gray-400" />
                ⬛ Pris
              </span>
            </div>

            {selectedSeat && (
              <div className="bg-white rounded-xl border p-4 mt-4 text-center">
                <p className="font-semibold">Siège {selectedSeat} sélectionné</p>
                <p className="text-sm text-gray-500">
                  {CAT_COLORS[SEATS.find(s => s.id === selectedSeat)!.category].desc} — {seatPrice > 0 ? `+CHF ${seatPrice}` : 'Gratuit'}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
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

      {/* Skip modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2">Vous n'avez pas choisi de siège</h3>
            <p className="text-sm text-gray-500 mb-5">
              Un siège vous sera attribué automatiquement au moment de la confirmation.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSkipModal(false)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: GOLD }}
              >
                Choisir un siège
              </button>
              <button
                onClick={() => { setShowSkipModal(false); forward(); }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Continuer sans
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
