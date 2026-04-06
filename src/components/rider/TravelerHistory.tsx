import React, { useEffect, useState } from 'react';
import { Star, Award, Clock, Leaf, RotateCw, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface TravelerStats {
  averageRating: number;
  totalTrips: number;
  badges: { id: string; label: string; emoji: string }[];
  loading: boolean;
}

const BADGE_MAP: Record<string, { label: string; emoji: string }> = {
  punctual: { label: 'Ponctuel', emoji: '⏰' },
  clean: { label: 'Voyageur propre', emoji: '🌿' },
  regular: { label: 'Client régulier', emoji: '🔄' },
  recommend: { label: 'Recommandé', emoji: '👍' },
  friendly: { label: 'Sympathique', emoji: '😊' },
};

const TravelerHistory: React.FC = () => {
  const [stats, setStats] = useState<TravelerStats>({
    averageRating: 0,
    totalTrips: 0,
    badges: [],
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setStats(s => ({ ...s, loading: false })); return; }

      // Fetch last 20 ratings where user is the ratee
      const { data: ratings } = await supabase
        .from('trip_ratings')
        .select('overall_score, badges, is_revealed')
        .eq('ratee_id', user.id)
        .eq('is_revealed', true)
        .order('created_at', { ascending: false })
        .limit(20);

      // Count total trips as rider
      const { count: tripCount } = await supabase
        .from('rides')
        .select('id', { count: 'exact', head: true })
        .eq('rider_id', user.id)
        .eq('status', 'completed');

      const scores = (ratings || []).map(r => r.overall_score);
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      // Aggregate badges
      const badgeCounts: Record<string, number> = {};
      (ratings || []).forEach(r => {
        (r.badges || []).forEach((b: string) => {
          badgeCounts[b] = (badgeCounts[b] || 0) + 1;
        });
      });

      const earnedBadges = Object.entries(badgeCounts)
        .filter(([, count]) => count >= 2)
        .map(([id]) => ({
          id,
          label: BADGE_MAP[id]?.label || id,
          emoji: BADGE_MAP[id]?.emoji || '🏅',
        }));

      setStats({
        averageRating: Math.round(avg * 10) / 10,
        totalTrips: tripCount || 0,
        badges: earnedBadges,
        loading: false,
      });
    };

    fetchStats();
  }, []);

  if (stats.loading) {
    return (
      <div className="rounded-2xl bg-card border border-border p-5 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2 mb-3" />
        <div className="h-8 bg-muted rounded w-1/3" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-sm">Mon historique voyageur</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Average Rating */}
        <div className="rounded-xl bg-background border border-border p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-5 h-5 fill-primary text-primary" />
            <span className="text-2xl font-bold">
              {stats.totalTrips < 5 ? '—' : stats.averageRating.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.totalTrips < 5 ? 'Nouveau 🆕' : 'Note moyenne'}
          </p>
        </div>

        {/* Total Trips */}
        <div className="rounded-xl bg-background border border-border p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <RotateCw className="w-4 h-4 text-muted-foreground" />
            <span className="text-2xl font-bold">{stats.totalTrips}</span>
          </div>
          <p className="text-xs text-muted-foreground">Trajets effectués</p>
        </div>
      </div>

      {/* Badges */}
      {stats.badges.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Badges obtenus</p>
          <div className="flex flex-wrap gap-2">
            {stats.badges.map(b => (
              <span
                key={b.id}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary"
              >
                {b.emoji} {b.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {stats.totalTrips < 5 && (
        <p className="text-xs text-muted-foreground text-center">
          🆕 Badge "Nouveau" — Encore {5 - stats.totalTrips} trajet{5 - stats.totalTrips > 1 ? 's' : ''} avant votre première note visible
        </p>
      )}
    </motion.div>
  );
};

export default TravelerHistory;
