import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { INCIDENT_PROTOCOLS, type IncidentType } from '@/utils/incidentProtocol';

interface IncidentRow {
  id: string;
  incident_type: string;
  status: string;
  description: string | null;
  compensation_amount: number | null;
  compensation_type: string | null;
  created_at: string;
  resolved_at: string | null;
  client_id: string | null;
  reported_by: string;
}

interface Incident {
  id: string;
  type: string;
  label: string;
  emoji: string;
  status: 'open' | 'resolving' | 'resolved' | 'cancelled';
  description: string;
  compensation?: { amount: number; type: string };
  createdAt: Date;
  resolvedAt?: Date;
}

const STATUS_CONFIG = {
  open: { label: 'Signalé', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  resolving: { label: 'En cours de résolution ⏳', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  resolved: { label: 'Résolu ✅', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  cancelled: { label: 'Annulé ❌', icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
};

function mapRow(row: IncidentRow): Incident {
  const protocol = INCIDENT_PROTOCOLS[row.incident_type as IncidentType];
  const status = (row.status as Incident['status']) || 'open';
  return {
    id: row.id,
    type: row.incident_type,
    label: protocol?.label || row.incident_type,
    emoji: protocol?.emoji || '⚠️',
    status,
    description: row.description || '',
    compensation: row.compensation_amount
      ? { amount: row.compensation_amount, type: row.compensation_type || 'credit' }
      : undefined,
    createdAt: new Date(row.created_at),
    resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
  };
}

const IncidentTracker: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const fetchIncidents = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('incidents')
        .select('*')
        .or(`client_id.eq.${user.id},reported_by.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) setIncidents(data.map(mapRow));
      setLoading(false);

      // Subscribe to realtime updates
      channel = supabase
        .channel('incidents-tracker')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'incidents',
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as IncidentRow;
            if (row.client_id === user.id || row.reported_by === user.id) {
              setIncidents(prev => [mapRow(row), ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new as IncidentRow;
            setIncidents(prev => prev.map(i => i.id === row.id ? mapRow(row) : i));
          }
        })
        .subscribe();
    };

    fetchIncidents();
    return () => { channel?.unsubscribe(); };
  }, []);

  if (loading || incidents.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        Incidents en cours
      </h3>
      {incidents.map((incident) => {
        const config = STATUS_CONFIG[incident.status];
        const StatusIcon = config.icon;

        return (
          <motion.div
            key={incident.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card border border-border p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{incident.emoji}</span>
                <div>
                  <p className="font-semibold text-sm">{incident.label}</p>
                  <p className="text-xs text-muted-foreground">{incident.description}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${config.bg}`}>
                <StatusIcon className={`w-3 h-3 ${config.color}`} />
                <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
              </div>
            </div>

            {incident.compensation && incident.status === 'resolved' && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Gift className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary">
                  Compensation : CHF {incident.compensation.amount} crédité sur votre Wallet
                </span>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Signalé : {incident.createdAt.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })}</span>
              {incident.resolvedAt && (
                <span>Résolu : {incident.resolvedAt.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })}</span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default IncidentTracker;
