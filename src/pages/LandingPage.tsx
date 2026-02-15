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
  const [mode, setMode] = useState<Mode>(() => {
    return (localStorage.getItem('caby_preferred_mode') as Mode) || 'rider';
  });
  const [credential, setCredential] = useState('');
  const [transitioning, setTransitioning] = useState(false);

  const isDriver = mode === 'driver';

  const selectMode = (m: Mode) => {
    if (m === mode) return;
    setTransitioning(true);
    setTimeout(() => {
      setMode(m);
      localStorage.setItem('caby_preferred_mode', m);
      setTimeout(() => setTransitioning(false), 600);
    }, 150);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential.trim()) return;
    localStorage.setItem('caby_preferred_mode', mode);
    navigate(`/auth/login?role=${mode}&id=${encodeURIComponent(credential)}`);
  };

  // Dynamic accent color
  const accent = isDriver ? '#D4AF37' : '#007AFF';
  const accentGlow = isDriver
    ? 'shadow-[0_0_60px_rgba(212,175,55,0.25)]'
    : 'shadow-[0_0_60px_rgba(0,122,255,0.25)]';

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Full-page color overlay for transition effect */}
      <div
        className="absolute inset-0 z-30 pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${accent}22 0%, transparent 70%)`,
          opacity: transitioning ? 1 : 0,
        }}
      />

      {/* Ambient glow — follows mode */}
      <div
        className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out pointer-events-none"
        style={{
          background: isDriver
            ? 'radial-gradient(ellipse at 50% 80%, rgba(212,175,55,0.08) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at 50% 20%, rgba(0,122,255,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Double-Face Visual */}
      <div className="relative flex-1 min-h-0 flex flex-col z-10">
        {/* Top half — Rider */}
        <div
          className={`relative flex-1 overflow-hidden transition-all duration-700 ease-in-out ${
            isDriver ? 'flex-[0.35]' : 'flex-[0.65]'
          }`}
        >
          <img
            src={riderImage}
            alt="Passager premium"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
            style={{ filter: isDriver ? 'brightness(0.4) saturate(0.3)' : 'brightness(0.6) saturate(1.2)' }}
          />
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{
              background: isDriver
                ? 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9))'
                : 'linear-gradient(to bottom, rgba(0,122,255,0.15), rgba(0,60,180,0.25), rgba(0,0,0,0.8))',
            }}
          />
          {/* Blue accent line when active */}
          {!isDriver && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-0.5 rounded-full animate-fade-in"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
            />
          )}
          {!isDriver && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm font-medium tracking-widest uppercase animate-fade-in"
                style={{ color: `${accent}BB` }}>
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
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
            style={{ filter: !isDriver ? 'brightness(0.4) saturate(0.3)' : 'brightness(0.6) saturate(1.2)' }}
          />
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{
              background: !isDriver
                ? 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.9))'
                : 'linear-gradient(to top, rgba(212,175,55,0.15), rgba(180,140,30,0.2), rgba(0,0,0,0.8))',
            }}
          />
          {/* Gold accent line when active */}
          {isDriver && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-0.5 rounded-full animate-fade-in"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
            />
          )}
          {isDriver && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm font-medium tracking-widest uppercase animate-fade-in"
                style={{ color: `${accent}CC` }}>
                Roulez avec fierté
              </p>
            </div>
          )}
        </div>

        {/* Center Toggle Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="pointer-events-auto">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <Logo size="lg" />
            </div>

            {/* The Switch */}
            <div
              className={`flex rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-700 ${accentGlow}`}
              style={{ border: `1px solid ${accent}33` }}
            >
              <button
                onClick={() => selectMode('rider')}
                className="px-8 py-4 text-base font-bold tracking-wide transition-all duration-500"
                style={{
                  background: !isDriver ? accent : 'transparent',
                  color: !isDriver ? '#FFFFFF' : '#888',
                }}
              >
                COMMANDER
              </button>
              <button
                onClick={() => selectMode('driver')}
                className="px-8 py-4 text-base font-bold tracking-wide transition-all duration-500"
                style={{
                  background: isDriver ? accent : 'transparent',
                  color: isDriver ? '#000000' : '#888',
                }}
              >
                ROULER
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section — Unified Login */}
      <div className="relative z-10 bg-background px-6 pt-8 pb-6 safe-area-bottom">
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4">
          <Input
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            placeholder="Numéro de mobile ou Email"
            className="h-14 rounded-2xl bg-card text-foreground text-center text-base placeholder:text-muted-foreground transition-all duration-500"
            style={{ borderColor: `${accent}44` }}
          />
          <Button
            type="submit"
            disabled={!credential.trim()}
            className="w-full h-14 rounded-2xl text-lg font-bold transition-all duration-500"
            style={{
              background: accent,
              color: isDriver ? '#000000' : '#FFFFFF',
              boxShadow: `0 0 30px ${accent}33`,
            }}
          >
            {isDriver ? 'JE ME CONNECTE POUR CONDUIRE' : 'JE COMMANDE UNE COURSE'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {isDriver && (
            <button
              type="button"
              onClick={() => navigate('/auth/register?role=driver')}
              className="block mx-auto text-xs transition-colors mt-1"
              style={{ color: `${accent}99` }}
              onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
              onMouseLeave={(e) => (e.currentTarget.style.color = `${accent}99`)}
            >
              Pas encore chauffeur ? <span className="underline">Devenir partenaire TATFleet</span>
            </button>
          )}
        </form>

        {/* Reassurance footer */}
        <div className="mt-8 text-center">
          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 transition-colors duration-500" style={{ color: accent }} />
            Propulsé par TATFleet — La garantie d'un transport certifié et humain.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
