import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Shield,
  Bell,
  Lock,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Star,
} from 'lucide-react';
import BottomNav from '@/components/rider/BottomNav';
import RiderHeader from '@/components/rider/RiderHeader';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const menuItems = [
    { icon: User, label: 'Modifier le profil', path: '/rider/account/edit' },
    { icon: MapPin, label: 'Lieux sauvegardés', path: '/rider/account/places' },
    { icon: Shield, label: 'Sécurité', path: '/rider/account/security' },
    { icon: Bell, label: 'Notifications', path: '/rider/account/notifications' },
    { icon: Lock, label: 'Confidentialité', path: '/rider/account/privacy' },
    { icon: HelpCircle, label: 'Aide et support', path: '/rider/account/help' },
    { icon: Info, label: 'À propos', path: '/rider/account/about' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <RiderHeader title="Compte" />

      <div className="pt-16 px-4">
        {/* Profile header */}
        <div className="flex items-center gap-4 py-6 border-b border-border">
          <Avatar className="w-20 h-20">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-2xl">
              {profile?.full_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{profile?.full_name || 'Utilisateur'}</h2>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span>4.95</span>
              <span className="mx-2">•</span>
              <span>Passager</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Membre depuis {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Menu items */}
        <nav className="py-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-4 py-4 hover:bg-secondary/50 rounded-xl px-2 transition-colors"
            >
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </nav>

        {/* Sign out button */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Se déconnecter
          </Button>

          <button className="w-full text-center text-sm text-muted-foreground mt-4 py-2 hover:text-destructive transition-colors">
            Supprimer mon compte
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AccountPage;
