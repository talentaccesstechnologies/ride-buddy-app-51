import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  ShieldCheck,
  Lock,
  ChevronRight,
  Smartphone,
  Monitor,
  LogOut,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/rider/BottomNav';

type TabKey = 'home' | 'personal' | 'security' | 'privacy';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'home', label: 'Accueil' },
  { key: 'personal', label: 'Infos personnelles' },
  { key: 'security', label: 'Sécurité' },
  { key: 'privacy', label: 'Confidentialité' },
];

const AccountSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/caby/account')} className="p-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-bold">Compte Caby</h1>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-5 px-5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Tab content */}
      <div className="px-5 pt-6">
        {activeTab === 'home' && <HomeTab profile={profile} />}
        {activeTab === 'personal' && <PersonalInfoTab profile={profile} />}
        {activeTab === 'security' && <SecurityTab onSignOut={handleSignOut} />}
        {activeTab === 'privacy' && <PrivacyTab />}
      </div>

      <BottomNav />
    </div>
  );
};

/* ─── HOME TAB ─── */
const HomeTab: React.FC<{ profile: any }> = ({ profile }) => (
  <div className="flex flex-col items-center">
    <Avatar className="w-24 h-24 border-2 border-border mb-4">
      <AvatarImage src={profile?.avatar_url || undefined} />
      <AvatarFallback className="text-3xl bg-muted text-muted-foreground">
        {profile?.full_name?.[0] || 'U'}
      </AvatarFallback>
    </Avatar>
    <h2 className="text-xl font-bold">{profile?.full_name || 'Utilisateur'}</h2>
    <p className="text-sm text-muted-foreground mt-1">{profile?.email}</p>

    {/* Quick action tiles */}
    <div className="grid grid-cols-3 gap-3 w-full mt-6">
      {[
        { icon: User, label: 'Infos\npersonnelles' },
        { icon: ShieldCheck, label: 'Sécurité' },
        { icon: Lock, label: 'Confidentialité\n& données' },
      ].map((item, i) => (
        <button
          key={i}
          className="flex flex-col items-center gap-2 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
        >
          <item.icon className="w-6 h-6 text-muted-foreground" />
          <span className="text-xs text-center font-medium whitespace-pre-line">
            {item.label}
          </span>
        </button>
      ))}
    </div>

    {/* Suggestions */}
    <div className="w-full mt-8">
      <h3 className="text-lg font-bold mb-4">Suggestions</h3>
      <button className="w-full flex items-center gap-4 bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 transition-colors">
        <div className="flex-1">
          <p className="font-bold text-base">Complétez votre vérification de compte</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complétez votre profil pour sécuriser votre compte Caby.
          </p>
          <span className="inline-block mt-3 px-4 py-1.5 bg-muted rounded-full text-xs font-medium text-foreground">
            Commencer
          </span>
        </div>
        <div className="text-3xl flex-shrink-0">🛡️</div>
      </button>
    </div>
  </div>
);

/* ─── PERSONAL INFO TAB ─── */
const PersonalInfoTab: React.FC<{ profile: any }> = ({ profile }) => {
  const fields = [
    { icon: User, label: 'Nom', value: profile?.full_name || '—' },
    { icon: Phone, label: 'Téléphone', value: profile?.phone || 'Non renseigné' },
    { icon: Mail, label: 'E-mail', value: profile?.email || '—' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Infos personnelles</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Gérez vos informations personnelles, y compris votre nom et vos coordonnées.
      </p>

      <div className="space-y-1">
        {fields.map((field, i) => (
          <button
            key={i}
            className="w-full flex items-center justify-between py-4 border-b border-border hover:bg-card/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <field.icon className="w-5 h-5 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm text-muted-foreground">{field.label}</p>
                <p className="text-base font-medium">{field.value}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─── SECURITY TAB ─── */
const SecurityTab: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => {
  const devices = [
    {
      icon: Smartphone,
      name: 'SM-S908B',
      current: true,
      location: 'Geneva, Switzerland',
      apps: 'Caby Rider',
    },
    { icon: Monitor, name: 'PC', current: false, location: '', apps: '' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Sécurité</h2>

      {/* Connected social apps */}
      <div className="mt-6 mb-8">
        <h3 className="text-lg font-bold mb-2">Applications sociales connectées</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Gérez les applications connectées à votre compte Caby.
        </p>
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold">G</span>
            <span className="font-medium">Google</span>
          </div>
          <button className="px-4 py-1.5 bg-muted rounded-full text-sm font-medium text-foreground">
            Déconnecter
          </button>
        </div>
      </div>

      {/* Login activity */}
      <h3 className="text-lg font-bold mb-2">Activité de connexion</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Appareils connectés au cours des 30 derniers jours.
      </p>

      <div className="space-y-3">
        {devices.map((device, i) => (
          <div
            key={i}
            className={`flex items-start gap-4 p-4 rounded-xl ${
              device.current ? 'bg-card border border-border' : ''
            }`}
          >
            <device.icon className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">{device.name}</p>
              {device.current && (
                <p className="text-sm text-[hsl(var(--caby-blue))]">Connexion actuelle</p>
              )}
              {device.location && (
                <p className="text-sm text-muted-foreground">{device.location}</p>
              )}
              {device.apps && (
                <p className="text-sm text-muted-foreground">{device.apps}</p>
              )}
            </div>
            {!device.current && (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Sign out all */}
      <button
        onClick={onSignOut}
        className="flex items-center gap-3 mt-6 py-4 border-t border-border w-full"
      >
        <LogOut className="w-5 h-5 text-foreground" />
        <div className="text-left">
          <p className="font-bold text-sm">Se déconnecter de tous les appareils</p>
          <p className="text-xs text-muted-foreground">
            Sauf votre connexion actuelle
          </p>
        </div>
      </button>
    </div>
  );
};

/* ─── PRIVACY TAB ─── */
const PrivacyTab: React.FC = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6">Confidentialité & données</h2>

    <h3 className="text-lg font-bold mb-2">Confidentialité</h3>
    <button className="w-full flex items-center justify-between py-4 border-b border-border">
      <div>
        <p className="font-bold text-sm">Centre de confidentialité</p>
        <p className="text-sm text-muted-foreground mt-1">
          Contrôlez votre vie privée et découvrez comment nous la protégeons.
        </p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    </button>

    <h3 className="text-lg font-bold mt-8 mb-2">
      Applications tierces avec accès au compte
    </h3>
    <p className="text-sm text-muted-foreground">
      Lorsque vous autorisez des applications tierces, elles apparaîtront ici.{' '}
      <span className="underline">En savoir plus</span>
    </p>
  </div>
);

export default AccountSettingsPage;
