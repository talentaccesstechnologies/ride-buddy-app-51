import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/rider/BottomNav';

interface ServiceItem {
  id: string;
  title: string;
  desc: string;
  badge?: string;
  badgeColor?: string;
  image: string;
  route: string;
}

interface ServiceCategory {
  label: string;
  emoji: string;
  items: ServiceItem[];
}

const categories: ServiceCategory[] = [
  {
    label: 'MOBILITÉ URBAINE',
    emoji: '🚗',
    items: [
      {
        id: 'ride',
        title: 'Caby Ride',
        desc: 'Course classique avec chauffeur privé',
        badge: 'Populaire',
        badgeColor: 'bg-primary text-primary-foreground',
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80',
        route: '/caby/search',
      },
      {
        id: 'tricycle',
        title: 'Caby Tricycle',
        desc: 'Tricycle électrique 2 places · Centre-ville',
        badge: 'Éco',
        badgeColor: 'bg-emerald-500 text-white',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
        route: '/caby/search',
      },
      {
        id: 'van',
        title: 'Caby Van',
        desc: 'Groupes & sorties · Jusqu\'à 7 passagers',
        image: 'https://images.unsplash.com/photo-1609520778163-a16fb3862581?w=800&q=80',
        route: '/caby/search',
      },
      {
        id: 'moto',
        title: 'Caby Moto',
        desc: 'Le trajet le plus rapide · Casque inclus',
        badge: 'Express',
        badgeColor: 'bg-orange-500 text-white',
        image: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=800&q=80',
        route: '/caby/search',
      },
    ],
  },
  {
    label: 'SANTÉ & SOINS',
    emoji: '🏥',
    items: [
      {
        id: 'care',
        title: 'Caby Care',
        desc: 'Transport médical · Hôpitaux & centres médicaux',
        badge: 'Certifié',
        badgeColor: 'bg-red-500 text-white',
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
        route: '/caby/search',
      },
      {
        id: 'health',
        title: 'Caby Health Logistix',
        desc: 'Analyses entre hôpitaux & laboratoires',
        badge: 'Chaîne du froid',
        badgeColor: 'bg-sky-500 text-white',
        image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80',
        route: '/caby/search',
      },
      {
        id: 'vet',
        title: 'Caby Vet',
        desc: 'Transport vétérinaire · Cliniques & urgences',
        badge: 'Soins animaux',
        badgeColor: 'bg-pink-500 text-white',
        image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80',
        route: '/caby/search',
      },
    ],
  },
  {
    label: 'ÉDUCATION & ENTREPRISES',
    emoji: '🎓',
    items: [
      {
        id: 'school',
        title: 'Caby School',
        desc: 'Transport scolaire sécurisé · Suivi parental',
        badge: 'Suivi parental',
        badgeColor: 'bg-amber-500 text-white',
        image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
        route: '/caby/search',
      },
      {
        id: 'business',
        title: 'Caby Business',
        desc: 'PME & entreprises · Facturation centralisée',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        route: '/caby/search',
      },
    ],
  },
  {
    label: 'LIVRAISON PRO',
    emoji: '📦',
    items: [
      {
        id: 'express',
        title: 'Caby Express',
        desc: 'Colis e-commerce, plis & livraisons classiques',
        badge: 'Express 30 min',
        badgeColor: 'bg-primary text-primary-foreground',
        image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80',
        route: '/caby/express',
      },
    ],
  },
  {
    label: 'SERVICES PREMIUM',
    emoji: '⭐',
    items: [
      {
        id: 'secure',
        title: 'Caby Secure',
        desc: 'Clés, passeports, contrats · Ultra-sécurisé',
        badge: 'Certifié Caby',
        badgeColor: 'bg-[hsl(43,75%,52%)] text-black',
        image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80',
        route: '/caby/search',
      },
      {
        id: 'gourmet',
        title: 'Caby Gourmet',
        desc: 'Vins fins & spiritueux · Cavistes partenaires',
        badge: 'Certifié Caby',
        badgeColor: 'bg-[hsl(43,75%,52%)] text-black',
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
        route: '/caby/search',
      },
      {
        id: 'laundry',
        title: 'Caby Laundry',
        desc: 'Pressing à domicile · Matin → soir',
        badge: 'Certifié Caby',
        badgeColor: 'bg-[hsl(43,75%,52%)] text-black',
        image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&q=80',
        route: '/caby/search',
      },
      {
        id: 'pet',
        title: 'Caby Pet',
        desc: 'Transport d\'animaux · Vétérinaire & toilettage',
        badge: 'Certifié Caby',
        badgeColor: 'bg-[hsl(43,75%,52%)] text-black',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
        route: '/caby/search',
      },
      {
        id: 'concierge',
        title: 'Caby Concierge',
        desc: 'Click & Collect de luxe · Personal Shopper',
        badge: 'Certifié Caby',
        badgeColor: 'bg-[hsl(43,75%,52%)] text-black',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
        route: '/caby/search',
      },
    ],
  },
];

const ServiceCard: React.FC<{ service: ServiceItem; index: number; onTap: () => void }> = ({ service, index, onTap }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04, duration: 0.3 }}
    whileTap={{ scale: 0.98 }}
    onClick={onTap}
    className="relative w-full h-[140px] rounded-2xl overflow-hidden shadow-lg group text-left"
  >
    {/* Background image */}
    <img
      src={service.image}
      alt={service.title}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
    />

    {/* Dark overlay with gold tint */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
    <div className="absolute inset-0 bg-[hsl(43,75%,52%)]/5" />

    {/* Badge */}
    {service.badge && (
      <div className="absolute top-3 left-3">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${service.badgeColor || 'bg-primary text-primary-foreground'}`}>
          {service.badge}
        </span>
      </div>
    )}

    {/* Content */}
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <h3 className="text-base font-bold text-white">{service.title}</h3>
      <p className="text-[11px] text-white/70 mt-0.5 line-clamp-1">{service.desc}</p>
    </div>
  </motion.button>
);

const CategoryHeader: React.FC<{ emoji: string; label: string }> = ({ emoji, label }) => (
  <div className="flex items-center gap-3 mb-3">
    <span className="text-lg">{emoji}</span>
    <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[hsl(43,75%,52%)]">{label}</h2>
    <div className="flex-1 h-px bg-gradient-to-r from-[hsl(43,75%,52%)]/40 to-transparent" />
  </div>
);

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-14 pb-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Services</h1>
          <p className="text-sm text-muted-foreground mb-8">Notre gamme complète de mobilité premium</p>
        </motion.div>

        <div className="space-y-8">
          {categories.map((cat) => (
            <section key={cat.label}>
              <CategoryHeader emoji={cat.emoji} label={cat.label} />
              <div className="space-y-3">
                {cat.items.map((s, i) => (
                  <ServiceCard
                    key={s.id}
                    service={s}
                    index={i}
                    onTap={() => navigate(s.route)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Trust banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex items-center gap-3 rounded-2xl border border-[hsl(43,75%,52%)]/20 bg-[hsl(43,75%,52%)]/5 p-4"
        >
          <ShieldCheck className="w-8 h-8 text-[hsl(43,75%,52%)] flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Tous nos services sont certifiés Caby</p>
            <p className="text-xs text-muted-foreground mt-0.5">Chauffeurs salariés · Assurances professionnelles · Conformité LTVTC Genève</p>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ServicesPage;
