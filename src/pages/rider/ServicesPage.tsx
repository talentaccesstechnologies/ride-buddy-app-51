import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Package, CalendarClock, ChevronRight, Bike, Bus } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';

const services = [
  {
    id: 'ride',
    icon: Car,
    emoji: '🚗',
    title: 'Course',
    desc: 'Réservez un chauffeur privé',
    route: '/caby/search',
  },
  {
    id: 'delivery',
    icon: Package,
    emoji: '📦',
    title: 'Livraison',
    desc: 'Envoi de colis express',
    route: null,
  },
  {
    id: 'reserve',
    icon: CalendarClock,
    emoji: '📅',
    title: 'Réservation',
    desc: 'Planifiez une course à l\'avance',
    route: null,
  },
  {
    id: 'moto',
    icon: Bike,
    emoji: '🏍️',
    title: 'Moto',
    desc: 'Transport rapide en deux-roues',
    route: null,
  },
  {
    id: 'shuttle',
    icon: Bus,
    emoji: '🚐',
    title: 'Navette',
    desc: 'Trajets partagés à prix réduit',
    route: null,
  },
];

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-14 pb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Services</h1>
        <p className="text-sm text-muted-foreground mb-6">Choisissez parmi nos options de mobilité</p>

        <div className="space-y-3">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => service.route && navigate(service.route)}
              className="w-full flex items-center gap-4 bg-card border border-border rounded-xl p-4 text-left hover:border-primary/30 transition-colors"
            >
              <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">{service.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base">{service.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{service.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Promo banner */}
        <div className="mt-6 bg-primary/10 border border-primary/20 rounded-xl p-5">
          <p className="font-bold text-base">Nouveau ! Livraisons express 🚀</p>
          <p className="text-sm text-muted-foreground mt-1">
            Envoyez vos colis à travers Genève en moins de 30 minutes.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ServicesPage;
