import React, { useState } from 'react';
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
  Clock,
  UserPlus,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import BottomNav from '@/components/rider/BottomNav';

const SafetyPage: React.FC = () => {
  const navigate = useNavigate();
  const [verifyTrip, setVerifyTrip] = useState(false);
  const [rideCheck, setRideCheck] = useState(true);

  const safetyPreferences = [
    {
      icon: Shield,
      title: 'Safety Preferences',
      subtitle: 'Automatisez vos fonctions de sécurité',
      type: 'link' as const,
    },
    {
      icon: Users,
      title: 'Contacts de confiance',
      subtitle: 'Partagez votre trajet en temps réel',
      type: 'link' as const,
    },
    {
      icon: KeyRound,
      title: 'Verify Your Trip',
      subtitle: 'Code PIN à 4 chiffres avant de monter',
      type: 'toggle' as const,
      checked: verifyTrip,
      onToggle: setVerifyTrip,
    },
    {
      icon: Activity,
      title: 'RideCheck',
      subtitle: 'Détection d\'anomalies pendant le trajet',
      type: 'toggle' as const,
      checked: rideCheck,
      onToggle: setRideCheck,
    },
  ];

  const knowBeforeTrip = [
    {
      icon: Lightbulb,
      title: 'Conseils de sécurité',
      subtitle: 'Vérifiez plaque, modèle et photo du chauffeur',
    },
    {
      icon: Baby,
      title: 'Sécurité des adolescents',
      subtitle: 'Paramètres parentaux et suivi obligatoire',
    },
    {
      icon: Building,
      title: 'Safety at Caby',
      subtitle: 'Nos protocoles et conformité TATFleet',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/caby/account')} className="p-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-bold">Sécurité</h1>
        </div>
      </div>

      <div className="px-5 space-y-8">
        {/* Safety tools */}
        <div>
          <h2 className="text-xl font-bold mb-1">Outils de sécurité</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Gérez vos préférences pour chaque trajet.
          </p>
          <div className="space-y-1">
            {safetyPreferences.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-4 border-b border-border"
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
                {item.type === 'toggle' ? (
                  <Switch checked={item.checked} onCheckedChange={item.onToggle} />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Safety Preferences detail */}
        <SafetyPreferencesCard />

        {/* Trusted Contacts */}
        <TrustedContactsCard />

        {/* Know before your trip */}
        <div>
          <h2 className="text-xl font-bold mb-1">S'informer avant le trajet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ressources pour voyager en toute sérénité.
          </p>
          <div className="space-y-1">
            {knowBeforeTrip.map((item, i) => (
              <button
                key={i}
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
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

/* ─── Safety Preferences Card ─── */
const SafetyPreferencesCard: React.FC = () => {
  const [shareEvening, setShareEvening] = useState(true);
  const [shareAll, setShareAll] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-bold text-sm">Partage automatique</h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Courses du soir (après 21h)</p>
            <p className="text-xs text-muted-foreground">Partage auto avec vos contacts</p>
          </div>
          <Switch checked={shareEvening} onCheckedChange={setShareEvening} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Tous les trajets</p>
            <p className="text-xs text-muted-foreground">Partage systématique</p>
          </div>
          <Switch checked={shareAll} onCheckedChange={setShareAll} />
        </div>
      </div>
    </div>
  );
};

/* ─── Trusted Contacts Card ─── */
const TrustedContactsCard: React.FC = () => {
  const contacts = [
    { name: 'Maman', initials: 'MA' },
    { name: 'Alex B.', initials: 'AB' },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-bold text-sm">Contacts de confiance</h3>
        </div>
        <button className="flex items-center gap-1 text-xs font-medium text-primary">
          <UserPlus className="w-4 h-4" />
          Ajouter
        </button>
      </div>
      {contacts.length > 0 ? (
        <div className="space-y-3">
          {contacts.map((c, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {c.initials}
                </div>
                <span className="text-sm font-medium">{c.name}</span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Aucun contact ajouté.</p>
      )}
    </div>
  );
};

export default SafetyPage;
