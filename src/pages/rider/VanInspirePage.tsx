import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, Map, Grid3X3, ChevronDown, ArrowLeft, X } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';
import InspireMapView from '@/components/van/InspireMapView';

// Import all destination images
import zermattImg from '@/assets/zermatt.jpg';
import zurichImg from '@/assets/zurich.jpg';
import verbierImg from '@/assets/verbier.jpg';
import lausanneImg from '@/assets/lausanne.jpg';
import annecyImg from '@/assets/annecy.jpg';
import lyonImg from '@/assets/lyon.jpg';
import baleImg from '@/assets/bale.jpg';
import berneImg from '@/assets/berne.jpg';
import chamberyImg from '@/assets/chambery.jpg';
import chamonixImg from '@/assets/chamonix.jpg';
import sionImg from '@/assets/sion.jpg';
import neuchatelImg from '@/assets/neuchatel.jpg';
import montreuxImg from '@/assets/montreux.jpg';
import davosImg from '@/assets/davos.jpg';
import gstaadImg from '@/assets/gstaad.jpg';
import parisImg from '@/assets/paris.jpg';
import milanImg from '@/assets/milan.jpg';
import munichImg from '@/assets/munich.jpg';

const GOLD = '#C9A84C';

const IMAGE_MAP: Record<string, string> = {
  Zurich: zurichImg, Lausanne: lausanneImg, Verbier: verbierImg, Zermatt: zermattImg,
  Annecy: annecyImg, Lyon: lyonImg, 'Bâle': baleImg, Berne: berneImg,
  'Chambéry': chamberyImg, Chamonix: chamonixImg, Sion: sionImg,
  'Neuchâtel': neuchatelImg, Montreux: montreuxImg, Davos: davosImg,
  Gstaad: gstaadImg, Paris: parisImg, Milan: milanImg, Munich: munichImg,
};

interface Destination {
  city: string;
  country: string;
  countryFlag: string;
  region: 'suisse' | 'france' | 'italie' | 'allemagne';
  category: 'ville' | 'ski' | 'lac' | 'nature';
  priceFrom: number;
  lat: number;
  lng: number;
}

const ALL_DESTINATIONS: Destination[] = [
  { city: 'Zurich', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'ville', priceFrom: 54, lat: 47.3769, lng: 8.5417 },
  { city: 'Lausanne', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'ville', priceFrom: 18, lat: 46.5197, lng: 6.6323 },
  { city: 'Berne', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'ville', priceFrom: 39, lat: 46.9480, lng: 7.4474 },
  { city: 'Bâle', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'ville', priceFrom: 52, lat: 47.5596, lng: 7.5886 },
  { city: 'Sion', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'nature', priceFrom: 45, lat: 46.2333, lng: 7.3500 },
  { city: 'Montreux', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'lac', priceFrom: 29, lat: 46.4312, lng: 6.9107 },
  { city: 'Neuchâtel', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'lac', priceFrom: 32, lat: 46.9900, lng: 6.9293 },
  { city: 'Verbier', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'ski', priceFrom: 35, lat: 46.0967, lng: 7.2286 },
  { city: 'Zermatt', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'ski', priceFrom: 55, lat: 46.0207, lng: 7.7491 },
  { city: 'Davos', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'ski', priceFrom: 45, lat: 46.8027, lng: 9.8360 },
  { city: 'Gstaad', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'ski', priceFrom: 62, lat: 46.4748, lng: 7.2863 },
  { city: 'Chamonix', country: 'France', countryFlag: '🇫🇷', region: 'france', category: 'ski', priceFrom: 28, lat: 45.9237, lng: 6.8694 },
  { city: 'Annecy', country: 'France', countryFlag: '🇫🇷', region: 'france', category: 'lac', priceFrom: 15, lat: 45.8992, lng: 6.1294 },
  { city: 'Lyon', country: 'France', countryFlag: '🇫🇷', region: 'france', category: 'ville', priceFrom: 42, lat: 45.7640, lng: 4.8357 },
  { city: 'Chambéry', country: 'France', countryFlag: '🇫🇷', region: 'france', category: 'ville', priceFrom: 32, lat: 45.5646, lng: 5.9178 },
  { city: 'Paris', country: 'France', countryFlag: '🇫🇷', region: 'france', category: 'ville', priceFrom: 65, lat: 48.8566, lng: 2.3522 },
  { city: 'Milan', country: 'Italie', countryFlag: '🇮🇹', region: 'italie', category: 'ville', priceFrom: 79, lat: 45.4642, lng: 9.1900 },
  { city: 'Munich', country: 'Allemagne', countryFlag: '🇩🇪', region: 'allemagne', category: 'ville', priceFrom: 72, lat: 48.1351, lng: 11.5820 },
];

type ViewMode = 'grid' | 'map';
type BudgetFilter = 'all' | 'under30' | 'under50' | 'under80';
type RegionFilter = 'all' | 'suisse' | 'france' | 'italie' | 'allemagne';
type CategoryFilter = 'all' | 'ville' | 'ski' | 'lac' | 'nature';
type SortMode = 'price' | 'alpha';

const VanInspirePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as CategoryFilter) || 'all';

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [origin] = useState('Genève');
  const [budget, setBudget] = useState<BudgetFilter>('all');
  const [region, setRegion] = useState<RegionFilter>('all');
  const [category, setCategory] = useState<CategoryFilter>(initialCategory);
  const [sortMode, setSortMode] = useState<SortMode>('price');
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('caby_wishlist') || '[]'); } catch { return []; }
  });
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  const toggleWishlist = useCallback((city: string) => {
    setWishlist(prev => {
      const next = prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city];
      localStorage.setItem('caby_wishlist', JSON.stringify(next));
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    let results = ALL_DESTINATIONS;
    if (budget === 'under30') results = results.filter(d => d.priceFrom < 30);
    else if (budget === 'under50') results = results.filter(d => d.priceFrom < 50);
    else if (budget === 'under80') results = results.filter(d => d.priceFrom < 80);
    if (region !== 'all') results = results.filter(d => d.region === region);
    if (category !== 'all') results = results.filter(d => d.category === category);
    if (showWishlistOnly) results = results.filter(d => wishlist.includes(d.city));
    if (sortMode === 'price') results = [...results].sort((a, b) => a.priceFrom - b.priceFrom);
    else results = [...results].sort((a, b) => a.city.localeCompare(b.city));
    return results;
  }, [budget, region, category, sortMode, showWishlistOnly, wishlist]);

  const selectDestination = (city: string) => {
    navigate(`/caby/van?destination=${encodeURIComponent(city)}`);
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero Banner */}
      <div className="relative h-[180px] overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0099cc 0%, #00c2c7 30%, #f7d794 70%, #f8b500 100%)' }}>
        <div className="absolute inset-0 flex flex-col justify-center px-6">
          <button onClick={() => navigate('/caby/van')} className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tight mt-6">
            Inspirez-moi
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-4">
          C'est parti pour la préparation des vacances !
        </h2>

        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Je veux voyager depuis</span>
            <span className="font-bold border-b-2 border-gray-900 pb-0.5">{origin}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span>Mon budget est de</span>
            <select value={budget} onChange={e => setBudget(e.target.value as BudgetFilter)}
              className="font-bold border-b-2 border-gray-900 bg-transparent pb-0.5 cursor-pointer appearance-none pr-4">
              <option value="all">peu importe</option>
              <option value="under30">moins de CHF 30</option>
              <option value="under50">moins de CHF 50</option>
              <option value="under80">moins de CHF 80</option>
            </select>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span>Je voudrais un voyage plutôt</span>
            <select value={region} onChange={e => setRegion(e.target.value as RegionFilter)}
              className="font-bold border-b-2 border-gray-900 bg-transparent pb-0.5 cursor-pointer appearance-none pr-4">
              <option value="all">partout</option>
              <option value="suisse">en Suisse</option>
              <option value="france">en France</option>
              <option value="italie">en Italie</option>
              <option value="allemagne">en Allemagne</option>
            </select>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span>Type de destination</span>
            <select value={category} onChange={e => setCategory(e.target.value as CategoryFilter)}
              className="font-bold border-b-2 border-gray-900 bg-transparent pb-0.5 cursor-pointer appearance-none pr-4">
              <option value="all">toutes</option>
              <option value="ville">Villes</option>
              <option value="ski">Ski & Montagne</option>
              <option value="lac">Lac & Nature</option>
              <option value="nature">Nature</option>
            </select>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mt-6 pb-4 border-b border-gray-200 flex-wrap gap-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500 font-medium">{filtered.length} destinations à partir de {origin}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowWishlistOnly(!showWishlistOnly)}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-all ${showWishlistOnly ? 'border-red-300 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              <Heart className={`w-4 h-4 ${showWishlistOnly ? 'fill-red-500 text-red-500' : ''}`} />
              Favoris ({wishlist.length})
            </button>

            <div className="flex items-center bg-gray-100 rounded-full p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-full transition-all ${viewMode === 'map' ? 'bg-white shadow-sm' : ''}`}
              >
                <Map className="w-4 h-4" />
              </button>
            </div>

            <select value={sortMode} onChange={e => setSortMode(e.target.value as SortMode)}
              className="text-sm border border-gray-200 rounded-full px-3 py-1.5 bg-white cursor-pointer">
              <option value="price">Budget : ordre croissant</option>
              <option value="alpha">A → Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(dest => {
              const img = IMAGE_MAP[dest.city];
              const isFav = wishlist.includes(dest.city);
              return (
                <div key={dest.city} className="group relative">
                  <button
                    onClick={() => selectDestination(dest.city)}
                    className="w-full text-left rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all bg-white border border-gray-100"
                  >
                    <div className="relative h-[180px] overflow-hidden">
                      {img ? (
                        <img src={img} alt={dest.city}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-4xl">
                          {dest.countryFlag}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-gray-900 text-sm">{dest.city}</p>
                      <p className="text-xs text-gray-500">{dest.country}</p>
                      <p className="text-sm font-black mt-1" style={{ color: GOLD }}>
                        dès CHF {dest.priceFrom}
                      </p>
                    </div>
                  </button>
                  {/* Wishlist button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(dest.city); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-all z-10"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">Aucune destination trouvée</p>
              <p className="text-sm mt-2">Essayez de modifier vos filtres</p>
            </div>
          )}
        </div>
      ) : (
        /* Map View */
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
            {/* Simple map placeholder with markers */}
            <div className="absolute inset-0">
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=46.8,7.5&zoom=6&size=1200x600&maptype=roadmap&style=feature:all|element:labels|visibility:on${filtered.map(d => `&markers=color:0xC9A84C|label:${d.priceFrom}|${d.lat},${d.lng}`).join('')}&key=`}
                alt="Map"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {/* Fallback CSS map */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-green-50 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {filtered.map(dest => {
                    // Simple projection: lat/lng to % position
                    const minLat = 44.5, maxLat = 49.5, minLng = 1.5, maxLng = 12.5;
                    const x = ((dest.lng - minLng) / (maxLng - minLng)) * 90 + 5;
                    const y = ((maxLat - dest.lat) / (maxLat - minLat)) * 85 + 5;
                    const isFav = wishlist.includes(dest.city);
                    return (
                      <button
                        key={dest.city}
                        onClick={() => selectDestination(dest.city)}
                        className="absolute transform -translate-x-1/2 -translate-y-full group/marker z-10"
                        style={{ left: `${x}%`, top: `${y}%` }}
                      >
                        <div className="relative">
                          <div className="px-2 py-1 rounded-md text-white text-xs font-bold shadow-lg whitespace-nowrap"
                            style={{ backgroundColor: GOLD }}>
                            CHF {dest.priceFrom}
                          </div>
                          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent mx-auto"
                            style={{ borderTopColor: GOLD }} />
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/marker:block">
                            <div className="bg-white rounded-xl shadow-xl p-2 w-[160px] border border-gray-100">
                              {IMAGE_MAP[dest.city] && (
                                <img src={IMAGE_MAP[dest.city]} alt={dest.city} className="w-full h-[80px] object-cover rounded-lg mb-2" />
                              )}
                              <p className="text-sm font-bold text-gray-900">{dest.city}</p>
                              <p className="text-xs text-gray-500">{dest.country}</p>
                              <p className="text-sm font-black mt-1" style={{ color: GOLD }}>dès CHF {dest.priceFrom}</p>
                            </div>
                          </div>
                        </div>
                        {isFav && (
                          <Heart className="absolute -top-1 -right-1 w-3 h-3 fill-red-500 text-red-500" />
                        )}
                      </button>
                    );
                  })}
                  {/* Background text */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <span className="text-6xl font-black text-gray-400 uppercase">SUISSE</span>
                  </div>
                  {/* Simple country labels */}
                  <span className="absolute text-xs font-medium text-gray-400 uppercase" style={{ left: '25%', top: '70%' }}>FRANCE</span>
                  <span className="absolute text-xs font-medium text-gray-400 uppercase" style={{ left: '55%', top: '15%' }}>ALLEMAGNE</span>
                  <span className="absolute text-xs font-medium text-gray-400 uppercase" style={{ left: '65%', top: '85%' }}>ITALIE</span>
                  <span className="absolute text-xs font-medium text-gray-400 uppercase" style={{ left: '45%', top: '50%' }}>SUISSE</span>
                </div>
              </div>
            </div>
            {/* Map controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button className="w-8 h-8 bg-white rounded shadow border border-gray-200 flex items-center justify-center text-gray-600 font-bold hover:bg-gray-50">+</button>
              <button className="w-8 h-8 bg-white rounded shadow border border-gray-200 flex items-center justify-center text-gray-600 font-bold hover:bg-gray-50">−</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default VanInspirePage;
