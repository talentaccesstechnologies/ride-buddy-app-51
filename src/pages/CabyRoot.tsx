// ============================================================
// src/pages/CabyRoot.tsx
// Router mobile / desktop — même URL, rendu différent
//
// Mobile  (< 768px) → CabyVanHome  — 5 onglets natifs
// Desktop (≥ 768px) → Index        — version web existante
// ============================================================

import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import CabyVanHome from '@/pages/rider/CabyVanHome';
import Index from '@/pages/Index';

const CabyRoot: React.FC = () => {
  const isMobile = useIsMobile();
  return isMobile ? <CabyVanHome /> : <Index />;
};

export default CabyRoot;
