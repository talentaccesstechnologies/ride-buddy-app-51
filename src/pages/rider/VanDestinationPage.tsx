import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, MapPin, Calendar, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';
import { supabase } from '@/integrations/supabase/client';
import {
  ALL_DESTINATIONS,
  IMAGE_MAP,
  CONNECTIONS_FROM_GENEVA,
  SIMILAR_DESTINATIONS,
  FEATURED_CITIES,
  type Destination,
} from '@/lib/destinationData';

const GOLD = '#C9A84C';

interface AIContent {
  heroTitle: string;
  heroSubtitle: string;
  whyGo: { title: string; paragraphs: string[] };
  thingsToDo: Array<{ emoji: string; title: string; description: string }>;
  bestSeason: string;
  travelTip: string;
}

const VanDestinationPage: React.FC = () => {
  const { city } = useParams<{ city: string }>();
  const navigate = useNavigate();
  const decodedCity = decodeURIComponent(city || '');

  const dest = useMemo(
    () => ALL_DESTINATIONS.find(d => d.city === decodedCity),
    [decodedCity]
  );

  const connections = CONNECTIONS_FROM_GENEVA[decodedCity] || [];
  const similarCities = SIMILAR_DESTINATIONS[decodedCity] || [];
  const similarDests = similarCities
    .map(c => ALL_DESTINATIONS.find(d => d.city === c))
    .filter(Boolean) as Destination[];

  const [aiContent, setAiContent] = useState<AIContent | null>(null);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    if (!decodedCity || !dest) return;

    const cacheKey = `caby_dest_${decodedCity}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setAiContent(JSON.parse(cached));
        setAiLoading(false);
        return;
      } catch { /* ignore */ }
    }

    const fetchContent = async () => {
      setAiLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('destination-content', {
          body: { city: decodedCity, country: dest.country },
        });
        if (!error && data && !data.error) {
          setAiContent(data);
          localStorage.setItem(cacheKey, JSON.stringify(data));
        }
      } catch (e) {
        console.error('Failed to load AI content:', e);
      } finally {
        setAiLoading(false);
      }
    };
    fetchContent();
  }, [decodedCity, dest]);

  if (!dest) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-black text-gray-900">Destination introuvable</p>
          <button onClick={() => navigate('/caby/van')} className="mt-4 text-sm font-bold" style={{ color: GOLD }}>
            ← Retour à Caby Van
          </button>
        </div>
      </div>
    );
  }

  const heroImg = IMAGE_MAP[decodedCity];

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero */}
      <div className="relative h-[280px] md:h-[360px] overflow-hidden">
        {heroImg ? (
          <img src={heroImg} alt={decodedCity} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-sm text-white/80 font-medium uppercase tracking-wider">
            Voyagez en van depuis Genève
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mt-1">
            {dest.countryFlag} {decodedCity}
          </h1>
          {aiContent && (
            <p className="text-lg text-white/90 mt-2 font-medium">{aiContent.heroSubtitle}</p>
          )}
        </div>
      </div>

      {/* Quick info bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-6 flex-wrap text-sm">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{dest.country}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{connections[0]?.duration || '—'}</span>
          </div>
          <div className="font-black text-lg" style={{ color: GOLD }}>
            dès CHF {dest.priceFrom}
          </div>
          <button
            onClick={() => navigate(`/caby/van?destination=${encodeURIComponent(decodedCity)}`)}
            className="ml-auto px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90"
            style={{ backgroundColor: GOLD }}
          >
            Réserver ce trajet →
          </button>
        </div>
      </div>

      {/* Connections table */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight text-center mb-8">
          Les meilleures offres pour : {decodedCity}
        </h2>
        {connections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {connections.map((conn, i) => (
              <button
                key={i}
                onClick={() => navigate(`/caby/van?destination=${encodeURIComponent(decodedCity)}`)}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all bg-white text-left"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 flex-shrink-0" style={{ color: GOLD }} />
                  <span className="text-sm font-medium text-gray-800">{conn.route}</span>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <span className="text-xs text-gray-400 block">{conn.nextDate} à partir de</span>
                  <span className="text-lg font-black" style={{ color: GOLD }}>
                    CHF {conn.priceFrom}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">Aucune connexion disponible pour le moment.</p>
        )}
      </section>

      {/* Why go - AI content */}
      <section className="py-12" style={{ backgroundColor: '#F8F8F8' }}>
        <div className="max-w-5xl mx-auto px-4">
          {aiLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: GOLD }} />
              <p className="text-sm text-gray-400">Chargement du contenu...</p>
            </div>
          ) : aiContent ? (
            <>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight text-center mb-6">
                {aiContent.whyGo.title}
              </h2>
              <div className="max-w-3xl mx-auto space-y-4">
                {aiContent.whyGo.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm text-gray-600 leading-relaxed">{p}</p>
                ))}
              </div>
              {/* Travel tip */}
              <div className="mt-8 max-w-3xl mx-auto bg-white rounded-xl p-4 border border-gray-200 flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Conseil voyage</p>
                  <p className="text-sm text-gray-700">{aiContent.travelTip}</p>
                </div>
              </div>
              <div className="mt-4 max-w-3xl mx-auto bg-white rounded-xl p-4 border border-gray-200 flex items-start gap-3">
                <span className="text-xl">🗓️</span>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Meilleure saison</p>
                  <p className="text-sm text-gray-700">{aiContent.bestSeason}</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400 py-8">Contenu non disponible.</p>
          )}
        </div>
      </section>

      {/* Things to do */}
      {aiContent && aiContent.thingsToDo.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight text-center mb-8">
            Que faire à {decodedCity}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {aiContent.thingsToDo.map((item, i) => (
              <div key={i} className="p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all bg-white">
                <span className="text-3xl">{item.emoji}</span>
                <h3 className="text-base font-bold text-gray-900 mt-3">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA banner */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div
            className="rounded-2xl p-8 md:p-12 text-center"
            style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}
          >
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
              Voyagez à {decodedCity} en Caby Van
            </h3>
            <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
              Réservez votre trajet depuis Genève. Confort premium, prix malin.
            </p>
            <button
              onClick={() => navigate(`/caby/van?destination=${encodeURIComponent(decodedCity)}`)}
              className="mt-6 px-8 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-all"
              style={{ backgroundColor: GOLD }}
            >
              Réserver dès CHF {dest.priceFrom} →
            </button>
          </div>
        </div>
      </section>

      {/* Similar destinations */}
      {similarDests.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight text-center mb-8">
            Destinations similaires
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {similarDests.map(sim => (
              <button
                key={sim.city}
                onClick={() => navigate(`/caby/van/destination/${encodeURIComponent(sim.city)}`)}
                className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all text-left"
              >
                <div className="h-[120px] overflow-hidden">
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
                <div className="p-3">
                  <p className="text-sm font-bold text-gray-900">{sim.countryFlag} {sim.city}</p>
                  <p className="text-xs text-gray-500">{sim.country}</p>
                  <p className="text-sm font-black mt-1" style={{ color: GOLD }}>dès CHF {sim.priceFrom}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <BottomNav />
    </div>
  );
};

export default VanDestinationPage;
