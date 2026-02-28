/**
 * CABY — LiveTrackingMap
 * Carte de suivi en temps réel avec TrafficLayer, voiture Caby or animée,
 * polyline colorée selon le trafic, et bottom sheet infos chauffeur + ETA.
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  GoogleMap,
  useLoadScript,
  TrafficLayer,
  Marker,
  Polyline,
  OverlayView,
} from "@react-google-maps/api";
import { useRideTracking } from "@/hooks/useRideTracking";
import { getTrafficColor, type LatLng } from "@/services/googleMaps.service";
import { Star, Clock, MapPin, Wifi, WifiOff, Car } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DriverInfo {
  name: string;
  avatarUrl?: string;
  rating: number;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  vehiclePlate: string;
}

interface LiveTrackingMapProps {
  rideId: string;
  destination: LatLng;
  pickupLocation?: LatLng;
  driverInfo: DriverInfo;
  onDriverArrived?: () => void;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const GOOGLE_LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

const MAP_STYLES = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "simplified" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8c8c8c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { featureType: "landscape", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#3a3a3a" }] },
];

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  styles: MAP_STYLES,
  gestureHandling: "greedy",
};

function getCarSvgIcon(heading: number): google.maps.Symbol {
  return {
    path: "M -10,-18 L 10,-18 L 14,0 L 10,18 L -10,18 L -14,0 Z",
    fillColor: "#D4AF37",
    fillOpacity: 1,
    strokeColor: "#000000",
    strokeWeight: 1.5,
    scale: 1.2,
    rotation: heading,
    anchor: new google.maps.Point(0, 0),
  };
}

// ─── Composant marqueur pulsant ──────────────────────────────────────────────

const PulsingDot: React.FC<{ position: google.maps.LatLngLiteral }> = ({ position }) => (
  <OverlayView position={position} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
    <div className="relative flex items-center justify-center">
      <div className="absolute w-12 h-12 rounded-full opacity-30 animate-ping" style={{ backgroundColor: "#007AFF" }} />
      <div className="relative w-5 h-5 rounded-full border-2 border-white shadow-lg" style={{ backgroundColor: "#007AFF" }} />
    </div>
  </OverlayView>
);

// ─── Composant principal ──────────────────────────────────────────────────────

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  rideId,
  destination,
  pickupLocation,
  driverInfo,
  onDriverArrived,
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_LIBRARIES,
  });

  const tracking = useRideTracking({
    rideId,
    destination,
    onDriverArrived,
  });

  const fitBoundsToDriverAndDest = useCallback(() => {
    if (!mapRef.current || !tracking.driverLat || !tracking.driverLng) return;

    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: tracking.driverLat, lng: tracking.driverLng });
    bounds.extend(destination);
    if (pickupLocation) bounds.extend(pickupLocation);

    mapRef.current.fitBounds(bounds, {
      top: 60,
      right: 30,
      bottom: 220,
      left: 30,
    });
  }, [tracking.driverLat, tracking.driverLng, destination, pickupLocation]);

  useEffect(() => {
    fitBoundsToDriverAndDest();
  }, [tracking.driverLat, tracking.driverLng, fitBoundsToDriverAndDest]);

  if (loadError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center px-6">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Carte indisponible</p>
          <p className="text-xs text-muted-foreground mt-1">Vérifiez votre connexion internet</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const driverPosition =
    tracking.driverLat && tracking.driverLng
      ? { lat: tracking.driverLat, lng: tracking.driverLng }
      : null;

  const polylineColor = getTrafficColor(tracking.trafficCondition || "fluide");

  const destinationIcon: google.maps.Symbol = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: "#007AFF",
    fillOpacity: 1,
    strokeColor: "#FFFFFF",
    strokeWeight: 2,
    scale: 10,
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Indicateur connexion */}
      <div className="absolute top-4 left-4 z-10">
        {tracking.isConnected ? (
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Wifi className="w-3 h-3 text-green-400" />
            <span className="text-xs text-white font-medium">En direct</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <WifiOff className="w-3 h-3 text-red-400" />
            <span className="text-xs text-white">Reconnexion...</span>
          </div>
        )}
      </div>

      {/* Badge trafic */}
      {tracking.trafficCondition && (
        <div className="absolute top-4 right-4 z-10">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm"
            style={{
              backgroundColor: `${polylineColor}33`,
              border: `1px solid ${polylineColor}66`,
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: polylineColor }} />
            <span className="text-xs font-semibold" style={{ color: polylineColor }}>
              {tracking.trafficCondition === "fluide"
                ? "Trafic fluide"
                : tracking.trafficCondition === "ralenti"
                ? "Trafic ralenti"
                : "Trafic bloqué"}
            </span>
          </div>
        </div>
      )}

      {/* Carte Google Maps */}
      <GoogleMap
        mapContainerStyle={{ width: "100%", flex: 1 }}
        center={driverPosition || destination}
        zoom={15}
        options={MAP_OPTIONS}
        onLoad={(map) => { mapRef.current = map; }}
      >
        <TrafficLayer />

        {driverPosition && (
          <Marker
            position={driverPosition}
            icon={getCarSvgIcon(tracking.driverHeading)}
            title={`${driverInfo.name} — ${driverInfo.vehicleMake} ${driverInfo.vehicleModel}`}
            zIndex={10}
          />
        )}

        {pickupLocation && <PulsingDot position={pickupLocation} />}

        <Marker position={destination} icon={destinationIcon} title="Destination" zIndex={5} />

        {tracking.routePoints.length > 1 && (
          <Polyline
            path={tracking.routePoints}
            options={{
              strokeColor: polylineColor,
              strokeOpacity: 0.85,
              strokeWeight: 5,
              zIndex: 1,
            }}
          />
        )}
      </GoogleMap>

      {/* Bottom Sheet — Infos chauffeur + ETA */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 
          bg-card border-t border-border 
          rounded-t-3xl
          transition-all duration-300 ease-out
          ${isBottomSheetExpanded ? "h-64" : "h-36"}
        `}
        style={{ boxShadow: "0 -4px 30px rgba(0,0,0,0.5)" }}
      >
        <button
          className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-muted rounded-full"
          onClick={() => setIsBottomSheetExpanded((v) => !v)}
          aria-label="Expand info panel"
        />

        <div className="pt-8 px-5">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#D4AF3720" }}
            >
              {driverInfo.avatarUrl ? (
                <img src={driverInfo.avatarUrl} alt={driverInfo.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <Car className="w-6 h-6" style={{ color: "#D4AF37" }} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground truncate">{driverInfo.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                <span className="text-xs font-semibold text-foreground">{driverInfo.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">
                  · {driverInfo.vehicleColor} {driverInfo.vehicleMake} {driverInfo.vehicleModel}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{driverInfo.vehiclePlate}</p>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 justify-end">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-2xl font-black text-foreground">{tracking.etaMinutes ?? "—"}</span>
                <span className="text-sm text-muted-foreground">min</span>
              </div>
              {tracking.distanceKm && (
                <p className="text-xs text-muted-foreground">{tracking.distanceKm} km</p>
              )}
            </div>
          </div>

          {isBottomSheetExpanded && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex gap-3">
                <div className="flex-1 bg-muted rounded-2xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Vitesse</p>
                  <p className="text-lg font-bold text-foreground">
                    {tracking.driverSpeed ?? "—"}
                    <span className="text-xs font-normal text-muted-foreground"> km/h</span>
                  </p>
                </div>
                <div className="flex-1 bg-muted rounded-2xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Trafic</p>
                  <p className="text-lg font-bold capitalize" style={{ color: polylineColor }}>
                    {tracking.trafficCondition ?? "—"}
                  </p>
                </div>
                <div className="flex-1 bg-muted rounded-2xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Mise à jour</p>
                  <p className="text-xs font-semibold text-foreground mt-1">
                    {tracking.lastUpdateAt
                      ? tracking.lastUpdateAt.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;