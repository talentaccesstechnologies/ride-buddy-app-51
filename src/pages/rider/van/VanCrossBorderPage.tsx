import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Shield, Users, Clock, Check } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';

const GOLD = '#C9A84C';

const ROUTES = [
  { from: 'Annemasse', to: 'Genève', duration: '25 min', price: 'dès 8 CHF', daily: true },
  { from: 'Annecy', to: 'Genève', duration: '50 min', price: 'dès 14 CHF', daily: true },
  { from: 'Saint-Julien', to: 'Genève', duration: '20 min', price: 'dès 7 CHF', daily: true },
  { from: 'Thonon-les-Bains', to: 'Genève', duration: '40 min', price: 'dès 12 CHF', daily: true },
  { from: 'Évian', to: 'Genève', duration: '50 min', price: 'dès 16 CHF', daily: false },
  { from: 'Gex / Pays de Gex', to: 'Genève', duration: '30 min', price: 'dès 9 CHF', daily: true },
];

const VanCrossBorderPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white" style={{ background: '#F8F7F2', paddingBottom: 96 }}>
      <header style={{ background: GOLD, padding: '0 5%', height: 56, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#0A0A0A', padding: 4 }}>
          <ArrowLeft size={22} />
        </button>
        <CabyLogo size={28} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.7)', marginLeft: 8 }}>Cross-Border</span>
      </header>

      <div style={{ background: '#0A0A0A', color: '#fff', padding: '40px 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>
            Covoiturage Frontalier · Grand Genève
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.15 }}>
            Traversez la frontière sans stress, à prix coûtant
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
            Pour les 112'000 frontaliers entre la Haute-Savoie, l'Ain et Genève.
            Service de cost-sharing 100% conforme à la loi suisse, assuré par Wakam.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 5%' }}>
        {/* Avantages */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
          {[
            { icon: <Globe size={20} />, title: 'CH ↔ FR', desc: 'Annemasse, Annecy, Gex, Thonon, Évian, Saint-Julien…' },
            { icon: <Clock size={20} />, title: 'Départs réguliers', desc: 'Toutes les 30 min aux heures de pointe' },
            { icon: <Shield size={20} />, title: 'Assurance Wakam', desc: 'Couverture passagers + 2.50 CHF taxe incluse' },
            { icon: <Users size={20} />, title: 'Cost-sharing légal', desc: 'Tarif limité à 130% du coût réel · LSE conforme' },
          ].map(a => (
            <div key={a.title} style={{ background: '#fff', borderRadius: 12, padding: 18, border: '1px solid #E0DDD5' }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: '#F8F7F2', color: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>{a.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0A0A0A', marginBottom: 4 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: '#888780', lineHeight: 1.5 }}>{a.desc}</div>
            </div>
          ))}
        </section>

        {/* Routes populaires */}
        <section style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E0DDD5', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0A0A0A', margin: 0 }}>Routes les plus empruntées</h2>
            <button onClick={() => navigate('/caby/van')} style={{ background: 'transparent', border: 'none', color: GOLD, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Réserver →
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {ROUTES.map(r => (
              <button
                key={`${r.from}-${r.to}`}
                onClick={() => navigate(`/caby/van?destination=${encodeURIComponent(r.from)}`)}
                style={{
                  textAlign: 'left',
                  background: '#F8F7F2',
                  border: '1px solid #E0DDD5',
                  borderRadius: 10,
                  padding: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A' }}>
                  {r.from} → {r.to}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#888780' }}>
                  <span>{r.duration}</span>
                  <span style={{ color: GOLD, fontWeight: 700 }}>{r.price}</span>
                </div>
                {r.daily && (
                  <div style={{ fontSize: 10, color: '#10B981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Quotidien · Pendulaire
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Cadre légal */}
        <section style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E0DDD5', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0A0A0A', margin: '0 0 14px' }}>Cadre légal & assurance</h2>
          {[
            'Service de cost-sharing : tarif plafonné à 130% du coût réel (carburant, péage, usure)',
            'Conforme à la LSE (Loi sur le Service de l\'Emploi) et LTVTC Genève',
            'Assurance passagers Wakam incluse dans chaque trajet (taxe forfaitaire 2.50 CHF)',
            'Documents requis : CNI ou Passeport en cours de validité (CH ou UE)',
            'Aucun travail dissimulé : le chauffeur n\'est pas rémunéré au-delà du partage des frais',
          ].map(t => (
            <div key={t} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#3A3A3A', padding: '7px 0' }}>
              <Check size={16} color={GOLD} style={{ flexShrink: 0, marginTop: 2 }} />
              {t}
            </div>
          ))}
        </section>

        {/* CTA */}
        <section style={{ background: '#0A0A0A', color: '#fff', borderRadius: 12, padding: 24, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
            Frontalier ? Économisez avec un abonnement
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '0 0 16px' }}>
            Trajets illimités sur votre route à partir de 299 CHF/mois
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/caby/van/pass')}
              style={{ padding: '12px 22px', background: GOLD, color: '#0A0A0A', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Voir les abonnements
            </button>
            <button
              onClick={() => navigate('/caby/van')}
              style={{ padding: '12px 22px', background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Réserver un trajet
            </button>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default VanCrossBorderPage;
