import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Affiliation {
  id: string;
  client_id: string;
  driver_id: string;
  source: string;
  total_rides: number;
  total_revenue: number;
  last_ride_at: string | null;
  created_at: string;
  // Joined profile data
  client_name?: string;
  client_avatar?: string;
  driver_name?: string;
  driver_avatar?: string;
  driver_is_online?: boolean;
  driver_rating?: number;
}

export interface InviteCode {
  id: string;
  driver_id: string;
  code: string;
  is_active: boolean;
  uses_count: number;
  created_at: string;
}

export function useAffiliations() {
  const { user } = useAuth();
  const [clientAffiliations, setClientAffiliations] = useState<Affiliation[]>([]);
  const [driverClients, setDriverClients] = useState<Affiliation[]>([]);
  const [inviteCode, setInviteCode] = useState<InviteCode | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAffiliations = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Fetch affiliations where user is client (favorite drivers)
    const { data: asClient } = await supabase
      .from('client_driver_affiliations')
      .select('*')
      .eq('client_id', user.id);

    // Fetch affiliations where user is driver (private clients)
    const { data: asDriver } = await supabase
      .from('client_driver_affiliations')
      .select('*')
      .eq('driver_id', user.id);

    // Enrich with profile data
    if (asClient && asClient.length > 0) {
      const driverIds = asClient.map(a => a.driver_id);
      const { data: driverProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', driverIds);

      // Get driver online status
      const { data: driverStatuses } = await supabase
        .from('driver_profiles')
        .select('user_id, is_online, rating')
        .in('user_id', driverIds);

      const enriched = asClient.map(a => {
        const dp = driverProfiles?.find(p => p.id === a.driver_id);
        const ds = driverStatuses?.find(s => s.user_id === a.driver_id);
        return {
          ...a,
          driver_name: dp?.full_name || 'Chauffeur',
          driver_avatar: dp?.avatar_url,
          driver_is_online: ds?.is_online || false,
          driver_rating: ds?.rating ? Number(ds.rating) : 5.0,
        };
      });
      setClientAffiliations(enriched);
    } else {
      setClientAffiliations([]);
    }

    if (asDriver && asDriver.length > 0) {
      const clientIds = asDriver.map(a => a.client_id);
      const { data: clientProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', clientIds);

      const enriched = asDriver.map(a => {
        const cp = clientProfiles?.find(p => p.id === a.client_id);
        return {
          ...a,
          client_name: cp?.full_name || 'Client',
          client_avatar: cp?.avatar_url,
        };
      });
      setDriverClients(enriched);
    } else {
      setDriverClients([]);
    }

    setLoading(false);
  }, [user]);

  const fetchInviteCode = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('driver_invite_codes')
      .select('*')
      .eq('driver_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    setInviteCode(data as InviteCode | null);
  }, [user]);

  const generateInviteCode = async () => {
    if (!user) return null;
    const code = `CABY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const { data, error } = await supabase
      .from('driver_invite_codes')
      .insert({ driver_id: user.id, code })
      .select()
      .single();

    if (!error && data) {
      setInviteCode(data as InviteCode);
      return data as InviteCode;
    }
    return null;
  };

  const createAffiliation = async (clientId: string, driverId: string, source: string) => {
    const { error } = await supabase
      .from('client_driver_affiliations')
      .insert({ client_id: clientId, driver_id: driverId, source })
      .select();

    if (!error) {
      await fetchAffiliations();
    }
    return { error };
  };

  const removeAffiliation = async (affiliationId: string) => {
    const { error } = await supabase
      .from('client_driver_affiliations')
      .delete()
      .eq('id', affiliationId);

    if (!error) {
      await fetchAffiliations();
    }
    return { error };
  };

  useEffect(() => {
    fetchAffiliations();
    fetchInviteCode();
  }, [fetchAffiliations, fetchInviteCode]);

  return {
    clientAffiliations,
    driverClients,
    inviteCode,
    loading,
    generateInviteCode,
    createAffiliation,
    removeAffiliation,
    refetch: fetchAffiliations,
  };
}
