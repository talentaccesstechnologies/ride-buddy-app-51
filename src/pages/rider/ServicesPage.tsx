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
        image: 'https://images.unsplash.com/photo-1558442074-3c19857bc1dc?w=800&q=80',
        route: '/caby/search',
      },
      {
        id: 'van',
        title: 'Caby Van',
        desc: 'Groupes & sorties · Jusqu\'à 7 passagers',
        image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80',
        route: '/caby/search',
      },
      {
        id: 'moto',
        title: 'Caby Moto',
        desc: 'Le trajet le plus rapide · Casque inclus',
        badge: 'Express',
        badgeColor: 'bg-orange-500 text-white',
        image: 'https://images.unsplash.com/photo-1622185135505-2d795003994a?w=800&q=80',
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
        image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80',
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
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
        route: '/caby/search',
      },
      {
        id: 'business',
        title: 'Caby Business',
        desc: 'PME & entreprises · Facturation centralisée',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
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
        image: 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=800&q=80',
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
        image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80',
        route: '/caby/search',
      },
      {
        id: 'gourmet',
        title: 'Caby Gourmet',
        desc: 'Livraison repas gastronomiques · Restaurants partenaires',
        badge: 'Certifié Caby',
        badgeColor: 'bg-[hsl(43,75%,52%)] text-black',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
        route: '/caby/search',
      },
      {
        id: 'laundry',
        title: 'Caby Laundry',
        desc: 'Transport de vêtements sans plis · Pressing & retour',
        badge: 'Certifié Caby',
        badgeColor: 'bg-[hsl(43,75%,52%)] text-black',
        image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80',
        route: '/caby/search',
      },
      {
        id: 'pet',
        title: 'Caby Pet',
        desc: 'Transport d\'animaux de compagnie · Vétérinaire & toilettage',
        badge: 'Certifié Caby',
        badgeColor: 'bg-[hsl(43,75%,52%)] text-black',
        image: 'https://images.unsplash.com/photo-1583337130417-13104dec14a3?w=800&q=80',
        route: '/caby/search',
      },
      {
        id: 'concierge',
        title: 'Caby Concierge',
        desc: 'Shopping personnalisé · Votre chauffeur fait vos courses',
        badge: 'Certifié Caby',
        badgeColor: 'bg-[hsl(43,75%,52%)] text-black',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
        route: '/caby/search',
      },
    ],
  },
];

const ServiceCard: React.FC<{ service: ServiceItem; index: number; fullWidth?: boolean; onTap: () => void }> = ({ service, index, fullWidth, onTap }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04, duration: 0.3 }}
    whileTap={{ scale: 0.97 }}
    onClick={onTap}
    className={`relative aspect-square rounded-2xl overflow-hidden shadow-lg group text-left ${fullWidth ? 'col-span-2' : ''}`}
  >
    <img
      src={service.image}
      alt={service.title}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

    {service.badge && (
      <div className="absolute top-2.5 left-2.5">
        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${service.badgeColor || 'bg-primary text-primary-foreground'}`}>
          {service.badge}
        </span>
      </div>
    )}

    <div className="absolute bottom-0 left-0 right-0 p-3">
      <h3 className="text-sm font-bold text-white leading-tight">{service.title}</h3>
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
              <div className="grid grid-cols-2 gap-3">
                {cat.items.map((s, i) => {
                  const isLast = i === cat.items.length - 1;
                  const isOddTotal = cat.items.length % 2 !== 0;
                  return (
                    <ServiceCard
                      key={s.id}
                      service={s}
                      index={i}
                      fullWidth={isLast && isOddTotal}
                      onTap={() => navigate(s.route)}
                    />
                  );
                })}
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
