import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GOLD = '#C9A84C';

export interface BookingItem {
  label: string;
  amount: number;
}

interface BookingSidebarProps {
  from: string;
  to: string;
  departureDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  returnDate?: string;
  returnTime?: string;
  returnArrivalTime?: string;
  items: BookingItem[];
  roundTripDiscount?: number;
  onContinue: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
}

export default function BookingSidebar({
  from, to, departureDate, departureTime, arrivalTime,
  returnDate, returnTime, returnArrivalTime,
  items, roundTripDiscount = 0,
  onContinue, continueDisabled = false, continueLabel = 'Continuer →',
}: BookingSidebarProps) {
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const total = subtotal - roundTripDiscount;

  return (
    <div className="bg-white border rounded-xl shadow-sm p-5 sticky top-28">
      <h3 className="font-bold text-lg mb-4">Panier</h3>

      {/* Outbound */}
      <div className="mb-3">
        <p className="text-sm font-semibold">{from} → {to}</p>
        {departureDate ? (
          <p className="text-xs text-gray-500">
            ✓ {departureDate} · {departureTime}→{arrivalTime}
          </p>
        ) : (
          <p className="text-xs text-gray-400 italic">Aucun trajet sélectionné</p>
        )}
      </div>

      {/* Return */}
      {returnDate !== undefined && (
        <div className="mb-3">
          <p className="text-sm font-semibold">{to} → {from}</p>
          {returnDate ? (
            <p className="text-xs text-gray-500">
              ✓ {returnDate} · {returnTime}→{returnArrivalTime}
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic">Aucun trajet sélectionné</p>
          )}
        </div>
      )}

      <hr className="my-3" />

      {/* Line items */}
      {items.length > 0 ? (
        <div className="space-y-1.5 mb-3">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-medium">CHF {item.amount.toFixed(2)}</span>
            </div>
          ))}
          {roundTripDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Remise aller-retour -5%</span>
              <span>-CHF {roundTripDiscount.toFixed(2)}</span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic mb-3">Aucun article</p>
      )}

      <hr className="my-3" />

      <div className="flex justify-between font-bold text-lg mb-4">
        <span>TOTAL</span>
        <span>CHF {total.toFixed(2)}</span>
      </div>

      <Button
        className="w-full text-white font-semibold"
        style={{ backgroundColor: GOLD }}
        disabled={continueDisabled}
        onClick={onContinue}
      >
        {continueLabel}
      </Button>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Check className="w-3 h-3 text-green-500" /> Annulation gratuite 24h
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <ShieldCheck className="w-3 h-3 text-green-500" /> Assurance trajet disponible
        </div>
      </div>
    </div>
  );
}
