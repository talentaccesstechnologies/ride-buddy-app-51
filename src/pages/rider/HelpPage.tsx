import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Car, ChevronRight, Wallet, FileText, Shield, Smartphone, Phone } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';

const recentActivities = [
  {
    id: '1',
    icon: '🚗',
    location: 'Av. de la Gare des Eaux-Vives 19',
    date: '14 Fév · 13:13',
    amount: 'CHF 40.73',
  },
  {
    id: '2',
    icon: '🚗',
    location: 'Rue du Mont-Blanc 24, Genève',
    date: '13 Fév · 18:53',
    amount: 'CHF 32.50',
  },
  {
    id: '3',
    icon: '🚗',
    location: 'Aéroport de Genève',
    date: '13 Fév · 09:15',
    amount: 'CHF 55.00',
  },
];

const helpTopics = [
  { icon: Wallet, label: 'Paiements & Revenus', desc: 'Salaire, factures, primes' },
  { icon: FileText, label: 'Compte & Documents', desc: 'Attestation VTC, permis, profil' },
  { icon: Shield, label: 'Protection Sociale', desc: 'Chômage, LPP, AVS' },
  { icon: Smartphone, label: "Utilisation de l'App", desc: 'Guide technique Caby' },
];

const HelpPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-2">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/caby/account')} className="p-1">
            <X className="w-6 h-6 text-foreground" />
          </button>
          <button
            onClick={() => navigate('/caby/account/messages')}
            className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2"
          >
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Messages</span>
          </button>
        </div>
        <h1 className="text-3xl font-bold">Aide</h1>
      </div>

      <div className="px-5 pt-4">
        {/* Recent activity */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Sélectionner une course</h2>
          <button
            onClick={() => navigate('/caby/activity')}
            className="text-sm font-medium text-muted-foreground"
          >
            Tout voir
          </button>
        </div>

        <div className="space-y-3 mb-8">
          {recentActivities.map((activity) => (
            <button
              key={activity.id}
              className="w-full flex items-center gap-4 bg-card border border-border rounded-xl p-4 text-left hover:border-primary/30 transition-colors"
            >
              <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <Car className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{activity.location}</p>
                <p className="text-sm text-muted-foreground">{activity.date}</p>
                <p className="text-sm text-muted-foreground">{activity.amount}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Help topics */}
        <h2 className="text-lg font-bold mb-4">Parcourir les thèmes d'aide</h2>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {helpTopics.map((topic, i) => (
            <button
              key={i}
              className="flex flex-col gap-2 bg-card border border-border rounded-xl p-4 text-left hover:border-primary/30 transition-colors"
            >
              <topic.icon className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-bold text-sm">{topic.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{topic.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground self-end" />
            </button>
          ))}
        </div>
      </div>

      {/* Floating call button */}
      <div className="fixed bottom-24 right-5 z-40">
        <button className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-5 py-3 shadow-lg hover:bg-primary/90 transition-colors">
          <Phone className="w-5 h-5" />
          <span className="font-bold text-sm">Appeler le Support</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default HelpPage;
