import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, FileCheck, ShieldCheck, GraduationCap } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';

const SafetyAtCabyPage: React.FC = () => {
  const navigate = useNavigate();

  const guarantees = [
    {
      icon: FileCheck,
      title: 'Casier judiciaire vérifié',
      desc: "Chaque chauffeur fait l'objet d'une vérification complète de ses antécédents avant d'être autorisé à exercer.",
    },
    {
      icon: ShieldCheck,
      title: 'Assurances professionnelles à jour',
      desc: "Toutes les polices d'assurance (responsabilité civile et professionnelle) sont vérifiées et renouvelées en permanence.",
    },
    {
      icon: GraduationCap,
      title: 'Formation VTC Genève (LTVTC)',
      desc: 'Nos chauffeurs sont formés aux réglementations VTC spécifiques au canton de Genève et certifiés conformes.',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/caby/account/safety')} className="p-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-bold">Safety at Caby</h1>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center">
            <Building className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">La promesse TATFleet</h2>
            <p className="text-xs text-muted-foreground">
              Des standards de sécurité inégalés
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-8">
          Tous nos chauffeurs sont rigoureusement sélectionnés. Chaque chauffeur sur Caby est un salarié de TATFleet, ce qui garantit un niveau de qualité et de conformité supérieur.
        </p>

        <div className="space-y-3">
          {guarantees.map((item, i) => (
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

        <div className="mt-8 bg-card border border-border rounded-xl p-5 text-center">
          <p className="text-xs text-muted-foreground">
            🔒 TATFleet LSE Certified · Genève, Suisse
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default SafetyAtCabyPage;
