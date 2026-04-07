import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import annecyImg from '@/assets/annecy.jpg';
import zermattImg from '@/assets/zermatt.jpg';
import milanImg from '@/assets/milan.jpg';

const GOLD = '#C9A84C';

interface EditorialSectionsProps {
  onSelectDestination: (city: string) => void;
}

const EditorialSections: React.FC<EditorialSectionsProps> = ({ onSelectDestination }) => {
  const navigate = useNavigate();
  return (
    <>
      {/* SECTION 1 — NOS TRAJETS PHARES */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-12">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 text-center mb-8 uppercase tracking-tight">
          Nos trajets phares
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 — Traversez les Alpes */}
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

          {/* Card 2 — Genève ↔ Lyon */}
          <button
            onClick={() => navigate('/caby/van/inspire?category=ville')}
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
                Réserver <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* Card 3 — Stations de Ski */}
          <button
            onClick={() => onSelectDestination('Chamonix')}
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

      {/* SECTION 2 — NOTRE TRAJET COUP DE CŒUR */}
      <section className="py-16" style={{ backgroundColor: '#F8F8F8' }}>
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 text-center mb-8 uppercase tracking-tight">
            Notre trajet coup de cœur
          </h2>
          <button
            onClick={() => onSelectDestination('Lausanne')}
            className="group w-full rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all text-left flex flex-col md:flex-row"
          >
            <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight leading-tight">
                Le Lac Léman,<br />plein de vie.
              </h3>
              <p className="text-sm text-gray-500 mt-4 leading-relaxed max-w-md">
                De Genève à Lausanne en 45 minutes, traversez les vignobles UNESCO du Lavaux. Un trajet qui est déjà un voyage.
              </p>
              <div className="flex items-center gap-1.5 mt-6 font-bold text-sm" style={{ color: GOLD }}>
                Réserver ce trajet <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            <div className="md:w-1/2 h-[250px] md:h-[320px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1573108724029-4c46571d6490?w=800&h=400&fit=crop"
                alt="Vignobles du Lavaux et Lac Léman"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          </button>
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
          {/* Colonne gauche — 2 petites cartes empilées */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => onSelectDestination('Annecy')}
              className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all text-left"
            >
              <div className="h-[140px] overflow-hidden">
                <img src={annecyImg} alt="Annecy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="p-4">
                <p className="text-base font-bold text-gray-900">🇫🇷 Annecy</p>
                <p className="text-lg font-black mt-1" style={{ color: GOLD }}>dès CHF 15</p>
              </div>
            </button>
            <button
              onClick={() => onSelectDestination('Milan')}
              className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all text-left"
            >
              <div className="h-[140px] overflow-hidden">
                <img src={milanImg} alt="Milan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="p-4">
                <p className="text-base font-bold text-gray-900">🇮🇹 Milan</p>
                <p className="text-lg font-black mt-1" style={{ color: GOLD }}>dès CHF 79</p>
              </div>
            </button>
          </div>

          {/* Colonne centre — grande carte Zermatt */}
          <button
            onClick={() => onSelectDestination('Zermatt')}
            className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all text-left relative"
          >
            <div className="h-[320px] overflow-hidden">
              <img src={zermattImg} alt="Zermatt" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            </div>
            <div className="p-4">
              <p className="text-base font-bold text-gray-900">🎿 Zermatt</p>
              <p className="text-lg font-black mt-1" style={{ color: GOLD }}>dès CHF 55</p>
            </div>
          </button>

          {/* Colonne droite — Caby Pass CTA */}
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
