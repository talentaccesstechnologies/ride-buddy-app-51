import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BookingStepper from '@/components/van/BookingStepper';
import BookingSidebar, { BookingItem } from '@/components/van/BookingSidebar';
import { ShieldCheck, Clock, CalendarCheck, Coins } from 'lucide-react';

const GOLD = '#C9A84C';

export default function VanOptionsPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const from = params.get('from') || 'Genève';
  const to = params.get('to') || 'Zurich';
  const price = parseFloat(params.get('price') || '54');
  const packPrice = parseFloat(params.get('packPrice') || '0');
  const seatPrice = parseFloat(params.get('seatPrice') || '0');
  const luggagePrice = parseFloat(params.get('luggagePrice') || '0');
  const passengers = parseInt(params.get('passengers') || '1');

  const [cabyFlex, setCabyFlex] = useState(false);
  const [insurance, setInsurance] = useState(false);

  const flexTotal = cabyFlex ? 9 * passengers : 0;
  const insuranceTotal = insurance ? 4.90 : 0;

  const items: BookingItem[] = [
    { label: `Trajet ${from} → ${to}`, amount: price },
  ];
  if (packPrice > 0) items.push({ label: 'Formule choisie', amount: packPrice });
  if (seatPrice > 0) items.push({ label: 'Siège choisi', amount: seatPrice });
  if (luggagePrice > 0) items.push({ label: 'Bagages', amount: luggagePrice });
  if (flexTotal > 0) items.push({ label: 'Caby Flex', amount: flexTotal });
  if (insuranceTotal > 0) items.push({ label: 'Assurance trajet', amount: insuranceTotal });

  const forward = () => {
    const p = new URLSearchParams(params);
    p.set('optionsPrice', String(flexTotal + insuranceTotal));
    navigate(`/caby/van/payment?${p}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BookingStepper currentStep={5} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Options supplémentaires</h1>
          <button onClick={forward} className="text-sm hover:underline" style={{ color: GOLD }}>
            Passer les options →
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            {/* Caby Flex */}
            <div
              className="bg-white rounded-xl border-2 p-6 transition-all"
              style={{ borderColor: cabyFlex ? GOLD : '#e5e7eb' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-bold text-lg">CABY FLEX</h2>
                  <p className="text-sm text-gray-500">Flexibilité maximale sur votre trajet</p>
                </div>
                <span className="font-bold" style={{ color: GOLD }}>CHF 9.00 <span className="text-xs font-normal text-gray-400">/pers.</span></span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="text-center">
                  <Clock className="w-6 h-6 mx-auto mb-1 text-gray-500" />
                  <p className="text-xs font-medium">Dernière minute</p>
                  <p className="text-[10px] text-gray-400">Modifiez jusqu'à 2h avant</p>
                </div>
                <div className="text-center">
                  <CalendarCheck className="w-6 h-6 mx-auto mb-1 text-gray-500" />
                  <p className="text-xs font-medium">Flexibilité</p>
                  <p className="text-[10px] text-gray-400">Changez heure ou créneau</p>
                </div>
                <div className="text-center">
                  <Coins className="w-6 h-6 mx-auto mb-1 text-gray-500" />
                  <p className="text-xs font-medium">Économies</p>
                  <p className="text-[10px] text-gray-400">Pas de frais de modification</p>
                </div>
              </div>

              <button
                onClick={() => setCabyFlex(!cabyFlex)}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  cabyFlex ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={cabyFlex ? { backgroundColor: GOLD } : undefined}
              >
                {cabyFlex ? 'Ajouté ✓' : 'Ajouter Caby Flex'}
              </button>
            </div>

            {/* Insurance */}
            <div
              className="bg-white rounded-xl border-2 p-6 transition-all"
              style={{ borderColor: insurance ? GOLD : '#e5e7eb' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-bold text-lg">ASSURER MON TRAJET</h2>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Choix populaire</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">Proposé par 🛡️ Wakam Assurance</p>

              <div
                className="border rounded-lg p-4 mb-4"
                style={{ borderColor: insurance ? GOLD : '#e5e7eb' }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-sm">Annulation & Bagages</h3>
                  <span className="font-bold" style={{ color: GOLD }}>CHF 4.90</span>
                </div>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Annulation : jusqu'à CHF 500</li>
                  <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Bagages perdus : jusqu'à CHF 300</li>
                  <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Assistance retard : jusqu'à CHF 100</li>
                </ul>
              </div>

              <button
                onClick={() => setInsurance(!insurance)}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  insurance ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={insurance ? { backgroundColor: GOLD } : undefined}
              >
                {insurance ? 'Ajouté ✓' : 'Ajouter cette assurance'}
              </button>
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
              onContinue={forward}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
