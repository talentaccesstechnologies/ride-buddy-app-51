import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import BookingStepper from '@/components/van/BookingStepper';
import BookingSidebar, { BookingItem } from '@/components/van/BookingSidebar';
import { MobileInstructionBar, MobileSectionHeader } from '@/components/van/EasyJetMobileUI';
import { Check, Lock, Mail, User, X, AlertTriangle, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNoShow, getNoShowStatus } from '@/hooks/useNoShow';
import visaMastercardLogo from '@/assets/payment/visa-mastercard.png';
import twintLogo from '@/assets/payment/twint.png';
import revolutLogo from '@/assets/payment/revolut.png';
import applepayLogo from '@/assets/payment/applepay.png';

const GOLD = '#C9A84C';
const COMPENSATION_PCT = 60;

// ── Bandeau politique no-show ─────────────────────────────────
const NoShowPolicyBanner: React.FC<{ totalPrice: number }> = ({ totalPrice }) => {
  const compensation = Math.round(totalPrice * COMPENSATION_PCT / 100 * 100) / 100;
  return (
    <div style={{
      background: '#FFFBEB', border: '1.5px solid #FDE68A',
      borderRadius: 12, padding: '12px 14px',
      display: 'flex', gap: 10, alignItems: 'flex-start',
    }}>
      <Shield style={{ width: 16, height: 16, color: GOLD, flexShrink: 0, marginTop: 1 }} />
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>
          Politique d'absence (No-Show)
        </div>
        <div style={{ fontSize: 11, color: '#78350F', lineHeight: 1.6 }}>
          Si vous ne vous présentez pas à l'heure de départ, votre réservation sera marquée
          comme no-show après <strong>10 minutes</strong> de délai de grâce.
          Dans ce cas, <strong>aucun remboursement</strong> ne sera effectué et
          CHF <strong>{compensation}</strong> ({COMPENSATION_PCT}% du prix) sera versé au chauffeur.
        </div>
        <div style={{ fontSize: 11, color: '#B45309', marginTop: 6, fontWeight: 600 }}>
          ⚠️ 2 no-shows = avertissement · 3 no-shows = suspension 30 jours
        </div>
      </div>
    </div>
  );
};

// ── Alerte suspension rider ───────────────────────────────────
const SuspensionAlert: React.FC<{ suspendedUntil: Date | null; noShowCount: number }> = ({ suspendedUntil, noShowCount }) => {
  if (!suspendedUntil && (noShowCount || 0) < 2) return null;
  const isSuspended = suspendedUntil && new Date() < suspendedUntil;
  const daysLeft = suspendedUntil
    ? Math.ceil((suspendedUntil.getTime() - Date.now()) / 86400000)
    : 0;

  if (isSuspended) {
    return (
      <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <AlertTriangle style={{ width: 16, height: 16, color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#991B1B', marginBottom: 2 }}>Compte suspendu</div>
          <div style={{ fontSize: 11, color: '#7F1D1D', lineHeight: 1.6 }}>
            Votre compte est suspendu suite à {noShowCount} no-shows répétés.
            Vous pouvez à nouveau réserver dans <strong>{daysLeft} jour{daysLeft > 1 ? 's' : ''}</strong>.
          </div>
        </div>
      </div>
    );
  }

  if ((noShowCount || 0) >= 2) {
    return (
      <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 10 }}>
        <AlertTriangle style={{ width: 16, height: 16, color: GOLD, flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 11, color: '#92400E', lineHeight: 1.6 }}>
          <strong>Avertissement :</strong> vous avez {noShowCount} no-show{noShowCount > 1 ? 's' : ''} enregistré{noShowCount > 1 ? 's' : ''}.
          Un prochain no-show entraînera la suspension de votre compte pendant 30 jours.
        </div>
      </div>
    );
  }

  return null;
};

// ── Bouton no-show pour le chauffeur ─────────────────────────
export const NoShowDriverButton: React.FC<{
  bookingId: string;
  driverId: string;
  departureTime: Date;
  seatPrice: number;
}> = ({ bookingId, driverId, departureTime, seatPrice }) => {
  const { declareNoShow, isLoading } = useNoShow();
  const [status, setStatus] = useState(getNoShowStatus(departureTime));
  const [confirmed, setConfirmed] = useState(false);
  const compensation = Math.round(seatPrice * COMPENSATION_PCT / 100 * 100) / 100;

  // Mettre à jour le statut toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getNoShowStatus(departureTime));
    }, 30000);
    return () => clearInterval(interval);
  }, [departureTime]);

  if (!status.canDeclare) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
        <Clock style={{ width: 14, height: 14, color: '#9CA3AF' }} />
        <span style={{ fontSize: 11, color: '#6B7280' }}>
          Bouton no-show disponible dans {status.minutesUntilAvailable} min
        </span>
      </div>
    );
  }

  if (!confirmed) {
    return (
      <button
        onClick={() => setConfirmed(true)}
        style={{ padding: '8px 14px', background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <AlertTriangle style={{ width: 14, height: 14 }} />
        Passager absent
      </button>
    );
  }

  return (
    <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#991B1B', marginBottom: 6 }}>
        Confirmer le no-show ?
      </div>
      <div style={{ fontSize: 11, color: '#7F1D1D', marginBottom: 10, lineHeight: 1.5 }}>
        Le siège sera remis en vente et vous recevrez CHF <strong>{compensation}</strong> ({COMPENSATION_PCT}%).
        Cette action est irréversible.
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={async () => {
            await declareNoShow(bookingId, driverId);
            setConfirmed(false);
          }}
          disabled={isLoading}
          style={{ flex: 1, padding: '7px 0', background: '#EF4444', border: 'none', borderRadius: 7, cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: '#fff', opacity: isLoading ? 0.6 : 1 }}
        >
          {isLoading ? 'En cours...' : '✓ Confirmer'}
        </button>
        <button
          onClick={() => setConfirmed(false)}
          style={{ flex: 1, padding: '7px 0', background: 'none', border: '1.5px solid #E5E7EB', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: '#6B7280' }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
};

// ── PAGE PAIEMENT ─────────────────────────────────────────────
export default function VanPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { riderNoShowCount, isSuspended, suspendedUntil, loadRiderStatus } = useNoShow();

  const from = params.get('from') || 'Genève';
  const to = params.get('to') || 'Zurich';
  const price = parseFloat(params.get('price') || '54');
  const packPrice = parseFloat(params.get('packPrice') || '0');
  const seatPrice = parseFloat(params.get('seatPrice') || '0');
  const luggagePrice = parseFloat(params.get('luggagePrice') || '0');
  const optionsPrice = parseFloat(params.get('optionsPrice') || '0');

  const items: BookingItem[] = [{ label: `Trajet ${from} → ${to}`, amount: price }];
  if (packPrice > 0) items.push({ label: 'Formule choisie', amount: packPrice });
  if (seatPrice > 0) items.push({ label: 'Siège choisi', amount: seatPrice });
  if (luggagePrice > 0) items.push({ label: 'Bagages & équipement', amount: luggagePrice });
  if (optionsPrice > 0) items.push({ label: 'Options (Flex/Assurance)', amount: optionsPrice });
  const total = items.reduce((s, i) => s + i.amount, 0);

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'twint' | 'revolut' | 'apple'>('card');
  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());

  // Auth
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Charger le statut no-show du rider connecté
  useEffect(() => {
    if (user?.id) loadRiderStatus(user.id);
  }, [user?.id, loadRiderStatus]);

  const handlePay = () => {
    if (!user) { toast.error('Veuillez vous connecter'); return; }
    if (isSuspended && suspendedUntil && new Date() < suspendedUntil) {
      const days = Math.ceil((suspendedUntil.getTime() - Date.now()) / 86400000);
      toast.error(`Compte suspendu — disponible dans ${days} jour${days > 1 ? 's' : ''}`);
      return;
    }
    toast.success('Paiement simulé avec succès');
    setConfirmed(true);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authEmail || !authPassword || (authMode === 'register' && !authName)) {
      setAuthError('Veuillez remplir tous les champs'); return;
    }
    setAuthSubmitting(true);
    try {
      if (authMode === 'login') {
        const { error } = await signIn(authEmail, authPassword);
        if (error) setAuthError(error.message || 'Identifiants invalides');
        else toast.success('Connecté avec succès');
      } else {
        const { error } = await signUp(authEmail, authPassword, authName);
        if (error) setAuthError(error.message || 'Erreur création compte');
        else toast.success('Compte créé. Vérifiez votre email.');
      }
    } finally { setAuthSubmitting(false); }
  };

  // ── CONFIRMATION ───────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BookingStepper currentStep={7} />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#D1FAE5' }}>
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-gray-900">Réservation confirmée ! 🎉</h1>
          <p className="text-gray-700 mb-2">Votre trajet {from} → {to} est réservé.</p>
          <p className="text-sm text-gray-500 mb-8">Référence : CABY-{bookingRef}</p>

          <div className="bg-white rounded-xl border p-6 mb-4 text-left max-w-md mx-auto">
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

          {/* Rappel politique no-show sur la confirmation */}
          <div style={{ maxWidth: 448, margin: '0 auto 24px', textAlign: 'left' }}>
            <NoShowPolicyBanner totalPrice={total} />
          </div>

          <button onClick={() => navigate('/caby/account/reservations')} className="px-6 py-3 rounded-lg text-white font-semibold" style={{ backgroundColor: GOLD }}>
            Voir mes réservations
          </button>
        </div>
      </div>
    );
  }

  const showAuthGate = !authLoading && !user;
  const isBlocked = isSuspended && suspendedUntil && new Date() < suspendedUntil;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <BookingStepper currentStep={7} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Paiement</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">

            {/* Alerte suspension / avertissement */}
            {user && (
              <SuspensionAlert suspendedUntil={suspendedUntil} noShowCount={riderNoShowCount || 0} />
            )}

            {/* Récapitulatif */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-semibold mb-3 text-gray-900">Récapitulatif</h2>
              {items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="font-medium text-gray-900">CHF {item.amount.toFixed(2)}</span>
                </div>
              ))}
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-lg text-gray-900">
                <span>TOTAL</span>
                <span>CHF {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Politique no-show */}
            <NoShowPolicyBanner totalPrice={total} />

            {/* Mode de paiement */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-semibold mb-3 text-gray-900">Mode de paiement</h2>
              <div className="space-y-2">
                {([
                  { id: 'card' as const, label: 'Carte bancaire', sub: 'Visa, Mastercard', logos: [visaMastercardLogo] },
                  { id: 'twint' as const, label: 'TWINT', sub: 'Paiement instantané suisse', logos: [twintLogo] },
                  { id: 'revolut' as const, label: 'Revolut Pay', sub: 'Payez avec votre compte Revolut', logos: [revolutLogo] },
                  { id: 'apple' as const, label: 'Apple Pay', sub: 'Touch ID ou Face ID', logos: [applepayLogo] },
                ]).map((m) => {
                  const active = paymentMethod === m.id;
                  return (
                    <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                      className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition ${active ? 'border-2' : 'border-gray-200 hover:border-gray-300'}`}
                      style={active ? { borderColor: GOLD, backgroundColor: '#FFFBF0' } : {}}>
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? '' : 'border-gray-300'}`} style={active ? { borderColor: GOLD } : {}}>
                        {active && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GOLD }} />}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{m.label}</div>
                        <div className="text-xs text-gray-500">{m.sub}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {m.logos.map((src, idx) => <img key={idx} src={src} alt="" className="h-7 w-auto object-contain" />)}
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handlePay}
                disabled={showAuthGate || !!isBlocked}
                className="w-full mt-4 py-3 rounded-lg text-white font-bold text-lg disabled:opacity-60"
                style={{ backgroundColor: isBlocked ? '#9CA3AF' : GOLD }}
              >
                {isBlocked ? 'Compte suspendu' : `Payer CHF ${total.toFixed(2)}`}
              </button>

              {/* Mention no-show sous le bouton */}
              <p style={{ fontSize: 10, color: '#9CA3AF', textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>
                En payant, vous acceptez la politique d'absence · No-show = 0% remboursé + CHF {Math.round(total * COMPENSATION_PCT / 100)} au chauffeur
              </p>
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
              continueLabel={`Payer CHF ${total.toFixed(2)}`}
            />
          </div>
        </div>
      </div>

      {/* Auth gate */}
      {showAuthGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {authMode === 'login' ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">pour finaliser votre réservation</p>
                </div>
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 -mr-2 -mt-1" aria-label="Fermer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleAuthSubmit} className="px-6 py-5 space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="Jean Dupont" className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2" style={{ outlineColor: GOLD }} />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="vous@exemple.com" className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2" />
                </div>
              </div>
              {authError && <p className="text-sm text-red-600 text-center">{authError}</p>}
              <button type="submit" disabled={authSubmitting} className="w-full py-3 rounded-lg text-white font-semibold disabled:opacity-60" style={{ backgroundColor: GOLD }}>
                {authSubmitting ? 'Veuillez patienter…' : authMode === 'login' ? 'Se connecter' : 'Créer mon compte'}
              </button>
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">{authMode === 'login' ? "Pas encore de compte ?" : 'Déjà un compte ?'}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <button type="button" onClick={() => { setAuthError(''); setAuthMode(authMode === 'login' ? 'register' : 'login'); }} className="w-full py-2.5 rounded-lg border-2 font-semibold" style={{ borderColor: GOLD, color: GOLD }}>
                {authMode === 'login' ? 'Créer un compte' : 'Se connecter'}
              </button>
            </form>
            <div className="px-6 pb-5 text-center">
              <p className="text-xs text-gray-400">Vos informations sont sécurisées et ne servent qu'à confirmer votre réservation.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
