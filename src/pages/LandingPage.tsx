import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Shield, UserCheck, CreditCard, QrCode, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '@/components/shared/Logo';
import { APP_CONFIG } from '@/config/app.config';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState('');
  const [taglineIndex, setTaglineIndex] = useState(0);

  const taglines = [
    'Votre chauffeur privé à Genève',
    'Premium & Sécurisé',
    'Certifié LSE/LTVTC',
  ];

  // Animate tagline
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleQrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrCode.length >= 6) {
      navigate(`/auth/register?driver=${qrCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-caby-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-caby-black via-caby-dark to-caby-black" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(212, 168, 83, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 168, 83, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-lg mx-auto">
          {/* Logo */}
          <div className="mb-8 animate-fade-in">
            <Logo size="xl" showTagline />
          </div>

          {/* Animated tagline */}
          <div className="h-8 mb-12 overflow-hidden">
            <p
              key={taglineIndex}
              className="text-xl text-caby-muted animate-fade-in"
            >
              {taglines[taglineIndex]}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4 mb-12">
            <Button
              onClick={() => navigate('/auth/login?role=rider')}
              className="w-full h-14 btn-gold rounded-2xl text-lg font-bold shadow-gold-glow"
            >
              Commander une course
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button
              onClick={() => navigate('/auth/login?role=driver')}
              variant="outline"
              className="w-full h-14 rounded-2xl text-lg font-semibold border-caby-border text-white hover:bg-caby-card hover:border-caby-gold/50"
            >
              Devenir chauffeur
            </Button>
          </div>

          {/* Scroll indicator */}
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="animate-bounce"
          >
            <ChevronDown className="w-8 h-8 text-caby-gold" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-caby-dark">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center text-white mb-16">
            Pourquoi <span className="text-caby-gold">Caby</span> ?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Premium & Sûr',
                description: 'Chauffeurs certifiés LSE/LTVTC, véhicules contrôlés régulièrement',
              },
              {
                icon: UserCheck,
                title: 'Votre Chauffeur Privé',
                description: 'Scannez, connectez-vous, retrouvez votre chauffeur préféré à chaque course',
              },
              {
                icon: CreditCard,
                title: 'Transparent',
                description: 'Prix fixe, pas de surge pricing, paiement sécurisé Stripe',
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="bg-caby-card border border-caby-border rounded-3xl p-8 text-center hover:border-caby-gold/30 transition-colors"
              >
                <div className="w-14 h-14 mx-auto mb-6 bg-caby-gold/20 rounded-2xl flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-caby-gold" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-caby-muted text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-caby-black">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center text-white mb-16">
            Comment ça marche
          </h2>

          <div className="space-y-8">
            {[
              { step: 1, title: 'Inscrivez-vous en 30 secondes' },
              { step: 2, title: 'Indiquez votre destination' },
              { step: 3, title: 'Un chauffeur vérifié arrive' },
              { step: 4, title: 'Payez facilement et notez' },
            ].map((item, index) => (
              <div key={item.step} className="flex items-center gap-6">
                <div className="w-12 h-12 bg-caby-gold text-black rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-caby-gold/50 to-transparent" />
                <p className="text-white font-medium">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QR Code Section */}
      <section className="py-24 px-6 bg-caby-dark">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-8 bg-caby-gold/20 rounded-3xl flex items-center justify-center">
            <QrCode className="w-10 h-10 text-caby-gold" />
          </div>

          <h2 className="text-2xl font-display font-bold text-white mb-4">
            Votre chauffeur vous a donné son code ?
          </h2>
          <p className="text-caby-muted mb-8">
            Entrez son code pour vous affilier et le retrouver facilement
          </p>

          <form onSubmit={handleQrSubmit} className="flex gap-3">
            <Input
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value.toUpperCase())}
              placeholder="CODE CHAUFFEUR"
              maxLength={8}
              className="flex-1 h-14 bg-caby-card border-caby-border text-white text-center text-lg font-mono uppercase tracking-widest rounded-2xl"
            />
            <Button
              type="submit"
              disabled={qrCode.length < 6}
              className="h-14 px-6 btn-gold rounded-2xl"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <button
            onClick={() => navigate('/scan')}
            className="mt-4 text-caby-gold text-sm font-medium hover:underline"
          >
            ou scanner un QR Code
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-caby-black border-t border-caby-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <Logo size="md" />
            
            <div className="flex items-center gap-6 text-sm text-caby-muted">
              <a href="/cgu" className="hover:text-white transition-colors">CGU</a>
              <a href="/privacy" className="hover:text-white transition-colors">Confidentialité</a>
              <a href="/contact" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>

          <div className="text-center text-xs text-caby-muted">
            <p className="mb-2">
              © {new Date().getFullYear()} {APP_CONFIG.COMPANY_NAME} — {APP_CONFIG.DEFAULT_CITY}, {APP_CONFIG.DEFAULT_COUNTRY}
            </p>
            <p className="flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" />
              <span>Entreprise certifiée LSE</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
