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
}

const mockRides: MockRide[] = [
  {
    id: '1',
    date: '15 Jan 2026, 14:30',
    pickup: '15 Rue de la Paix, Paris',
    dropoff: 'Gare du Nord, Paris',
    status: 'completed',
    price: 18.50,
    driver: 'Mohamed B.',
    rating: 5,
  },
  {
    id: '2',
    date: '12 Jan 2026, 09:15',
    pickup: 'Opéra Garnier',
    dropoff: 'La Défense',
    status: 'completed',
    price: 25.00,
    driver: 'Pierre C.',
    rating: 4,
  },
  {
    id: '3',
    date: '10 Jan 2026, 18:45',
    pickup: 'Tour Eiffel',
    dropoff: 'Champs-Élysées',
    status: 'cancelled',
    price: 0,
    driver: null,
    rating: null,
  },
];

const getStatusBadge = (status: RideStatus) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-success text-success-foreground">Terminée</Badge>;
    case 'cancelled':
      return <Badge variant="destructive">Annulée</Badge>;
    case 'in_progress':
      return <Badge className="bg-accent text-accent-foreground">En cours</Badge>;
    default:
      return null;
  }
};

const RideCard: React.FC<{ ride: MockRide }> = ({ ride }) => {
  return (
    <button className="w-full bg-card border border-border rounded-xl p-4 text-left hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{ride.date}</span>
        </div>
        {getStatusBadge(ride.status)}
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-sm truncate">{ride.pickup}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-sm truncate">{ride.dropoff}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {ride.price > 0 && (
            <span className="font-semibold">{ride.price.toFixed(2)}€</span>
          )}
          {ride.driver && (
            <span className="text-sm text-muted-foreground">{ride.driver}</span>
          )}
          {ride.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-warning text-warning" />
              <span className="text-sm">{ride.rating}</span>
            </div>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
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
          <TabsList className="w-full mb-4">
            <TabsTrigger value="upcoming" className="flex-1">
              À venir ({upcomingRides.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1">
              Passées ({pastRides.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingRides.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🚗</div>
                <h3 className="text-lg font-semibold mb-2">Pas de course en cours</h3>
                <p className="text-muted-foreground">
                  Vos courses à venir apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingRides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastRides.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-lg font-semibold mb-2">Pas encore de courses</h3>
                <p className="text-muted-foreground">
                  Votre historique de courses apparaîtra ici
                </p>
              </div>
            ) : (
              <div className="space-y-3">
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
