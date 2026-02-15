import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '@/components/shared/Logo';
import riderImage from '@/assets/rider-mode.jpg';
import driverImage from '@/assets/driver-mode.jpg';

type Mode = 'rider' | 'driver';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('rider');
  const [credential, setCredential] = useState('');

  const isDriver = mode === 'driver';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential.trim()) return;
    navigate(`/auth/login?role=${mode}&id=${encodeURIComponent(credential)}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Double-Face Visual */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        {/* Top half — Rider */}
        <div
          className={`relative flex-1 overflow-hidden transition-all duration-700 ease-in-out ${
            isDriver ? 'flex-[0.35]' : 'flex-[0.65]'
          }`}
        >
          <img
            src={riderImage}
            alt="Passager premium"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background" />
          {!isDriver && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-foreground/70 text-sm font-medium tracking-widest uppercase animate-fade-in">
                Voyagez sereinement
              </p>
            </div>
          )}
        </div>

        {/* Bottom half — Driver */}
        <div
          className={`relative flex-1 overflow-hidden transition-all duration-700 ease-in-out ${
            isDriver ? 'flex-[0.65]' : 'flex-[0.35]'
          }`}
        >
          <img
            src={driverImage}
            alt="Chauffeur professionnel"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background" />
          {isDriver && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-primary/80 text-sm font-medium tracking-widest uppercase animate-fade-in">
                Roulez avec fierté
              </p>
            </div>
          )}
        </div>

        {/* Center Toggle Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="pointer-events-auto">
            {/* Logo above toggle */}
            <div className="mb-6 flex justify-center">
              <Logo size="lg" />
            </div>

            {/* The Switch */}
            <div className="flex rounded-2xl overflow-hidden border border-border bg-card/80 backdrop-blur-xl">
              <button
                onClick={() => setMode('rider')}
                className={`px-8 py-4 text-base font-bold tracking-wide transition-all duration-500 ${
                  !isDriver
                    ? 'bg-[hsl(var(--caby-blue))] text-white shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                COMMANDER
              </button>
              <button
                onClick={() => setMode('driver')}
                className={`px-8 py-4 text-base font-bold tracking-wide transition-all duration-500 ${
                  isDriver
                    ? 'btn-gold shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                ROULER
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section — Unified Login */}
      <div className="relative z-10 bg-background px-6 pt-8 pb-6 safe-area-bottom">
        {/* Unified input */}
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4">
          <Input
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            placeholder="Numéro de mobile ou Email"
            className="h-14 rounded-2xl bg-card border-border text-foreground text-center text-base placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            disabled={!credential.trim()}
            className={`w-full h-14 rounded-2xl text-lg font-bold transition-all duration-500 ${
              isDriver
                ? 'btn-gold shadow-[0_0_30px_hsl(var(--caby-gold)/0.3)]'
                : 'bg-[hsl(var(--caby-blue))] hover:bg-[hsl(var(--caby-blue))]/90 text-white shadow-[0_0_30px_hsl(var(--caby-blue)/0.3)]'
            }`}
          >
            {isDriver ? 'Accéder à TATFleet' : 'Continuer'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </form>

        {/* Reassurance footer */}
        <div className="mt-8 text-center">
          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-primary" />
            Propulsé par TATFleet — La garantie d'un transport certifié et humain.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
