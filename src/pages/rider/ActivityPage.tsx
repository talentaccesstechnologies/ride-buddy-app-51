import React from 'react';
import { Clock, MapPin, Star, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';
import RiderHeader from '@/components/rider/RiderHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

type RideStatus = 'completed' | 'cancelled' | 'in_progress';

interface MockRide {
  id: string;
  date: string;
  pickup: string;
  dropoff: string;
  status: RideStatus;
  price: number;
  driver: string | null;
  rating: number | null;
  image: string;
}

const mockRides: MockRide[] = [
  {
    id: '1',
    date: '15 Jan 2026, 14:30',
    pickup: '15 Rue de Lausanne, Genève',
    dropoff: 'Gare Cornavin, Genève',
    status: 'completed',
    price: 18.50,
    driver: 'Mohamed B.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&h=200&fit=crop',
  },
  {
    id: '2',
    date: '12 Jan 2026, 09:15',
    pickup: 'Place des Nations',
    dropoff: 'Aéroport de Genève',
    status: 'completed',
    price: 35.00,
    driver: 'Pierre C.',
    rating: 4,
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=200&h=200&fit=crop',
  },
  {
    id: '3',
    date: '10 Jan 2026, 18:45',
    pickup: 'Jet d\'Eau',
    dropoff: 'Carouge Centre',
    status: 'cancelled',
    price: 0,
    driver: null,
    rating: null,
    image: 'https://images.unsplash.com/photo-1573108037329-37aa135a142e?w=200&h=200&fit=crop',
  },
];

const getStatusBadge = (status: RideStatus) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-[hsl(var(--caby-green))]/20 text-[hsl(var(--caby-green))] border-0 text-[10px]">Terminée</Badge>;
    case 'cancelled':
      return <Badge className="bg-destructive/20 text-destructive border-0 text-[10px]">Annulée</Badge>;
    case 'in_progress':
      return <Badge className="bg-primary/20 text-primary border-0 text-[10px]">En cours</Badge>;
    default:
      return null;
  }
};

const RideCard: React.FC<{ ride: MockRide }> = ({ ride }) => {
  return (
    <button className="w-full flex items-center gap-3 bg-card border border-border rounded-xl p-3 text-left hover:border-primary/30 transition-colors">
      {/* Destination image */}
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-card flex-shrink-0">
        <img
          src={ride.image}
          alt={ride.dropoff}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-semibold text-sm truncate">{ride.dropoff}</p>
          {getStatusBadge(ride.status)}
        </div>
        <p className="text-xs text-muted-foreground">{ride.date}</p>
        <div className="flex items-center gap-3 mt-1">
          {ride.price > 0 && (
            <span className="text-sm font-bold">{ride.price.toFixed(2)} CHF</span>
          )}
          {ride.driver && (
            <span className="text-xs text-muted-foreground">{ride.driver}</span>
          )}
          {ride.rating && (
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-warning text-warning" />
              <span className="text-xs">{ride.rating}</span>
            </div>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </button>
  );
};

const ActivityPage: React.FC = () => {
  const upcomingRides = mockRides.filter((r) => r.status === 'in_progress');
  const pastRides = mockRides.filter((r) => r.status !== 'in_progress');

  return (
    <div className="min-h-screen bg-background pb-20">
      <RiderHeader title="Activité" />

      <div className="pt-16 px-4">
        <Tabs defaultValue="past" className="w-full">
          <TabsList className="w-full mb-4 bg-card border border-border">
            <TabsTrigger value="upcoming" className="flex-1 text-xs">
              À venir ({upcomingRides.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1 text-xs">
              Passées ({pastRides.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingRides.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold mb-1">Pas de course en cours</h3>
                <p className="text-sm text-muted-foreground">
                  Vos courses à venir apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingRides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastRides.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold mb-1">Pas encore de courses</h3>
                <p className="text-sm text-muted-foreground">
                  Votre historique de courses apparaîtra ici
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pastRides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default ActivityPage;
