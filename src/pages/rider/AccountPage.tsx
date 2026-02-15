import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Wallet,
  Shield,
  Mail,
  Leaf,
  Gift,
  ChevronRight,
  Star,
  LogOut,
} from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-14 pb-6">
        {/* Profile header - Uber style */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{profile?.full_name || 'Utilisateur'}</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="w-4 h-4 fill-foreground text-foreground" />
              <span className="text-sm font-medium">4.93</span>
            </div>
          </div>
          <Avatar className="w-16 h-16 border border-border">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-xl bg-muted text-muted-foreground">
              {profile?.full_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* 4 action buttons - 2x2 grid like Uber */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => navigate('/caby/account/help')}
            className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-sm">Aide</span>
          </button>
          <button
            onClick={() => navigate('/caby/payment')}
            className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
          >
            <Wallet className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-sm">Portefeuille</span>
          </button>
          <button
            onClick={() => navigate('/caby/account/security')}
            className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
          >
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-sm">Sécurité</span>
          </button>
          <button
            onClick={() => navigate('/caby/account/messages')}
            className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
          >
            <Mail className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-sm">Messages</span>
          </button>
        </div>

        {/* Large info tiles - Uber style stacked cards */}
        <div className="space-y-3">
          {/* Caby Premium promo tile */}
          <button className="w-full flex items-center gap-4 bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 transition-colors">
            <div className="flex-1">
              <p className="font-bold text-base">Économisez 42.52 CHF avec Caby Premium</p>
              <p className="text-sm text-muted-foreground mt-1">
                Vous auriez économisé 2.8x le coût de Caby Premium ces 30 derniers jours
              </p>
            </div>
            <div className="text-3xl flex-shrink-0">💰</div>
          </button>

          {/* Safety check-up tile */}
          <button className="w-full flex items-center gap-4 bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 transition-colors">
            <div className="flex-1">
              <p className="font-bold text-base">Bilan sécurité</p>
              <p className="text-sm text-muted-foreground mt-1">Découvrez comment rendre vos courses plus sûres</p>
            </div>
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--caby-blue))" strokeWidth="3" strokeDasharray="125.6" strokeDashoffset="104.7" strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">1/6</span>
            </div>
          </button>

          {/* CO2 tile */}
          <button className="w-full flex items-center justify-between bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 transition-colors">
            <p className="font-bold text-base">Estimation CO₂ économisée</p>
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-[hsl(var(--caby-green))]" />
              <span className="text-xl font-bold">1'740 g</span>
            </div>
          </button>

          {/* Referral tile */}
          <button className="w-full flex items-center gap-4 bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 transition-colors">
            <div className="flex-1">
              <p className="font-bold text-base">Invitez vos amis sur Caby</p>
              <p className="text-sm text-muted-foreground mt-1">Obtenez 50% de réduction sur 5 courses</p>
            </div>
            <Gift className="w-8 h-8 text-primary flex-shrink-0" />
          </button>
        </div>

        {/* Sign out */}
        <div className="mt-8 pt-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Se déconnecter
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AccountPage;
