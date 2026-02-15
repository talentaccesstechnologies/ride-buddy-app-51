import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Gift,
  Headphones,
  Sparkles,
  AlertTriangle,
  Inbox,
} from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';

type FilterKey = 'all' | 'offers' | 'support' | 'updates' | 'priority';

interface Message {
  id: string;
  category: Exclude<FilterKey, 'all'>;
  title: string;
  excerpt: string;
  date: string;
  unread: boolean;
}

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tout' },
  { key: 'offers', label: 'Offres' },
  { key: 'support', label: 'Support' },
  { key: 'updates', label: 'Mises à jour' },
  { key: 'priority', label: 'Priorité' },
];

const categoryConfig: Record<Exclude<FilterKey, 'all'>, { icon: typeof Gift; color: string }> = {
  offers: { icon: Gift, color: 'text-primary' },
  support: { icon: Headphones, color: 'text-[hsl(var(--caby-blue))]' },
  updates: { icon: Sparkles, color: 'text-muted-foreground' },
  priority: { icon: AlertTriangle, color: 'text-destructive' },
};

const mockMessages: Message[] = [
  {
    id: '1',
    category: 'priority',
    title: 'Vérification de compte requise',
    excerpt: 'Complétez votre vérification pour continuer à utiliser Caby.',
    date: 'Aujourd\'hui, 09:12',
    unread: true,
  },
  {
    id: '2',
    category: 'offers',
    title: '50% sur votre prochaine course 🎉',
    excerpt: 'Utilisez le code CABY50 avant le 28 février.',
    date: 'Aujourd\'hui, 08:30',
    unread: true,
  },
  {
    id: '3',
    category: 'support',
    title: 'Objet oublié — Résolu',
    excerpt: 'Votre sac a été retrouvé. Récupération prévue demain.',
    date: 'Hier, 18:45',
    unread: false,
  },
  {
    id: '4',
    category: 'updates',
    title: 'Nouvelle fonctionnalité : RideCheck',
    excerpt: 'Caby détecte maintenant les anomalies pendant vos trajets.',
    date: '12 fév.',
    unread: false,
  },
  {
    id: '5',
    category: 'offers',
    title: 'Parrainage : invitez, gagnez !',
    excerpt: 'Partagez votre code CABY-2026 et recevez 50% sur 5 courses.',
    date: '10 fév.',
    unread: false,
  },
  {
    id: '6',
    category: 'support',
    title: 'Réclamation tarifaire #4812',
    excerpt: 'Votre demande de remboursement a été acceptée.',
    date: '8 fév.',
    unread: false,
  },
  {
    id: '7',
    category: 'priority',
    title: 'Mise à jour des CGU',
    excerpt: 'Nos conditions générales ont été mises à jour le 5 février.',
    date: '5 fév.',
    unread: false,
  },
  {
    id: '8',
    category: 'updates',
    title: 'Caby est disponible à Lausanne',
    excerpt: 'Réservez vos courses VTC dans toute la région lémanique.',
    date: '1 fév.',
    unread: false,
  },
];

const InboxPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const filtered =
    activeFilter === 'all'
      ? mockMessages
      : mockMessages.filter((m) => m.category === activeFilter);

  const handleMessageClick = (msg: Message) => {
    if (msg.category === 'offers') {
      navigate('/caby/offers');
    }
    // Support messages would open a thread — placeholder for now
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/caby/account')} className="p-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-bold">Boîte de réception</h1>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                activeFilter === f.key
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card border-border text-muted-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Messages */}
      <div className="px-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Inbox className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-sm text-muted-foreground">Aucun message dans cette catégorie.</p>
          </div>
        ) : (
          filtered.map((msg) => {
            const config = categoryConfig[msg.category];
            const Icon = config.icon;

            return (
              <button
                key={msg.id}
                onClick={() => handleMessageClick(msg)}
                className="w-full flex items-start gap-4 py-4 border-b border-border text-left"
              >
                {/* Unread dot */}
                <div className="pt-1.5 w-2 flex-shrink-0">
                  {msg.unread && (
                    <div className="w-2 h-2 rounded-full bg-[hsl(var(--caby-blue))]" />
                  )}
                </div>

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${msg.unread ? 'font-bold' : 'font-medium'}`}>
                    {msg.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {msg.excerpt}
                  </p>
                </div>

                {/* Date */}
                <span className="text-[10px] text-muted-foreground flex-shrink-0 pt-0.5">
                  {msg.date}
                </span>
              </button>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default InboxPage;
