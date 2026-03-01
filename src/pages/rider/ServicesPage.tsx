import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, ChevronRight, Truck, Heart, GraduationCap, Building2, Package, Bike, Bus, Ambulance, FlaskConical, ShieldCheck, KeyRound, Wine, Shirt, PawPrint, ShoppingBag, Zap } from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';

interface ServiceItem {
  id: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  badge?: string;
  route: string | null;
}

interface ServiceCategory {
  label: string;
  emoji: string;
  items: ServiceItem[];
}

const categories: ServiceCategory[] = [
  {
    label: 'Mobilité Urbaine',
    emoji: '🚗',
    items: [
      { id: 'ride', icon: Car, title: 'Caby Ride', desc: 'Course classique avec chauffeur privé', badge: 'Populaire', route: '/caby/search' },
      { id: 'tricycle', icon: Bike, title: 'Caby Tricycle', desc: 'Tricycle électrique 2 places · Centre-ville', route: '/caby/search' },
      { id: 'van', icon: Bus, title: 'Caby Van', desc: 'Groupes & sorties · Jusqu\'à 7 passagers', route: '/caby/search' },
      { id: 'moto', icon: Zap, title: 'Caby Moto', desc: 'Le trajet le plus rapide · Casque & charlotte inclus', badge: 'Casque & Gants inclus', route: '/caby/search' },
    ],
  },
  {
    label: 'Santé & Soins',
    emoji: '🏥',
    items: [
      { id: 'care', icon: Ambulance, title: 'Caby Care', desc: 'Transport médical · Hôpitaux, centres médicaux & médecins', badge: 'Certifié Caby Safety', route: '/caby/search' },
      { id: 'health', icon: FlaskConical, title: 'Caby Health Logistix', desc: 'Transport d\'analyses entre hôpitaux & laboratoires (Unilabs, Dynalabs)', badge: 'Chaîne du froid garantie', route: '/caby/search' },
      { id: 'vet', icon: Heart, title: 'Caby Vet', desc: 'Transport vétérinaire · Cliniques & urgences animales', badge: 'Soins animaux', route: '/caby/search' },
    ],
  },
  {
    label: 'Éducation & Entreprises',
    emoji: '🎓',
    items: [
      { id: 'school', icon: GraduationCap, title: 'Caby School', desc: 'Crèches, écoles, collèges, lycées & universités du canton', badge: 'Suivi parental', route: '/caby/search' },
      { id: 'business', icon: Building2, title: 'Caby Business', desc: 'PME & entreprises sous contrat · Facturation centralisée', route: '/caby/search' },
    ],
  },
  {
    label: 'Livraison Pro',
    emoji: '📦',
    items: [
      { id: 'express', icon: Package, title: 'Caby Express', desc: 'Colis e-commerce (Zalando, Amazon, Temu…), plis & livraisons classiques', badge: 'Express 30 min', route: '/caby/express' },
    ],
  },
  {
    label: 'Services Premium',
    emoji: '✨',
    items: [
      { id: 'secure', icon: KeyRound, title: 'Caby Secure', desc: 'Clés, passeports, contrats originaux · Transport ultra-sécurisé', badge: 'Certifié Caby', route: '/caby/search' },
      { id: 'gourmet', icon: Wine, title: 'Caby Gourmet', desc: 'Vins fins & spiritueux · Livraison soignée depuis cavistes partenaires', badge: 'Certifié Caby', route: '/caby/search' },
      { id: 'laundry', icon: Shirt, title: 'Caby Laundry', desc: 'Pressing à domicile · Ramassage matin, livraison soir', badge: 'Certifié Caby', route: '/caby/search' },
      { id: 'pet', icon: PawPrint, title: 'Caby Pet', desc: 'Transport d\'animaux seul · Vétérinaire & toilettage', badge: 'Certifié Caby', route: '/caby/search' },
      { id: 'concierge', icon: ShoppingBag, title: 'Caby Concierge', desc: 'Click & Collect de luxe · Personal Shopper logistique', badge: 'Certifié Caby', route: '/caby/search' },
    ],
  },
];

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-14 pb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Services</h1>
        <p className="text-sm text-muted-foreground mb-6">Notre gamme complète de mobilité premium</p>

        <div className="space-y-7">
          {categories.map((cat) => (
            <section key={cat.label}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <span>{cat.emoji}</span> {cat.label}
              </h2>
              <div className="space-y-2.5">
                {cat.items.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => s.route && navigate(s.route)}
                    disabled={!s.route}
                    className="w-full flex items-center gap-4 bg-card border border-border rounded-2xl p-4 text-left hover:border-primary/30 transition-colors disabled:opacity-60"
                  >
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <s.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">{s.title}</p>
                        {s.badge && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                            {s.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{s.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Trust banner */}
        <div className="mt-8 flex items-center gap-3 bg-card border border-border rounded-2xl p-4">
          <ShieldCheck className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Tous nos services sont certifiés Caby</p>
            <p className="text-xs text-muted-foreground mt-0.5">Chauffeurs salariés · Assurances professionnelles · Conformité LTVTC Genève</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ServicesPage;
