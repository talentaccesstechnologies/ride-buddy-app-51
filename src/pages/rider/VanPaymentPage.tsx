import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BookingStepper from '@/components/van/BookingStepper';
import BookingSidebar, { BookingItem } from '@/components/van/BookingSidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, Apple, Smartphone, Check } from 'lucide-react';
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

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [useWallet, setUseWallet] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const walletBalance = 15;
  const walletApplied = useWallet ? Math.min(walletBalance, total) : 0;
  const finalTotal = total - walletApplied;

  const canPay = paymentMethod !== 'card' || (cardNumber && expiry && cvv);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      if (cardNumber === '4000 0000 0000 0002' || cardNumber === '4000000000000002') {
        setProcessing(false);
        toast.error('Paiement refusé. Veuillez vérifier vos informations.');
        return;
      }
      setProcessing(false);
      setConfirmed(true);
    }, 2000);
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BookingStepper currentStep={6} />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#D1FAE5' }}>
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Réservation confirmée ! 🎉</h1>
          <p className="text-gray-500 mb-2">Votre trajet {from} → {to} est réservé.</p>
          <p className="text-sm text-gray-400 mb-8">Référence : CABY-{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>

          <div className="bg-white rounded-xl border p-6 mb-6 text-left max-w-md mx-auto">
            <h3 className="font-semibold mb-3">Récapitulatif</h3>
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium">CHF {item.amount.toFixed(2)}</span>
              </div>
            ))}
            {walletApplied > 0 && (
              <div className="flex justify-between text-sm py-1 text-green-600">
                <span>Wallet Caby</span>
                <span>-CHF {walletApplied.toFixed(2)}</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Total payé</span>
              <span>CHF {finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-500 mb-8">
            <p>✅ Confirmation envoyée par email</p>
            <p>🛡️ Garanti Caby — Remboursement si annulé par le chauffeur</p>
            <p>📱 Retrouvez votre réservation dans "Mes réservations"</p>
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
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Paiement</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            {/* Promo code / Wallet */}
            <div className="bg-white rounded-xl border p-5 text-gray-900">
              <h2 className="font-semibold mb-3 text-gray-900">Code promo ou Wallet Caby</h2>
              <div className="flex gap-2 mb-3">
                <Input
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  placeholder="Code promo"
                  className="flex-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
                <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-900">
                  Appliquer
                </button>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-900">
                <span className="text-gray-700">Wallet Caby : CHF {walletBalance.toFixed(2)} disponible</span>
                <button
                  onClick={() => setUseWallet(!useWallet)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    useWallet ? 'text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                  style={useWallet ? { backgroundColor: GOLD } : undefined}
                >
                  {useWallet ? 'Appliqué ✓' : 'Utiliser'}
                </button>
              </div>
            </div>

            {/* Recap */}
            <div className="bg-white rounded-xl border p-5 text-gray-900">
              <h2 className="font-semibold mb-3 text-gray-900">Récapitulatif</h2>
              {items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="font-medium text-gray-900">CHF {item.amount.toFixed(2)}</span>
                </div>
              ))}
              {walletApplied > 0 && (
                <div className="flex justify-between text-sm py-1 text-green-600">
                  <span>Wallet Caby</span>
                  <span>-CHF {walletApplied.toFixed(2)}</span>
                </div>
              )}
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-lg text-gray-900">
                <span>TOTAL</span>
                <span>CHF {finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-xl border p-5 text-gray-900">
              <h2 className="font-semibold mb-4 text-gray-900">Comment souhaitez-vous payer ?</h2>
              <div className="space-y-3">
                {[
                  { id: 'card', label: 'Carte bancaire', icon: <CreditCard className="w-4 h-4" /> },
                  { id: 'apple', label: 'Apple Pay', icon: <Apple className="w-4 h-4" /> },
                  { id: 'twint', label: 'TWINT (Suisse)', icon: <span className="text-sm">🔵</span> },
                  { id: 'google', label: 'Google Pay', icon: <Smartphone className="w-4 h-4" /> },
                ].map(m => (
                  <label key={m.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: paymentMethod === m.id ? GOLD : '#e5e7eb' }}
                  >
                    <input
                      type="radio" name="method"
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)}
                      className="accent-[#C9A84C]"
                    />
                    {m.icon}
                    <span className="text-sm font-medium text-gray-900">{m.label}</span>
                  </label>
                ))}
              </div>

              {paymentMethod === 'card' && (
                <div className="mt-4 space-y-3">
                  <div>
                    <Label className="text-gray-900">Numéro de carte</Label>
                    <Input
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-gray-900">Expiration</Label>
                      <Input value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/AA" className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" />
                    </div>
                    <div>
                      <Label className="text-gray-900">CVV</Label>
                      <Input value={cvv} onChange={e => setCvv(e.target.value)} placeholder="123" type="password" className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-900">
                    <Checkbox checked={saveCard} onCheckedChange={v => setSaveCard(!!v)} />
                    Sauvegarder cette carte
                  </label>
                </div>
              )}
            </div>


            {/* Pay button */}
            <div className="text-center">
              <p className="text-lg font-bold mb-2 text-gray-900">Montant total : CHF {finalTotal.toFixed(2)}</p>
              <button
                onClick={handlePay}
                disabled={!canPay || processing}
                className="w-full max-w-md py-3 rounded-lg text-white font-bold text-lg disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: GOLD }}
              >
                {processing ? 'Traitement en cours...' : `Payer maintenant CHF ${finalTotal.toFixed(2)}`}
              </button>
              <p className="text-xs text-gray-400 mt-2">Avec obligation de paiement</p>
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
              onContinue={handlePay}
              continueDisabled={!canPay || processing}
              continueLabel={processing ? 'Traitement...' : `Payer CHF ${finalTotal.toFixed(2)}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
