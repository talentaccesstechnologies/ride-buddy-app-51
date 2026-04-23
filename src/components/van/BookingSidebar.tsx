import React, { useState } from 'react';
import { Check, ShieldCheck, ChevronUp, ChevronDown } from 'lucide-react';
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
  onContinue, continueDisabled = false, continueLabel = 'Continue >',
}: BookingSidebarProps) {
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const total = subtotal - roundTripDiscount;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── DESKTOP SIDEBAR (unchanged) ── */}
      <div className="hidden md:block bg-white border rounded-xl shadow-sm p-5 sticky top-28">
        <h3 className="font-bold text-lg mb-4">Panier</h3>

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

      {/* ── MOBILE STICKY BOTTOM BAR (easyJet-style) ── */}
      <div className="md:hidden">
        {/* Spacer so content above isn't hidden */}
        <div style={{ height: 78 }} />

        {/* Expanded basket overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
        )}
        {mobileOpen && (
          <div className="fixed bottom-[78px] left-0 right-0 z-50 bg-white border-t shadow-2xl rounded-t-2xl p-4 max-h-[60vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base text-gray-900">Your basket</h3>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 p-1">
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm font-semibold text-gray-900">{from} → {to}</div>
            {departureDate && (
              <div className="text-xs text-gray-500 mb-2">
                {departureDate} · {departureTime}→{arrivalTime}
              </div>
            )}
            {returnDate && (
              <>
                <div className="text-sm font-semibold text-gray-900 mt-2">{to} → {from}</div>
                <div className="text-xs text-gray-500 mb-2">
                  {returnDate} · {returnTime}→{returnArrivalTime}
                </div>
              </>
            )}

            <hr className="my-3" />

            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="text-gray-700">{item.label}</span>
                <span className="font-medium text-gray-900">CHF {item.amount.toFixed(2)}</span>
              </div>
            ))}
            {roundTripDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600 py-1">
                <span>Remise aller-retour -5%</span>
                <span>-CHF {roundTripDiscount.toFixed(2)}</span>
              </div>
            )}

            <hr className="my-3" />

            <div className="flex justify-between font-bold text-base text-gray-900 mb-3">
              <span>TOTAL</span>
              <span>CHF {total.toFixed(2)}</span>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Check className="w-3 h-3 text-green-500" /> Annulation gratuite 24h
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <ShieldCheck className="w-3 h-3 text-green-500" /> Assurance trajet disponible
              </div>
            </div>
          </div>
        )}

        {/* Sticky bar */}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex items-stretch">
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="flex-1 flex flex-col items-start justify-center px-4 py-2 active:bg-gray-50"
            >
              <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                <span>{mobileOpen ? 'Hide basket' : 'Show basket'}</span>
                {mobileOpen
                  ? <ChevronDown className="w-3.5 h-3.5" />
                  : <ChevronUp className="w-3.5 h-3.5" />}
              </div>
              <div className="text-[18px] font-extrabold text-gray-900 leading-tight">
                CHF {total.toFixed(2)}
              </div>
            </button>
            <button
              onClick={onContinue}
              disabled={continueDisabled}
              className="px-6 m-2 rounded-md text-white font-bold text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: continueDisabled ? '#9CA3AF' : GOLD, minWidth: 130 }}
            >
              {continueLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
