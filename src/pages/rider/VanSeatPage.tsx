import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BookingStepper from '@/components/van/BookingStepper';
import BookingSidebar, { BookingItem } from '@/components/van/BookingSidebar';
import vanInterior from '@/assets/van-interior.png';

const GOLD = '#C9A84C';

interface Seat {
  id: number;
  category: 'avant' | 'capitaine' | 'banquette';
  price: number;
  taken: boolean;
}

// Mercedes V-Class 7 places (vue de dessus) :
// Rang 1 : Chauffeur | Passager 1
// Rang 2 : Siège capitaine 2 | [allée] | Siège capitaine 3
// Rang 3 : Banquette 4 | 5 | 6
const SEATS: Seat[] = [
  { id: 1, category: 'avant', price: 8, taken: false },
  { id: 2, category: 'capitaine', price: 5, taken: false },
  { id: 3, category: 'capitaine', price: 5, taken: true },
  { id: 4, category: 'banquette', price: 0, taken: false },
  { id: 5, category: 'banquette', price: 0, taken: true },
  { id: 6, category: 'banquette', price: 0, taken: false },
];

const CAT_META: Record<string, { bg: string; border: string; selectedBg: string; label: string; price: string; desc: string }> = {
  avant: { bg: '#FEF3C7', border: GOLD, selectedBg: GOLD, label: 'Avant', price: '+CHF 8', desc: 'Place passager avant, meilleure vue' },
  capitaine: { bg: '#D1FAE5', border: '#10B981', selectedBg: '#10B981', label: 'Capitaine', price: '+CHF 5', desc: 'Siège capitaine individuel, confort optimal' },
  banquette: { bg: '#F3F4F6', border: '#9CA3AF', selectedBg: '#6B7280', label: 'Banquette', price: 'Gratuit', desc: 'Banquette arrière 3 places' },
};

function SeatBtn({ seat, selected, onSelect }: { seat: Seat; selected: boolean; onSelect: () => void }) {
  const cat = CAT_META[seat.category];
  if (seat.taken) {
    return (
      <div className="h-[60px] rounded-xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center cursor-not-allowed">
        <span className="text-gray-300 text-base">✕</span>
      </div>
    );
  }
  return (
    <button
      onClick={onSelect}
      className={`h-[60px] rounded-xl border-2 flex flex-col items-center justify-center font-semibold transition-all ${
        selected ? 'shadow-lg scale-105 text-white ring-2 ring-offset-2' : 'hover:scale-[1.03] cursor-pointer'
      }`}
      style={{
        backgroundColor: selected ? cat.selectedBg : cat.bg,
        borderColor: selected ? cat.selectedBg : cat.border + '60',
        color: selected ? 'white' : '#1f2937',
        // @ts-ignore
        '--tw-ring-color': selected ? cat.selectedBg + '40' : undefined,
      }}
    >
      <span className="text-lg leading-none">{seat.id}</span>
      <span className="text-[10px] font-normal mt-0.5 opacity-70">{cat.price}</span>
    </button>
  );
}

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

  const selectedSeatData = selectedSeat ? SEATS.find(s => s.id === selectedSeat) : null;
  const seatPrice = selectedSeatData?.price || 0;

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
    if (!selectedSeat) setShowSkipModal(true);
    else forward();
  };

  const toggle = (id: number) => setSelectedSeat(prev => prev === id ? null : id);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <BookingStepper currentStep={3} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Où souhaitez-vous être assis ?</h1>
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

            {/* Interior image */}
            <div className="max-w-[380px] mx-auto mb-4">
              <img
                src={vanInterior}
                alt="Vue intérieure Mercedes V-Class"
                className="w-full rounded-xl object-contain"
                loading="lazy"
              />
            </div>

            {/* Van seat map */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 max-w-[340px] mx-auto overflow-hidden">
              {/* Header */}
              <div className="bg-gray-900 text-white text-center py-2.5 text-xs font-medium uppercase tracking-wider">
                ▲ Avant du véhicule
              </div>

              <div className="p-5 space-y-3">
                {/* Row 1: Driver + Seat 1 */}
                <div className="grid grid-cols-[1fr_20px_1fr] items-center">
                  <div className="h-[60px] rounded-xl bg-gray-900 flex items-center justify-center text-white text-xs font-medium gap-1.5">
                    <span className="text-base">🧑‍✈️</span> Chauffeur
                  </div>
                  <div />
                  <SeatBtn seat={SEATS[0]} selected={selectedSeat === 1} onSelect={() => toggle(1)} />
                </div>

                {/* Aisle divider */}
                <div className="flex items-center gap-2 px-4">
                  <div className="flex-1 border-t border-dashed border-gray-200" />
                  <span className="text-[10px] text-gray-300 uppercase tracking-wider">allée</span>
                  <div className="flex-1 border-t border-dashed border-gray-200" />
                </div>

                {/* Row 2: Captain seats */}
                <div className="grid grid-cols-[1fr_20px_1fr] items-center">
                  <SeatBtn seat={SEATS[1]} selected={selectedSeat === 2} onSelect={() => toggle(2)} />
                  <div className="flex justify-center">
                    <div className="w-px h-10 bg-gray-100" />
                  </div>
                  <SeatBtn seat={SEATS[2]} selected={selectedSeat === 3} onSelect={() => toggle(3)} />
                </div>

                {/* Aisle divider */}
                <div className="flex items-center gap-2 px-4">
                  <div className="flex-1 border-t border-dashed border-gray-200" />
                  <span className="text-[10px] text-gray-300 uppercase tracking-wider">allée</span>
                  <div className="flex-1 border-t border-dashed border-gray-200" />
                </div>

                {/* Row 3: Bench */}
                <div className="grid grid-cols-3 gap-2">
                  <SeatBtn seat={SEATS[3]} selected={selectedSeat === 4} onSelect={() => toggle(4)} />
                  <SeatBtn seat={SEATS[4]} selected={selectedSeat === 5} onSelect={() => toggle(5)} />
                  <SeatBtn seat={SEATS[5]} selected={selectedSeat === 6} onSelect={() => toggle(6)} />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-100 text-center py-2 text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                ▼ Arrière du véhicule
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-5 text-xs text-gray-600">
              {Object.entries(CAT_META).map(([key, c]) => (
                <span key={key} className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: c.bg, border: `2px solid ${c.border}` }} />
                  {c.label} ({c.price})
                </span>
              ))}
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-gray-100 border-2 border-gray-200" />
                Occupé
              </span>
            </div>

            {/* Selection feedback */}
            {selectedSeatData && (
              <div className="bg-white rounded-xl border-2 p-4 mt-5 text-center max-w-[340px] mx-auto" style={{ borderColor: GOLD + '60' }}>
                <p className="font-semibold text-gray-900">Siège {selectedSeat} sélectionné</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {CAT_META[selectedSeatData.category].desc} — {seatPrice > 0 ? `+CHF ${seatPrice}` : 'Gratuit'}
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
