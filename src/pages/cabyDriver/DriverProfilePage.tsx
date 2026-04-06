import React, { useState } from 'react';
import { ArrowLeft, Shield, LogOut, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DriverBottomNav from '@/components/cabyDriver/DriverBottomNav';
import DriverPhotoUpload from '@/components/cabyDriver/DriverPhotoUpload';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

const DriverProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl active:bg-muted">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Paramètres</p>
          <h1 className="text-2xl font-display font-bold text-foreground mt-1">Mon Profil</h1>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-6">
        {/* Photo upload */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-primary" />
            <h3 className="text-sm font-display font-bold text-foreground">Photo de profil</h3>
          </div>
          <DriverPhotoUpload />
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Visible par vos clients et dans le Club chauffeur
          </p>
        </div>

        {/* Personal info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-muted-foreground/30" />
            <h3 className="text-sm font-display font-bold text-foreground">Informations</h3>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Nom complet</span>
              <span className="text-sm font-semibold text-foreground">{profile?.full_name || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Email</span>
              <span className="text-sm font-semibold text-foreground">{profile?.email || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Téléphone</span>
              <span className="text-sm font-semibold text-foreground">{profile?.phone || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-5 mt-10">
        <Button
          variant="ghost"
          onClick={() => setShowLogoutDialog(true)}
          className="w-full justify-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl h-12"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </Button>
      </div>

      {/* Footer */}
      <div className="px-5 mt-6 mb-4">
        <div className="flex items-center justify-center gap-4 opacity-30">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Caby LSE Certified</span>
          </div>
        </div>
      </div>

      {/* Logout confirmation dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="rounded-2xl max-w-[90vw]">
          <AlertDialogHeader>
            <AlertDialogTitle>Se déconnecter ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir vous déconnecter de votre compte Caby ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DriverBottomNav />
    </div>
  );
};

export default DriverProfilePage;
