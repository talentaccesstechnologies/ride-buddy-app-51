import React, { useState } from 'react';
import { X, ArrowRightLeft, Shield, Users, User, MapPin, Radio, Check } from 'lucide-react';
import { RadarCourse } from '@/types/radar.types';
import { APP_CONFIG } from '@/config/app.config';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TransferModalProps {
  course: RadarCourse;
  driverName: string;
  onConfirm: (courseId: string, notes: string) => void;
  onClose: () => void;
}

// Simulated groups
const demoGroups = [
  { id: 'g1', name: 'Équipe Nuit', members: 8, online: 5 },
  { id: 'g2', name: 'Club Aéroport', members: 12, online: 7 },
  { id: 'g3', name: 'Réseau Premium', members: 4, online: 2 },
];

// Simulated colleagues with distance from pickup
const demoColleagues = [
  { id: 'c1', name: 'Jean-Pierre D.', distanceKm: 1.2, isOnline: true, rating: 4.8 },
  { id: 'c2', name: 'Domingo M.', distanceKm: 2.4, isOnline: true, rating: 4.9 },
  { id: 'c3', name: 'Karim B.', distanceKm: 4.1, isOnline: true, rating: 4.7 },
  { id: 'c4', name: 'Alexandre F.', distanceKm: 8.3, isOnline: true, rating: 4.6 },
  { id: 'c5', name: 'Youssef H.', distanceKm: 0, isOnline: false, rating: 4.5 },
  { id: 'c6', name: 'Philippe R.', distanceKm: 0, isOnline: false, rating: 4.4 },
];

const TransferModal: React.FC<TransferModalProps> = ({
  course,
  driverName,
  onConfirm,
  onClose,
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'groups' | 'colleagues'>('groups');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedColleague, setSelectedColleague] = useState<string | null>(null);

  const nettingAmount = course.estimatedPrice * APP_CONFIG.NETTING_RATE;
  const hasSelection = selectedGroup || selectedColleague;

  const handleConfirm = async () => {
    if (!hasSelection) return;
    setIsSubmitting(true);
    await onConfirm(course.id, notes);
    setIsSubmitting(false);
  };

  const handleSelectGroup = (id: string) => {
    setSelectedGroup(id === selectedGroup ? null : id);
    setSelectedColleague(null);
  };

  const handleSelectColleague = (id: string) => {
    setSelectedColleague(id === selectedColleague ? null : id);
    setSelectedGroup(null);
  };

  const getDistanceColor = (km: number) => {
    if (km <= 2) return 'text-[hsl(var(--caby-green))]';
    if (km <= 5) return 'text-[hsl(var(--caby-gold))]';
    return 'text-[hsl(var(--caby-red))]';
  };

  const getDistanceLabel = (km: number) => {
    if (km <= 2) return 'Proche';
    if (km <= 5) return 'Modéré';
    return 'Loin';
  };

  const onlineColleagues = demoColleagues.filter(c => c.isOnline).sort((a, b) => a.distanceKm - b.distanceKm);
  const offlineColleagues = demoColleagues.filter(c => !c.isOnline);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70" onClick={onClose}>
      <div className="w-full max-w-lg bg-card rounded-t-3xl animate-slide-up max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-display font-bold text-foreground">
            Partager la course
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-5 space-y-5">
            {/* Course summary mini */}
            <div className="bg-muted/30 rounded-2xl p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground text-xs font-bold w-8">DE :</span>
                <span className="text-muted-foreground truncate">{course.pickupAddress}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-foreground text-xs font-bold w-8">À :</span>
                <span className="text-foreground font-semibold truncate">{course.dropoffAddress}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
                <span className="text-xs text-muted-foreground">{course.estimatedDistance.toFixed(1)} km · ~{course.estimatedDuration} min</span>
                <span className="text-lg font-black text-[hsl(var(--caby-gold))]">
                  {course.estimatedPrice.toFixed(0)} {APP_CONFIG.DEFAULT_CURRENCY}
                </span>
              </div>
            </div>

            {/* Commission info */}
            <div className="bg-[hsl(var(--caby-gold))]/10 border border-[hsl(var(--caby-gold))]/30 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-[hsl(var(--caby-gold))] font-medium">Votre rétrocession</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ({(APP_CONFIG.NETTING_RATE * 100).toFixed(0)}% si un collègue accepte)
                </p>
              </div>
              <p className="text-xl font-black text-[hsl(var(--caby-gold))]">
                +{nettingAmount.toFixed(0)} {APP_CONFIG.DEFAULT_CURRENCY}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted/30 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('groups')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'groups'
                    ? 'bg-[hsl(var(--caby-gold))] text-black'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Users className="w-4 h-4" />
                Mes Groupes
              </button>
              <button
                onClick={() => setActiveTab('colleagues')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'colleagues'
                    ? 'bg-[hsl(var(--caby-gold))] text-black'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <User className="w-4 h-4" />
                Mes Collègues
              </button>
            </div>

            {/* Groups tab */}
            {activeTab === 'groups' && (
              <div className="space-y-2">
                {demoGroups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => handleSelectGroup(group.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      selectedGroup === group.id
                        ? 'border-[hsl(var(--caby-gold))] bg-[hsl(var(--caby-gold))]/10'
                        : 'border-border hover:border-muted-foreground/30 bg-card'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedGroup === group.id ? 'bg-[hsl(var(--caby-gold))]' : 'bg-muted'
                    }`}>
                      {selectedGroup === group.id ? (
                        <Check className="w-5 h-5 text-black" />
                      ) : (
                        <Users className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{group.name}</p>
                      <p className="text-xs text-muted-foreground">{group.members} membres</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-[hsl(var(--caby-green))]" />
                      <span className="text-xs text-[hsl(var(--caby-green))] font-semibold">{group.online} en ligne</span>
                    </div>
                  </button>
                ))}
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  Le premier membre qui clique obtient la course.
                </p>
              </div>
            )}

            {/* Colleagues tab */}
            {activeTab === 'colleagues' && (
              <div className="space-y-2">
                {/* Online colleagues sorted by proximity */}
                {onlineColleagues.length > 0 && (
                  <>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">En ligne</p>
                    {onlineColleagues.map(colleague => (
                      <button
                        key={colleague.id}
                        onClick={() => handleSelectColleague(colleague.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          selectedColleague === colleague.id
                            ? 'border-[hsl(var(--caby-gold))] bg-[hsl(var(--caby-gold))]/10'
                            : 'border-border hover:border-muted-foreground/30 bg-card'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          selectedColleague === colleague.id ? 'bg-[hsl(var(--caby-gold))]' : 'bg-muted'
                        }`}>
                          {selectedColleague === colleague.id ? (
                            <Check className="w-5 h-5 text-black" />
                          ) : (
                            <span className="text-sm font-bold text-muted-foreground">
                              {colleague.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-foreground">{colleague.name}</p>
                          <p className="text-xs text-muted-foreground">★ {colleague.rating}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className={`w-3 h-3 ${getDistanceColor(colleague.distanceKm)}`} />
                          <span className={`text-xs font-semibold ${getDistanceColor(colleague.distanceKm)}`}>
                            {colleague.distanceKm.toFixed(1)} km
                          </span>
                          <span className={`text-[10px] ${getDistanceColor(colleague.distanceKm)}`}>
                            ({getDistanceLabel(colleague.distanceKm)})
                          </span>
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {/* Offline colleagues */}
                {offlineColleagues.length > 0 && (
                  <>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-3">Hors ligne</p>
                    {offlineColleagues.map(colleague => (
                      <div
                        key={colleague.id}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card opacity-40"
                      >
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-bold text-muted-foreground">
                            {colleague.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-foreground">{colleague.name}</p>
                          <p className="text-xs text-muted-foreground">★ {colleague.rating}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground">Hors ligne</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Notes field */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                Note pour le destinataire (optionnel)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Client régulier, ponctuel..."
                className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground/50 rounded-xl"
                rows={2}
              />
            </div>

            {/* Firewall warning */}
            <div className="bg-[hsl(var(--caby-purple))]/10 border border-[hsl(var(--caby-purple))]/20 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-3.5 h-3.5 text-[hsl(var(--caby-purple))]" />
                <span className="text-xs font-medium text-[hsl(var(--caby-purple))]">Protection Client Activée</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Le destinataire ne verra pas les coordonnées de votre client.
                Nom affiché : "<span className="text-foreground font-medium">Client de {driverName}</span>"
              </p>
            </div>
          </div>
        </div>

        {/* Fixed bottom actions */}
        <div className="p-5 border-t border-border flex-shrink-0 space-y-2">
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || !hasSelection}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wide transition-all ${
              hasSelection
                ? 'bg-gradient-to-r from-[hsl(var(--caby-gold))] to-[hsl(var(--caby-gold))]/80 text-black hover:opacity-90'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {isSubmitting
              ? 'Envoi en cours...'
              : selectedGroup
                ? `Envoyer au groupe`
                : selectedColleague
                  ? `Envoyer à ${demoColleagues.find(c => c.id === selectedColleague)?.name}`
                  : 'Sélectionnez un destinataire'
            }
          </Button>
          <button
            onClick={onClose}
            className="w-full text-muted-foreground text-xs py-2 hover:text-foreground transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
