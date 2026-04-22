import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Accessibility, Users, PawPrint, Heart, Phone } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';

const GOLD = '#C9A84C';

const Card: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <section style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E0DDD5', marginBottom: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 8, background: '#F8F7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD }}>
        {icon}
      </div>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0A0A0A', margin: 0 }}>{title}</h2>
    </div>
    <div style={{ fontSize: 14, color: '#3A3A3A', lineHeight: 1.65 }}>{children}</div>
  </section>
);

const VanAssistancePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white" style={{ background: '#F8F7F2', paddingBottom: 96 }}>
      <header style={{ background: GOLD, padding: '0 5%', height: 56, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#0A0A0A', padding: 4 }}>
          <ArrowLeft size={22} />
        </button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-1px' }}>caby</div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.7)', marginLeft: 8 }}>Assistance spéciale</span>
      </header>

      <div style={{ background: '#0A0A0A', color: '#fff', padding: '40px 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>
            Voyager pour tous
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.15 }}>
            Assistance spéciale
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
            PMR, mineurs, animaux, besoins spécifiques : Caby vous accompagne pour un voyage sans souci.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 5%' }}>
        <Card icon={<Accessibility size={22} />} title="Accessibilité PMR">
          <p style={{ margin: '0 0 10px' }}>Caby s'engage à offrir un service inclusif pour les voyageurs à mobilité réduite.</p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Véhicules adaptés sur demande (rampe d'accès, fauteuil roulant pliant)</li>
            <li>Aide à l'embarquement par le chauffeur — gratuit</li>
            <li>Accompagnant voyage gratuitement sur les trajets Cross-Border</li>
            <li>Réservation 24h à l'avance recommandée pour véhicule adapté</li>
          </ul>
        </Card>

        <Card icon={<Users size={22} />} title="Mineurs voyageant seuls">
          <ul style={{ margin: '0 0 12px', paddingLeft: 18 }}>
            <li>Acceptés à partir de <strong>12 ans</strong> avec autorisation parentale</li>
            <li>Suivi temps réel via <strong>Caby Teen Safety</strong></li>
            <li>Notifications SMS aux parents : départ, étape, arrivée</li>
            <li>Chauffeurs formés et vérifiés (casier judiciaire)</li>
          </ul>
          <button
            onClick={() => navigate('/caby/account/safety/teen')}
            style={{ background: 'transparent', border: `1px solid ${GOLD}`, color: GOLD, padding: '8px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Activer Teen Safety
          </button>
        </Card>

        <Card icon={<PawPrint size={22} />} title="Animaux de compagnie">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Petits animaux en sac fermé : gratuit</li>
            <li>Chiens en laisse + muselière : option Pet (+8 CHF)</li>
            <li>Chiens guide / d'assistance : toujours gratuits, prioritaires</li>
            <li>Cross-Border : passeport européen pour animaux requis</li>
          </ul>
        </Card>

        <Card icon={<Heart size={22} />} title="Besoins médicaux spécifiques">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Transport de matériel médical (oxygène, fauteuil) — précisez à la réservation</li>
            <li>Pause supplémentaire sur trajets Cross-Border : sans surcoût</li>
            <li>Réfrigération de médicaments : possible sur demande (Caby Premium)</li>
          </ul>
        </Card>

        {/* Contact spécial */}
        <section style={{ background: '#0A0A0A', color: '#fff', borderRadius: 12, padding: 24, textAlign: 'center' }}>
          <Phone size={28} color={GOLD} style={{ marginBottom: 10 }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Une demande spécifique ?</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: '0 0 16px' }}>Notre équipe Assistance répond 7j/7 de 7h à 22h</p>
          <button
            onClick={() => navigate('/caby/account/help')}
            style={{ padding: '12px 24px', background: GOLD, color: '#0A0A0A', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Contacter l'assistance
          </button>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default VanAssistancePage;
