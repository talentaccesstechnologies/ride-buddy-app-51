import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, Map, Grid3X3, ChevronDown, ArrowLeft, X } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';
import InspireMapView from '@/components/van/InspireMapView';
import { ALL_DESTINATIONS, IMAGE_MAP, type Destination } from '@/lib/destinationData';

const GOLD = '#C9A84C';

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
            <span className="text-gray-700 font-semibold">{filtered.length} destinations à partir de {origin}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowWishlistOnly(!showWishlistOnly)}
              className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border-2 font-semibold transition-all ${showWishlistOnly ? 'border-red-400 bg-red-50 text-red-600 shadow-sm' : 'border-gray-300 text-gray-700 bg-white hover:border-gray-400 shadow-sm'}`}
            >
              <Heart className={`w-4 h-4 ${showWishlistOnly ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
              Favoris ({wishlist.length})
            </button>

            <div className="flex items-center bg-gray-200 rounded-full p-0.5 shadow-inner">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-full transition-all ${viewMode === 'map' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Map className="w-4 h-4" />
              </button>
            </div>

            <select value={sortMode} onChange={e => setSortMode(e.target.value as SortMode)}
              className="text-sm border-2 border-gray-300 rounded-full px-4 py-2 bg-white cursor-pointer font-semibold text-gray-700 shadow-sm hover:border-gray-400 transition-all">
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
          <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-gray-200">
            <InspireMapView
              destinations={filtered}
              wishlist={wishlist}
              onSelectDestination={selectDestination}
              onToggleWishlist={toggleWishlist}
              imageMap={IMAGE_MAP}
            />
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default VanInspirePage;
