import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BookingStepper from '@/components/van/BookingStepper';
import BookingSidebar, { BookingItem } from '@/components/van/BookingSidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  MobileInstructionBar,
  MobileSectionHeader,
  MobileInput,
  MobileSelect,
  MobileBlockCard,
} from '@/components/van/EasyJetMobileUI';

const GOLD = '#C9A84C';

export default function VanPassengersPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const from = params.get('from') || 'Genève';
  const to = params.get('to') || 'Zurich';
  const passengers = parseInt(params.get('passengers') || '1');
  const price = parseFloat(params.get('price') || '54');
  const packPrice = parseFloat(params.get('packPrice') || '0');

  const [form, setForm] = useState({
    title: 'Mr',
    firstName: '', lastName: '', email: '', phone: '',
    age: '18+',
    reason: 'loisirs', flightNumber: '',
  });
  const [passengerNames, setPassengerNames] = useState<{ first: string; last: string }[]>(
    Array.from({ length: Math.max(0, passengers - 1) }, () => ({ first: '', last: '' }))
  );

  const alreadyAccepted = localStorage.getItem('cabyvan_terms_accepted') === 'true';
  const [check1, setCheck1] = useState(alreadyAccepted);
  const [check2, setCheck2] = useState(alreadyAccepted);
  const [check3, setCheck3] = useState(alreadyAccepted);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const update = (key: string, val: string | boolean) => setForm(f => ({ ...f, [key]: val }));

  const items: BookingItem[] = [{ label: `Trajet ${from} → ${to}`, amount: price }];
  if (packPrice > 0) items.push({ label: 'Formule choisie', amount: packPrice });

  const formValid = !!(form.firstName && form.lastName && form.email);
  const allChecked = check1 && check2 && check3;
  const canContinue = formValid && allChecked;

  const handleContinue = () => {
    if (!allChecked) {
      setSubmitAttempted(true);
      return;
    }
    localStorage.setItem('cabyvan_terms_accepted', 'true');
    localStorage.setItem('cabyvan_terms_date', new Date().toISOString());
    const p = new URLSearchParams(params);
    navigate(`/caby/van/seat?${p}`);
  };

  const forward = () => {
    const p = new URLSearchParams(params);
    navigate(`/caby/van/seat?${p}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <BookingStepper currentStep={3} />

      {/* ── MOBILE (easyJet-style) ────────────────────────────── */}
      <MobileSectionHeader title="Passenger details" onBack={() => navigate(-1)} />
      <MobileInstructionBar
        text="Now tell us who's flying"
        ctaLabel={canContinue ? 'Continue >' : undefined}
        onCta={canContinue ? handleContinue : undefined}
        ctaPrimary
      />

      <div className="md:hidden bg-white px-4 py-5">
        <p className="text-[13px] text-gray-700 leading-relaxed mb-4">
          Please enter passenger names exactly as they appear on the passengers passport or photo ID.
        </p>

        {/* Adult 1 */}
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">👤</span>
              <span className="font-bold text-[15px] text-gray-900">Adult 1</span>
            </div>
            <button className="text-[12px] font-medium underline" style={{ color: GOLD }}>
              Copy from contact details &gt;
            </button>
          </div>

          <div className="space-y-4">
            <MobileSelect
              label="Title"
              value={form.title}
              onChange={(v) => update('title', v)}
              options={[
                { value: 'Mr', label: 'Mr' },
                { value: 'Mrs', label: 'Mrs' },
                { value: 'Ms', label: 'Ms' },
                { value: 'Dr', label: 'Dr' },
              ]}
            />
            <MobileInput
              label="First name"
              value={form.firstName}
              onChange={(v) => update('firstName', v)}
              placeholder="First name"
              autoComplete="given-name"
            />
            <MobileInput
              label="Last name"
              value={form.lastName}
              onChange={(v) => update('lastName', v)}
              placeholder="Last name"
              autoComplete="family-name"
            />
            <MobileSelect
              label="Age at time of travel"
              value={form.age}
              onChange={(v) => update('age', v)}
              options={[
                { value: '18+', label: '18+' },
                { value: '12-17', label: '12-17' },
                { value: '2-11', label: '2-11' },
                { value: '<2', label: 'Under 2' },
              ]}
            />
          </div>
        </div>

        {/* Contact + flight */}
        <div className="border border-gray-200 rounded-lg p-4 mb-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-700">✉️</span>
            <span className="font-bold text-[15px] text-gray-900">Contact details</span>
          </div>
          <MobileInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => update('email', v)}
            placeholder="email@example.com"
            inputMode="email"
            autoComplete="email"
          />
          <MobileInput
            label="Mobile"
            type="tel"
            value={form.phone}
            onChange={(v) => update('phone', v)}
            placeholder="+41 79 000 00 00"
            inputMode="tel"
            autoComplete="tel"
          />
          <MobileInput
            label="Flight number (optional)"
            value={form.flightNumber}
            onChange={(v) => update('flightNumber', v)}
            placeholder="ex: LX 1234"
          />
        </div>

        {/* Additional passengers */}
        {passengerNames.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-[15px] text-gray-900">Additional passengers</span>
              <button
                onClick={() =>
                  setPassengerNames(ps => ps.map(() => ({ first: form.firstName, last: form.lastName })))
                }
                className="text-[12px] font-medium underline"
                style={{ color: GOLD }}
              >
                Copy from Adult 1 &gt;
              </button>
            </div>
            {passengerNames.map((p, i) => (
              <div key={i} className={`space-y-3 ${i > 0 ? 'border-t border-gray-100 pt-4 mt-4' : ''}`}>
                <div className="text-[13px] font-semibold text-gray-700">Adult {i + 2}</div>
                <MobileInput
                  label="First name"
                  value={p.first}
                  onChange={(v) => {
                    const copy = [...passengerNames];
                    copy[i] = { ...copy[i], first: v };
                    setPassengerNames(copy);
                  }}
                  placeholder="First name"
                />
                <MobileInput
                  label="Last name"
                  value={p.last}
                  onChange={(v) => {
                    const copy = [...passengerNames];
                    copy[i] = { ...copy[i], last: v };
                    setPassengerNames(copy);
                  }}
                  placeholder="Last name"
                />
              </div>
            ))}
          </div>
        )}

        {/* Travel reason */}
        <div className="mb-4">
          <p className="text-[14px] font-bold text-gray-900 mb-3">Please tell us your reason for travel</p>
          <div className="flex gap-6">
            {[
              { id: 'affaires', label: 'Business' },
              { id: 'loisirs', label: 'Leisure' },
            ].map(r => (
              <label key={r.id} className="flex items-center gap-2 cursor-pointer text-[14px] text-gray-900">
                <span
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: form.reason === r.id ? GOLD : '#D1D5DB' }}
                >
                  {form.reason === r.id && (
                    <span className="w-3 h-3 rounded-full" style={{ background: GOLD }} />
                  )}
                </span>
                <input
                  type="radio"
                  name="reason"
                  checked={form.reason === r.id}
                  onChange={() => update('reason', r.id)}
                  className="hidden"
                />
                {r.label}
              </label>
            ))}
          </div>
        </div>

        {/* Terms & Conditions */}
        <MobileBlockCard title="Terms & Conditions">
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <span
                className="mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0"
                style={{
                  borderColor: GOLD,
                  background: check1 ? GOLD : 'white',
                }}
              >
                {check1 && <span className="text-white text-[12px] font-bold leading-none">✓</span>}
              </span>
              <input
                type="checkbox"
                checked={check1}
                onChange={(e) => setCheck1(e.target.checked)}
                className="hidden"
              />
              <span className="text-[12.5px] text-gray-800 leading-relaxed">
                I confirm that I am aged 18 or over, have read and accepted the{' '}
                <a href="/caby/van/terms" target="_blank" className="underline" style={{ color: GOLD }}>
                  Caby Van terms and conditions
                </a>
                , the{' '}
                <a href="/caby/van/terms#cancellation" className="underline" style={{ color: GOLD }}>
                  key booking and cancellation terms
                </a>{' '}
                and our service rules.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <span
                className="mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0"
                style={{ borderColor: GOLD, background: check2 ? GOLD : 'white' }}
              >
                {check2 && <span className="text-white text-[12px] font-bold leading-none">✓</span>}
              </span>
              <input type="checkbox" checked={check2} onChange={(e) => setCheck2(e.target.checked)} className="hidden" />
              <span className="text-[12.5px] text-gray-800 leading-relaxed">
                I understand this service is ride-sharing with cost-sharing between individuals.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <span
                className="mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0"
                style={{ borderColor: GOLD, background: check3 ? GOLD : 'white' }}
              >
                {check3 && <span className="text-white text-[12px] font-bold leading-none">✓</span>}
              </span>
              <input type="checkbox" checked={check3} onChange={(e) => setCheck3(e.target.checked)} className="hidden" />
              <span className="text-[12.5px] text-gray-800 leading-relaxed">
                To find out more about how we process your personal information, please read our{' '}
                <a href="/caby/privacy" className="underline" style={{ color: GOLD }}>
                  Privacy Notice
                </a>.
              </span>
            </label>

            {submitAttempted && !allChecked && (
              <p className="text-red-600 text-[12px] mt-2">
                ⚠️ Please accept the terms to continue
              </p>
            )}
          </div>
        </MobileBlockCard>

        <BookingSidebar
          from={from} to={to}
          departureDate={params.get('date') || undefined}
          departureTime={params.get('time') || '07:00'}
          arrivalTime={params.get('arrivalTime') || '10:00'}
          returnDate={params.get('returnDate') || undefined}
          returnTime={params.get('returnTime') || undefined}
          returnArrivalTime={params.get('returnArrivalTime') || undefined}
          items={items}
          onContinue={handleContinue}
          continueDisabled={!canContinue}
        />
      </div>

      {/* ── DESKTOP (inchangé) ─────────────────────────────────── */}
      <div className="hidden md:block">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Informations passagers</h1>
            <button onClick={forward} className="text-sm hover:underline" style={{ color: GOLD }}>
              Passer cette étape →
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-6">
              <div className="bg-white rounded-xl border p-5 text-gray-900">
                <h2 className="font-semibold mb-4 text-gray-900">Coordonnées du réservant</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Prénom</Label>
                    <Input value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="Prénom" className="bg-white" />
                  </div>
                  <div>
                    <Label>Nom</Label>
                    <Input value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Nom" className="bg-white" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@exemple.com" className="bg-white" />
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+41 79 000 00 00" className="bg-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border p-5 text-gray-900">
                <h2 className="font-semibold mb-3 text-gray-900">Raison du voyage</h2>
                <div className="flex gap-6">
                  {['affaires', 'loisirs'].map(r => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="radio" name="reason-d"
                        checked={form.reason === r}
                        onChange={() => update('reason', r)}
                        className="accent-[#C9A84C]"
                      />
                      {r === 'affaires' ? '💼 Affaires' : '🌴 Loisirs'}
                    </label>
                  ))}
                </div>
              </div>

              {passengerNames.length > 0 && (
                <div className="bg-white rounded-xl border p-5 text-gray-900">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="font-semibold text-gray-900">Passagers supplémentaires</h2>
                    <button
                      className="text-xs hover:underline" style={{ color: GOLD }}
                      onClick={() => setPassengerNames(ps => ps.map(() => ({ first: form.firstName, last: form.lastName })))}
                    >
                      Copier mes coordonnées
                    </button>
                  </div>
                  {passengerNames.map((p, i) => (
                    <div key={i} className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <Label>Prénom (Adulte {i + 2})</Label>
                        <Input
                          value={p.first}
                          className="bg-white"
                          placeholder="Prénom"
                          onChange={e => {
                            const copy = [...passengerNames];
                            copy[i] = { ...copy[i], first: e.target.value };
                            setPassengerNames(copy);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Nom (Adulte {i + 2})</Label>
                        <Input
                          value={p.last}
                          className="bg-white"
                          placeholder="Nom"
                          onChange={e => {
                            const copy = [...passengerNames];
                            copy[i] = { ...copy[i], last: e.target.value };
                            setPassengerNames(copy);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white rounded-xl border p-5 text-gray-900">
                <h2 className="font-semibold mb-2 text-gray-900">Numéro de vol (optionnel)</h2>
                <p className="text-xs text-gray-600 mb-3">Votre chauffeur suivra votre vol en temps réel</p>
                <Input
                  value={form.flightNumber}
                  onChange={e => update('flightNumber', e.target.value)}
                  placeholder="ex: LX 1234"
                  className="bg-white"
                />
              </div>

              <div className="rounded-xl border p-5 space-y-4" style={{ background: '#fafaf7', borderColor: '#e8e0cc' }}>
                <h3 className="text-[15px] font-bold text-gray-900">Conditions d'utilisation</h3>
                <div className="space-y-3 pt-1">
                  <label className="flex items-start gap-3 cursor-pointer text-sm">
                    <Checkbox checked={check1} onCheckedChange={v => setCheck1(!!v)} className="mt-0.5" />
                    <span>
                      J'ai lu et j'accepte les{' '}
                      <a href="/caby/van/terms" target="_blank" className="underline font-medium" style={{ color: GOLD }}>
                        Conditions Générales d'Utilisation
                      </a>
                      {' '}de Caby Van
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer text-sm">
                    <Checkbox checked={check2} onCheckedChange={v => setCheck2(!!v)} className="mt-0.5" />
                    <span>Je comprends que ce service constitue du covoiturage avec partage de frais entre particuliers</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer text-sm">
                    <Checkbox checked={check3} onCheckedChange={v => setCheck3(!!v)} className="mt-0.5" />
                    <span>Je certifie avoir au moins 18 ans</span>
                  </label>
                </div>
                {submitAttempted && !allChecked && (
                  <p className="text-red-500 text-[13px]">
                    ⚠️ Veuillez accepter les conditions générales pour continuer
                  </p>
                )}
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
                onContinue={handleContinue}
                continueDisabled={!canContinue}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
