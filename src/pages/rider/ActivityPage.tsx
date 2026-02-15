import React from 'react';
import { Clock, MapPin, Star, ChevronRight, CalendarClock, SlidersHorizontal } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';
import { useNavigate } from 'react-router-dom';

type RideStatus = 'completed' | 'cancelled' | 'in_progress';

interface MockRide {
  id: string;
  date: string;
  dropoff: string;
  status: RideStatus;
  price: number;
  driver: string | null;
  rating: number | null;
  image: string;
  items?: string;
}

const mockRides: MockRide[] = [
  {
    id: '1',
    date: '15 Fév · 14:30',
    dropoff: 'Gare Cornavin, Genève',
    status: 'completed',
    price: 18.50,
    driver: 'Mohamed B.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=250&fit=crop',
  },
  {
    id: '2',
    date: '12 Fév · 09:15',
    dropoff: 'Aéroport de Genève',
    status: 'completed',
    price: 35.00,
    driver: 'Pierre C.',
    rating: 4,
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=400&h=250&fit=crop',
  },
  {
    id: '3',
    date: '10 Fév · 18:45',
    dropoff: 'Carouge Centre',
    status: 'cancelled',
    price: 0,
    driver: null,
    rating: null,
    image: 'https://images.unsplash.com/photo-1573108037329-37aa135a142e?w=400&h=250&fit=crop',
  },
];

const RideCard: React.FC<{ ride: MockRide }> = ({ ride }) => {
  return (
    <button className="w-full bg-card border border-border rounded-xl overflow-hidden text-left hover:border-primary/30 transition-colors">
      {/* Large destination image */}
      <div className="w-full h-40 bg-card">
        <img
          src={ride.image}
          alt={ride.dropoff}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Info below image */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-base">{ride.dropoff}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{ride.date}</p>
            {ride.price > 0 && (
              <p className="text-sm text-muted-foreground mt-0.5">
                CHF {ride.price.toFixed(2)}
                {ride.driver && ` · ${ride.driver}`}
              </p>
            )}
            {ride.status === 'cancelled' && (
              <p className="text-sm text-destructive mt-0.5">Annulée</p>
            )}
          </div>
          {ride.rating && (
            <div className="flex items-center gap-1 bg-card border border-border rounded-full px-2 py-1">
              <Star className="w-3 h-3 fill-foreground text-foreground" />
              <span className="text-xs font-medium">{ride.rating}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

const ActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const upcomingRides = mockRides.filter((r) => r.status === 'in_progress');
  const pastRides = mockRides.filter((r) => r.status !== 'in_progress');

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-14 pb-6">
        {/* Title */}
        <h1 className="text-3xl font-bold tracking-tight mb-6">Activité</h1>

        {/* Upcoming section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">À venir</h2>
          {upcomingRides.length === 0 ? (
            <button className="w-full flex items-center gap-4 bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 transition-colors">
              <div className="flex-1">
                <p className="font-bold">Pas de course à venir</p>
                <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                  Réserver un trajet <ChevronRight className="w-3 h-3" />
                </p>
              </div>
              <div className="text-3xl flex-shrink-0">📅</div>
            </button>
          ) : (
            <div className="space-y-3">
              {upcomingRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          )}
        </div>

        {/* Past section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Passées</h2>
            <button className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Savings promo banner */}
          <button className="w-full flex items-center gap-4 bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 transition-colors mb-3">
            <div className="flex-1">
              <p className="font-bold">Vous auriez pu économiser CHF 42.52 ces 30 derniers jours</p>
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                Essayer Caby Premium <ChevronRight className="w-3 h-3" />
              </p>
            </div>
            <div className="text-3xl flex-shrink-0">💰</div>
          </button>

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
            <div className="space-y-3">
              {pastRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ActivityPage;
