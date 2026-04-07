import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ALL_DESTINATIONS, IMAGE_MAP, FEATURED_CITIES } from '@/lib/destinationData';

const GOLD = '#C9A84C';

interface EditorialSectionsProps {
  onSelectDestination: (city: string) => void;
}

const EditorialSections: React.FC<EditorialSectionsProps> = ({ onSelectDestination }) => {
  const navigate = useNavigate();

  // Coup de Coeur carousel
  const featuredDests = FEATURED_CITIES
    .map(c => ALL_DESTINATIONS.find(d => d.city === c))
    .filter(Boolean) as typeof ALL_DESTINATIONS;

  const [coupIdx, setCoupIdx] = useState(0);
  const nextCoup = useCallback(() => setCoupIdx(i => (i + 1) % featuredDests.length), [featuredDests.length]);
  const prevCoup = useCallback(() => setCoupIdx(i => (i - 1 + featuredDests.length) % featuredDests.length), [featuredDests.length]);

  useEffect(() => {
    const timer = setInterval(nextCoup, 8000);
    return () => clearInterval(timer);
  }, [nextCoup]);

  const currentFeatured = featuredDests[coupIdx];

  return (
    <>
      {/* SECTION 1 — NOS TRAJETS PHARES */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-12">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 text-center mb-8 uppercase tracking-tight">
          Nos trajets phares
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/caby/van/inspire?category=ski')}
            className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all text-left flex flex-col"
          >
            <div className="h-[200px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=600&h=400&fit=crop"
                alt="Alpes enneigées"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight min-h-[56px]">
                Traversez les Alpes en Van
              </h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed flex-1">
                Verbier, Zermatt, Davos... Les plus belles stations accessibles en un trajet.
              </p>
              <div className="flex items-center gap-1.5 mt-4 font-bold text-sm" style={{ color: GOLD }}>
                Explorer <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/caby/van/destination/Lyon')}
            className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all text-left flex flex-col"
          >
            <div className="h-[200px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop"
                alt="Lac Léman coucher de soleil"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight min-h-[56px]">
                Genève ↔ Lyon en 1h45
              </h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed flex-1">
                Business, loisirs, week-end. Dès CHF 42.
              </p>
              <div className="flex items-center gap-1.5 mt-4 font-bold text-sm" style={{ color: GOLD }}>
                Découvrir <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/caby/van/inspire?category=ski')}
            className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all text-left flex flex-col"
          >
            <div className="h-[200px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&h=400&fit=crop"
                alt="Station de ski"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight min-h-[56px]">
                Stations de Ski — Réservez tôt
              </h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed flex-1">
                Verbier, Chamonix, Zermatt, Davos. Dès CHF 28.
              </p>
              <div className="flex items-center gap-1.5 mt-4 font-bold text-sm" style={{ color: GOLD }}>
                Voir les offres <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* SECTION 2 — NOTRE TRAJET COUP DE CŒUR — CAROUSEL */}
      <section className="py-16" style={{ backgroundColor: '#F8F8F8' }}>
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 text-center mb-8 uppercase tracking-tight">
            Nos coups de cœur
          </h2>

          {currentFeatured && (
            <div className="relative">
              <button
                onClick={() => navigate(`/caby/van/destination/${encodeURIComponent(currentFeatured.city)}`)}
                className="group w-full rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all text-left flex flex-col md:flex-row"
              >
                <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {currentFeatured.countryFlag} {currentFeatured.country}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight leading-tight">
                    {currentFeatured.city}
                  </h3>
                  <p className="text-sm text-gray-500 mt-4 leading-relaxed max-w-md">
                    Découvrez {currentFeatured.city} depuis Genève en Caby Van. Confort, flexibilité et petits prix.
                  </p>
                  <div className="flex items-center gap-3 mt-6">
                    <span className="text-xl font-black" style={{ color: GOLD }}>
                      dès CHF {currentFeatured.priceFrom}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-4 font-bold text-sm" style={{ color: GOLD }}>
                    Voir la destination <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="md:w-1/2 h-[250px] md:h-[320px] overflow-hidden">
                  {IMAGE_MAP[currentFeatured.city] ? (
                    <img
                      src={IMAGE_MAP[currentFeatured.city]}
                      alt={currentFeatured.city}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-5xl">
                      {currentFeatured.countryFlag}
                    </div>
                  )}
                </div>
              </button>

              {/* Nav arrows */}
              <button
                onClick={prevCoup}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all z-10"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={nextCoup}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all z-10"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {featuredDests.map((d, i) => (
              <button
                key={d.city}
                onClick={() => setCoupIdx(i)}
                className="w-2.5 h-2.5 rounded-full transition-all"
                style={{
                  backgroundColor: i === coupIdx ? GOLD : '#D1D5DB',
                  transform: i === coupIdx ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — VOUS ÊTES À UN TRAJET DU BONHEUR */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">
            Vous êtes à un trajet du bonheur...
          </h2>
          <p className="text-sm text-gray-500 mt-2">Découvrez la Suisse et ses voisins autrement</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate(`/caby/van/destination/Annecy`)}
              className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all text-left"
            >
              <div className="h-[140px] overflow-hidden">
                <img src={IMAGE_MAP['Annecy']} alt="Annecy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="p-4">
                <p className="text-base font-bold text-gray-900">🇫🇷 Annecy</p>
                <p className="text-lg font-black mt-1" style={{ color: GOLD }}>dès CHF 15</p>
              </div>
            </button>
            <button
              onClick={() => navigate(`/caby/van/destination/Milan`)}
              className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all text-left"
            >
              <div className="h-[140px] overflow-hidden">
                <img src={IMAGE_MAP['Milan']} alt="Milan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="p-4">
                <p className="text-base font-bold text-gray-900">🇮🇹 Milan</p>
                <p className="text-lg font-black mt-1" style={{ color: GOLD }}>dès CHF 79</p>
              </div>
            </button>
          </div>

          <button
            onClick={() => navigate(`/caby/van/destination/Zermatt`)}
            className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all text-left relative"
          >
            <div className="h-[320px] overflow-hidden">
              <img src={IMAGE_MAP['Zermatt']} alt="Zermatt" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            </div>
            <div className="p-4">
              <p className="text-base font-bold text-gray-900">🎿 Zermatt</p>
              <p className="text-lg font-black mt-1" style={{ color: GOLD }}>dès CHF 55</p>
            </div>
          </button>

          <div className="rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col justify-center text-center" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
            <div className="text-3xl mb-3">🎫</div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">
              Caby Pass
            </h3>
            <p className="text-sm font-bold mt-1 uppercase" style={{ color: GOLD }}>
              Vivez une expérience VIP
            </p>
            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              Voyageur régulier ? Le Caby Pass est rentabilisé dès 3 trajets/mois.
            </p>
            <p className="text-2xl font-black text-white mt-4">
              CHF 29<span className="text-sm font-normal text-gray-400">/mois</span>
            </p>
            <button
              className="mt-5 w-full py-3 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90"
              style={{ backgroundColor: GOLD }}
            >
              Je réserve →
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default EditorialSections;
