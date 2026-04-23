import CabyLogo from '@/components/shared/CabyLogo';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileCheck, Users, PawPrint, AlertCircle, CheckCircle2 } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';

const GOLD = '#C9A84C';

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <section style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E0DDD5', marginBottom: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
      <div style={{ width: 38, height: 38, borderRadius: 8, background: '#F8F7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD }}>
        {icon}
      </div>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0A0A0A', margin: 0 }}>{title}</h2>
    </div>
    <div style={{ fontSize: 14, color: '#3A3A3A', lineHeight: 1.65 }}>{children}</div>
  </section>
);

const VanDocumentsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white" style={{ background: '#F8F7F2', paddingBottom: 96 }}>
      {/* Header */}
      <header style={{ background: GOLD, padding: '0 5%', height: 56, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#0A0A0A', padding: 4 }}>
          <ArrowLeft size={22} />
        </button>
        <CabyLogo size={28} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.7)', marginLeft: 8 }}>Documents requis</span>
      </header>

      {/* Hero */}
      <div style={{ background: '#0A0A0A', color: '#fff', padding: '40px 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>
            Préparer son voyage
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.15 }}>
            Documents d'identité requis
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
            Tout ce qu'il faut savoir pour voyager sereinement en Suisse et entre la Suisse et l'Union européenne.
          </p>
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 5%' }}>
        <Section icon={<FileCheck size={20} />} title="Trajets en Suisse (intérieur)">
          <p style={{ margin: '0 0 10px' }}>Aucun document spécifique n'est requis pour les trajets domestiques. Un document d'identité (CNI suisse, permis de conduire ou passeport) reste recommandé pour vérification éventuelle.</p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Mineurs de moins de 16 ans : accompagnés d'un adulte ou autorisation écrite</li>
            <li>Permis de conduire accepté comme pièce de secours</li>
          </ul>
        </Section>

        <Section icon={<FileCheck size={20} />} title="Cross-Border : Suisse ↔ Union européenne">
          <p style={{ margin: '0 0 10px' }}>Pour tout passage de frontière (France, Italie, Allemagne, Autriche, Liechtenstein) :</p>
          <ul style={{ margin: '0 0 14px', paddingLeft: 18 }}>
            <li><strong>Citoyens UE/AELE :</strong> CNI ou passeport en cours de validité</li>
            <li><strong>Citoyens hors UE :</strong> Passeport valide + visa Schengen le cas échéant</li>
            <li><strong>Validité :</strong> document valable au minimum 3 mois après la date de retour</li>
          </ul>
          <div style={{ background: '#FFF8E6', border: `1px solid ${GOLD}`, borderRadius: 8, padding: 14, display: 'flex', gap: 10 }}>
            <AlertCircle size={18} color={GOLD} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 13, color: '#5A4A1A' }}>
              Il est de votre responsabilité de vérifier la validité de vos documents avant le départ. Caby ne peut être tenu responsable d'un refus aux frontières.
            </div>
          </div>
        </Section>

        <Section icon={<Users size={20} />} title="Mineurs voyageant seuls">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Caby Van accepte les mineurs de plus de 12 ans accompagnés ou avec autorisation parentale écrite</li>
            <li>Pour les trajets transfrontaliers : autorisation de sortie de territoire (AST) obligatoire pour les mineurs français</li>
            <li>Activez <strong>Caby Teen Safety</strong> dans votre compte pour suivre le trajet en direct</li>
          </ul>
        </Section>

        <Section icon={<PawPrint size={20} />} title="Animaux de compagnie">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Petits animaux en sac de transport : acceptés gratuitement</li>
            <li>Chiens en laisse + muselière : option Caby Van Pet (+8 CHF)</li>
            <li>Passage de frontière : passeport européen pour animaux + vaccin antirabique à jour</li>
          </ul>
        </Section>

        <Section icon={<CheckCircle2 size={20} />} title="Bon à savoir">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Certains chauffeurs peuvent vérifier votre identité avant la prise en charge</li>
            <li>Les justificatifs (visa, AST) doivent être présentés sur demande</li>
            <li>En cas de doute : contactez le support Caby 24/7</li>
          </ul>
        </Section>
      </main>

      <BottomNav />
    </div>
  );
};

export default VanDocumentsPage;
