import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import CabyVanHome from '@/pages/rider/CabyVanHome';
import Index from '@/pages/Index';

const CabyRoot: React.FC = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Utilisateur connecté → toujours le dashboard, peu importe le device
  if (user) return <CabyVanHome />;

  // Non connecté : mobile voit le dashboard (lui-même gère les CTA), desktop voit la landing
  if (isMobile) return <CabyVanHome />;
  return <Index />;
};

export default CabyRoot;
