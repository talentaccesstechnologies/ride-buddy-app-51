import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Package } from 'lucide-react';
import { toast } from 'sonner';
import { RadarCourse, LegalStatus } from '@/types/radar.types';
import { APP_CONFIG } from '@/config/app.config';
import RadarHeader from '@/components/tatfleet/RadarHeader';
import RadarToggle from '@/components/tatfleet/RadarToggle';
import RadarAnimation from '@/components/tatfleet/RadarAnimation';
import RadarEmptyState from '@/components/tatfleet/RadarEmptyState';
import DriverBottomNav from '@/components/tatfleet/DriverBottomNav';
import LegalBlockOverlay from '@/components/tatfleet/LegalBlockOverlay';
import TransferModal from '@/components/tatfleet/TransferModal';
import MotoSafetyChecklist from '@/components/tatfleet/MotoSafetyChecklist';
import SwipeableCard from '@/components/tatfleet/SwipeableCard';
import SwipeableCourseCard from '@/components/tatfleet/SwipeableCourseCard';
import Logo from '@/components/shared/Logo';

// Demo data
const demoCourses: RadarCourse[] = [
  {
    id: 'demo-1',
    type: 'private_client',
    source: 'qr_code',
    clientDisplayName: 'Jean-Luc Gauthier',
    clientIsProtected: false,
    pickupAddress: 'Gare de Genève-Cornavin',
    pickupLat: 46.2100,
    pickupLng: 6.1426,
    dropoffAddress: 'Route de la Capite 12, Cologny',
    dropoffLat: 46.2186,
    dropoffLng: 6.1837,
    estimatedPrice: 42,
    estimatedDistance: 5.8,
    estimatedDuration: 14,
    vehicleTypeRequired: 'premium',
    expiresAt: new Date(Date.now() + 30000),
    createdAt: new Date(Date.now() - 10000),
    meta: { date: new Date().toISOString(), source: 'qr_code', sujet: 'Course privée', lien: '', description: 'Client affilié QR', eligible: true },
  },
  {
    id: 'demo-2',
    type: 'caby_direct',
    source: 'caby_app',
    clientDisplayName: 'Sophie Müller',
    clientIsProtected: false,
    pickupAddress: 'Rue du Rhône 48, Genève',
    pickupLat: 46.2017,
    pickupLng: 6.1468,
    dropoffAddress: 'CERN, Meyrin',
    dropoffLat: 46.2330,
    dropoffLng: 6.0557,
    estimatedPrice: 38,
    estimatedDistance: 9.2,
    estimatedDuration: 16,
    vehicleTypeRequired: 'standard',
    expiresAt: new Date(Date.now() + 15000),
    createdAt: new Date(Date.now() - 5000),
    meta: { date: new Date().toISOString(), source: 'caby_app', sujet: 'Caby Ride', lien: '', description: 'Commande Caby App', eligible: true },
  },
  {
    id: 'demo-3',
    type: 'livraison',
    source: 'caby_app',
    clientDisplayName: 'Zalando Express',
    clientIsProtected: false,
    pickupAddress: 'Hub Logistique Lancy',
    pickupLat: 46.1800,
    pickupLng: 6.1200,
    dropoffAddress: 'Rue de Carouge 90, Genève',
    dropoffLat: 46.1950,
    dropoffLng: 6.1400,
    estimatedPrice: 15,
    estimatedDistance: 3.1,
    estimatedDuration: 8,
    vehicleTypeRequired: 'standard',
    expiresAt: new Date(Date.now() + 60000),
    createdAt: new Date(Date.now() - 30000),
    meta: { date: new Date().toISOString(), source: 'caby_app', sujet: 'Livraison', lien: '', description: 'Forfait livraison', eligible: true },
  },
  {
    id: 'demo-4',
    type: 'network_dispatch',
    source: 'private_dispatch',
    clientDisplayName: 'Client de Domingo M.',
    clientIsProtected: true,
    pickupAddress: 'Aéroport de Genève (GVA)',
    pickupLat: 46.2381,
    pickupLng: 6.1089,
    dropoffAddress: 'Place du Marché, Nyon',
    dropoffLat: 46.3833,
    dropoffLng: 6.2398,
    estimatedPrice: 85,
    estimatedDistance: 28.4,
    estimatedDuration: 32,
    vehicleTypeRequired: 'standard',
    networkCommission: 8.50,
    netPriceForDriver: 76.50,
    senderDriverName: 'Domingo M.',
    expiresAt: new Date(Date.now() + 300000),
    createdAt: new Date(Date.now() - 60000),
    meta: { date: new Date().toISOString(), source: 'private_dispatch', sujet: 'Dispatch réseau', lien: '', description: 'Transféré par Domingo', eligible: true },
  },
];

const DriverRadarPage: React.FC = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [legalStatus] = useState<LegalStatus>('green');
  const [courses, setCourses] = useState<RadarCourse[]>([]);
  const [transferCourse, setTransferCourse] = useState<RadarCourse | null>(null);
  const [motoCheckCourse, setMotoCheckCourse] = useState<RadarCourse | null>(null);
  const [driverMode, setDriverMode] = useState<'passenger' | 'logistics'>('passenger');
  const [stats] = useState({ todayRides: 3, todayEarnings: 145, onlineMinutes: 127 });

  const handleSwitchMode = () => {
    if (driverMode === 'passenger') {
      navigate('/tatfleet/logistics');
    } else {
      setDriverMode('passenger');
    }
  };

  // Sort by priority
  const sortedCourses = [...courses].sort((a, b) => {
    const priority: Record<string, number> = { private_client: 0, network_dispatch: 1, caby_direct: 2, livraison: 3, uber_sync: 4 };
    return (priority[a.type] ?? 5) - (priority[b.type] ?? 5);
  });

  const handleToggleOnline = useCallback((value: boolean) => {
    if (legalStatus === 'red') {
      toast.error('Documents expirés', { description: "Mettez à jour vos documents pour reprendre l'activité" });
      return;
    }
    setIsOnline(value);
    if (value) {
      setTimeout(() => {
        setCourses(demoCourses.map(c => ({
          ...c,
          expiresAt: new Date(Date.now() + (c.type === 'private_client' ? 30000 : c.type === 'caby_direct' ? 15000 : 300000)),
          createdAt: new Date(),
        })));
      }, 2000);
      toast.success('Radar activé', { description: 'Vous recevrez les courses à proximité' });
    } else {
      setCourses([]);
      toast.info('Radar désactivé');
    }
  }, [legalStatus]);

  const handleSwipeRight = useCallback((courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    if (course.vehicleTypeRequired === 'moto') {
      setMotoCheckCourse(course);
      return;
    }

    toast.success('Course acceptée !', { description: `${course.pickupAddress} → ${course.dropoffAddress}` });
    setCourses(prev => prev.filter(c => c.id !== courseId));
  }, [courses]);

  const handleSwipeLeft = useCallback((courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    toast.info('Course ignorée');
  }, []);

  const handleShare = useCallback((courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setTransferCourse(course);
    }
  }, [courses]);

  const handleConfirmTransfer = useCallback(async (courseId: string, notes: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      const commission = course.estimatedPrice * 0.10;
      toast.success('Course partagée au Club Privé ✓', {
        description: `Rétrocession de ${commission.toFixed(0)} ${APP_CONFIG.DEFAULT_CURRENCY} si exécutée`,
      });
    }
    setCourses(prev => prev.filter(c => c.id !== courseId));
    setTransferCourse(null);
  }, [courses]);

  const handleExpire = useCallback((courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    toast.info('Course expirée');
  }, []);

  const handleMotoCheckConfirm = useCallback(() => {
    if (!motoCheckCourse) return;
    toast.success('Course Moto acceptée !', { description: `Équipement vérifié · ${motoCheckCourse.pickupAddress}` });
    setCourses(prev => prev.filter(c => c.id !== motoCheckCourse.id));
    setMotoCheckCourse(null);
  }, [motoCheckCourse]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {legalStatus === 'red' && <LegalBlockOverlay />}

      <RadarHeader
        isOnline={isOnline}
        legalStatus={legalStatus}
        unreadNotifications={2}
        onNotificationClick={() => navigate('/tatfleet/notifications')}
      />

      <RadarToggle
        isOnline={isOnline}
        onToggle={handleToggleOnline}
        disabled={legalStatus === 'red'}
      />

      {/* Mode toggle + title */}
      <div className="px-4 mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-display font-bold text-foreground flex-1">
          Radar de Courses
        </h1>
        <button
          onClick={handleSwitchMode}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-semibold"
        >
          <Package className="w-3.5 h-3.5 text-primary" />
          <span className="text-primary">Mode Colis</span>
        </button>
      </div>

      {/* Course count */}
      {isOnline && sortedCourses.length > 0 && (
        <div className="px-4 mb-3">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            {sortedCourses.length} course{sortedCourses.length > 1 ? 's' : ''} disponible{sortedCourses.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="px-4">
        {isOnline && courses.length === 0 && (
          <>
            <RadarAnimation isActive={true} />
            <RadarEmptyState stats={stats} />
          </>
        )}

        {/* Tinder-style stacked cards */}
        {isOnline && sortedCourses.length > 0 && (
          <div className="relative" style={{ height: '480px' }}>
            {sortedCourses.slice(0, 3).map((course, index) => (
              <SwipeableCard
                key={course.id}
                isTop={index === 0}
                index={index}
                onSwipeRight={() => handleSwipeRight(course.id)}
                onSwipeLeft={() => handleSwipeLeft(course.id)}
              >
                <SwipeableCourseCard
                  course={course}
                  onShare={handleShare}
                  onExpire={handleExpire}
                />
              </SwipeableCard>
            ))}
          </div>
        )}

        {!isOnline && (
          <div className="text-center py-16">
            <Logo size="lg" showTagline className="mb-8 opacity-30" />
            <p className="text-muted-foreground">
              Activez le radar pour recevoir des courses
            </p>
          </div>
        )}
      </div>

      {/* Footer branding */}
      <div className="fixed bottom-20 left-0 right-0 flex items-center justify-center gap-4 py-2 opacity-30">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Shield className="w-3 h-3" />
          <span>TATFleet LSE Certified</span>
        </div>
        {!APP_CONFIG.IS_TEST_MODE && (
          <span className="text-[8px] font-mono text-muted-foreground">
            ENCRYPTED_STREAM_V2_ACTIVE
          </span>
        )}
      </div>

      <DriverBottomNav />

      {transferCourse && (
        <TransferModal
          course={transferCourse}
          driverName="Mohamed"
          onConfirm={handleConfirmTransfer}
          onClose={() => setTransferCourse(null)}
        />
      )}

      {motoCheckCourse && (
        <MotoSafetyChecklist
          onConfirm={handleMotoCheckConfirm}
          onClose={() => setMotoCheckCourse(null)}
        />
      )}
    </div>
  );
};

export default DriverRadarPage;
