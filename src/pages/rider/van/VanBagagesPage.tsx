import CabyLogo from '@/components/shared/CabyLogo';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Luggage, Briefcase, Snowflake, Bike, AlertCircle } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';

const GOLD = '#C9A84C';

const Row: React.FC<{ icon: React.ReactNode; title: string; price: string; desc: string }> = ({ icon, title, price, desc }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0', borderBottom: '1px solid #E0DDD5' }}>
    <div style={{ width: 42, height: 42, borderRadius: 8, background: '#F8F7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, flexShrink: 0 }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0A0A0A' }}>{title}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, whiteSpace: 'nowrap' }}>{price}</div>
      </div>
      <div style={{ fontSize: 12, color: '#888780', marginTop: 2, lineHeight: 1.5 }}>{desc}</div>
    </div>
  </div>
);

const VanBagagesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white" style={{ background: '#F8F7F2', paddingBottom: 96 }}>
      <header style={{ background: GOLD, padding: '0 5%', height: 56, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#0A0A0A', padding: 4 }}>
          <ArrowLeft size={22} />
        </button>
        <CabyLogo size={28} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.7)', marginLeft: 8 }}>Bagages & options</span>
      </header>

      <div style={{ background: '#0A0A0A', color: '#fff', padding: '40px 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>
            Préparer son voyage
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.15 }}>
            Bagages & équipements
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
            Inclus, options et tarifs : préparez votre trajet en toute sérénité.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 5%' }}>
        {/* Inclus */}
        <section style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E0DDD5', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0A0A0A', margin: '0 0 6px' }}>Inclus dans tous les trajets</h2>
          <p style={{ fontSize: 13, color: '#888780', margin: '0 0 6px' }}>Aucun supplément, à bord avec vous</p>
          <Row icon={<Briefcase size={20} />} title="1 bagage cabine" price="Gratuit" desc="Max 55 × 40 × 20 cm — placé à vos pieds" />
          <Row icon={<Luggage size={20} />} title="1 bagage en soute" price="Gratuit" desc="Max 23 kg — valise standard de format moyen" />
        </section>

        {/* Options */}
        <section style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E0DDD5', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0A0A0A', margin: '0 0 6px' }}>Options additionnelles</h2>
          <p style={{ fontSize: 13, color: '#888780', margin: '0 0 6px' }}>À ajouter lors de la réservation</p>
          <Row icon={<Luggage size={20} />} title="Grande valise (+8 CHF)" price="+8 CHF" desc="Au-delà de 23 kg ou format XL (jusqu'à 30 kg)" />
          <Row icon={<Snowflake size={20} />} title="Skis ou snowboard" price="+12 CHF" desc="Housse fournie, max 195 cm" />
          <Row icon={<Bike size={20} />} title="Vélo démonté" price="+15 CHF" desc="Dans housse rigide ou carton" />
          <Row icon={<Briefcase size={20} />} title="Bagage cabine supplémentaire" price="+5 CHF" desc="2ᵉ sac à main ou sac à dos" />
        </section>

        {/* Restrictions */}
        <section style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E0DDD5' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'center' }}>
            <AlertCircle size={20} color={GOLD} />
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0A0A0A', margin: 0 }}>Objets interdits</h2>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: '#3A3A3A', lineHeight: 1.7 }}>
            <li>Matières dangereuses, inflammables ou explosifs</li>
            <li>Armes (sauf sportives déclarées sur autorisation)</li>
            <li>Animaux non autorisés en cabine sans option Pet</li>
            <li>Objets dépassant 2 m de long</li>
          </ul>
          <p style={{ fontSize: 13, color: '#888780', marginTop: 14, marginBottom: 0 }}>
            Pensez à ajouter vos options en ligne avant le départ — elles sont jusqu'à 50% moins chères que sur place.
          </p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default VanBagagesPage;
