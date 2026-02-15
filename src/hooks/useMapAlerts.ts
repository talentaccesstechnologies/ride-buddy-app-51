import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MapAlert } from '@/types/map.types';
import { toast } from 'sonner';

export const useMapAlerts = () => {
  const [alerts, setAlerts] = useState<MapAlert[]>([]);

  const fetchAlerts = useCallback(async () => {
    const { data, error } = await supabase
      .from('map_alerts')
      .select('*')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString());

    if (!error && data) {
      setAlerts(data as unknown as MapAlert[]);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    // Refresh every 60s
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const reportAlert = useCallback(async (type: 'police' | 'construction', lat: number, lng: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Connectez-vous pour signaler');
      return;
    }

    const { error } = await supabase
      .from('map_alerts')
      .insert({
        reporter_id: user.id,
        alert_type: type,
        lat,
        lng,
      } as any);

    if (error) {
      toast.error('Erreur lors du signalement');
    } else {
      toast.success(
        type === 'police' ? '👮 Contrôle signalé' : '🚧 Travaux signalés',
        { description: 'Visible 30 min pour tous les chauffeurs' }
      );
      fetchAlerts();
    }
  }, [fetchAlerts]);

  return { alerts, reportAlert };
};
