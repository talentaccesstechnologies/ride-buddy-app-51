import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Star } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';
import { ALL_DESTINATIONS, IMAGE_MAP, type Destination } from '@/lib/destinationData';

const GOLD = '#C9A84C';

// Cities surrounding Lac Léman
const LEMAN_CITIES = ['Lausanne', 'Montreux', 'Annecy'];
const SIMILAR_REGIONS = [
  { label: 'France', image: IMAGE_MAP['Annecy'], cityCount: 5, fromPrice: 15 },
  { label: 'Suisse', image: IMAGE_MAP['Zurich'], cityCount: 10, fromPrice: 18 },
  { label: 'Italie', image: IMAGE_MAP['Milan'], cityCount: 1, fromPrice: 79 },
];

const LEMAN_OFFERS = [
  { route: 'Genève → Lausanne', priceFrom: 18, nextDate: 'avr. 2026' },
  { route: 'Genève → Montreux', priceFrom: 29, nextDate: 'avr. 2026' },
  { route: 'Genève → Évian-les-Bains', priceFrom: 22, nextDate: 'avr. 2026' },
  { route: 'Genève → Vevey', priceFrom: 26, nextDate: 'mai 2026' },
  { route: 'Genève → Nyon', priceFrom: 12, nextDate: 'avr. 2026' },
  { route: 'Genève → Thonon-les-Bains', priceFrom: 24, nextDate: 'avr. 2026' },
  { route: 'Genève Aéroport → Lausanne', priceFrom: 22, nextDate: 'avr. 2026' },
  { route: 'Genève Aéroport → Montreux', priceFrom: 35, nextDate: 'mai 2026' },
];

const HERO_IMG = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80&fit=crop';

const VanLemanPage: React.FC = () => {
  const navigate = useNavigate();

  const lemanDests = useMemo(
    () => LEMAN_CITIES.map(c => ALL_DESTINATIONS.find(d => d.city === c)).filter(Boolean) as Destination[],
    []
  );

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero */}
      <div className="relative h-[320px] md:h-[420px] overflow-hidden">
        <img src={HERO_IMG} alt="Lac Léman" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="absolute bottom-8 left-6 right-6 max-w-5xl mx-auto">
          <p className="text-sm text-white/85 font-medium uppercase tracking-wider">
            Trajets pas chers pour
          </p>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tight mt-1">
            Le Lac Léman
          </h1>
          <p className="text-base md:text-lg text-white/90 mt-3 max-w-xl">
            Lausanne, Montreux, Évian — la perle des Alpes à portée de van.
          </p>
        </div>
      </div>

      {/* Quick info bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-6 flex-wrap text-sm">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Suisse & Haute-Savoie</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">dès 35 min depuis Genève</span>
          </div>
          <div className="font-black text-lg" style={{ color: GOLD }}>
            dès CHF 12
          </div>
          <button
            onClick={() => navigate('/caby/van/inspire?region=leman')}
            className="ml-auto px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90"
            style={{ backgroundColor: GOLD }}
          >
            Trouver des tarifs peu élevés →
          </button>
        </div>
      </div>

      {/* Best offers */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight text-center mb-8">
          Les meilleures offres pour : Lac Léman
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {LEMAN_OFFERS.map((offer, i) => {
            const cityMatch = offer.route.split('→')[1]?.trim().split(' ')[0] || 'Lausanne';
            return (
              <button
                key={i}
                onClick={() => navigate(`/caby/van?destination=${encodeURIComponent(cityMatch)}`)}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all bg-white text-left"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 flex-shrink-0" style={{ color: GOLD }} />
                  <span className="text-sm font-medium text-gray-800 underline">{offer.route}</span>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <span className="text-xs text-gray-400 block">{offer.nextDate} à partir de</span>
                  <span className="text-lg font-black" style={{ color: GOLD }}>
                    CHF {offer.priceFrom}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Why go */}
      <section className="py-12" style={{ backgroundColor: '#F8F8F8' }}>
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight text-center mb-6">
            Pourquoi aller sur le Lac Léman
          </h2>
          <div className="space-y-4 text-sm md:text-base text-gray-700 leading-relaxed">
            <p>
              Le plus grand lac d'Europe occidentale s'étire entre la Suisse et la France, encadré par les
              Alpes et les vignobles en terrasses du Lavaux classés à l'UNESCO. Une demi-heure suffit depuis
              Genève pour basculer dans une autre ambiance : promenades sur les quais, terrasses face à l'eau,
              bateaux Belle Époque et palaces du XIXᵉ.
            </p>
            <p>
              <strong>Lausanne</strong> joue la carte étudiante et culturelle avec sa cathédrale gothique et
              son Musée Olympique. <strong>Montreux</strong> séduit par sa Riviera, son célèbre festival de
              jazz et le château de Chillon posé sur l'eau. Côté français, <strong>Évian</strong> et{' '}
              <strong>Thonon</strong> proposent thermes, casinos et villas Belle Époque dans un cadre intimiste.
            </p>
            <p>
              En été, plages, baignades et sports nautiques. En hiver, les stations de Villars, Leysin et Les
              Diablerets sont à moins d'une heure. Toute l'année, la gastronomie autour du poisson du lac
              (perches, féras) et des vins du Lavaux fait du Léman une escapade gourmande imbattable.
            </p>
          </div>
          <div className="mt-8 bg-white rounded-xl p-4 border border-gray-200 flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Conseil voyage</p>
              <p className="text-sm text-gray-700">
                Combinez un trajet Caby Van vers Lausanne ou Montreux avec une croisière CGN pour profiter du
                lac sous tous ses angles — et évitez les bouchons des week-ends d'été sur l'A1.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div
            className="rounded-2xl p-8 md:p-12 text-center"
            style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}
          >
            <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Évadez-vous sur le Léman en Caby Van
            </h3>
            <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
              Réservez votre trajet depuis Genève vers Lausanne, Montreux, Évian et plus encore. Confort
              premium, prix malin.
            </p>
            <button
              onClick={() => navigate('/caby/van/inspire?region=leman')}
              className="mt-6 px-8 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-all"
              style={{ backgroundColor: GOLD }}
            >
              Découvrir toutes les offres →
            </button>
          </div>
        </div>
      </section>

      {/* Cities of Lac Léman */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight mb-8">
          Villes du Lac Léman
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {lemanDests.map(sim => (
            <button
              key={sim.city}
              onClick={() => navigate(`/caby/van/destination/${encodeURIComponent(sim.city)}`)}
              className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all text-left"
            >
              <div className="h-[160px] overflow-hidden">
                {IMAGE_MAP[sim.city] ? (
                  <img
                    src={IMAGE_MAP[sim.city]}
                    alt={sim.city}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-3xl">
                    {sim.countryFlag}
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-base font-bold text-gray-900">{sim.city}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sim.country}</p>
                <p className="text-sm font-black mt-2" style={{ color: GOLD }}>
                  dès CHF {sim.priceFrom}
                </p>
                <p className="text-xs text-gray-400 mt-1">avr. 2026</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Similar regions */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight mb-8">
          Régions similaires
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SIMILAR_REGIONS.map(region => (
            <button
              key={region.label}
              onClick={() => navigate(`/caby/van/inspire?region=${region.label.toLowerCase()}`)}
              className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all text-left"
            >
              <div className="h-[140px] overflow-hidden">
                <img
                  src={region.image}
                  alt={region.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <p className="text-base font-bold text-gray-900">{region.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{region.cityCount} destination{region.cityCount > 1 ? 's' : ''}</p>
                <p className="text-sm font-black mt-2" style={{ color: GOLD }}>
                  dès CHF {region.fromPrice}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
};

export default VanLemanPage;
