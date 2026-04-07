import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BookingStepper from '@/components/van/BookingStepper';
import BookingSidebar, { BookingItem } from '@/components/van/BookingSidebar';
import { Check, X } from 'lucide-react';

const GOLD = '#C9A84C';

const PACKS = [
  {
    id: 'essentiel',
    name: 'ESSENTIEL',
    subtitle: 'Voyagez léger',
    price: 0,
    priceLabel: 'Continuer avec tarif Essentiel',
    features: {
      petit_bagage: true,
      grande_valise: 'Supplément',
      siege: 'Supplément',
      annulation: false,
      wifi: false,
      boisson: false,
    },
  },
  {
    id: 'confort',
    name: 'CONFORT',
    subtitle: 'Voyagez bien',
    price: 12,
    priceLabel: '+CHF 12 par personne',
    recommended: true,
    features: {
      petit_bagage: true,
      grande_valise: true,
      siege: 'Siège standard',
      annulation: false,
      wifi: true,
      boisson: false,
    },
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    subtitle: 'Voyagez en VIP',
    price: 22,
    priceLabel: '+CHF 22 par personne',
    features: {
      petit_bagage: true,
      grande_valise: true,
      siege: 'Siège avant prioritaire',
      annulation: true,
      wifi: true,
      boisson: true,
    },
  },
];

const FEATURE_LABELS: Record<string, { icon: string; label: string }> = {
  petit_bagage: { icon: '🎒', label: 'Petit bagage' },
  grande_valise: { icon: '🧳', label: 'Grande valise' },
  siege: { icon: '💺', label: 'Siège choisi' },
  annulation: { icon: '🔄', label: 'Annulation flexible' },
  wifi: { icon: '📶', label: 'WiFi' },
  boisson: { icon: '🥤', label: 'Boisson' },
};

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-4 h-4 text-green-500 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-gray-300 mx-auto" />;
  return <span className="text-xs text-gray-500">{value}</span>;
}

export default function VanPackPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [selected, setSelected] = useState('confort');
  const from = params.get('from') || 'Genève';
  const to = params.get('to') || 'Zurich';
  const passengers = parseInt(params.get('passengers') || '1');
  const price = parseFloat(params.get('price') || '54');

  const pack = PACKS.find(p => p.id === selected)!;
  const packTotal = pack.price * passengers;

  const items: BookingItem[] = [
    { label: `Trajet ${from} → ${to}`, amount: price },
  ];
  if (packTotal > 0) items.push({ label: `Formule ${pack.name} ×${passengers}`, amount: packTotal });

  const forwardParams = new URLSearchParams(params);
  forwardParams.set('pack', selected);
  forwardParams.set('packPrice', String(packTotal));

  return (
    <div className="min-h-screen bg-gray-50">
      <BookingStepper currentStep={1} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-2xl font-bold">Sélectionnez votre formule de voyage</h1>
            <p className="text-gray-500 text-sm">La formule s'applique par passager et par trajet</p>
          </div>
          <button
            onClick={() => navigate(`/caby/van/passengers?${forwardParams}`)}
            className="text-sm hover:underline"
            style={{ color: GOLD }}
          >
            Passer cette étape →
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          {/* Pack comparison */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PACKS.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className={`relative bg-white rounded-xl border-2 p-5 cursor-pointer transition-all ${
                    selected === p.id ? 'shadow-lg' : 'hover:shadow-md'
                  }`}
                  style={{
                    borderColor: selected === p.id ? GOLD : p.recommended ? GOLD + '60' : '#e5e7eb',
                  }}
                >
                  {p.recommended && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-3 py-0.5 rounded-full"
                      style={{ backgroundColor: GOLD }}
                    >
                      ⭐ Recommandé
                    </div>
                  )}

                  <h3 className="font-bold text-lg text-center mt-1">{p.name}</h3>
                  <p className="text-xs text-gray-500 text-center mb-3">{p.subtitle}</p>
                  <p className="text-center font-semibold text-sm mb-4" style={{ color: GOLD }}>
                    {p.priceLabel}
                  </p>

                  <div className="space-y-2.5">
                    {Object.entries(FEATURE_LABELS).map(([key, meta]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <span>{meta.icon}</span>
                        <span className="flex-1 text-gray-600">{meta.label}</span>
                        <FeatureCell value={p.features[key as keyof typeof p.features]} />
                      </div>
                    ))}
                  </div>

                  <button
                    className={`w-full mt-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      selected === p.id ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={selected === p.id ? { backgroundColor: GOLD } : undefined}
                    onClick={() => setSelected(p.id)}
                  >
                    {selected === p.id ? 'Sélectionné ✓' : 'Choisir'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-72">
            <BookingSidebar
              from={from}
              to={to}
              departureDate={params.get('date') || undefined}
              departureTime={params.get('time') || '07:00'}
              arrivalTime={params.get('arrivalTime') || '10:00'}
              returnDate={params.get('returnDate') || undefined}
              returnTime={params.get('returnTime') || undefined}
              returnArrivalTime={params.get('returnArrivalTime') || undefined}
              items={items}
              onContinue={() => navigate(`/caby/van/passengers?${forwardParams}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
