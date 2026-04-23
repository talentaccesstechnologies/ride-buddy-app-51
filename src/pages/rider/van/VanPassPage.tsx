import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Crown, Sparkles, Star } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';

const GOLD = '#C9A84C';

const PLANS = [
  {
    id: 'essentiel',
    name: 'Essentiel',
    price: 299,
    badge: null,
    desc: 'Pour les frontaliers réguliers sur une seule route',
    features: [
      'Trajets illimités sur 1 route Grand Genève',
      'Réservation prioritaire',
      'Badge Abonné',
      'Siège garanti à chaque départ',
    ],
    cta: 'Choisir Essentiel',
  },
  {
    id: 'flex',
    name: 'Flex',
    price: 449,
    badge: 'Le plus choisi',
    desc: 'Toutes les routes frontalières du Grand Genève',
    features: [
      'Trajets illimités toutes routes Grand Genève',
      'Annulation gratuite jusqu\'à 2h avant',
      'Modifications illimitées',
      'Siège garanti + Badge Flex',
      'Accès Flash Deals en avant-première',
    ],
    cta: 'Choisir Flex',
    highlight: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 599,
    badge: 'Premium',
    desc: 'L\'expérience complète, partout en Suisse',
    features: [
      'Trajets illimités toutes routes',
      'Siège premium (avant) garanti',
      'Bagages illimités inclus',
      'Accès ski & longue distance',
      'Support client dédié 24/7',
      'Caby Miles x2',
    ],
    cta: 'Choisir Premium',
  },
];

const VanPassPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white" style={{ background: '#F8F7F2', paddingBottom: 96 }}>
      <header style={{ background: GOLD, padding: '0 5%', height: 56, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#0A0A0A', padding: 4 }}>
          <ArrowLeft size={22} />
        </button>
        <CabyLogo size={28} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.7)', marginLeft: 8 }}>Caby Van Pass</span>
      </header>

      <div style={{ background: '#0A0A0A', color: '#fff', padding: '40px 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>
            Abonnement Caby Van
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.15 }}>
            Voyagez sans compter, économisez chaque mois
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
            3 formules pensées pour les frontaliers, voyageurs réguliers et amateurs de ski.
            Trajets illimités, sièges garantis, annulation flexible.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 5%' }}>
        {/* Plans */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
          {PLANS.map(plan => (
            <div
              key={plan.id}
              style={{
                background: plan.highlight ? '#0A0A0A' : '#fff',
                color: plan.highlight ? '#fff' : '#0A0A0A',
                borderRadius: 14,
                padding: 24,
                border: plan.highlight ? `2px solid ${GOLD}` : '1px solid #E0DDD5',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {plan.badge && (
                <div style={{ position: 'absolute', top: -12, left: 20, background: GOLD, color: '#0A0A0A', fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6 }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {plan.id === 'premium' && <Crown size={18} color={GOLD} />}
                {plan.id === 'flex' && <Sparkles size={18} color={GOLD} />}
                {plan.id === 'essentiel' && <Star size={18} color={GOLD} />}
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{plan.name}</h3>
              </div>
              <p style={{ fontSize: 12, color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#888780', margin: '0 0 16px', minHeight: 36 }}>{plan.desc}</p>

              <div style={{ marginBottom: 18 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 900, color: GOLD }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#888780', marginLeft: 4 }}>CHF/mois</span>
              </div>

              <div style={{ flex: 1, marginBottom: 16 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, fontSize: 13, padding: '5px 0', color: plan.highlight ? 'rgba(255,255,255,0.85)' : '#3A3A3A' }}>
                    <Check size={16} color={GOLD} style={{ flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/caby/van')}
                style={{
                  padding: '12px 16px',
                  background: plan.highlight ? GOLD : 'transparent',
                  color: plan.highlight ? '#0A0A0A' : '#0A0A0A',
                  border: plan.highlight ? 'none' : `1.5px solid ${GOLD}`,
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </section>

        {/* Comparatif */}
        <section style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E0DDD5', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0A0A0A', margin: '0 0 14px' }}>Combien j'économise ?</h2>
          <div style={{ overflow: 'hidden', borderRadius: 8, border: '1px solid #E0DDD5' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', padding: '10px 14px', background: '#0A0A0A', color: '#fff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <div>Profil</div>
              <div style={{ textAlign: 'center' }}>Sans Pass</div>
              <div style={{ textAlign: 'center', color: GOLD }}>Avec Pass</div>
            </div>
            {[
              { profil: 'Frontalier 20j/mois (Annemasse ↔ Genève)', sans: '720 CHF', avec: '299 CHF' },
              { profil: 'Voyageur 8j/mois (Lausanne, Annecy)', sans: '520 CHF', avec: '449 CHF' },
              { profil: 'Skieur intensif + business (Verbier, Zurich)', sans: '980 CHF', avec: '599 CHF' },
            ].map((row, i) => (
              <div key={row.profil} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', padding: '12px 14px', background: i % 2 === 0 ? '#F8F7F2' : '#fff', fontSize: 13 }}>
                <div style={{ color: '#0A0A0A', fontWeight: 600 }}>{row.profil}</div>
                <div style={{ color: '#888780', textAlign: 'center' }}>{row.sans}</div>
                <div style={{ color: GOLD, fontWeight: 700, textAlign: 'center' }}>{row.avec}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E0DDD5' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0A0A0A', margin: '0 0 14px' }}>Questions fréquentes</h2>
          {[
            { q: 'Engagement minimum ?', r: 'Aucun engagement. Résiliable à tout moment, effet le mois suivant.' },
            { q: 'Puis-je changer de formule ?', r: 'Oui, à tout moment depuis votre compte. Le nouveau tarif s\'applique au prochain cycle.' },
            { q: 'Un siège garanti, c\'est quoi ?', r: 'Vous avez la priorité de réservation 7 jours avant les non-abonnés, même sur les Flash Deals.' },
            { q: 'Le ski est-il inclus ?', r: 'Uniquement avec la formule Premium. Les autres formules permettent d\'acheter des trajets ski à tarif préférentiel (-15%).' },
          ].map(item => (
            <details key={item.q} style={{ borderTop: '1px solid #F0EDE5', padding: '12px 0' }}>
              <summary style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0A', cursor: 'pointer', listStyle: 'none' }}>{item.q}</summary>
              <p style={{ fontSize: 13, color: '#888780', margin: '8px 0 0', lineHeight: 1.5 }}>{item.r}</p>
            </details>
          ))}
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default VanPassPage;
