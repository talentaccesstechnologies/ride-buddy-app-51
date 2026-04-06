import React from 'react';
import { ArrowLeft, Shield, Users, Car, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const sections = [
  {
    icon: Car,
    title: 'Caby Van Suisse',
    text: 'Caby Van Suisse connecte des voyageurs avec des chauffeurs professionnels salariés pour des trajets longue distance en Suisse. Les prix couvrent les frais du trajet et la rémunération du chauffeur.',
    color: 'hsl(43,75%,52%)',
  },
  {
    icon: Users,
    title: 'Caby Cross-Border',
    text: "Caby Cross-Border fonctionne comme du covoiturage organisé entre la France et la Suisse. Vous réservez un siège dans le véhicule d'un particulier qui fait déjà ce trajet. Le prix que vous payez couvre les frais réels de déplacement (carburant, péages, amortissement, entretien) incluant une marge de sécurité de 20% pour les variations de conditions, plus 15% de frais de service Caby. Caby n'est pas une entreprise de transport — nous sommes une plateforme de mise en relation.",
    color: 'hsl(220,70%,50%)',
  },
  {
    icon: Shield,
    title: 'Vos garanties',
    text: 'Remboursement 100% si votre trajet est annulé · Chauffeurs vérifiés · Assurance trajet incluse · Support disponible 7j/7.',
    color: 'hsl(142,70%,45%)',
  },
  {
    icon: FileText,
    title: 'Mentions légales',
    text: "Caby est une plateforme technologique de mise en relation. Les trajets Cross-Border constituent du covoiturage au sens de l'article L3132-1 du Code des transports français. Chaque conducteur reste responsable de son véhicule et de son assurance.",
    color: 'hsl(0,0%,45%)',
  },
];

const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="px-5 pt-14 pb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Retour</span>
        </button>
        <h1 className="text-2xl font-bold text-foreground">Comment ça marche</h1>
        <p className="text-sm text-muted-foreground mt-1">Transparence totale sur notre fonctionnement</p>
      </div>

      <div className="px-5 space-y-4">
        {sections.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-2xl p-5 border border-border"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}20` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <h2 className="font-bold text-foreground">{s.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="px-5 mt-6">
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          Talent Access Technologies SA · Genève, Suisse · Plateforme de mise en relation · Tous droits réservés
        </p>
      </div>
    </div>
  );
};

export default HowItWorksPage;
