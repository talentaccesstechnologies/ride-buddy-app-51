import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Wallet,
  Shield,
  MessageSquare,
  Leaf,
  Gift,
  ChevronRight,
  Star,
  Settings,
  LogOut,
} from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const quickActions = [
    { icon: HelpCircle, label: 'Aide', path: '/caby/account/help', color: 'bg-[hsl(var(--caby-blue))]/15 text-[hsl(var(--caby-blue))]' },
    { icon: Wallet, label: 'Portefeuille', path: '/caby/payment', color: 'bg-primary/15 text-primary' },
    { icon: Shield, label: 'Sécurité', path: '/caby/account/security', color: 'bg-[hsl(var(--caby-green))]/15 text-[hsl(var(--caby-green))]' },
    { icon: MessageSquare, label: 'Messages', path: '/caby/account/messages', color: 'bg-[hsl(var(--caby-purple))]/15 text-[hsl(var(--caby-purple))]' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with profile */}
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="w-14 h-14 border-2 border-border">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-lg bg-card">
                {profile?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{profile?.full_name || 'Utilisateur'}</h1>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                <span className="font-medium">4.93</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/caby/account/settings')}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Quick action grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Info tiles */}
        <div className="space-y-3">
          {/* CO2 Tile */}
          <button
            className="w-full flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-[hsl(var(--caby-green))]/15 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-[hsl(var(--caby-green))]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Estimation CO₂ économisée</p>
              <p className="text-xs text-muted-foreground mt-0.5">12.4 kg de CO₂ en moins ce mois</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Referral Tile */}
          <button
            className="w-full flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Parrainage</p>
              <p className="text-xs text-muted-foreground mt-0.5">Invitez un ami et gagnez 10 CHF chacun</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
