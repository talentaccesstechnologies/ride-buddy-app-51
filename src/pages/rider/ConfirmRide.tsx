import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, ChevronRight, Tag, MapPin, Search, X, Pencil } from 'lucide-react';
import { useRide } from '@/contexts/RideContext';
import { vehicleOptions, calculatePrice, getVehicleOption } from '@/lib/vehicleOptions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VehicleType } from '@/types';
import ConfirmRideMap from '@/components/maps/ConfirmRideMap';
import { calculateRoute, searchPlaces, getPlaceDetails, generateSessionToken, type RouteResult } from '@/services/googleMaps.service';

const ConfirmRide: React.FC = () => {
  const navigate = useNavigate();
  const {
    pickup,
    dropoff,
    selectedVehicle,
    setSelectedVehicle,
    setEstimatedPrice,
    setEstimatedDistance,
    setEstimatedDuration,
    setPickup,
  } = useRide();

  // Route data from Directions API
  const [routeData, setRouteData] = useState<RouteResult | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // Editable pickup
  const [editingPickup, setEditingPickup] = useState(false);
  const [pickupQuery, setPickupQuery] = useState('');
  const [pickupResults, setPickupResults] = useState<{ place_id: string; main_text: string; secondary_text: string }[]>([]);
  const [pickupSearching, setPickupSearching] = useState(false);
  const sessionTokenRef = useRef(generateSessionToken());
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate real route
  const fetchRoute = useCallback(async () => {
    if (!pickup || !dropoff) return;
    setRouteLoading(true);
    try {
      const result = await calculateRoute(
        { lat: pickup.lat, lng: pickup.lng },
        { lat: dropoff.lat, lng: dropoff.lng }
      );
      setRouteData(result);
    } catch (err) {
      console.error('Route calculation failed:', err);
    } finally {
      setRouteLoading(false);
    }
  }, [pickup, dropoff]);

  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);

  // Trip details from route or fallback
  const tripDetails = useMemo(() => {
    if (routeData) {
      return { distance: routeData.distance_km, duration: routeData.eta_minutes };
    }
    const distance = 5 + Math.random() * 10;
    const duration = 10 + Math.random() * 20;
    return { distance: Math.round(distance * 10) / 10, duration: Math.round(duration) };
  }, [routeData]);

  const prices = useMemo(() => {
    return vehicleOptions.reduce((acc, option) => {
      acc[option.type] = calculatePrice(tripDetails.distance, tripDetails.duration, option);
      return acc;
    }, {} as Record<VehicleType, number>);
  }, [tripDetails]);

  // Pickup search
  const handlePickupSearch = useCallback((query: string) => {
    setPickupQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (query.length < 2) {
      setPickupResults([]);
      return;
    }
    setPickupSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(query, sessionTokenRef.current);
        setPickupResults(results.map(r => ({
          place_id: r.place_id,
          main_text: r.main_text,
          secondary_text: r.secondary_text,
        })));
      } catch (err) {
        console.error('Pickup search error:', err);
      } finally {
        setPickupSearching(false);
      }
    }, 300);
  }, []);

  const handleSelectPickup = useCallback(async (placeId: string) => {
    try {
      const details = await getPlaceDetails(placeId, sessionTokenRef.current);
      setPickup({ address: details.address, lat: details.lat, lng: details.lng });
      sessionTokenRef.current = generateSessionToken();
    } catch (err) {
      console.error('Place details error:', err);
    }
    setEditingPickup(false);
    setPickupQuery('');
    setPickupResults([]);
  }, [setPickup]);

  useEffect(() => {
    if (editingPickup && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingPickup]);

  const handleConfirm = () => {
    const price = prices[selectedVehicle];
    setEstimatedPrice(price);
    setEstimatedDistance(tripDetails.distance);
    setEstimatedDuration(tripDetails.duration);
    navigate('/rider/searching');
  };

  if (!pickup || !dropoff) {
    navigate('/rider/search');
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Map preview (top 40%) */}
      <div className="h-[40vh] relative">
        <ConfirmRideMap
          pickupLat={pickup.lat}
          pickupLng={pickup.lng}
          dropoffLat={dropoff.lat}
          dropoffLng={dropoff.lng}
          polyline={routeData?.polyline}
        />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-background rounded-full shadow-lg flex items-center justify-center safe-area-top"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Trip summary overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-xl p-3 shadow-lg z-10">
          {/* Pickup - editable */}
          {editingPickup ? (
            <div className="relative">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
                <Input
                  ref={inputRef}
                  value={pickupQuery}
                  onChange={(e) => handlePickupSearch(e.target.value)}
                  placeholder="Rechercher une adresse de départ..."
                  className="h-9 text-sm"
                />
                <button
                  onClick={() => { setEditingPickup(false); setPickupQuery(''); setPickupResults([]); }}
                  className="p-1"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              {pickupResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background rounded-lg shadow-xl border border-border max-h-48 overflow-y-auto z-50">
                  {pickupResults.map((result) => (
                    <button
                      key={result.place_id}
                      onClick={() => handleSelectPickup(result.place_id)}
                      className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-secondary/50 transition-colors text-left"
                    >
                      <Search className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{result.main_text}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.secondary_text}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {pickupSearching && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background rounded-lg shadow-xl border border-border p-3 z-50">
                  <p className="text-xs text-muted-foreground text-center">Recherche...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  Départ
                </p>
                <button
                  onClick={() => setEditingPickup(true)}
                  className="flex items-center gap-1 group"
                >
                  <p className="font-medium truncate group-hover:text-primary transition-colors">
                    {pickup.address.split(',')[0]}
                  </p>
                  <Pencil className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </button>
              </div>
              <ChevronRight className="w-5 h-5 mx-2 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0 text-right">
                <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                  Destination
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                </p>
                <p className="font-medium truncate">{dropoff.address.split(',')[0]}</p>
              </div>
            </div>
          )}
          {!editingPickup && (
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>{tripDetails.distance} km</span>
              <span>•</span>
              <span>{tripDetails.duration} min</span>
              {routeLoading && <span className="text-xs">⏳ Calcul...</span>}
            </div>
          )}
        </div>
      </div>

      {/* Vehicle selection */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Choisissez un véhicule</h2>

          <div className="space-y-3">
            {vehicleOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => setSelectedVehicle(option.type)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  selectedVehicle === option.type
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className="text-3xl">{option.icon}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{option.name}</span>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      {option.eta} min
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">{prices[option.type].toFixed(2)}€</span>
                </div>
              </button>
            ))}
          </div>

          {/* Payment method */}
          <button className="w-full flex items-center gap-3 p-4 mt-4 border border-border rounded-xl hover:bg-secondary/50 transition-colors">
            <CreditCard className="w-5 h-5" />
            <div className="flex-1 text-left">
              <p className="font-medium">Paiement</p>
              <p className="text-sm text-muted-foreground">•••• 4242</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Promo code */}
          <button className="w-full flex items-center gap-3 p-4 mt-2 border border-border rounded-xl hover:bg-secondary/50 transition-colors">
            <Tag className="w-5 h-5" />
            <span className="flex-1 text-left font-medium">Ajouter un code promo</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Confirm button */}
      <div className="p-4 border-t border-border safe-area-bottom">
        <Button onClick={handleConfirm} className="w-full h-14 text-lg font-semibold">
          Commander {getVehicleOption(selectedVehicle).name} — {prices[selectedVehicle].toFixed(2)}€
        </Button>
      </div>
    </div>
  );
};

export default ConfirmRide;
