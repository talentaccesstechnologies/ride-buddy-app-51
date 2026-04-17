import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Car, ChevronRight, Phone, PackageOpen, AlertTriangle, Receipt } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';

const recentRides = [
  {
    id: '1',
    icon: '🚗',
    location: 'Av. de la Gare des Eaux-Vives 19',
    date: '14 Fév · 13:13',
    amount: 'CHF 40.73',
    image: '/placeholder.svg',
  },
  {
    id: '2',
    icon: '🚗',
    location: 'Rue du Mont-Blanc 24, Genève',
    date: '13 Fév · 18:53',
    amount: 'CHF 32.50',
    image: null,
  },
  {
    id: '3',
    icon: '🚗',
    location: 'Aéroport de Genève',
    date: '13 Fév · 09:15',
    amount: 'CHF 55.00',
    image: '/placeholder.svg',
  },
];

const rideActions = [
  { icon: PackageOpen, label: 'Objet oublié' },
  { icon: AlertTriangle, label: 'Signaler un problème de conduite' },
  { icon: Receipt, label: 'Réclamation tarifaire' },
];

const helpTopics = [
  { label: 'Courses' },
  { label: 'Paiements' },
  { label: 'Compte' },
  { label: 'Sécurité' },
];

const HelpPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRide, setSelectedRide] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-2">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/caby/account')} className="p-1">
            <X className="w-6 h-6 text-foreground" />
          </button>
          <button className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Messages</span>
          </button>
        </div>
        <h1 className="text-3xl font-bold">Aide</h1>
      </div>

      <div className="px-5 pt-4">
        {/* Select a trip */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Sélectionner une course</h2>
          <button
            onClick={() => navigate('/caby/activity')}
            className="text-sm font-medium text-muted-foreground"
          >
            Tout voir
          </button>
        </div>

        <div className="space-y-3 mb-10">
          {recentRides.map((ride) => (
            <div key={ride.id}>
              <button
                onClick={() => setSelectedRide(selectedRide === ride.id ? null : ride.id)}
                className="w-full flex items-center gap-4 bg-card border border-border rounded-xl p-3 text-left hover:border-primary/30 transition-colors"
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                  {ride.image ? (
                    <img src={ride.image} alt={ride.location} className="w-full h-full object-cover" />
                  ) : (
                    <Car className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[15px] truncate">{ride.location}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{ride.date}</p>
                  <p className="text-sm text-muted-foreground">{ride.amount}</p>
                </div>
              </button>

              {selectedRide === ride.id && (
                <div className="mt-1 ml-4 space-y-1">
                  {rideActions.map((action, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center gap-3 bg-card/50 border border-border rounded-lg px-4 py-3 text-left hover:border-primary/30 transition-colors"
                    >
                      <action.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Browse help topics */}
        <h2 className="text-lg font-bold mb-4">Parcourir les thèmes d'aide</h2>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {helpTopics.map((topic, i) => (
            <button
              key={i}
              className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-4 text-left hover:border-primary/30 transition-colors"
            >
              <span className="font-medium text-sm">{topic.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Floating contact button */}
      <div className="fixed bottom-24 right-5 z-40">
        <button className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-5 py-3 shadow-lg hover:bg-primary/90 transition-colors">
          <Phone className="w-5 h-5" />
          <span className="font-bold text-sm">Contacter le support</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default HelpPage;
