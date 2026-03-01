import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Shield,
  Users,
  KeyRound,
  Activity,
  Lightbulb,
  Baby,
  Building,
} from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';

const SafetyPage: React.FC = () => {
  const navigate = useNavigate();

  const safetyTools = [
    {
      icon: Shield,
      title: 'Safety Preferences',
      subtitle: 'Automatisez vos fonctions de sécurité',
      route: '/caby/account/safety/preferences',
    },
    {
      icon: Users,
      title: 'Contacts de confiance',
      subtitle: 'Partagez votre trajet en temps réel',
      route: '/caby/account/safety/contacts',
    },
    {
      icon: KeyRound,
      title: 'Verify Your Trip',
      subtitle: 'Code PIN à 4 chiffres avant de monter',
      route: '/caby/account/safety/verify',
    },
    {
      icon: Activity,
      title: 'RideCheck',
      subtitle: "Détection d'anomalies pendant le trajet",
      route: '/caby/account/safety/ridecheck',
    },
  ];

  const knowBeforeTrip = [
    {
      icon: Lightbulb,
      title: 'Conseils de sécurité',
      subtitle: 'Vérifiez plaque, modèle et photo du chauffeur',
      route: '/caby/account/safety/tips',
    },
    {
      icon: Baby,
      title: 'Sécurité des adolescents',
      subtitle: 'Paramètres parentaux et suivi obligatoire',
      route: '/caby/account/safety/teen',
    },
    {
      icon: Building,
      title: 'Safety at Caby',
      subtitle: 'Nos protocoles et conformité Caby',
      route: '/caby/account/safety/about',
    },
  ];

  const renderRow = (item: (typeof safetyTools)[0]) => (
    <button
      key={item.title}
      onClick={() => navigate(item.route)}
      className="w-full flex items-center justify-between py-4 border-b border-border text-left"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center flex-shrink-0">
          <item.icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm">{item.title}</p>
          <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    </button>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/caby/account')} className="p-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-bold">Sécurité</h1>
        </div>
      </div>

      <div className="px-5 space-y-8">
        <div>
          <h2 className="text-xl font-bold mb-1">Outils de sécurité</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Gérez vos préférences pour chaque trajet.
          </p>
          <div className="space-y-1">{safetyTools.map(renderRow)}</div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-1">S'informer avant le trajet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ressources pour voyager en toute sérénité.
          </p>
          <div className="space-y-1">{knowBeforeTrip.map(renderRow)}</div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default SafetyPage;
