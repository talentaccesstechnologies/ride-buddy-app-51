import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import BookingStepper from '@/components/van/BookingStepper';
import BookingSidebar, { BookingItem } from '@/components/van/BookingSidebar';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const GOLD = '#C9A84C';

const stripePromise = loadStripe(
  import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string
);

export default function VanPaymentPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const sessionIdInUrl = params.get('session_id');

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

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [paidAmount, setPaidAmount] = useState<number | null>(null);
  const [bookingRef] = useState(() =>
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );

  // If Stripe redirected back with session_id, verify payment
  useEffect(() => {
    if (!sessionIdInUrl) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-van-payment', {
          method: 'GET' as never,
          // supabase-js doesn't expose query params for GET easily; use fetch instead
        });
        if (error || !data) {
          // Fallback to direct fetch
          const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-van-payment?session_id=${encodeURIComponent(sessionIdInUrl)}&env=sandbox`;
          const res = await fetch(url, {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
            },
          });
          const json = await res.json();
          if (!cancelled && json.payment_status === 'paid') {
            setPaidAmount((json.amount_total ?? 0) / 100);
            setConfirmed(true);
          } else if (!cancelled) {
            toast.error('Paiement non confirmé. Veuillez réessayer.');
          }
          return;
        }
      } catch (e) {
        if (!cancelled) toast.error('Erreur de vérification du paiement.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionIdInUrl]);

  const startCheckout = useCallback(async () => {
    if (clientSecret || loadingCheckout) return;
    setLoadingCheckout(true);
    try {
      const returnUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      const { data, error } = await supabase.functions.invoke('create-van-checkout', {
        body: {
          items,
          from,
          to,
          return_url: returnUrl,
          env: 'sandbox',
        },
      });

      if (error) throw error;
      if (!data?.client_secret) throw new Error('Réponse de paiement invalide');
      setClientSecret(data.client_secret);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur inconnue';
      toast.error(`Impossible d'initier le paiement : ${msg}`);
    } finally {
      setLoadingCheckout(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientSecret, loadingCheckout, params]);

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
              <span>CHF {(paidAmount ?? total).toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600 mb-8">
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
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Paiement</h1>
        <p className="text-sm text-gray-600 mb-6">
          Mode test — utilisez la carte <code className="bg-gray-100 px-1 rounded">4242 4242 4242 4242</code> avec une date future et un CVC quelconque.
        </p>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            {/* Recap */}
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

            {/* Stripe Embedded Checkout */}
            <div className="bg-white rounded-xl border p-5 min-h-[400px]">
              {!clientSecret && (
                <div className="text-center py-8">
                  <p className="font-semibold text-gray-900 mb-4">
                    Montant total : CHF {total.toFixed(2)}
                  </p>
                  <button
                    onClick={startCheckout}
                    disabled={loadingCheckout}
                    className="w-full max-w-md py-3 rounded-lg text-white font-bold text-lg disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    style={{ backgroundColor: GOLD }}
                  >
                    {loadingCheckout && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loadingCheckout
                      ? 'Préparation du paiement...'
                      : `Payer maintenant CHF ${total.toFixed(2)}`}
                  </button>
                  <p className="text-xs text-gray-500 mt-3">
                    Paiement sécurisé par Stripe — Avec obligation de paiement
                  </p>
                </div>
              )}
              {clientSecret && (
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{ clientSecret }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              )}
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
              onContinue={startCheckout}
              continueDisabled={loadingCheckout || !!clientSecret}
              continueLabel={
                clientSecret
                  ? 'Paiement en cours...'
                  : loadingCheckout
                  ? 'Préparation...'
                  : `Payer CHF ${total.toFixed(2)}`
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
