import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { searchPlaces, getPlaceDetails, generateSessionToken, type PlacePrediction, type PlaceDetails } from '@/services/googleMaps.service';

interface PlacesAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onPlaceSelect?: (place: PlaceDetails) => void;
  placeholder?: string;
  className?: string;
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  value, onChange, onPlaceSelect, placeholder = "Tapez votre adresse...", className = "",
}) => {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const sessionRef = useRef(generateSessionToken());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 3) { setPredictions([]); setIsOpen(false); return; }
    setLoading(true);
    try {
      const results = await searchPlaces(q, sessionRef.current);
      setPredictions(results);
      setIsOpen(results.length > 0);
    } catch {
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(v), 300);
  };

  const handleSelect = async (pred: PlacePrediction) => {
    onChange(pred.description);
    setIsOpen(false);
    setPredictions([]);
    try {
      const details = await getPlaceDetails(pred.place_id, sessionRef.current);
      onPlaceSelect?.(details);
      // Reset session after details call (billing best practice)
      sessionRef.current = generateSessionToken();
    } catch {
      // Still set the description even if details fail
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => predictions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full h-12 rounded-xl bg-gray-50 border border-gray-200 pl-9 pr-9 text-sm text-gray-900 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-colors ${className}`}
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
      </div>

      {isOpen && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          {predictions.map((p) => (
            <button
              key={p.place_id}
              onClick={() => handleSelect(p)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex items-start gap-3"
            >
              <MapPin className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{p.main_text}</p>
                <p className="text-xs text-gray-500 truncate">{p.secondary_text}</p>
              </div>
            </button>
          ))}
          <div className="px-4 py-1.5 bg-gray-50 text-[9px] text-gray-400 text-right">
            Powered by Google
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacesAutocomplete;
