import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

const GOLD = '#A07830';
const CREAM = '#F5F2EC';

type Severity = 'info' | 'warning' | 'ok';

const ALERTS: { date: string; severity: Severity; title: string; body: string; link?: string }[] = [
  {
    date: '23/04/2026',
    severity: 'warning',
    title: 'Travaux Pont du Mont-Blanc — circulation perturbée à Genève',
    body: 'Des travaux de réfection sont en cours sur le Pont du Mont-Blanc jusqu\'au 30 avril. Prévoir +15 à 20 minutes pour les trajets traversant le centre de Genève. Nos chauffeurs adaptent automatiquement les itinéraires en temps réel.',
    link: '#',
  },
  {
    date: '20/04/2026',
    severity: 'info',
    title: 'Nouveau point de prise en charge à Lausanne Gare',
    body: 'À partir du 1er mai 2026, tous les trajets Caby Van au départ de Lausanne s\'effectueront depuis le quai dédié situé à la sortie Sud (place de la Gare). Plus de visibilité, accès direct, abrité.',
  },
  {
    date: '15/04/2026',
    severity: 'warning',
    title: 'Contrôles renforcés à la frontière franco-suisse',
    body: 'Des contrôles douaniers renforcés peuvent allonger les temps de passage de 10 à 30 minutes aux postes-frontières (Bardonnex, Moillesulaz, Saint-Genis-Pouilly). Munissez-vous obligatoirement d\'une pièce d\'identité valide.',
    link: '#',
  },
  {
    date: '10/04/2026',
    severity: 'ok',
    title: 'Service Caby Van Annecy — capacité doublée',
    body: 'En réponse à la forte demande, nous avons doublé la fréquence des trajets Genève ↔ Annecy. Désormais 16 départs quotidiens dans chaque sens, de 6h à 22h.',
  },
  {
    date: '02/04/2026',
    severity: 'info',
    title: 'Mise à jour des conditions hivernales',
    body: 'Tous nos véhicules sont équipés de pneus 4 saisons et de chaînes pour les trajets vers les stations de ski (Chamonix, Verbier, Zermatt). Aucun retard significatif n\'est attendu en cas d\'épisode neigeux modéré.',
  },
];

const SEVERITY_CONFIG: Record<Severity, { icon: typeof AlertTriangle; color: string; label: string; bg: string }> = {
  warning: { icon: AlertTriangle, color: '#C9301C', label: 'Perturbation', bg: '#FBE9E7' },
  info: { icon: Info, color: GOLD, label: 'Information', bg: '#FAF4E8' },
  ok: { icon: CheckCircle2, color: '#2E7D32', label: 'Amélioration', bg: '#E8F5E9' },
};

const TrafficStatusPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Inter', system-ui, sans-serif", color: '#0A0A0A' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #E0DDD5', padding: '14px 5%', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center' }} aria-label="Retour">
          <ArrowLeft size={20} />
        </button>
        <CabyLogo size={28} />
        <nav style={{ marginLeft: 'auto', display: 'flex', gap: 24, fontSize: 13, fontWeight: 600 }}>
          <button onClick={() => navigate('/caby/account/reservations')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#0A0A0A', fontFamily: 'inherit', fontWeight: 600, fontSize: 13 }}>Vos réservations</button>
          <button onClick={() => navigate('/caby/help')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: GOLD, fontFamily: 'inherit', fontWeight: 700, fontSize: 13 }}>Aide</button>
        </nav>
      </header>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 5% 60px' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
          <button onClick={() => navigate('/caby/help')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: GOLD, fontFamily: 'inherit', fontSize: 13 }}>Centre d'aide</button>
          <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 4px' }} />
          <span>Avant de voyager</span>
          <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 4px' }} />
          <span style={{ color: '#0A0A0A', fontWeight: 600 }}>État du trafic actuel</span>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: 0, marginBottom: 16 }}>
          État du trafic actuel
        </h1>
        <p style={{ fontSize: 15, color: '#444', maxWidth: 720, lineHeight: 1.55, marginBottom: 36 }}>
          Restez informé de l'état du trafic en temps réel sur le réseau Caby Van, y compris les mises à jour sur les horaires, les itinéraires conseillés et les directives de sécurité pour voyager l'esprit léger.
        </p>

        {/* Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {ALERTS.map((a, i) => {
            const cfg = SEVERITY_CONFIG[a.severity];
            const Icon = cfg.icon;
            return (
              <article key={i} style={{ background: '#fff', border: '1px solid #E0DDD5', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', background: cfg.bg, borderBottom: '1px solid #E0DDD5' }}>
                  <div style={{ display: 'inline-block', background: cfg.color, color: '#fff', padding: '4px 12px', borderRadius: 4, fontSize: 12, fontWeight: 800 }}>
                    {a.date}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    <Icon size={14} /> {cfg.label}
                  </div>
                </div>
                <div style={{ padding: '20px 24px' }}>
                  <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 10 }}>{a.title}</h2>
                  <p style={{ fontSize: 14, color: '#333', lineHeight: 1.6, margin: 0 }}>{a.body}</p>
                  {a.link && (
                    <button
                      onClick={() => navigate('/caby/help/article/retards-annulations')}
                      style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: GOLD, fontWeight: 700, fontSize: 13.5, padding: 0, fontFamily: 'inherit' }}
                    >
                      En savoir plus <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Footer info */}
        <div style={{ marginTop: 40, padding: 22, background: '#fff', border: '1px solid #E0DDD5', borderRadius: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#555', marginBottom: 12 }}>
            Aucune perturbation ne concerne votre trajet ? Consultez le centre d'aide pour d'autres questions.
          </div>
          <button
            onClick={() => navigate('/caby/help')}
            style={{ padding: '10px 24px', background: GOLD, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Retour au centre d'aide
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrafficStatusPage;
