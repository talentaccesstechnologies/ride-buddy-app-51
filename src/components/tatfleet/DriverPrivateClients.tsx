import React, { useState } from 'react';
import { Users, Link2, Copy, Check, UserPlus, Star, Calendar, TrendingUp, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAffiliations, type Affiliation } from '@/hooks/useAffiliations';
import { toast } from 'sonner';

const DriverPrivateClients: React.FC = () => {
  const { driverClients, inviteCode, loading, generateInviteCode } = useAffiliations();
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerateLink = async () => {
    setGenerating(true);
    await generateInviteCode();
    setGenerating(false);
    toast.success('Lien d\'invitation généré !');
  };

  const handleCopyLink = () => {
    if (!inviteCode) return;
    const link = `${window.location.origin}/invite/${inviteCode.code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!inviteCode) return;
    const link = `${window.location.origin}/invite/${inviteCode.code}`;
    if (navigator.share) {
      await navigator.share({
        title: 'Devenez mon client privé sur Caby',
        text: 'Rejoignez-moi sur Caby pour des courses prioritaires !',
        url: link,
      });
    } else {
      handleCopyLink();
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Intl.DateTimeFormat('fr-CH', { day: 'numeric', month: 'short' }).format(new Date(dateStr));
  };

  return (
    <div className="space-y-4">
      {/* Invite section */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus className="w-5 h-5 text-primary" />
          <h4 className="text-sm font-bold text-foreground">Inviter un client</h4>
        </div>

        {inviteCode ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border">
              <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs font-mono text-muted-foreground truncate flex-1">
                caby.app/invite/{inviteCode.code}
              </span>
              <button onClick={handleCopyLink} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                {copied ? <Check className="w-4 h-4 text-[hsl(var(--caby-green))]" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={handleCopyLink}>
                <Copy className="w-3 h-3 mr-1" />
                Copier
              </Button>
              <Button size="sm" className="flex-1 text-xs" onClick={handleShare}>
                <Share2 className="w-3 h-3 mr-1" />
                Partager
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              {inviteCode.uses_count} client{inviteCode.uses_count !== 1 ? 's' : ''} inscrit{inviteCode.uses_count !== 1 ? 's' : ''} via ce lien
            </p>
          </div>
        ) : (
          <Button
            size="sm"
            className="w-full"
            onClick={handleGenerateLink}
            disabled={generating}
          >
            <Link2 className="w-4 h-4 mr-2" />
            {generating ? 'Génération...' : 'Générer un lien d\'invitation'}
          </Button>
        )}
      </div>

      {/* Clients list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground">
              {driverClients.length} client{driverClients.length !== 1 ? 's' : ''} privé{driverClients.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : driverClients.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Aucun client privé</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Partagez votre lien d'invitation pour lier vos clients
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {driverClients.map((client) => (
              <ClientRow key={client.id} client={client} formatDate={formatDate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ClientRow: React.FC<{ client: Affiliation; formatDate: (d: string | null) => string }> = ({ client, formatDate }) => (
  <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
    <Avatar className="w-10 h-10">
      <AvatarImage src={client.client_avatar || undefined} />
      <AvatarFallback className="bg-muted text-xs font-bold">
        {client.client_name?.[0] || 'C'}
      </AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground truncate">{client.client_name}</p>
      <div className="flex items-center gap-3 mt-0.5">
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {client.total_rides} courses
        </span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(client.last_ride_at)}
        </span>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-black text-[hsl(var(--caby-green))]">
        {Number(client.total_revenue).toFixed(0)} CHF
      </p>
      <p className="text-[10px] text-muted-foreground">revenus</p>
    </div>
  </div>
);

export default DriverPrivateClients;
