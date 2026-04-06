import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Gift } from 'lucide-react';

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

interface IncidentTrackerProps {
  incidents: Incident[];
}

const IncidentTracker: React.FC<IncidentTrackerProps> = ({ incidents }) => {
  if (incidents.length === 0) return null;

  return (
    <div className="space-y-3">
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

            {/* Compensation */}
            {incident.compensation && incident.status === 'resolved' && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Gift className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary">
                  Compensation : CHF {incident.compensation.amount} crédité sur votre Wallet
                </span>
              </div>
            )}

            {/* Timeline */}
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
