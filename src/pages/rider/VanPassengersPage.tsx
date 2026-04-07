import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BookingStepper from '@/components/van/BookingStepper';
import BookingSidebar, { BookingItem } from '@/components/van/BookingSidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

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
    firstName: '', lastName: '', email: '', phone: '', country: 'Suisse',
    reason: 'loisirs', flightNumber: '',
    cguAccepted: false, covoiturageAccepted: false,
  });
  const [passengerNames, setPassengerNames] = useState<{ first: string; last: string }[]>(
    Array.from({ length: Math.max(0, passengers - 1) }, () => ({ first: '', last: '' }))
  );

  const update = (key: string, val: string | boolean) => setForm(f => ({ ...f, [key]: val }));

  const items: BookingItem[] = [
    { label: `Trajet ${from} → ${to}`, amount: price },
  ];
  if (packPrice > 0) items.push({ label: 'Formule choisie', amount: packPrice });

  const canContinue = form.firstName && form.lastName && form.email && form.cguAccepted && form.covoiturageAccepted;

  const forward = () => {
    const p = new URLSearchParams(params);
    navigate(`/caby/van/seat?${p}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <BookingStepper currentStep={2} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Informations passagers</h1>
          <button onClick={forward} className="text-sm hover:underline" style={{ color: GOLD }}>
            Passer cette étape →
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            {/* Contact info */}
            <div className="bg-white rounded-xl border p-5 text-gray-900">
              <h2 className="font-semibold mb-4 text-gray-900">Coordonnées du réservant</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Prénom</Label>
                  <Input value={form.firstName} onChange={e => update('firstName', e.target.value)} />
                </div>
                <div>
                  <Label>Nom</Label>
                  <Input value={form.lastName} onChange={e => update('lastName', e.target.value)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+41 79 000 00 00" />
                </div>
                <div>
                  <Label>Pays</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={form.country}
                    onChange={e => update('country', e.target.value)}
                  >
                    <option>Suisse</option>
                    <option>France</option>
                    <option>Allemagne</option>
                    <option>Italie</option>
                    <option>Autriche</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Travel reason */}
            <div className="bg-white rounded-xl border p-5 text-gray-900">
              <h2 className="font-semibold mb-3 text-gray-900">Raison du voyage</h2>
              <div className="flex gap-6">
                {['affaires', 'loisirs'].map(r => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio" name="reason"
                      checked={form.reason === r}
                      onChange={() => update('reason', r)}
                      className="accent-[#C9A84C]"
                    />
                    {r === 'affaires' ? '💼 Affaires' : '🌴 Loisirs'}
                  </label>
                ))}
              </div>
            </div>

            {/* Additional passengers */}
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

            {/* Flight number */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-semibold mb-2">Numéro de vol (optionnel)</h2>
              <p className="text-xs text-gray-500 mb-3">Votre chauffeur suivra votre vol en temps réel</p>
              <Input
                value={form.flightNumber}
                onChange={e => update('flightNumber', e.target.value)}
                placeholder="ex: LX 1234"
              />
            </div>

            {/* CGU */}
            <div className="bg-white rounded-xl border p-5 space-y-3">
              <label className="flex items-start gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={form.cguAccepted}
                  onCheckedChange={v => update('cguAccepted', !!v)}
                />
                <span>Je confirme avoir lu et accepté les <a href="#" className="underline" style={{ color: GOLD }}>conditions générales de Caby</a></span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={form.covoiturageAccepted}
                  onCheckedChange={v => update('covoiturageAccepted', !!v)}
                />
                <span>Je certifie que ce trajet constitue du covoiturage avec partage de frais</span>
              </label>
            </div>
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
              continueDisabled={!canContinue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
