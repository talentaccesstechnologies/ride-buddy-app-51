import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, Info, Star, Share2, Shield } from 'lucide-react';
import { useRide } from '@/contexts/RideContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { APP_CONFIG } from '@/config/app.config';
import LiveTrackingMap from '@/components/maps/LiveTrackingMap';
import MapPlaceholder from '@/components/maps/MapPlaceholder';

type TripStatus = 'arriving' | 'in_progress' | 'completed';

const TripTracking: React.FC = () => {
  const navigate = useNavigate();
  const { currentDriver, pickup, dropoff, estimatedPrice, estimatedDuration, estimatedDistance, resetRide } = useRide();
  const [status, setStatus] = useState<TripStatus>('arriving');
  const [eta, setEta] = useState(currentDriver?.eta || 4);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

  // Simulate trip progression
  useEffect(() => {
    if (status === 'arriving') {
      const timer = setInterval(() => {
        setEta((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setStatus('in_progress');
            return 0;
          }
          return prev - 1;
        });
      }, 3000);
      return () => clearInterval(timer);
    }

    if (status === 'in_progress') {
      const timer = setTimeout(() => {
        setStatus('completed');
        setShowRating(true);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleFinish = () => {
    resetRide();
    navigate('/caby');
  };

  if (!currentDriver) {
    navigate('/caby');
    return null;
  }

  const hasGoogleMaps = !!APP_CONFIG.GOOGLE_MAPS_API_KEY;
  const hasPositions = pickup && dropoff;
  // Use a simulated rideId for demo purposes
  const rideId = `demo-${currentDriver.id}`;

  const steps = [
    { label: 'Chauffeur en route', completed: true, active: status === 'arriving' },
    { label: 'En course', completed: status === 'in_progress' || status === 'completed', active: status === 'in_progress' },
    { label: 'Arrivée', completed: status === 'completed', active: status === 'completed' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Map area - Now with live tracking */}
      <div className="h-[45vh] relative">
        {hasGoogleMaps && hasPositions ? (
          <LiveTrackingMap
            rideId={rideId}
            pickupLocation={{ lat: pickup.lat, lng: pickup.lng }}
            destination={{ lat: dropoff.lat, lng: dropoff.lng }}
            driverInfo={{
              name: currentDriver.name,
              avatarUrl: currentDriver.avatar,
              rating: currentDriver.rating,
              vehicleMake: currentDriver.vehicle.make,
              vehicleModel: currentDriver.vehicle.model,
              vehicleColor: currentDriver.vehicle.color,
              vehiclePlate: currentDriver.vehicle.plate,
            }}
            onDriverArrived={() => setStatus('in_progress')}
          />
        ) : (
          <MapPlaceholder
            latitude={pickup?.lat ?? APP_CONFIG.DEFAULT_CENTER.lat}
            longitude={pickup?.lng ?? APP_CONFIG.DEFAULT_CENTER.lng}
            showRoute={true}
          />
        )}
      </div>

      {/* Progress steps */}
      <div className="bg-background -mt-4 relative z-10 rounded-t-3xl shadow-sheet">
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step.completed || step.active
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {step.completed && !step.active ? '✓' : index + 1}
                  </div>
                  <span className="text-xs mt-1 text-center">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      steps[index + 1].completed || steps[index + 1].active
                        ? 'bg-primary'
                        : 'bg-secondary'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Driver info */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={currentDriver.avatar} />
              <AvatarFallback>{currentDriver.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{currentDriver.name}</h3>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span>{currentDriver.rating}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentDriver.vehicle.make} {currentDriver.vehicle.model} {currentDriver.vehicle.color}
              </p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-secondary rounded-lg font-mono text-sm font-semibold">
                {currentDriver.vehicle.plate}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          {status !== 'completed' && (
            <div className="flex gap-3 mb-4">
              <Button variant="outline" className="flex-1">
                <Phone className="w-4 h-4 mr-2" />
                Appeler
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button variant="outline" size="icon">
                <Info className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Status specific content */}
          {status === 'in_progress' && (
            <div className="bg-secondary rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">En route vers</p>
              <p className="font-medium">{dropoff?.address.split(',')[0]}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span>{estimatedDuration} min restants</span>
                <span>•</span>
                <span>{estimatedDistance} km</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Share2 className="w-4 h-4 mr-1" />
                  Partager
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive">
                  <Shield className="w-4 h-4 mr-1" />
                  SOS
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rating modal */}
      {showRating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-background rounded-3xl p-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Vous êtes arrivé !</h2>
              <p className="text-muted-foreground">
                Comment s'est passée votre course avec {currentDriver.name} ?
              </p>
            </div>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="p-1">
                  <Star className={`w-10 h-10 ${star <= rating ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                </button>
              ))}
            </div>

            <div className="bg-secondary rounded-xl p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Course</span>
                <span>{estimatedPrice?.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Distance</span>
                <span>{estimatedDistance} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durée</span>
                <span>{estimatedDuration} min</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Ajouter un pourboire</p>
              <div className="flex gap-2">
                {['1€', '2€', '5€', 'Autre'].map((tip) => (
                  <Button key={tip} variant="outline" className="flex-1">{tip}</Button>
                ))}
              </div>
            </div>

            <Button onClick={handleFinish} className="w-full h-12">Terminé</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripTracking;
