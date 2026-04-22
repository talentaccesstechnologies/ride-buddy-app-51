import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Info, ChevronLeft, Users, X } from 'lucide-react';
import BookingStepper from '@/components/van/BookingStepper';
import BookingSidebar, { BookingItem } from '@/components/van/BookingSidebar';

const GOLD = '#C9A84C';

type SeatStatus = 'available' | 'taken' | 'selected';
type CategoryKey = 'avant' | 'rang2' | 'rang3';

interface Seat {
  id: number;
  category: CategoryKey;
  taken: boolean;
}

interface Category {
  key: CategoryKey;
  label: string;
  price: number;
  priceLabel: string;
  benefits: string[];
}

// Mercedes V-Class : 7 sièges passagers (chauffeur exclu)
// Rang 1 : 1 siège passager avant (id 1)
// Rang 2 : 3 sièges (id 2, 3, 4)
// Rang 3 : 3 sièges (id 5, 6, 7)
const SEATS: Seat[] = [
  { id: 1, category: 'avant', taken: false },
  { id: 2, category: 'rang2', taken: false },
  { id: 3, category: 'rang2', taken: true },
  { id: 4, category: 'rang2', taken: false },
  { id: 5, category: 'rang3', taken: false },
  { id: 6, category: 'rang3', taken: true },
  { id: 7, category: 'rang3', taken: false },
];

const CATEGORIES: Category[] = [
  {
    key: 'avant',
    label: 'Premium Avant',
    price: 8,
    priceLabel: '8.00 CHF',
    benefits: [
      'Meilleure vue panoramique',
      'Espace pour les jambes maximal',
      'Embarquez en premier',
    ],
  },
  {
    key: 'rang2',
    label: 'Confort Rang 2',
    price: 5,
    priceLabel: '5.00 CHF',
    benefits: [
      'Banquette centrale spacieuse',
      'Accès facile aux prises USB',
    ],
  },
  {
    key: 'rang3',
    label: 'Standard Rang 3',
    price: 0,
    priceLabel: 'Inclus',
    benefits: ['Choisissez votre place : couloir, fenêtre ou centre'],
  },
];

interface SeatIconProps {
  status: SeatStatus;
  number?: number;
  onClick?: () => void;
}

const SeatIcon = React.forwardRef<HTMLButtonElement, SeatIconProps>(function SeatIcon({ status, number, onClick }, ref) {
  const isSelected = status === 'selected';
  const isTaken = status === 'taken';

  const fill = isSelected ? '#FFFFFF' : isTaken ? '#1F2937' : '#374151';
  const stroke = isSelected ? GOLD : '#4B5563';
  const cursor = isTaken ? 'cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      onClick={isTaken ? undefined : onClick}
      disabled={isTaken}
      className={`relative ${cursor} group`}
      aria-label={isTaken ? 'Siège occupé' : isSelected ? `Siège ${number} sélectionné` : `Siège ${number}`}
    >
      <svg width="32" height="34" viewBox="0 0 32 34" className="transition-transform group-hover:scale-110">
        {/* Dossier */}
        <rect x="4" y="2" width="24" height="8" rx="2" fill={fill} stroke={stroke} strokeWidth={isSelected ? 1.5 : 1} />
        {/* Assise */}
        <rect x="2" y="11" width="28" height="18" rx="3" fill={fill} stroke={stroke} strokeWidth={isSelected ? 1.5 : 1} />
        {/* Accoudoirs */}
        <rect x="0" y="14" width="3" height="14" rx="1" fill={fill} stroke={stroke} strokeWidth={isSelected ? 1.5 : 1} />
        <rect x="29" y="14" width="3" height="14" rx="1" fill={fill} stroke={stroke} strokeWidth={isSelected ? 1.5 : 1} />
        {isTaken && (
          <text x="16" y="22" textAnchor="middle" fill="#EF4444" fontSize="14" fontWeight="bold">✕</text>
        )}
        {isSelected && number && (
          <text x="16" y="23" textAnchor="middle" fill={GOLD} fontSize="11" fontWeight="bold">{number}</text>
        )}
      </svg>
    </button>
  );
}

function CategoryHeader({ category }: { category: Category }) {
  return (
    <div className="border-t border-gray-700 pt-3 pb-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-white text-sm font-bold">{category.label}</span>
        <span className="text-white text-sm font-bold" style={{ color: GOLD }}>
          {category.priceLabel}
        </span>
        <Info className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <ul className="space-y-1 mb-3">
        {category.benefits.map((b, i) => (
          <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-300 leading-tight">
            <span className="flex-shrink-0 mt-0.5 w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function VanSeatPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const from = params.get('from') || 'Genève';
  const to = params.get('to') || 'Zurich';
  const price = parseFloat(params.get('price') || '54');
  const packPrice = parseFloat(params.get('packPrice') || '0');
  const hasReturn = !!params.get('returnDate');

  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [tab, setTab] = useState<'aller' | 'retour'>('aller');

  const selectedSeatData = selectedSeat ? SEATS.find(s => s.id === selectedSeat) : null;
  const seatPrice = selectedSeatData
    ? CATEGORIES.find(c => c.key === selectedSeatData.category)!.price
    : 0;

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

  const toggle = (seat: Seat) => {
    if (seat.taken) return;
    setSelectedSeat(prev => (prev === seat.id ? null : seat.id));
  };

  const seatStatus = (seat: Seat): SeatStatus => {
    if (seat.taken) return 'taken';
    if (selectedSeat === seat.id) return 'selected';
    return 'available';
  };

  const seatById = (id: number) => SEATS.find(s => s.id === id)!;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <BookingStepper currentStep={3} />

      {/* Banner sombre style easyJet */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-start justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm hover:underline mb-2"
              style={{ color: GOLD }}
            >
              <ChevronLeft className="w-4 h-4" /> Retour
            </button>
            <h1 className="text-2xl font-bold flex items-baseline gap-2">
              Choix du siège
              <span className="text-sm font-normal text-gray-400">optionnel</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
              {from} → {to}
            </p>
          </div>
          <button
            onClick={trySkip}
            className="text-sm font-semibold hover:underline whitespace-nowrap"
            style={{ color: GOLD }}
          >
            Passer les sièges →
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            {/* Question */}
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Où souhaitez-vous être assis ?</h2>
            <p className="text-sm text-gray-500 mb-4">
              Si vous ne réservez pas votre siège, nous vous en attribuerons un automatiquement et gratuitement.
            </p>

            {/* Onglets aller/retour */}
            {hasReturn && (
              <div className="flex gap-0 mb-4 border-b border-gray-200">
                {(['aller', 'retour'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-6 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                      tab === t ? 'text-gray-900' : 'border-transparent text-gray-400'
                    }`}
                    style={tab === t ? { borderColor: GOLD } : undefined}
                  >
                    {t === 'aller' ? '🚐 Aller' : '🚐 Retour'}
                    <span className="block text-[10px] font-normal text-gray-500 uppercase mt-0.5">
                      {t === 'aller' ? `${from} - ${to}` : `${to} - ${from}`}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Plan du véhicule */}
            <div className="max-w-[420px] mx-auto bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
              {/* Pare-brise + chauffeur */}
              <div className="relative bg-gray-900 pt-6 pb-3 px-6">
                <div className="flex justify-center mb-3">
                  <Users className="w-8 h-8" style={{ color: GOLD }} />
                </div>
                <div className="absolute top-3 left-4 w-12 h-8 bg-gray-700 rounded-tl-3xl" />
                <div className="absolute top-3 right-4 w-12 h-8 bg-gray-700 rounded-tr-3xl" />
                {/* Lettres de colonnes */}
                <div className="grid grid-cols-3 gap-3 px-2 mt-2">
                  <div className="text-center text-[11px] font-bold text-gray-500">G</div>
                  <div className="text-center text-[11px] font-bold text-gray-500">C</div>
                  <div className="text-center text-[11px] font-bold text-gray-500">D</div>
                </div>
              </div>

              <div className="px-6 pb-6 space-y-1">
                {/* === RANG 1 (Premium Avant) === */}
                <CategoryHeader category={CATEGORIES[0]} />
                <div className="grid grid-cols-3 gap-3 items-center">
                  {/* Chauffeur (placeholder gauche) */}
                  <div className="flex flex-col items-center opacity-40">
                    <svg width="32" height="34" viewBox="0 0 32 34">
                      <rect x="4" y="2" width="24" height="8" rx="2" fill="#1F2937" stroke="#4B5563" />
                      <rect x="2" y="11" width="28" height="18" rx="3" fill="#1F2937" stroke="#4B5563" />
                      <text x="16" y="23" textAnchor="middle" fill="#9CA3AF" fontSize="10">🧑‍✈️</text>
                    </svg>
                    <span className="text-[9px] text-gray-500 mt-1 uppercase">Chauffeur</span>
                  </div>
                  <div className="text-center text-xs text-gray-500 font-semibold">1</div>
                  <div className="flex justify-center">
                    <SeatIcon
                      status={seatStatus(seatById(1))}
                      number={1}
                      onClick={() => toggle(seatById(1))}
                    />
                  </div>
                </div>

                {/* === RANG 2 (Confort) === */}
                <CategoryHeader category={CATEGORIES[1]} />
                <div className="grid grid-cols-[1fr_auto_1fr_1fr] gap-3 items-center">
                  <div className="flex justify-center">
                    <SeatIcon status={seatStatus(seatById(2))} number={2} onClick={() => toggle(seatById(2))} />
                  </div>
                  <div className="text-xs text-gray-500 font-semibold w-4 text-center">2</div>
                  <div className="flex justify-center">
                    <SeatIcon status={seatStatus(seatById(3))} number={3} onClick={() => toggle(seatById(3))} />
                  </div>
                  <div className="flex justify-center">
                    <SeatIcon status={seatStatus(seatById(4))} number={4} onClick={() => toggle(seatById(4))} />
                  </div>
                </div>

                {/* === RANG 3 (Standard) === */}
                <CategoryHeader category={CATEGORIES[2]} />
                <div className="grid grid-cols-[1fr_auto_1fr_1fr] gap-3 items-center">
                  <div className="flex justify-center">
                    <SeatIcon status={seatStatus(seatById(5))} number={5} onClick={() => toggle(seatById(5))} />
                  </div>
                  <div className="text-xs text-gray-500 font-semibold w-4 text-center">3</div>
                  <div className="flex justify-center">
                    <SeatIcon status={seatStatus(seatById(6))} number={6} onClick={() => toggle(seatById(6))} />
                  </div>
                  <div className="flex justify-center">
                    <SeatIcon status={seatStatus(seatById(7))} number={7} onClick={() => toggle(seatById(7))} />
                  </div>
                </div>
              </div>

              {/* Arrière du véhicule */}
              <div className="bg-gray-800 text-center py-2 text-[10px] text-gray-500 uppercase tracking-widest">
                ▼ Coffre arrière
              </div>
            </div>

            {/* Légende */}
            <div className="flex flex-wrap justify-center gap-5 mt-5 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <svg width="20" height="20" viewBox="0 0 32 34">
                  <rect x="4" y="2" width="24" height="8" rx="2" fill="#374151" />
                  <rect x="2" y="11" width="28" height="18" rx="3" fill="#374151" />
                </svg>
                Disponible
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="20" height="20" viewBox="0 0 32 34">
                  <rect x="4" y="2" width="24" height="8" rx="2" fill="#FFFFFF" stroke={GOLD} strokeWidth="1.5" />
                  <rect x="2" y="11" width="28" height="18" rx="3" fill="#FFFFFF" stroke={GOLD} strokeWidth="1.5" />
                </svg>
                Sélectionné
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="20" height="20" viewBox="0 0 32 34">
                  <rect x="4" y="2" width="24" height="8" rx="2" fill="#1F2937" />
                  <rect x="2" y="11" width="28" height="18" rx="3" fill="#1F2937" />
                  <text x="16" y="22" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">✕</text>
                </svg>
                Occupé
              </span>
            </div>

            {/* Feedback sélection */}
            {selectedSeatData && (
              <div className="bg-gray-900 text-white rounded-xl p-4 mt-5 max-w-[420px] mx-auto flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Siège {selectedSeat} sélectionné</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {CATEGORIES.find(c => c.key === selectedSeatData.category)!.label}
                  </p>
                </div>
                <span className="font-bold text-lg" style={{ color: GOLD }}>
                  {seatPrice > 0 ? `+${seatPrice.toFixed(2)} CHF` : 'Inclus'}
                </span>
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

      {/* Skip modal — style easyJet */}
      {showSkipModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowSkipModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
              <h3 className="font-bold text-xl text-gray-900 leading-snug">
                Vous n'avez pas choisi de siège. Vous confirmez ?
              </h3>
              <button
                onClick={() => setShowSkipModal(false)}
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                style={{ color: GOLD }}
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body — bloc gris pédagogique */}
            <div className="mx-6 mb-5 rounded-lg bg-gray-50 border border-gray-100 p-5 space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>
                Si vous souhaitez choisir où vous asseoir, vous pouvez sélectionner un siège dès maintenant :
              </p>
              <p>
                En sélectionnant un <strong>siège standard (Rang 3)</strong>, vous pourrez choisir de vous asseoir près de la fenêtre, au milieu ou côté couloir — <strong>gratuitement</strong>.
              </p>
              <p>
                En sélectionnant un <strong>siège Confort (Rang 2)</strong> ou <strong>Premium Avant</strong>, vous bénéficierez de plus d'espace pour les jambes, d'une meilleure vue panoramique et embarquerez parmi les premiers.
              </p>
            </div>

            {/* CTA principal */}
            <div className="px-6 pb-3">
              <button
                onClick={() => setShowSkipModal(false)}
                className="w-full py-3.5 rounded-lg text-base font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: GOLD }}
              >
                Choisir des sièges
              </button>
            </div>

            {/* Lien secondaire */}
            <div className="px-6 pb-6 text-center">
              <button
                onClick={() => { setShowSkipModal(false); forward(); }}
                className="text-sm font-semibold hover:underline py-2"
                style={{ color: GOLD }}
              >
                Ne pas choisir de siège
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
