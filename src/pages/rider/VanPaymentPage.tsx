import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import BookingStepper from '@/components/van/BookingStepper';
import BookingSidebar, { BookingItem } from '@/components/van/BookingSidebar';
import { Check, Lock, Mail, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import visaLogo from '@/assets/payment/visa.svg';
import mastercardLogo from '@/assets/payment/mastercard.svg';
import twintLogo from '@/assets/payment/twint.svg';
import revolutLogo from '@/assets/payment/revolut.svg';
import applepayLogo from '@/assets/payment/applepay.svg';

const GOLD = '#C9A84C';

export default function VanPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { user, signIn, signUp, loading: authLoading } = useAuth();

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

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'twint' | 'revolut' | 'apple'>('card');
  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef] = useState(() =>
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );

  // Auth gate
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const handlePay = () => {
    if (!user) {
      // Should not reach here because the modal blocks it, but just in case
      toast.error('Veuillez vous connecter pour finaliser le paiement');
      return;
    }
    toast.success('Paiement simulé avec succès');
    setConfirmed(true);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authEmail || !authPassword || (authMode === 'register' && !authName)) {
      setAuthError('Veuillez remplir tous les champs');
      return;
    }
    setAuthSubmitting(true);
    try {
      if (authMode === 'login') {
        const { error } = await signIn(authEmail, authPassword);
        if (error) {
          setAuthError(error.message || 'Identifiants invalides');
        } else {
          toast.success('Connecté avec succès');
        }
      } else {
        const { error } = await signUp(authEmail, authPassword, authName);
        if (error) {
          setAuthError(error.message || 'Erreur lors de la création du compte');
        } else {
          toast.success('Compte créé. Vérifiez votre email pour confirmer.');
        }
      }
    } finally {
      setAuthSubmitting(false);
    }
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

  const showAuthGate = !authLoading && !user;

  return (
    <div className="min-h-screen bg-gray-50 relative">
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
                {([
                  {
                    id: 'card' as const,
                    label: 'Carte bancaire',
                    sub: 'Visa, Mastercard',
                    logos: [visaLogo, mastercardLogo],
                  },
                  {
                    id: 'twint' as const,
                    label: 'TWINT',
                    sub: 'Paiement instantané suisse',
                    logos: [twintLogo],
                  },
                  {
                    id: 'revolut' as const,
                    label: 'Revolut Pay',
                    sub: 'Payez avec votre compte Revolut',
                    logos: [revolutLogo],
                  },
                  {
                    id: 'apple' as const,
                    label: 'Apple Pay',
                    sub: 'Touch ID ou Face ID',
                    logos: [applepayLogo],
                  },
                ]).map((m) => {
                  const active = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition ${
                        active ? 'border-2' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={active ? { borderColor: GOLD, backgroundColor: '#FFFBF0' } : {}}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          active ? '' : 'border-gray-300'
                        }`}
                        style={active ? { borderColor: GOLD } : {}}
                      >
                        {active && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: GOLD }}
                          />
                        )}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{m.label}</div>
                        <div className="text-xs text-gray-500">{m.sub}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {m.logos.map((src, idx) => (
                          <img
                            key={idx}
                            src={src}
                            alt=""
                            className="h-7 w-auto object-contain"
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handlePay}
                disabled={showAuthGate}
                className="w-full mt-4 py-3 rounded-lg text-white font-bold text-lg disabled:opacity-60"
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

      {/* Auth gate modal — required before paying */}
      {showAuthGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {authMode === 'login'
                      ? 'Connectez-vous à votre compte'
                      : 'Créez votre compte'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    pour finaliser votre réservation
                  </p>
                </div>
                <button
                  onClick={() => navigate(-1)}
                  className="text-gray-400 hover:text-gray-600 -mr-2 -mt-1"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAuthSubmit} className="px-6 py-5 space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Jean Dupont"
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-0"
                      style={{ outlineColor: GOLD }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2"
                  />
                </div>
              </div>

              {authError && (
                <p className="text-sm text-red-600 text-center">{authError}</p>
              )}

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3 rounded-lg text-white font-semibold disabled:opacity-60"
                style={{ backgroundColor: GOLD }}
              >
                {authSubmitting
                  ? 'Veuillez patienter…'
                  : authMode === 'login'
                  ? 'Se connecter'
                  : 'Créer mon compte'}
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">
                  {authMode === 'login'
                    ? "Vous n'avez pas encore de compte ?"
                    : 'Vous avez déjà un compte ?'}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={() => {
                  setAuthError('');
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                }}
                className="w-full py-2.5 rounded-lg border-2 font-semibold"
                style={{ borderColor: GOLD, color: GOLD }}
              >
                {authMode === 'login' ? 'Créer un compte' : 'Se connecter'}
              </button>
            </form>

            <div className="px-6 pb-5 text-center">
              <p className="text-xs text-gray-400">
                Vos informations sont sécurisées et ne servent qu'à confirmer votre réservation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
