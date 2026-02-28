import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, Clock, X } from 'lucide-react';
import { useRide } from '@/contexts/RideContext';
import { Input } from '@/components/ui/input';
import { searchPlaces, getPlaceDetails, generateSessionToken } from '@/services/googleMaps.service';
import { APP_CONFIG } from '@/config/app.config';

interface SearchResult {
  id: string;
  address: string;
  shortAddress: string;
  lat: number;
  lng: number;
}

const RiderSearch: React.FC = () => {
  const navigate = useNavigate();
  const { pickup, setPickup, setDropoff } = useRide();
  const [pickupInput, setPickupInput] = useState('Position actuelle');
  const [dropoffInput, setDropoffInput] = useState('');
  const [activeInput, setActiveInput] = useState<'pickup' | 'dropoff'>('dropoff');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const sessionTokenRef = useRef(generateSessionToken());

  // Set default pickup location (Geneva)
  useEffect(() => {
    if (!pickup) {
      setPickup({
        address: 'Position actuelle',
        lat: APP_CONFIG.DEFAULT_CENTER.lat,
        lng: APP_CONFIG.DEFAULT_CENTER.lng,
      });
    }
  }, [pickup, setPickup]);

  // Real Google Places autocomplete
  useEffect(() => {
    if (dropoffInput.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const predictions = await searchPlaces(dropoffInput, sessionTokenRef.current);
        setSearchResults(
          predictions.map((p) => ({
            id: p.place_id,
            address: p.description,
            shortAddress: p.main_text,
            lat: 0,
            lng: 0,
          }))
        );
      } catch (e) {
        console.error('Places search error:', e);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [dropoffInput]);

  const handleSelectResult = async (result: SearchResult) => {
    try {
      const details = await getPlaceDetails(result.id, sessionTokenRef.current);
      sessionTokenRef.current = generateSessionToken();

      if (activeInput === 'dropoff') {
        setDropoff({
          address: details.address,
          lat: details.lat,
          lng: details.lng,
        });
        setDropoffInput(details.name || result.shortAddress);
        navigate('/caby/confirm');
      } else {
        setPickup({
          address: details.address,
          lat: details.lat,
          lng: details.lng,
        });
        setPickupInput(details.name || result.shortAddress);
        setActiveInput('dropoff');
      }
    } catch (e) {
      console.error('Place details error:', e);
    }
  };

  const swapLocations = () => {
    const tempInput = pickupInput;
    setPickupInput(dropoffInput);
    setDropoffInput(tempInput);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with inputs */}
      <div className="bg-background border-b border-border p-4 safe-area-top">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-muted-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        <div className="flex gap-3">
          {/* Timeline dots */}
          <div className="flex flex-col items-center py-3">
            <div className="w-3 h-3 rounded-full bg-success" />
            <div className="flex-1 w-0.5 bg-border my-1" style={{ minHeight: '40px' }} />
            <div className="w-3 h-3 rounded-full bg-destructive" />
          </div>

          {/* Inputs */}
          <div className="flex-1 space-y-3">
            <div className="relative">
              <Input
                value={pickupInput}
                onChange={(e) => setPickupInput(e.target.value)}
                onFocus={() => setActiveInput('pickup')}
                placeholder="Point de départ"
                className={`h-12 pl-4 pr-10 ${activeInput === 'pickup' ? 'ring-2 ring-accent' : ''}`}
              />
              {pickupInput && (
                <button onClick={() => setPickupInput('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            <div className="relative">
              <Input
                value={dropoffInput}
                onChange={(e) => setDropoffInput(e.target.value)}
                onFocus={() => setActiveInput('dropoff')}
                placeholder="Où allez-vous ?"
                className={`h-12 pl-4 pr-10 ${activeInput === 'dropoff' ? 'ring-2 ring-accent' : ''}`}
                autoFocus
              />
              {dropoffInput && (
                <button onClick={() => setDropoffInput('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Swap button */}
          <button onClick={swapLocations} className="self-center p-2 hover:bg-secondary rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="p-4">
        <button
          onClick={() => navigate('/rider/map-select')}
          className="w-full flex items-center gap-3 p-3 hover:bg-secondary rounded-xl transition-colors mb-4"
        >
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
            <Navigation className="w-5 h-5 text-accent" />
          </div>
          <span className="font-medium">Choisir sur la carte</span>
        </button>

        {isSearching ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-1">
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSelectResult(result)}
                className="w-full flex items-center gap-3 p-3 hover:bg-secondary rounded-xl transition-colors text-left"
              >
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{result.shortAddress}</p>
                  <p className="text-sm text-muted-foreground truncate">{result.address}</p>
                </div>
              </button>
            ))}
          </div>
        ) : dropoffInput.length < 2 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">
            Tapez au moins 2 caractères pour rechercher
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default RiderSearch;
