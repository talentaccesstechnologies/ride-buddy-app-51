import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import CabyVanHome from '@/pages/rider/CabyVanHome';
import Index from '@/pages/Index';

const CabyRoot: React.FC = () => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  if (loading) return null;

  // Non connecté → landing visiteur (desktop ET mobile)
  if (!user) return <Index />;

  // Connecté mobile → app 5 onglets
  if (isMobile) return <CabyVanHome />;

  // Connecté desktop → app web (à développer)
  return <CabyVanHome />;
};

export default CabyRoot;
