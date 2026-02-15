import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, User, CreditCard, MessageCircle } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';

const SafetyTipsPage: React.FC = () => {
  const navigate = useNavigate();

  const checks = [
    {
      icon: CreditCard,
      title: "Plaque d'immatriculation",
      desc: "Doit correspondre à celle affichée dans l'app.",
    },
    {
      icon: Car,
      title: 'Modèle du véhicule',
      desc: 'Vérifiez la marque et la couleur.',
    },
    {
      icon: User,
      title: 'Photo du chauffeur',
      desc: 'Assurez-vous que le visage correspond.',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/caby/account/safety')} className="p-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-bold">Conseils de sécurité</h1>
        </div>

        <h2 className="text-xl font-bold mb-2">Check Your Ride 🛡️</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Avant chaque course, vérifiez ces 3 éléments essentiels.
        </p>

        <div className="space-y-3 mb-8">
          {checks.map((item, i) => (
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

        {/* Extra tip */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm">Conseil supplémentaire</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Demandez au chauffeur : <span className="font-bold text-foreground">« C'est pour qui ? »</span> avant de dire votre nom. C'est la meilleure façon de confirmer que c'est votre course.
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default SafetyTipsPage;
