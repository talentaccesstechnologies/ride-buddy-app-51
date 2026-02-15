import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import riderImage from '@/assets/rider-mode.jpg';
import driverImage from '@/assets/driver-mode.jpg';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [pressedZone, setPressedZone] = useState<'rider' | 'driver' | null>(null);

  const handleSelect = (mode: 'rider' | 'driver') => {
    setPressedZone(mode);
    localStorage.setItem('caby_preferred_mode', mode);
    setTimeout(() => {
      navigate(mode === 'rider' ? '/auth/login?role=rider' : '/auth/login?role=driver');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Logo centré */}
      <div className="absolute top-0 left-0 right-0 z-30 flex justify-center pt-8">
        <Logo size="lg" />
      </div>

      {/* Zone CLIENT (Haut) */}
      <button
        className="relative flex-1 overflow-hidden cursor-pointer border-none outline-none text-left"
        onPointerDown={() => setPressedZone('rider')}
        onPointerUp={() => handleSelect('rider')}
        onPointerLeave={() => setPressedZone(null)}
      >
        <img
          src={riderImage}
          alt="Passager premium"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay Bleu Cyan */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,122,255,0.45), rgba(0,80,220,0.5), rgba(0,0,0,0.7))',
            opacity: pressedZone === 'rider' ? 0 : 1,
          }}
        />
        {/* CTA */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 z-10">
          <p className="text-xs font-medium tracking-[0.3em] uppercase mb-4 text-white/60">
            Voyagez sereinement
          </p>
          <div
            className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold tracking-wide text-white transition-all duration-300"
            style={{
              background: '#007AFF',
              boxShadow: pressedZone === 'rider'
                ? '0 0 60px rgba(0,122,255,0.8)'
                : '0 0 30px rgba(0,122,255,0.4)',
            }}
          >
            JE COMMANDE UNE COURSE
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </button>

      {/* Séparateur */}
      <div className="relative z-20 h-px bg-white/10" />

      {/* Zone CHAUFFEUR (Bas) */}
      <button
        className="relative flex-1 overflow-hidden cursor-pointer border-none outline-none text-left"
        onPointerDown={() => setPressedZone('driver')}
        onPointerUp={() => handleSelect('driver')}
        onPointerLeave={() => setPressedZone(null)}
      >
        <img
          src={driverImage}
          alt="Chauffeur professionnel"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay Or Ambre */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to top, rgba(212,175,55,0.45), rgba(200,160,40,0.5), rgba(0,0,0,0.7))',
            opacity: pressedZone === 'driver' ? 0 : 1,
          }}
        />
        {/* CTA */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 z-10">
          <p className="text-xs font-medium tracking-[0.3em] uppercase mb-4 text-white/60">
            Roulez avec fierté
          </p>
          <div
            className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold tracking-wide text-black transition-all duration-300"
            style={{
              background: '#D4AF37',
              boxShadow: pressedZone === 'driver'
                ? '0 0 60px rgba(212,175,55,0.8)'
                : '0 0 30px rgba(212,175,55,0.4)',
            }}
          >
            JE ME CONNECTE POUR CONDUIRE
            <ArrowRight className="w-5 h-5" />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/auth/register?role=driver');
            }}
            className="mt-3 text-xs text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors"
          >
            Pas encore chauffeur ? <span className="underline">Devenir partenaire TATFleet</span>
          </button>
        </div>
      </button>

      {/* Footer */}
      <div className="relative z-10 bg-black px-6 py-4">
        <p className="flex items-center justify-center gap-2 text-xs text-white/40">
          <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
          Propulsé par TATFleet — La garantie d'un transport certifié et humain.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
