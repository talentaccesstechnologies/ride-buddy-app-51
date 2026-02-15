import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, KeyRound } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import BottomNav from '@/components/rider/BottomNav';

type ShareMode = 'all' | 'night' | 'off';

const SafetyPreferencesPage: React.FC = () => {
  const navigate = useNavigate();
  const [shareMode, setShareMode] = useState<ShareMode>('night');
  const [pinEnabled, setPinEnabled] = useState(false);

  const shareModes: { key: ShareMode; label: string }[] = [
    { key: 'all', label: 'Tous les trajets' },
    { key: 'night', label: 'Uniquement la nuit' },
    { key: 'off', label: 'Désactivé' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/caby/account/safety')} className="p-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-bold">Safety Preferences</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-8">
          Personnalisez vos outils de sécurité pour qu'ils s'activent au moment où vous en avez le plus besoin.
        </p>

        {/* Share location */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
              <MapPin className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm">Partage de trajet</p>
              <p className="text-xs text-muted-foreground">
                Partager automatiquement ma position avec mes contacts de confiance.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {shareModes.map((mode) => (
              <button
                key={mode.key}
                onClick={() => setShareMode(mode.key)}
                className="w-full flex items-center justify-between px-5 py-4 border-b border-border last:border-b-0 text-left"
              >
                <span className="text-sm font-medium">{mode.label}</span>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    shareMode === mode.key
                      ? 'border-primary'
                      : 'border-muted-foreground/40'
                  }`}
                >
                  {shareMode === mode.key && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* PIN */}
        <div className="flex items-center justify-between bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <KeyRound className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-sm">Vérification par code PIN</p>
              <p className="text-xs text-muted-foreground">
                Exiger un code pour chaque trajet.
              </p>
            </div>
          </div>
          <Switch checked={pinEnabled} onCheckedChange={setPinEnabled} />
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default SafetyPreferencesPage;
