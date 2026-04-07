import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GOLD = '#C9A84C';

const sections = [
  {
    title: '1. NATURE DU SERVICE',
    content: `Caby Van est une plateforme de mise en relation entre particuliers pour le covoiturage. Les trajets proposés constituent du partage de frais au sens de l'article L3132-1 du Code des transports français. Caby n'est pas une entreprise de transport de personnes.`,
  },
  {
    title: '2. PRIX ET PARTAGE DE FRAIS',
    content: `Le prix demandé par siège correspond aux frais réels du trajet (carburant, péages, amortissement, entretien) divisés entre les passagers, augmentés d'une marge de sécurité de 20% pour les variations de conditions et des frais de service Caby (15%). Le conducteur ne réalise pas de bénéfice commercial.`,
  },
  {
    title: '3. ASSURANCE',
    content: `Chaque conducteur certifie que son véhicule est couvert par une assurance responsabilité civile valide incluant le transport de passagers en covoiturage. Les passagers sont couverts par cette assurance obligatoire conformément à la loi Badinter. Une assurance trajet complémentaire Caby (CHF 2.50/siège) est activée automatiquement à chaque réservation.`,
  },
  {
    title: '4. RESPONSABILITÉ',
    content: `Caby agit en qualité d'intermédiaire de mise en relation. Caby décline toute responsabilité en cas d'accident, retard, annulation imputable au conducteur ou à des circonstances extérieures.`,
  },
  {
    title: '5. ANNULATION ET REMBOURSEMENT',
    content: null,
    list: [
      'Annulation > 48h avant : remboursement 80%',
      'Annulation 24-48h avant : remboursement 50%',
      'Annulation < 24h : non remboursable',
      'Avec option Annulation Flexible : remboursement 100% jusqu\'à 24h avant',
      'Annulation par Caby ou le conducteur : remboursement 100%',
    ],
  },
  {
    title: '6. OBLIGATIONS DU PASSAGER',
    content: `Le passager s'engage à être présent au point de pickup à l'heure convenue. En cas d'absence non signalée (no-show), aucun remboursement ne sera effectué. 3 no-shows entraînent la suspension du compte.`,
  },
  {
    title: '7. DONNÉES PERSONNELLES',
    content: `Vos données sont traitées conformément au RGPD. Elles ne sont jamais vendues à des tiers.`,
  },
  {
    title: '8. DROIT APPLICABLE',
    content: `Les présentes CGU sont soumises au droit suisse. Tout litige sera soumis aux tribunaux compétents du canton de Genève.`,
  },
];

export default function VanTermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div className="mb-2">
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: GOLD }}>
            Caby Van
          </span>
        </div>
        <h1 className="text-3xl font-bold mb-1">CONDITIONS GÉNÉRALES D'UTILISATION</h1>
        <p className="text-sm text-gray-500 mb-10">Dernière mise à jour : Avril 2026</p>

        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: GOLD }}>
                {s.title}
              </h2>
              {s.content && <p className="text-sm leading-relaxed text-gray-700">{s.content}</p>}
              {s.list && (
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {s.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-xs text-gray-400">© 2026 Caby SA — Genève, Suisse</p>
        </div>
      </div>
    </div>
  );
}
