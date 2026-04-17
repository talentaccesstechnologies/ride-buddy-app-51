import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BookingStepper from '@/components/van/BookingStepper';
import BookingSidebar, { BookingItem } from '@/components/van/BookingSidebar';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

const GOLD = '#C9A84C';

export default function VanPaymentPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const from = params.get('from') || 'Genève';
  const to = params.get('to') || 'Zurich';
  const price = parseFloat(params.get('price') || '54');
  const packPrice = parseFloat(params.get('packPrice') || '0');
  const seatPrice = parseFloat(params.get('seatPrice') || '0');
  const luggagePrice = parseFloat(params.get('luggagePrice') || '0');
  const optionsPrice = parseFloat(params.get('optionsPrice') || '0');

  const items: BookingItem[] = [
    { label: `Trajet ${from} → ${to}`, amount: price },
  ];
  if (packPrice > 0) items.push({ label: 'Formule choisie', amount: packPrice });
  if (seatPrice > 0) items.push({ label: 'Siège choisi', amount: seatPrice });
  if (luggagePrice > 0) items.push({ label: 'Bagages & équipement', amount: luggagePrice });
  if (optionsPrice > 0) items.push({ label: 'Options (Flex/Assurance)', amount: optionsPrice });

  const total = items.reduce((s, i) => s + i.amount, 0);

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'twint' | 'apple'>('card');
  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef] = useState(() =>
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );

  const handlePay = () => {
    toast.success('Paiement simulé avec succès');
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BookingStepper currentStep={6} />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: '#D1FAE5' }}
          >
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-gray-900">Réservation confirmée ! 🎉</h1>
          <p className="text-gray-700 mb-2">Votre trajet {from} → {to} est réservé.</p>
          <p className="text-sm text-gray-500 mb-8">Référence : CABY-{bookingRef}</p>

          <div className="bg-white rounded-xl border p-6 mb-6 text-left max-w-md mx-auto">
            <h3 className="font-semibold mb-3 text-gray-900">Récapitulatif</h3>
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="text-gray-700">{item.label}</span>
                <span className="font-medium text-gray-900">CHF {item.amount.toFixed(2)}</span>
              </div>
            ))}
            <hr className="my-2" />
            <div className="flex justify-between font-bold text-gray-900">
              <span>Total payé</span>
              <span>CHF {total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/caby/account/reservations')}
            className="px-6 py-3 rounded-lg text-white font-semibold"
            style={{ backgroundColor: GOLD }}
          >
            Voir mes réservations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BookingStepper currentStep={6} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Paiement</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-semibold mb-3 text-gray-900">Récapitulatif</h2>
              {items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="font-medium text-gray-900">
                    CHF {item.amount.toFixed(2)}
                  </span>
                </div>
              ))}
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-lg text-gray-900">
                <span>TOTAL</span>
                <span>CHF {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-semibold mb-3 text-gray-900">Mode de paiement</h2>
              <div className="space-y-2">
                {(['card', 'twint', 'apple'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`w-full p-3 rounded-lg border text-left ${
                      paymentMethod === m ? 'border-2' : 'border-gray-200'
                    }`}
                    style={paymentMethod === m ? { borderColor: GOLD } : {}}
                  >
                    {m === 'card' && '💳 Carte bancaire'}
                    {m === 'twint' && '📱 Twint'}
                    {m === 'apple' && '🍎 Apple Pay'}
                  </button>
                ))}
              </div>
              <button
                onClick={handlePay}
                className="w-full mt-4 py-3 rounded-lg text-white font-bold text-lg"
                style={{ backgroundColor: GOLD }}
              >
                Payer CHF {total.toFixed(2)}
              </button>
            </div>
          </div>

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
              onContinue={handlePay}
              continueLabel={`Payer CHF ${total.toFixed(2)}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
