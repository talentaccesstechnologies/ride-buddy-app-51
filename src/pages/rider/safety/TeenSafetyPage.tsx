import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Baby, MapPin, Bell, ShieldAlert } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';

const TeenSafetyPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Bell,
      title: 'Notifications parentales',
      desc: 'Les parents reçoivent une notification à chaque début et fin de course.',
    },
    {
      icon: MapPin,
      title: 'Suivi en temps réel obligatoire',
      desc: "La position est partagée automatiquement avec le compte parent lié.",
    },
    {
      icon: ShieldAlert,
      title: "Bouton d'urgence",
      desc: "Accès direct au bouton SOS pour contacter les secours immédiatement.",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/caby/account/safety')} className="p-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-bold">Sécurité des adolescents</h1>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center">
            <Baby className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Comptes 13–17 ans</h2>
            <p className="text-xs text-muted-foreground">
              Sécurité renforcée pour les mineurs
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-8">
          Les comptes pour adolescents incluent des protections supplémentaires pour garantir la sécurité des jeunes utilisateurs.
        </p>

        <div className="space-y-3">
          {features.map((item, i) => (
            <div key={i} className="flex items-start gap-4 bg-card border border-border rounded-xl p-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default TeenSafetyPage;
