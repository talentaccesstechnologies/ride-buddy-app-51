import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MessageCircle, Clock, MapPin, ChevronRight, HelpCircle } from 'lucide-react';

const GOLD = '#A07830';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [openCategory, setOpenCategory] = useState<string | null>('reservation');

  const categories = [
    {
      id: 'reservation',
      title: 'Ma réservation',
      description: 'Modifier, annuler ou trouver une réservation existante',
      options: [
        { label: 'Gérer ma réservation', to: '/caby/account/reservations' },
        { label: 'Demander un remboursement', to: '/caby/account/help' },
        { label: 'Modifier les coordonnées passager', to: '/caby/account/reservations' },
      ],
    },
    {
      id: 'trip',
      title: 'Pendant mon trajet',
      description: 'Suivi en temps réel et assistance pendant la course',
      options: [
        { label: 'Suivre ma course en direct', to: '/caby/trip' },
        { label: 'Contacter mon chauffeur', to: '/caby/trip' },
        { label: 'Signaler un problème de conduite', to: '/caby/account/help' },
      ],
    },
    {
      id: 'baggage',
      title: 'Bagages & objets oubliés',
      description: 'Politique bagages et déclaration d\'objet perdu',
      options: [
        { label: 'Politique bagages Caby Van', to: '/caby/van/bagages' },
        { label: 'Objet oublié dans la voiture', to: '/caby/account/help' },
      ],
    },
    {
      id: 'account',
      title: 'Compte & paiement',
      description: 'Connexion, facturation et abonnements',
      options: [
        { label: 'Caby Pass — abonnement', to: '/caby/pass' },
        { label: 'Mon portefeuille', to: '/caby/account/wallet' },
        { label: 'Paramètres du compte', to: '/caby/account/settings' },
      ],
    },
    {
      id: 'safety',
      title: 'Sécurité & urgence',
      description: 'Outils de sécurité et signalement d\'incident',
      options: [
        { label: 'Centre de sécurité', to: '/caby/account/safety' },
        { label: 'Contacts de confiance', to: '/caby/account/safety/contacts' },
        { label: 'Vérifier mon trajet', to: '/caby/account/safety/verify' },
      ],
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EC', fontFamily: "'Inter', system-ui, sans-serif", color: '#0A0A0A' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #E0DDD5', padding: '14px 5%', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center' }}
          aria-label="Retour"
        >
          <ArrowLeft size={20} />
        </button>
        <CabyLogo size={28} />
        <div style={{ marginLeft: 'auto', fontSize: 13, color: '#666' }}>Centre d'aide › Contactez-nous</div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 5%' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: GOLD, marginBottom: 10 }}>
            CENTRE D'AIDE
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, marginBottom: 10, lineHeight: 1.15 }}>
            Contactez-nous
          </h1>
          <p style={{ fontSize: 16, color: '#444', maxWidth: 720, lineHeight: 1.5, margin: 0 }}>
            Avant de nous contacter, sélectionnez la rubrique correspondant à votre demande. La plupart des questions trouvent une réponse immédiate.
          </p>
        </div>

        {/* Quick contact bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 36 }}>
          <a
            href="tel:+41225000000"
            style={{ background: '#fff', border: '1px solid #E0DDD5', borderRadius: 10, padding: 18, display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', color: '#0A0A0A' }}
          >
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${GOLD}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Phone size={20} color={GOLD} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>+41 22 500 00 00</div>
              <div style={{ fontSize: 12, color: '#666' }}>Lun–Dim, 6h–23h</div>
            </div>
          </a>
          <a
            href="mailto:support@caby.ch"
            style={{ background: '#fff', border: '1px solid #E0DDD5', borderRadius: 10, padding: 18, display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', color: '#0A0A0A' }}
          >
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${GOLD}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Mail size={20} color={GOLD} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>support@caby.ch</div>
              <div style={{ fontSize: 12, color: '#666' }}>Réponse sous 24h</div>
            </div>
          </a>
          <button
            onClick={() => navigate('/caby/account/inbox')}
            style={{ background: '#fff', border: '1px solid #E0DDD5', borderRadius: 10, padding: 18, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
          >
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${GOLD}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageCircle size={20} color={GOLD} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0A0A0A' }}>Messagerie</div>
              <div style={{ fontSize: 12, color: '#666' }}>Chat avec le support</div>
            </div>
          </button>
        </div>

        {/* Categories */}
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Sélectionnez votre demande</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {categories.map(cat => {
            const isOpen = openCategory === cat.id;
            return (
              <div key={cat.id} style={{ background: '#fff', border: '1px solid #E0DDD5', borderRadius: 10, overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenCategory(isOpen ? null : cat.id)}
                  style={{ width: '100%', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                >
                  <HelpCircle size={20} color={GOLD} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0A0A0A' }}>{cat.title}</div>
                    <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{cat.description}</div>
                  </div>
                  <ChevronRight size={18} style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', color: '#999' }} />
                </button>
                {isOpen && (
                  <div style={{ borderTop: '1px solid #F0EBE0', padding: '8px 22px 14px 56px', display: 'flex', flexDirection: 'column' }}>
                    {cat.options.map(opt => (
                      <button
                        key={opt.label}
                        onClick={() => navigate(opt.to)}
                        style={{ padding: '10px 0', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, color: GOLD, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        {opt.label} <ChevronRight size={14} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div style={{ marginTop: 40, padding: 22, background: '#fff', border: '1px solid #E0DDD5', borderRadius: 10, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <MapPin size={20} color={GOLD} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Talent Access Technologies SA</div>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>
              Genève, Suisse · <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Support disponible 7j/7 de 6h à 23h
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
