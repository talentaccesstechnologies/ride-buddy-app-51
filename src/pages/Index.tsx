import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Logo */}
        <div className="text-8xl mb-6 animate-fade-in">🚗</div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          VTC App
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-md mb-12">
          Votre trajet, simplifié. Commandez une course en quelques secondes.
        </p>

        {/* CTA buttons */}
        <div className="w-full max-w-sm space-y-4">
          <Button
            onClick={() => navigate('/auth/login')}
            className="w-full h-14 text-lg"
          >
            Se connecter
          </Button>
          
          <Button
            onClick={() => navigate('/auth/register')}
            variant="outline"
            className="w-full h-14 text-lg"
          >
            Créer un compte
          </Button>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <p className="text-sm text-muted-foreground">Réservation rapide</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🛡️</div>
            <p className="text-sm text-muted-foreground">Trajets sécurisés</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">💳</div>
            <p className="text-sm text-muted-foreground">Paiement facile</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground safe-area-bottom">
        <p>© 2026 VTC App. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default Index;
