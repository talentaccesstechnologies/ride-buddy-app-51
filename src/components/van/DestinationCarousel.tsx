import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import zermattImg from '@/assets/zermatt.jpg';
import zurichImg from '@/assets/zurich.jpg';
import verbierImg from '@/assets/verbier.jpg';
import lausanneImg from '@/assets/lausanne.jpg';
import annecyImg from '@/assets/annecy.jpg';
import lyonImg from '@/assets/lyon.jpg';
import baleImg from '@/assets/bale.jpg';

const GOLD = '#C9A84C';
const FALLBACK_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Montreux_and_Lake_Geneva.jpg/640px-Montreux_and_Lake_Geneva.jpg';

export interface DestinationItem {
  to: string;
  from: string;
  price: number;
  month: string;
  flag: string;
  image?: string;
}

const IMAGE_MAP: Record<string, string> = {
  Zurich: zurichImg,
  Lausanne: lausanneImg,
  Verbier: verbierImg,
  Zermatt: zermattImg,
  Annecy: annecyImg,
  Lyon: lyonImg,
};

const ALL_DESTINATIONS: DestinationItem[] = [
  { to: "Zurich", from: "Genève", price: 54, month: "avr. 2026", flag: "🇨🇭" },
  { to: "Lausanne", from: "Genève", price: 18, month: "avr. 2026", flag: "🇨🇭" },
  { to: "Berne", from: "Genève", price: 39, month: "avr. 2026", flag: "🇨🇭" },
  { to: "Bâle", from: "Genève", price: 52, month: "avr. 2026", flag: "🇨🇭" },
  { to: "Sion", from: "Genève", price: 45, month: "avr. 2026", flag: "🇨🇭" },
  { to: "Montreux", from: "Genève", price: 29, month: "avr. 2026", flag: "🇨🇭" },
  { to: "Neuchâtel", from: "Genève", price: 32, month: "avr. 2026", flag: "🇨🇭" },
  { to: "Verbier", from: "Genève", price: 35, month: "avr. 2026", flag: "🎿" },
  { to: "Zermatt", from: "Genève", price: 55, month: "mai 2026", flag: "🎿" },
  { to: "Davos", from: "Zurich", price: 45, month: "avr. 2026", flag: "🎿" },
  { to: "Chamonix", from: "Genève", price: 28, month: "avr. 2026", flag: "🎿" },
  { to: "Gstaad", from: "Genève", price: 62, month: "avr. 2026", flag: "🎿" },
  { to: "Annecy", from: "Genève", price: 15, month: "avr. 2026", flag: "🇫🇷" },
  { to: "Lyon", from: "Genève", price: 42, month: "avr. 2026", flag: "🇫🇷" },
  { to: "Chambéry", from: "Genève", price: 32, month: "avr. 2026", flag: "🇫🇷" },
  { to: "Paris", from: "Genève", price: 65, month: "mai 2026", flag: "🇫🇷" },
  { to: "Milan", from: "Genève", price: 79, month: "mai 2026", flag: "🇮🇹" },
  { to: "Munich", from: "Zurich", price: 72, month: "mai 2026", flag: "🇩🇪" },
];

interface DestinationCarouselProps {
  onSelect: (city: string) => void;
}

const DestinationCarousel: React.FC<DestinationCarouselProps> = ({ onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  // Responsive visible count
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisibleCount(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const totalSlides = ALL_DESTINATIONS.length;
  const maxIndex = totalSlides - visibleCount;

  const next = useCallback(() => {
    setCurrentIndex(i => (i >= maxIndex ? 0 : i + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setCurrentIndex(i => (i <= 0 ? maxIndex : i - 1));
  }, [maxIndex]);

  // Auto-play
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 10000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd = () => {
    if (touchDeltaX.current < -50) next();
    else if (touchDeltaX.current > 50) prev();
  };

  const totalDots = Math.ceil(totalSlides / visibleCount);
  const activeDot = Math.floor(currentIndex / visibleCount);

  return (
    <section className="max-w-5xl mx-auto px-4 pt-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">
          Nos meilleures destinations au meilleur prix
        </h2>
        <p className="text-sm text-gray-500 mt-2">Réservez tôt et économisez jusqu'à 30%</p>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Arrows */}
        <button
          onClick={prev}
          className="absolute -left-4 md:-left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Précédent"
        >
          <ChevronLeft className="w-5 h-5" style={{ color: GOLD }} />
        </button>
        <button
          onClick={next}
          className="absolute -right-4 md:-right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Suivant"
        >
          <ChevronRight className="w-5 h-5" style={{ color: GOLD }} />
        </button>

        {/* Track */}
        <div className="overflow-hidden rounded-2xl">
          <div
            ref={trackRef}
            className="flex"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
              transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              willChange: 'transform',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {ALL_DESTINATIONS.map((dest) => {
              const img = IMAGE_MAP[dest.to] || FALLBACK_IMAGE;
              return (
                <button
                  key={dest.to}
                  onClick={() => onSelect(dest.to)}
                  className="flex-shrink-0 text-left group"
                  style={{ width: `${100 / visibleCount}%`, padding: '0 8px' }}
                >
                  <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all bg-white border border-gray-100">
                    <div className="h-[160px] md:h-[200px] overflow-hidden relative">
                      <img
                        src={img}
                        alt={dest.to}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null;
                          currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-base font-bold text-gray-900">
                        {dest.flag} {dest.to}
                      </p>
                      <p className="text-xs text-gray-500">De {dest.from}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-black" style={{ color: GOLD }}>
                          dès CHF {dest.price}
                        </span>
                        <span className="text-[10px] text-gray-400">{dest.month}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalDots }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i * visibleCount)}
              className="w-2.5 h-2.5 rounded-full transition-all"
              style={{
                backgroundColor: activeDot === i ? GOLD : '#d1d5db',
                transform: activeDot === i ? 'scale(1.3)' : 'scale(1)',
              }}
              aria-label={`Groupe ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestinationCarousel;
