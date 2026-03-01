import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Logo from '@/components/shared/Logo';
import { toast } from 'sonner';

const InvitePage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'ready' | 'linked' | 'error'>('loading');
  const [driverName, setDriverName] = useState('');

  useEffect(() => {
    const resolveCode = async () => {
      if (!code) { setStatus('error'); return; }

      // Find invite code
      const { data: invite } = await supabase
        .from('driver_invite_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .maybeSingle();

      if (!invite) { setStatus('error'); return; }

      // Get driver name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', invite.driver_id)
        .maybeSingle();

      setDriverName(profile?.full_name || 'Chauffeur');

      if (!user) {
        // Store in sessionStorage for after login
        sessionStorage.setItem('pending_invite', JSON.stringify({ code, driverId: invite.driver_id }));
        setStatus('ready');
        return;
      }

      // Create affiliation
      const { error } = await supabase
        .from('client_driver_affiliations')
        .insert({
          client_id: user.id,
          driver_id: invite.driver_id,
          source: 'invite_link',
          invite_code: code,
        });

      if (error?.code === '23505') {
        // Already linked
        setStatus('linked');
        return;
      }

      if (!error) {
        // Increment uses_count
        await supabase
          .from('driver_invite_codes')
          .update({ uses_count: invite.uses_count + 1 })
          .eq('id', invite.id);
        setStatus('linked');
      } else {
        setStatus('error');
      }
    };

    resolveCode();
  }, [code, user]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <Logo className="mb-8" />

      {status === 'loading' && (
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Vérification du lien...</p>
        </div>
      )}

      {status === 'ready' && (
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold">{driverName} vous invite</h1>
          <p className="text-sm text-muted-foreground">
            Connectez-vous ou créez un compte pour devenir client privé de {driverName} et bénéficier de courses prioritaires.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate('/auth/login')}>Se connecter</Button>
            <Button variant="outline" onClick={() => navigate('/auth/register')}>Créer un compte</Button>
          </div>
        </div>
      )}

      {status === 'linked' && (
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--caby-green))]/15 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-[hsl(var(--caby-green))]" />
          </div>
          <h1 className="text-xl font-bold">Vous êtes lié à {driverName} !</h1>
          <p className="text-sm text-muted-foreground">
            Vos prochaines courses seront proposées en priorité à {driverName}.
          </p>
          <Button onClick={() => navigate('/caby')}>Réserver une course</Button>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-sm text-muted-foreground">Ce lien d'invitation est invalide ou expiré.</p>
          <Button variant="outline" onClick={() => navigate('/')}>Retour à l'accueil</Button>
        </div>
      )}
    </div>
  );
};

export default InvitePage;
