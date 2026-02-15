import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Bell, ShieldAlert, PhoneCall } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import BottomNav from '@/components/rider/BottomNav';

const RideCheckPage: React.FC = () => {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/caby/account/safety')} className="p-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-bold">RideCheck</h1>
        </div>

        {/* Hero */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Détection d'anomalies</h2>
          <p className="text-sm text-muted-foreground">
            Grâce aux capteurs de votre smartphone, Caby détecte si un trajet présente une anomalie (arrêt prolongé inattendu ou accident).
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between bg-card border border-border rounded-xl p-5 mb-8">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Activity className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-sm">Activer RideCheck</p>
              <p className="text-xs text-muted-foreground">Surveillance automatique de vos trajets</p>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {/* What happens */}
        <h3 className="font-bold text-sm mb-4">En cas de détection</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Nous vous enverrons une notification pour vérifier si vous allez bien et vous proposer de l'aide.
        </p>

        <div className="space-y-3">
          {[
            { icon: Bell, title: 'Notification', desc: "Vous recevez une alerte : « Tout va bien ? »" },
            { icon: ShieldAlert, title: 'Signaler un problème', desc: 'Répondez pour signaler un incident directement.' },
            { icon: PhoneCall, title: 'Appel d\'urgence', desc: 'Contactez les secours en un clic depuis la notification.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 bg-card border border-border rounded-xl p-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default RideCheckPage;
