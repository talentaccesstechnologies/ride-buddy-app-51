import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Search, Phone, Mail, Check } from 'lucide-react';
import { findArticle, HELP_CATEGORIES } from '@/lib/helpContent';

const GOLD = '#A07830';
const CREAM = '#F5F2EC';

const HelpArticlePage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const found = findArticle(slug);

  if (!found) {
    return (
      <div style={{ minHeight: '100vh', background: CREAM, padding: 80, textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>Article introuvable</h1>
        <button onClick={() => navigate('/caby/help')} style={{ padding: '10px 20px', background: GOLD, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>
          Retour au centre d'aide
        </button>
      </div>
    );
  }

  const { article, category } = found;
  const related = (article.relatedSlugs || []).map(s => findArticle(s)).filter(Boolean);

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

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 5% 60px' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
          <button onClick={() => navigate('/caby/help')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: GOLD, fontFamily: 'inherit', fontSize: 13 }}>Aide</button>
          <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 4px' }} />
          <span>{category.title}</span>
          <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 4px' }} />
          <span style={{ color: '#0A0A0A', fontWeight: 600 }}>{article.title}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'flex-start' }}>
          {/* Article content */}
          <main>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, marginBottom: 12, lineHeight: 1.2 }}>{article.title}</h1>
            <p style={{ fontSize: 16, color: '#444', lineHeight: 1.5, marginBottom: 28 }}>{article.intro}</p>

            {article.sections.map((s, i) => (
              <section key={i} style={{ marginBottom: 24, padding: '20px 24px', background: '#fff', border: '1px solid #E0DDD5', borderRadius: 8 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 10, color: GOLD }}>{s.heading}</h2>
                <p style={{ fontSize: 14.5, color: '#222', lineHeight: 1.6, margin: 0 }}>{s.body}</p>
                {s.bullets && (
                  <ul style={{ margin: '12px 0 0 0', padding: 0, listStyle: 'none' }}>
                    {s.bullets.map((b, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0', fontSize: 14, color: '#222' }}>
                        <Check size={16} color={GOLD} style={{ marginTop: 2, flexShrink: 0 }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {article.cta && (
              <button
                onClick={() => navigate(article.cta!.to)}
                style={{ marginTop: 8, padding: '14px 28px', background: GOLD, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                {article.cta.label} <ChevronRight size={18} />
              </button>
            )}

            {/* Related articles */}
            {related.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Articles liés</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {related.map((r: any) => (
                    <button
                      key={r.article.slug}
                      onClick={() => navigate(`/caby/help/article/${r.article.slug}`)}
                      style={{ background: '#fff', border: '1px solid #E0DDD5', borderRadius: 6, padding: '14px 18px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>{r.article.title}</div>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{r.category.title}</div>
                      </div>
                      <ChevronRight size={18} color={GOLD} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Sidebar : aide & conseils */}
          <aside>
            <div style={{ background: '#fff', border: '1px solid #E0DDD5', borderRadius: 8, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Aide & conseils</div>
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <input
                  placeholder="ex : Bagages"
                  onKeyDown={e => {
                    if (e.key === 'Enter') navigate('/caby/help');
                  }}
                  style={{ width: '100%', padding: '10px 36px 10px 12px', fontSize: 13, border: `1.5px solid ${GOLD}`, borderRadius: 6, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                />
                <Search size={14} color={GOLD} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <div style={{ borderTop: '1px solid #F0EBE0', paddingTop: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Catégories</div>
                {HELP_CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => navigate('/caby/help')}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 0', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: c.id === category.id ? GOLD : '#444', fontFamily: 'inherit', fontWeight: c.id === category.id ? 700 : 500 }}
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div style={{ background: GOLD, borderRadius: 8, padding: 18, color: '#fff' }}>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Besoin d'aide ?</div>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 12 }}>Support 7j/7 · 6h–23h</div>
              <a href="tel:+41225000000" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: 6, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                <Phone size={14} /> +41 22 500 00 00
              </a>
              <button
                onClick={() => navigate('/caby/help/contact')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, width: '100%', fontFamily: 'inherit' }}
              >
                <Mail size={14} /> Nous contacter
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default HelpArticlePage;
