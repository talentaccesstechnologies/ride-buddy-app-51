import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import CabyVanHome from '@/pages/rider/CabyVanHome';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const CabyRoot: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isMobile) {
      navigate('/caby/van', { replace: true });
    }
  }, [isMobile, navigate]);

  if (!isMobile) return null;
  return <CabyVanHome />;
};

export default CabyRoot;
