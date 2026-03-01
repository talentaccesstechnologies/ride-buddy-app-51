import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateDemoTour, TourProposal, ColisItem, ColisFlowPhase } from '@/components/cabyDriver/colis/colisData';
import TourProposalCard from '@/components/cabyDriver/colis/TourProposalCard';
import TourActiveView from '@/components/cabyDriver/colis/TourActiveView';
import TourCompletedView from '@/components/cabyDriver/colis/TourCompletedView';

const DriverColisFlowPage: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<ColisFlowPhase>('proposal');
  const [tour, setTour] = useState<TourProposal>(generateDemoTour);
  const [items, setItems] = useState<ColisItem[]>(tour.items);

  const handleShuffle = () => {
    const newTour = generateDemoTour();
    setTour(newTour);
    setItems(newTour.items);
  };

  const handleAccept = () => {
    setPhase('tour_active');
  };

  const handleUpdateItem = useCallback((id: string, updates: Partial<ColisItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const handleTourComplete = () => {
    setPhase('completed');
  };

  const handleFinish = () => {
    navigate('/caby/driver/dashboard');
  };

  if (phase === 'proposal') {
    return <TourProposalCard tour={tour} onAccept={handleAccept} onShuffle={handleShuffle} />;
  }

  if (phase === 'completed') {
    return <TourCompletedView tour={tour} onFinish={handleFinish} />;
  }

  // tour_active, at_pickup, delivering, at_delivery
  return (
    <TourActiveView
      items={items}
      onUpdateItem={handleUpdateItem}
      onTourComplete={handleTourComplete}
    />
  );
};

export default DriverColisFlowPage;
