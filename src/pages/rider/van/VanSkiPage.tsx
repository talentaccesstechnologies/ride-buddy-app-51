import CabyLogo from '@/components/shared/CabyLogo';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Snowflake, Clock, Package, Check } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';

const GOLD = '#C9A84C';

const STATIONS = [
  { name: 'Verbier', region: 'Valais', duration: '2h00', price: 'dès 65 CHF', tag: 'Premium' },
  { name: 'Chamonix', region: 'Haute-Savoie', duration: '1h15', price: 'dès 45 CHF', tag: 'Frontalier' },
  { name: 'Megève', region: 'Haute-Savoie', duration: '1h30', price: 'dès 55 CHF', tag: 'Frontalier' },
  { name: 'Crans-Montana', region: 'Valais', duration: '2h30', price: 'dès 75 CHF', tag: 'Famille' },
  { name: 'Les Gets / Morzine', region: 'Haute-Savoie', duration: '1h20', price: 'dès 48 CHF', tag: 'Frontalier' },
  { name: 'Zermatt', region: 'Valais', duration: '3h30', price: 'dès 95 CHF', tag: 'Premium' },
  { name: 'La Clusaz', region: 'Haute-Savoie', duration: '1h30', price: 'dès 55 CHF', tag: 'Famille' },
  { name: 'Villars-Gryon', region: 'Vaud', duration: '1h45', price: 'dès 60 CHF', tag: 'Famille' },
];

const SLOTS = ['05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '16:00', '17:00', '18:00', '19:00'];

const VanSkiPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white" style={{ background: '#F8F7F2', paddingBottom: 96 }}>
      <header style={{ background: GOLD, padding: '0 5%', height: 56, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#0A0A0A', padding: 4 }}>
          <ArrowLeft size={22} />
        </button>
        <CabyLogo size={28} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.7)', marginLeft: 8 }}>Caby Ski</span>
      </header>

      <div style={{ background: '#0A0A0A', color: '#fff', padding: '40px 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>
            <Snowflake size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            Saison hiver · Genève → Alpes
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.15 }}>
            Aux pistes en van, sans stress et sans voiture
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
            Skis et snowboard inclus, créneaux matinaux dès 5h30, retour en fin de journée.
            Toutes les grandes stations CH et FR au départ de Genève.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 5%' }}>
        {/* Tarif équipement */}
        <section style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #E0DDD5', marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          {[
            { icon: '🎿', label: 'Skis (paire)', price: '+15 CHF' },
            { icon: '🏂', label: 'Snowboard', price: '+15 CHF' },
            { icon: '👢', label: 'Chaussures + casque', price: 'Inclus' },
            { icon: '🎒', label: 'Sac de ski', price: 'Inclus' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center', padding: 12 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 12, color: '#888780', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>{item.price}</div>
            </div>
          ))}
        </section>

        {/* Stations */}
        <section style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E0DDD5', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0A0A0A', margin: '0 0 14px' }}>Stations desservies</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
            {STATIONS.map(s => (
              <button
                key={s.name}
                onClick={() => navigate(`/caby/van?destination=${encodeURIComponent(s.name)}`)}
                style={{
                  textAlign: 'left',
                  background: '#F8F7F2',
                  border: '1px solid #E0DDD5',
                  borderRadius: 10,
                  padding: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0A0A0A' }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#888780' }}>{s.region}</div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 4, background: '#0A0A0A', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {s.tag}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginTop: 6 }}>
                  <span style={{ color: '#888780', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} />{s.duration}
                  </span>
                  <span style={{ color: GOLD, fontWeight: 700 }}>{s.price}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Créneaux */}
        <section style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E0DDD5', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0A0A0A', margin: '0 0 6px' }}>Créneaux ski (week-ends & vacances)</h2>
          <p style={{ fontSize: 12, color: '#888780', margin: '0 0 14px' }}>Aller tôt le matin, retour en fin de journée — adapté aux horaires des remontées mécaniques.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SLOTS.map(t => (
              <span key={t} style={{ background: '#F8F7F2', border: '1px solid #E0DDD5', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#0A0A0A' }}>
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* Inclus */}
        <section style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E0DDD5', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0A0A0A', margin: '0 0 14px' }}>Ce qui est inclus</h2>
          {[
            'Pneus hiver et chaînes obligatoires fournies',
            'Chauffeur expérimenté en conduite montagne',
            'Wi-Fi et prises USB à bord',
            'Soute spacieuse pour skis, snowboard et bagages',
            'Suivi en temps réel de votre van',
            'Annulation gratuite jusqu\'à 24h avant (Flex Pass : 2h)',
          ].map(t => (
            <div key={t} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#3A3A3A', padding: '6px 0' }}>
              <Check size={16} color={GOLD} style={{ flexShrink: 0, marginTop: 2 }} />
              {t}
            </div>
          ))}
        </section>

        {/* CTA */}
        <section style={{ background: '#0A0A0A', color: '#fff', borderRadius: 12, padding: 24, textAlign: 'center' }}>
          <Package size={28} color={GOLD} style={{ marginBottom: 8 }} />
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
            Réservez votre van vers les pistes
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '0 0 16px' }}>
            Forfaits famille et groupes (jusqu'à 7 passagers) disponibles
          </p>
          <button
            onClick={() => navigate('/caby/van')}
            style={{ padding: '12px 22px', background: GOLD, color: '#0A0A0A', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Choisir une station
          </button>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default VanSkiPage;
