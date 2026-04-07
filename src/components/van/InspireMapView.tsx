import React, { useCallback, useMemo, useRef } from 'react';
import { GoogleMap, Marker, OverlayView } from '@react-google-maps/api';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Heart } from 'lucide-react';

const GOLD = '#C9A84C';

interface Destination {
  city: string;
  country: string;
  countryFlag: string;
  priceFrom: number;
  lat: number;
  lng: number;
}

interface InspireMapViewProps {
  destinations: Destination[];
  wishlist: string[];
  onSelectDestination: (city: string) => void;
  onToggleWishlist: (city: string) => void;
  imageMap: Record<string, string>;
}

const containerStyle = { width: '100%', height: '100%' };

const mapStyles: google.maps.MapTypeStyle[] = [
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

const InspireMapView: React.FC<InspireMapViewProps> = ({
  destinations,
  wishlist,
  onSelectDestination,
  onToggleWishlist,
  imageMap,
}) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [hoveredCity, setHoveredCity] = React.useState<string | null>(null);

  const center = useMemo(() => ({ lat: 46.8, lng: 7.5 }), []);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (destinations.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      destinations.forEach(d => bounds.extend({ lat: d.lat, lng: d.lng }));
      map.fitBounds(bounds, 60);
    }
  }, [destinations]);

  const mapOptions: google.maps.MapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    zoomControlOptions: { position: 3 }, // RIGHT_TOP
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: mapStyles,
    minZoom: 5,
    maxZoom: 12,
  }), []);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl">
        <p className="text-gray-500 text-sm">Erreur de chargement de la carte</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl">
        <div className="w-8 h-8 border-3 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={6}
      options={mapOptions}
      onLoad={onLoad}
    >
      {destinations.map(dest => {
        const isFav = wishlist.includes(dest.city);
        const isHovered = hoveredCity === dest.city;

        return (
          <OverlayView
            key={dest.city}
            position={{ lat: dest.lat, lng: dest.lng }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              className="relative cursor-pointer"
              style={{ transform: 'translate(-50%, -100%)' }}
              onMouseEnter={() => setHoveredCity(dest.city)}
              onMouseLeave={() => setHoveredCity(null)}
              onClick={() => onSelectDestination(dest.city)}
            >
              {/* Price tag - EasyJet style orange badge */}
              <div
                className="px-3 py-1.5 rounded text-white text-xs font-black whitespace-nowrap transition-transform"
                style={{
                  backgroundColor: '#FF6600',
                  transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  border: '2px solid #fff',
                  letterSpacing: '0.02em',
                }}
              >
                CHF {dest.priceFrom}
              </div>
              {/* Arrow */}
              <div
                className="w-0 h-0 mx-auto"
                style={{
                  borderLeft: '7px solid transparent',
                  borderRight: '7px solid transparent',
                  borderTop: '7px solid #FF6600',
                }}
              />
              {/* Fav indicator */}
              {isFav && (
                <Heart className="absolute -top-1 -right-1 w-3 h-3 fill-red-500 text-red-500" />
              )}

              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
                  <div className="bg-white rounded-xl shadow-2xl p-2 w-[180px] border border-gray-100">
                    {imageMap[dest.city] && (
                      <img
                        src={imageMap[dest.city]}
                        alt={dest.city}
                        className="w-full h-[80px] object-cover rounded-lg mb-2"
                      />
                    )}
                    <p className="text-sm font-bold text-gray-900">{dest.countryFlag} {dest.city}</p>
                    <p className="text-xs text-gray-500">{dest.country}</p>
                    <p className="text-sm font-black mt-1" style={{ color: GOLD }}>
                      dès CHF {dest.priceFrom}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleWishlist(dest.city); }}
                      className="mt-1 flex items-center gap-1 text-xs text-gray-500 hover:text-red-500"
                    >
                      <Heart className={`w-3 h-3 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                      {isFav ? 'Retirer' : 'Ajouter aux favoris'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </OverlayView>
        );
      })}
    </GoogleMap>
  );
};

export default InspireMapView;
