import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, Clock, Star, X } from 'lucide-react';
import { useRide } from '@/contexts/RideContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchResult {
  id: string;
  address: string;
  shortAddress: string;
  lat: number;
  lng: number;
}

// Simulated search results for demo
const mockResults: SearchResult[] = [
  { id: '1', address: 'Gare du Nord, 18 Rue de Dunkerque, 75010 Paris', shortAddress: 'Gare du Nord', lat: 48.8809, lng: 2.3553 },
  { id: '2', address: 'Tour Eiffel, Champ de Mars, 75007 Paris', shortAddress: 'Tour Eiffel', lat: 48.8584, lng: 2.2945 },
  { id: '3', address: 'Aéroport Paris-Charles de Gaulle, 95700 Roissy-en-France', shortAddress: 'CDG Airport', lat: 49.0097, lng: 2.5479 },
  { id: '4', address: 'Gare de Lyon, Place Louis-Armand, 75012 Paris', shortAddress: 'Gare de Lyon', lat: 48.8448, lng: 2.3735 },
  { id: '5', address: 'La Défense, 92800 Puteaux', shortAddress: 'La Défense', lat: 48.8918, lng: 2.2382 },
];

const recentSearches: SearchResult[] = [
  { id: 'r1', address: '25 Rue de Rivoli, 75001 Paris', shortAddress: '25 Rue de Rivoli', lat: 48.8606, lng: 2.3376 },
  { id: 'r2', address: 'Opéra Garnier, Place de l\'Opéra, 75009 Paris', shortAddress: 'Opéra Garnier', lat: 48.8720, lng: 2.3316 },
];

const RiderSearch: React.FC = () => {
  const navigate = useNavigate();
  const { pickup, setPickup, setDropoff } = useRide();
  const [pickupInput, setPickupInput] = useState('Position actuelle');
  const [dropoffInput, setDropoffInput] = useState('');
  const [activeInput, setActiveInput] = useState<'pickup' | 'dropoff'>('dropoff');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Set default pickup location
  useEffect(() => {
    if (!pickup) {
      // Default to current position simulation
      setPickup({
        address: 'Position actuelle',
        lat: 48.8566,
        lng: 2.3522,
      });
    }
  }, [pickup, setPickup]);

  // Simulated search with debounce
  useEffect(() => {
    if (dropoffInput.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const filtered = mockResults.filter(
        (r) =>
          r.address.toLowerCase().includes(dropoffInput.toLowerCase()) ||
          r.shortAddress.toLowerCase().includes(dropoffInput.toLowerCase())
      );
      setSearchResults(filtered.length > 0 ? filtered : mockResults.slice(0, 3));
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [dropoffInput]);

  const handleSelectResult = (result: SearchResult) => {
    if (activeInput === 'dropoff') {
      setDropoff({
        address: result.address,
        lat: result.lat,
        lng: result.lng,
      });
      setDropoffInput(result.shortAddress);
      // Navigate to confirm ride page
      navigate('/rider/confirm');
    } else {
      setPickup({
        address: result.address,
        lat: result.lat,
        lng: result.lng,
      });
      setPickupInput(result.shortAddress);
      setActiveInput('dropoff');
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
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-muted-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        {/* Location inputs */}
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
                className={`h-12 pl-4 pr-10 ${
                  activeInput === 'pickup' ? 'ring-2 ring-accent' : ''
                }`}
              />
              {pickupInput && (
                <button
                  onClick={() => setPickupInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
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
                className={`h-12 pl-4 pr-10 ${
                  activeInput === 'dropoff' ? 'ring-2 ring-accent' : ''
                }`}
                autoFocus
              />
              {dropoffInput && (
                <button
                  onClick={() => setDropoffInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Swap button */}
          <button
            onClick={swapLocations}
            className="self-center p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="p-4">
        {/* Choose on map option */}
        <button
          onClick={() => navigate('/rider/map-select')}
          className="w-full flex items-center gap-3 p-3 hover:bg-secondary rounded-xl transition-colors mb-4"
        >
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
            <Navigation className="w-5 h-5 text-accent" />
          </div>
          <span className="font-medium">Choisir sur la carte</span>
        </button>

        {/* Search results or recent searches */}
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
                  <p className="text-sm text-muted-foreground truncate">
                    {result.address}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recent searches */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recherches récentes
              </h3>
              <div className="space-y-1">
                {recentSearches.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelectResult(result)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-secondary rounded-xl transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.shortAddress}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {result.address}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderSearch;
