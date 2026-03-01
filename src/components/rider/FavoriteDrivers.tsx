import React from 'react';
import { Heart, Star, X, UserPlus, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAffiliations } from '@/hooks/useAffiliations';
import { toast } from 'sonner';

const FavoriteDrivers: React.FC = () => {
  const { clientAffiliations, loading, removeAffiliation } = useAffiliations();

  const handleRemove = async (id: string, name?: string) => {
    const { error } = await removeAffiliation(id);
    if (!error) {
      toast.success(`${name || 'Chauffeur'} retiré de vos favoris`);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-[hsl(var(--caby-gold))]" />
          <h3 className="text-sm font-bold text-foreground">Mes chauffeurs favoris</h3>
        </div>
        <span className="text-xs text-muted-foreground">{clientAffiliations.length} favori{clientAffiliations.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : clientAffiliations.length === 0 ? (
        <div className="text-center py-6 px-4 rounded-2xl bg-card border border-border">
          <Heart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm font-medium text-muted-foreground">Aucun chauffeur favori</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Scannez un QR code ou utilisez un lien d'invitation pour ajouter un chauffeur favori
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {clientAffiliations.map((aff) => (
            <div key={aff.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={aff.driver_avatar || undefined} />
                  <AvatarFallback className="bg-muted text-sm font-bold">
                    {aff.driver_name?.[0] || 'C'}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${
                  aff.driver_is_online ? 'bg-[hsl(var(--caby-green))]' : 'bg-muted-foreground/40'
                }`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{aff.driver_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[hsl(var(--caby-gold))] text-[hsl(var(--caby-gold))]" />
                    <span className="text-xs font-bold">{(aff.driver_rating || 5.0).toFixed(1)}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    aff.driver_is_online
                      ? 'bg-[hsl(var(--caby-green))]/15 text-[hsl(var(--caby-green))]'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {aff.driver_is_online ? 'EN LIGNE' : 'HORS LIGNE'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleRemove(aff.id, aff.driver_name)}
                className="p-2 rounded-xl hover:bg-destructive/10 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteDrivers;
