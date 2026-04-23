import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import CabyVanHome from '@/pages/rider/CabyVanHome';
import Index from '@/pages/Index';

const CabyRoot: React.FC = () => {
  const isMobile = useIsMobile();
  if (isMobile) return <CabyVanHome />;
  return <Index />;
};

export default CabyRoot;
