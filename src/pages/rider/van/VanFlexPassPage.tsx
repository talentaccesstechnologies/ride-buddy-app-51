import CabyLogo from '@/components/shared/CabyLogo';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Clock, CreditCard, Check, X } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';

const GOLD = '#C9A84C';

const VanFlexPassPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white" style={{ background: '#F8F7F2', paddingBottom: 96 }}>
      <header style={{ background: GOLD, padding: '0 5%', height: 56, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#0A0A0A', padding: 4 }}>
          <ArrowLeft size={22} />
        </button>
        <CabyLogo size={28} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.7)', marginLeft: 8 }}>Annulation flexible</span>
      </header>

      <div style={{ background: '#0A0A0A', color: '#fff', padding: '40px 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>
            Flex Pass
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.15 }}>
            Voyagez l'esprit libre
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
            Modifiez la date, l'heure ou la destination de votre trajet sans frais jusqu'à 2h avant le départ.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 5%' }}>
        {/* Avantages */}
        <section style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E0DDD5', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0A0A0A', margin: '0 0 16px' }}>Vos avantages avec Flex Pass</h2>
          {[
            { icon: <RefreshCw size={18} />, title: 'Modification illimitée', desc: 'Date, heure, destination — autant de fois que vous le souhaitez' },
            { icon: <Clock size={18} />, title: 'Jusqu\'à 2h avant le départ', desc: 'Pas de frais de modification ni de pénalité' },
            { icon: <CreditCard size={18} />, title: 'Remboursement intégral', desc: 'Annulation > 48h avant : 100% remboursé' },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', gap: 14, padding: '14px 0', borderTop: '1px solid #F0EDE5' }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: '#F8F7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0A0A0A', marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#888780', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Tableau remboursement */}
        <section style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E0DDD5', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0A0A0A', margin: '0 0 14px' }}>Politique de remboursement</h2>
          <div style={{ overflow: 'hidden', borderRadius: 8, border: '1px solid #E0DDD5' }}>
            {[
              { delai: 'Plus de 48h avant', sansFlex: '80%', avecFlex: '100%' },
              { delai: '24h à 48h avant', sansFlex: '50%', avecFlex: '100%' },
              { delai: '2h à 24h avant', sansFlex: '20%', avecFlex: '100%' },
              { delai: 'Moins de 2h', sansFlex: '0%', avecFlex: '50% en crédits' },
            ].map((row, i) => (
              <div key={row.delai} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', padding: '12px 14px', background: i % 2 === 0 ? '#F8F7F2' : '#fff', fontSize: 13 }}>
                <div style={{ color: '#0A0A0A', fontWeight: 600 }}>{row.delai}</div>
                <div style={{ color: '#888780', textAlign: 'center' }}>{row.sansFlex}</div>
                <div style={{ color: GOLD, fontWeight: 700, textAlign: 'center' }}>{row.avecFlex}</div>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', padding: '10px 14px', background: '#0A0A0A', color: '#fff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <div>Délai d'annulation</div>
              <div style={{ textAlign: 'center' }}>Tarif standard</div>
              <div style={{ textAlign: 'center', color: GOLD }}>Avec Flex Pass</div>
            </div>
          </div>
        </section>

        {/* Inclus / non inclus */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 16 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #E0DDD5' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0A0A0A', margin: '0 0 10px' }}>✓ Couvert par Flex Pass</h3>
            {['Changement de date', 'Changement d\'horaire', 'Changement de destination', 'Annulation gratuite > 48h', 'Crédits valables 12 mois'].map(t => (
              <div key={t} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#3A3A3A', padding: '5px 0' }}>
                <Check size={16} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                {t}
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #E0DDD5' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0A0A0A', margin: '0 0 10px' }}>✗ Non couvert</h3>
            {['No-show (absence non signalée)', 'Modifications < 2h avant départ', 'Annulation due au passager <2h', 'Frais bagages déjà payés'].map(t => (
              <div key={t} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#3A3A3A', padding: '5px 0' }}>
                <X size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                {t}
              </div>
            ))}
          </div>
        </section>

        {/* Prix */}
        <section style={{ background: '#0A0A0A', color: '#fff', borderRadius: 12, padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>
            Tarif
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: GOLD }}>+9 CHF</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>par trajet • à ajouter au moment du paiement</div>
          <button
            onClick={() => navigate('/caby/van')}
            style={{ marginTop: 18, padding: '12px 24px', background: GOLD, color: '#0A0A0A', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Réserver avec Flex Pass
          </button>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default VanFlexPassPage;
