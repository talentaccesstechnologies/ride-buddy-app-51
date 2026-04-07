import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, X, Bus } from 'lucide-react';

export interface CityEntry {
  name: string;
  country: string;
  region: string;
  flag: string;
}

const ALL_VAN_CITIES: CityEntry[] = [
  // SUISSE
  { name: "Genève", country: "Suisse", region: "Genève", flag: "🇨🇭" },
  { name: "Genève Aéroport (GVA)", country: "Suisse", region: "Genève", flag: "✈️" },
  { name: "Lausanne", country: "Suisse", region: "Vaud", flag: "🇨🇭" },
  { name: "Zurich", country: "Suisse", region: "Zurich", flag: "🇨🇭" },
  { name: "Zurich Aéroport (ZRH)", country: "Suisse", region: "Zurich", flag: "✈️" },
  { name: "Berne", country: "Suisse", region: "Berne", flag: "🇨🇭" },
  { name: "Bâle", country: "Suisse", region: "Bâle", flag: "🇨🇭" },
  { name: "Sion", country: "Suisse", region: "Valais", flag: "🇨🇭" },
  { name: "Martigny", country: "Suisse", region: "Valais", flag: "🇨🇭" },
  { name: "Montreux", country: "Suisse", region: "Vaud", flag: "🇨🇭" },
  { name: "Vevey", country: "Suisse", region: "Vaud", flag: "🇨🇭" },
  { name: "Neuchâtel", country: "Suisse", region: "Neuchâtel", flag: "🇨🇭" },
  { name: "Fribourg", country: "Suisse", region: "Fribourg", flag: "🇨🇭" },
  { name: "Nyon", country: "Suisse", region: "Vaud", flag: "🇨🇭" },
  { name: "Yverdon-les-Bains", country: "Suisse", region: "Vaud", flag: "🇨🇭" },
  { name: "La Chaux-de-Fonds", country: "Suisse", region: "Neuchâtel", flag: "⌚" },
  { name: "Verbier", country: "Suisse", region: "Valais", flag: "🎿" },
  { name: "Zermatt", country: "Suisse", region: "Valais", flag: "🎿" },
  { name: "Gstaad", country: "Suisse", region: "Berne", flag: "⭐" },
  { name: "Davos", country: "Suisse", region: "Grisons", flag: "🎿" },
  { name: "Brigue", country: "Suisse", region: "Valais", flag: "🇨🇭" },
  // FRANCE
  { name: "Annecy", country: "France", region: "Haute-Savoie", flag: "🇫🇷" },
  { name: "Annemasse", country: "France", region: "Haute-Savoie", flag: "🇫🇷" },
  { name: "Lyon", country: "France", region: "Rhône", flag: "🇫🇷" },
  { name: "Lyon Aéroport (LYS)", country: "France", region: "Rhône", flag: "✈️" },
  { name: "Chamonix", country: "France", region: "Haute-Savoie", flag: "🎿" },
  { name: "Morzine", country: "France", region: "Haute-Savoie", flag: "🎿" },
  { name: "Courchevel", country: "France", region: "Savoie", flag: "🎿" },
  { name: "Val d'Isère", country: "France", region: "Savoie", flag: "🎿" },
  { name: "Chambéry", country: "France", region: "Savoie", flag: "🇫🇷" },
  { name: "Grenoble", country: "France", region: "Isère", flag: "🇫🇷" },
  { name: "Bourg-en-Bresse", country: "France", region: "Ain", flag: "🇫🇷" },
  { name: "Gex", country: "France", region: "Ain", flag: "🇫🇷" },
  { name: "Ferney-Voltaire", country: "France", region: "Ain", flag: "🇫🇷" },
  { name: "Thonon-les-Bains", country: "France", region: "Haute-Savoie", flag: "🇫🇷" },
  { name: "Évian-les-Bains", country: "France", region: "Haute-Savoie", flag: "🇫🇷" },
  { name: "Bonneville", country: "France", region: "Haute-Savoie", flag: "🇫🇷" },
  { name: "Cluses", country: "France", region: "Haute-Savoie", flag: "🇫🇷" },
  { name: "Paris", country: "France", region: "Île-de-France", flag: "🇫🇷" },
  { name: "Strasbourg", country: "France", region: "Alsace", flag: "🇫🇷" },
  // ITALIE
  { name: "Milan", country: "Italie", region: "Lombardie", flag: "🇮🇹" },
  { name: "Domodossola", country: "Italie", region: "Piémont", flag: "🇮🇹" },
  // ALLEMAGNE
  { name: "Munich", country: "Allemagne", region: "Bavière", flag: "🇩🇪" },
];

const POPULAR_NAMES = ["Genève", "Lausanne", "Annecy", "Zurich", "Lyon", "Annemasse"];

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  iconColor?: string;
  /** Filter cities to show (e.g. only destinations from a given departure) */
  filterCities?: string[];
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value, onChange, placeholder = "Ville, adresse, gare, aéroport...", iconColor = "#10b981", filterCities,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Determine available cities
  const availableCities = useMemo(() => {
    if (!filterCities) return ALL_VAN_CITIES;
    const set = new Set(filterCities.map(c => c.toLowerCase()));
    return ALL_VAN_CITIES.filter(c => set.has(c.name.toLowerCase()));
  }, [filterCities]);

  const popular = useMemo(() => availableCities.filter(c => POPULAR_NAMES.includes(c.name)), [availableCities]);
  const others = useMemo(() => availableCities.filter(c => !POPULAR_NAMES.includes(c.name)), [availableCities]);

  const filtered = useMemo(() => {
    if (!query.trim()) return null; // show popular + all when no query
    const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return availableCities.filter(c => {
      const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return norm(c.name).includes(q) || norm(c.region).includes(q) || norm(c.country).includes(q);
    });
  }, [query, availableCities]);

  const flatList = useMemo(() => filtered || [...popular, ...others], [filtered, popular, others]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setHighlightIdx(-1); }, [query]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const el = listRef.current.children[highlightIdx] as HTMLElement | undefined;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIdx]);

  const handleSelect = (city: CityEntry) => {
    onChange(city.name);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIdx(i => Math.min(i + 1, flatList.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && highlightIdx >= 0) { e.preventDefault(); handleSelect(flatList[highlightIdx]); }
    else if (e.key === 'Escape') { setIsOpen(false); }
  };

  const renderRow = (city: CityEntry, idx: number) => (
    <button key={city.name + city.region} onClick={() => handleSelect(city)}
      className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${highlightIdx === idx ? 'bg-amber-50' : 'hover:bg-gray-50'}`}>
      <span className="text-base flex-shrink-0">{city.flag === '✈️' || city.flag === '🎿' || city.flag === '⌚' || city.flag === '⭐' ? city.flag : '🚐'}</span>
      <div className="min-w-0 flex-1">
        <span className="text-sm font-semibold text-gray-900">{city.name}</span>
        <span className="text-xs text-gray-400 ml-2">{city.region}, {city.country}</span>
      </div>
    </button>
  );

  // Compute the flat index offset for "others" section
  const popularCount = popular.length;

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: iconColor }} />
        <input
          type="text"
          value={isOpen ? query : value}
          onFocus={() => { setIsOpen(true); setQuery(''); }}
          onChange={(e) => { setQuery(e.target.value); if (!isOpen) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder={value || placeholder}
          className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 pl-9 pr-9 text-sm text-gray-900 font-medium focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-colors outline-none"
        />
        {(value || query) && (
          <button onClick={() => { onChange(''); setQuery(''); setIsOpen(true); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
            <X className="w-3 h-3 text-gray-500" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden max-h-[320px] overflow-y-auto" ref={listRef}>
          {filtered ? (
            filtered.length > 0 ? (
              filtered.map((c, i) => renderRow(c, i))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                Aucune destination trouvée · Essayez une autre ville
              </div>
            )
          ) : (
            <>
              {popular.length > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Départs populaires
                  </div>
                  {popular.map((c, i) => renderRow(c, i))}
                </>
              )}
              {others.length > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-t border-gray-100">
                    Toutes les villes
                  </div>
                  {others.map((c, i) => renderRow(c, popularCount + i))}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;
