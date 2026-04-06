import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Users, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type PricingResult } from '@/utils/cabyVanPricing';

const GOLD = '#C9A84C';

interface SeatPricingCardProps {
  from: string;
  to: string;
  departure: string;
  arrivalEstimate: string;
  pricing: PricingResult;
  seatsTotal: number;
  seatsSold: number;
  departureTime: Date;
  onBook: () => void;
}

const SeatPricingCard: React.FC<SeatPricingCardProps> = ({
  from, to, departure, arrivalEstimate, pricing, seatsTotal, seatsSold, departureTime, onBook,
}) => {
  const [qty, setQty] = useState(1);
  const [countdown, setCountdown] = useState('');
  const seatsLeft = seatsTotal - seatsSold;
  const fillPct = (seatsSold / seatsTotal) * 100;

  useEffect(() => {
    if (pricing.hoursUntilDeparture > 24) { setCountdown(''); return; }
    const tick = () => {
      const diff = departureTime.getTime() - Date.now();
      if (diff <= 0) { setCountdown(''); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${String(m).padStart(2, '0')}min ${String(s).padStart(2, '0')}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [departureTime, pricing.hoursUntilDeparture]);

  const fillColor = fillPct < 50 ? '#22c55e' : fillPct < 80 ? '#f59e0b' : '#ef4444';
  const badgeBg = pricing.urgencyColor === 'green' ? 'bg-emerald-100 text-emerald-700' :
    pricing.urgencyColor === 'orange' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Row 1 — badges */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeBg}`}>{pricing.urgencyLabel}</span>
          {pricing.discount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">−{pricing.discount}%</span>
          )}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${pricing.hoursUntilDeparture < 6 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
          {departure}
        </span>
      </div>

      {/* Row 2 — route */}
      <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Siège partagé · VAN</p>
      <p className="text-base font-bold text-gray-900 mt-0.5">{from} → {to}</p>

      {/* Row 3 — price */}
      <div className="flex items-baseline gap-2 mt-2">
        {pricing.currentPrice < pricing.originalPrice && (
          <span className="text-sm text-gray-400 line-through">CHF {pricing.originalPrice}</span>
        )}
        <span className="text-xl font-black" style={{ color: GOLD }}>CHF {pricing.currentPrice}</span>
        <span className="text-xs text-gray-400">→ {arrivalEstimate}</span>
      </div>

      {/* Row 4 — next price */}
      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-orange-600 font-medium">
        <TrendingUp className="w-3 h-3" />
        <span>Prochain prix : CHF {pricing.nextPrice} après {Math.max(1, Math.ceil((1 - pricing.fillRate) * 2))} réservation{Math.ceil((1 - pricing.fillRate) * 2) > 1 ? 's' : ''}</span>
      </div>

      {/* Row 5 — fill bar */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${fillPct}%`, backgroundColor: fillColor }} />
        </div>
        <span className="text-[10px] font-bold text-gray-500">{seatsSold}/{seatsTotal}</span>
      </div>

      {/* Row 6 — countdown */}
      {countdown && (
        <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-red-500 animate-pulse">
          <Clock className="w-3 h-3" />
          <span>Départ dans {countdown}</span>
        </div>
      )}

      {/* Row 7 — qty + book */}
      <div className="flex items-center gap-2 mt-3">
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 font-bold">−</button>
          <span className="w-6 text-center text-sm font-bold text-gray-900">{qty}</span>
          <button onClick={() => setQty(Math.min(seatsLeft, qty + 1))} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 font-bold">+</button>
        </div>
        <Button onClick={onBook} className="flex-1 h-9 rounded-xl text-white text-sm font-bold" style={{ backgroundColor: GOLD }}>
          Réserver CHF {pricing.currentPrice * qty}
        </Button>
      </div>

      {/* Eco badge */}
      <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-600">
        <Leaf className="w-3 h-3" />
        <span>6× moins de CO₂ qu'en voiture solo</span>
      </div>
    </motion.div>
  );
};

export default SeatPricingCard;
