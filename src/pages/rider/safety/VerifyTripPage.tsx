import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import BottomNav from '@/components/rider/BottomNav';

const VerifyTripPage: React.FC = () => {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/caby/account/safety')} className="p-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-bold">Verify Your Trip</h1>
        </div>

        {/* Hero */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Assurez-vous de monter dans la bonne voiture</h2>
          <p className="text-sm text-muted-foreground">
            Activez le code PIN pour plus de sérénité. Le chauffeur devra saisir le code que vous lui donnerez pour démarrer la course dans son application.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between bg-card border border-border rounded-xl p-5 mb-8">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <ShieldCheck className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-sm">Code PIN de vérification</p>
              <p className="text-xs text-muted-foreground">
                Un code à 4 chiffres unique par course
              </p>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {/* How it works */}
        <h3 className="font-bold text-sm mb-4">Comment ça marche</h3>
        <div className="space-y-4">
          {[
            { step: '1', text: "Un code PIN à 4 chiffres apparaît dans l'app une fois votre chauffeur attribué." },
            { step: '2', text: 'Communiquez ce code verbalement à votre chauffeur avant de monter.' },
            { step: '3', text: 'Le chauffeur le saisit dans son app pour confirmer et démarrer la course.' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">{item.step}</span>
              </div>
              <p className="text-sm text-muted-foreground pt-1">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default VerifyTripPage;
