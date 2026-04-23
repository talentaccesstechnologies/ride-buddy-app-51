import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, BookmarkCheck, Luggage, Car, Tag, ShieldAlert, ChevronRight, Mail, Phone } from 'lucide-react';
import { HELP_CATEGORIES, HELP_FAQ_QUICK, type HelpCategory } from '@/lib/helpContent';

const GOLD = '#A07830';
const CREAM = '#F5F2EC';

const ICON_MAP = {
  BookmarkCheck,
  Luggage,
  Car,
  Tag,
  ShieldAlert,
} as const;

const HelpCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState<HelpCategory | null>(null);
  const [query, setQuery] = useState('');

  const allArticles = useMemo(
    () => HELP_CATEGORIES.flatMap(c => c.articles.map(a => ({ ...a, categoryTitle: c.title, categoryId: c.id }))),
    []
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allArticles.filter(a => a.title.toLowerCase().includes(q) || a.intro.toLowerCase().includes(q)).slice(0, 6);
  }, [query, allArticles]);

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: "'Inter', system-ui, sans-serif", color: '#0A0A0A' }}>
      {/* Top header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #E0DDD5', padding: '14px 5%', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center' }} aria-label="Retour">
          <ArrowLeft size={20} />
        </button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px' }}>caby</div>
        <nav style={{ marginLeft: 'auto', display: 'flex', gap: 24, fontSize: 13, fontWeight: 600 }}>
          <button onClick={() => navigate('/caby/account/reservations')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#0A0A0A', fontFamily: 'inherit', fontWeight: 600, fontSize: 13 }}>Vos réservations</button>
          <button onClick={() => navigate('/caby/help/contact')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: GOLD, fontFamily: 'inherit', fontWeight: 700, fontSize: 13 }}>Aide</button>
        </nav>
      </header>

      {/* Gold band */}
      <div style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #C9A14A 100%)`, height: 80 }} />

      {/* Search section */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 5% 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'flex-start', marginBottom: 32 }}>
          {/* Left : search */}
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, marginBottom: 18, lineHeight: 1.15 }}>
              Comment pouvons-nous vous aider ?
            </h1>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Trouvons ce dont vous avez besoin…"
                style={{
                  width: '100%',
                  padding: '16px 56px 16px 20px',
                  fontSize: 15,
                  border: `1.5px solid ${GOLD}`,
                  borderRadius: 8,
                  fontFamily: 'inherit',
                  background: '#fff',
                  outline: 'none',
                }}
              />
              <button
                style={{
                  position: 'absolute',
                  right: 6,
                  top: 6,
                  bottom: 6,
                  width: 48,
                  background: GOLD,
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Rechercher"
              >
                <Search size={18} color="#fff" />
              </button>

              {filtered.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, background: '#fff', border: '1px solid #E0DDD5', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', zIndex: 10, overflow: 'hidden' }}>
                  {filtered.map(a => (
                    <button
                      key={a.slug}
                      onClick={() => navigate(`/caby/help/article/${a.slug}`)}
                      style={{ width: '100%', padding: '12px 16px', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: '1px solid #F0EBE0', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{a.title}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>{a.categoryTitle}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ marginTop: 14, fontSize: 13, color: '#555' }}>
              Recherches les plus populaires :{' '}
              <button onClick={() => navigate('/caby/help/trafic')} style={{ color: GOLD, textDecoration: 'underline', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>dernières infos de trajet</button>,{' '}
              <button onClick={() => navigate('/caby/help/article/grande-valise')} style={{ color: GOLD, textDecoration: 'underline', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>bagages</button>,{' '}
              <button onClick={() => navigate('/caby/help/article/annulation')} style={{ color: GOLD, textDecoration: 'underline', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>annuler un trajet</button>
            </div>
          </div>

          {/* Right : trafic widget */}
          <aside style={{ background: '#fff', border: '1px solid #E0DDD5', borderRadius: 8, padding: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Suivi de trajet</div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 14 }}>Consulter le statut du réseau Caby Van</div>
            <button
              onClick={() => navigate('/caby/help/trafic')}
              style={{ width: '100%', padding: 12, background: GOLD, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}
            >
              Consulter
            </button>
          </aside>
        </div>

        {/* 5 categories cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: activeCat ? 0 : 40 }}>
          {HELP_CATEGORIES.map(cat => {
            const Icon = ICON_MAP[cat.iconName];
            const isActive = activeCat?.id === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCat(isActive ? null : cat)}
                style={{
                  position: 'relative',
                  background: isActive ? GOLD : '#fff',
                  border: `2px solid ${isActive ? GOLD : '#E0DDD5'}`,
                  borderRadius: 8,
                  padding: '28px 12px 36px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={48} color={isActive ? '#fff' : '#0A0A0A'} strokeWidth={1.5} />
                <div style={{ marginTop: 14, fontSize: 14, fontWeight: 700, color: isActive ? '#fff' : '#0A0A0A' }}>{cat.title}</div>
                {isActive && (
                  <div style={{ position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: `14px solid ${GOLD}` }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Active category sub-links */}
        {activeCat && (
          <div style={{ marginTop: 28, marginBottom: 40, padding: '24px 28px', background: '#fff', border: '1px solid #E0DDD5', borderRadius: 8 }}>
            <div style={{ display: 'inline-block', background: GOLD, color: '#fff', padding: '6px 16px', borderRadius: 4, fontSize: 13, fontWeight: 700, marginBottom: 18 }}>
              {activeCat.title}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px 32px' }}>
              {activeCat.articles.map(art => (
                <button
                  key={art.slug}
                  onClick={() => navigate(`/caby/help/article/${art.slug}`)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, color: GOLD, fontSize: 14, fontWeight: 600, textDecoration: 'underline', fontFamily: 'inherit' }}
                >
                  {art.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAQ block (gold band, like easyJet orange) */}
        <div style={{ background: GOLD, borderRadius: 8, padding: '24px 28px', marginBottom: 40 }}>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 800, marginBottom: 18 }}>Questions les plus fréquentes…</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {HELP_FAQ_QUICK.map(faq => (
              <button
                key={faq.title}
                onClick={() => navigate(faq.to)}
                style={{ background: '#fff', border: 'none', padding: '18px 20px', borderRadius: 6, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'flex-start', gap: 12 }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: GOLD, marginBottom: 6 }}>{faq.title}</div>
                  <div style={{ fontSize: 13, color: '#444', lineHeight: 1.4 }}>{faq.desc}</div>
                </div>
                <ChevronRight size={18} color={GOLD} style={{ flexShrink: 0, marginTop: 2 }} />
              </button>
            ))}
          </div>
        </div>

        {/* Contact band */}
        <div style={{ background: '#fff', border: '1px solid #E0DDD5', borderRadius: 8, padding: 28, marginBottom: 60, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Vous n'avez pas trouvé de réponse ?</div>
            <div style={{ fontSize: 14, color: '#555' }}>Notre équipe support est disponible 7j/7 de 6h à 23h.</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="tel:+41225000000" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: '#fff', border: `1.5px solid ${GOLD}`, color: GOLD, borderRadius: 6, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              <Phone size={16} /> Appeler
            </a>
            <button onClick={() => navigate('/caby/help/contact')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: GOLD, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Mail size={16} /> Contactez-nous
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
