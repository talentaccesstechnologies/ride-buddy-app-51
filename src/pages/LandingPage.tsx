import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/shared/Logo';
import riderImage from '@/assets/rider-mode.webp';
import driverImage from '@/assets/driver-mode.webp';

type Mode = 'rider' | 'driver';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeHover, setActiveHover] = useState<Mode | null>(null);

  const handleRider = () => {
    localStorage.setItem('caby_preferred_mode', 'rider');
    navigate('/auth/login?role=rider');
  };

  const handleDriver = () => {
    localStorage.setItem('caby_preferred_mode', 'driver');
    navigate('/auth/login?role=driver');
  };

  return (
    <div className="h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Logo centered */}
      <div className="absolute top-6 left-0 right-0 z-30 flex justify-center">
        <Logo size="lg" />
      </div>

      {/* Top half — Rider */}
      <div
        className="relative flex-1 overflow-hidden cursor-pointer group"
        onMouseEnter={() => setActiveHover('rider')}
        onMouseLeave={() => setActiveHover(null)}
        onClick={handleRider}
      >
        <img
          src={riderImage}
          alt="Passager premium"
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
          style={{
            filter: activeHover === 'driver'
              ? 'brightness(0.3) saturate(0.2)'
              : 'brightness(0.55) saturate(1.3)',
          }}
        />
        {/* Blue overlay */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: activeHover === 'driver'
              ? 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.9))'
              : 'linear-gradient(to bottom, rgba(0,122,255,0.35), rgba(0,80,220,0.4), rgba(0,0,0,0.75))',
          }}
        />
        {/* Blue glow line */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-0.5 rounded-full transition-opacity duration-500"
          style={{
            background: 'linear-gradient(90deg, transparent, #007AFF, transparent)',
            opacity: activeHover === 'driver' ? 0 : 1,
          }}
        />
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6">
          <p className="text-sm font-medium tracking-[0.3em] uppercase mb-3 transition-colors duration-500"
            style={{ color: 'rgba(0,122,255,0.8)' }}>
            Voyagez sereinement
          </p>
          <Button
            onClick={(e) => { e.stopPropagation(); handleRider(); }}
            className="h-14 px-10 rounded-2xl text-lg font-bold transition-all duration-500 hover:scale-105"
            style={{
              background: '#007AFF',
              color: '#FFFFFF',
              boxShadow: '0 0 40px rgba(0,122,255,0.4)',
            }}
          >
            JE COMMANDE UNE COURSE
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Bottom half — Driver */}
      <div
        className="relative flex-1 overflow-hidden cursor-pointer group"
        onMouseEnter={() => setActiveHover('driver')}
        onMouseLeave={() => setActiveHover(null)}
        onClick={handleDriver}
      >
        <img
          src={driverImage}
          alt="Chauffeur professionnel"
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
          style={{
            filter: activeHover === 'rider'
              ? 'brightness(0.3) saturate(0.2)'
              : 'brightness(0.55) saturate(1.3)',
          }}
        />
        {/* Gold overlay */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: activeHover === 'rider'
              ? 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.9))'
              : 'linear-gradient(to top, rgba(212,175,55,0.35), rgba(200,160,40,0.4), rgba(0,0,0,0.75))',
          }}
        />
        {/* Gold glow line */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-0.5 rounded-full transition-opacity duration-500"
          style={{
            background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
            opacity: activeHover === 'rider' ? 0 : 1,
          }}
        />
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6">
          <p className="text-sm font-medium tracking-[0.3em] uppercase mb-3 transition-colors duration-500"
            style={{ color: 'rgba(212,175,55,0.85)' }}>
            Roulez avec fierté
          </p>
          <Button
            onClick={(e) => { e.stopPropagation(); handleDriver(); }}
            className="h-14 px-10 rounded-2xl text-lg font-bold transition-all duration-500 hover:scale-105"
            style={{
              background: '#D4AF37',
              color: '#000000',
              boxShadow: '0 0 40px rgba(212,175,55,0.4)',
            }}
          >
            JE ME CONNECTE POUR CONDUIRE
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate('/auth/register?role=driver'); }}
            className="mt-3 text-xs transition-colors hover:underline"
            style={{ color: 'rgba(212,175,55,0.6)' }}
          >
            Pas encore chauffeur ? <span className="underline">Devenir partenaire Caby</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 z-30 text-center">
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5 text-muted-foreground" />
          Propulsé par Caby — La garantie d'un transport certifié et humain.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
