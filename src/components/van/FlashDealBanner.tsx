import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type FlashDeal } from '@/utils/cabyVanPricing';

interface FlashDealBannerProps {
  deal: FlashDeal;
  onBook: () => void;
}

const FlashDealBanner: React.FC<FlashDealBannerProps> = ({ deal, onBook }) => {
  const [countdown, setCountdown] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    // Expires 24h after appearing
    const expiresAt = deal.departureTime.getTime() - 48 * 3600000;
    const tick = () => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) { setExpired(true); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deal.departureTime]);

  if (expired) return null;

  return (
    <div className="bg-red-600 text-white px-4 py-3 flex items-center gap-3 rounded-2xl shadow-lg animate-pulse-slow">
      <Zap className="w-5 h-5 text-yellow-300 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold">⚡ SIÈGE FLASH — {deal.route}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-lg font-black">CHF {deal.flashPrice}</span>
          <span className="text-xs line-through opacity-60">CHF {deal.originalPrice}</span>
          <span className="text-[10px] opacity-80">· {deal.seatsAvailable} siège</span>
          <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded">{countdown}</span>
        </div>
      </div>
      <Button onClick={onBook} size="sm" className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs rounded-lg h-8 px-3 flex-shrink-0">
        Réserver
      </Button>
    </div>
  );
};

export default FlashDealBanner;
