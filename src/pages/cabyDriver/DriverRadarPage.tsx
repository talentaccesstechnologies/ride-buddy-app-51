import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Package } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { RadarCourse, LegalStatus } from '@/types/radar.types';
import { APP_CONFIG } from '@/config/app.config';
import RadarHeader from '@/components/cabyDriver/RadarHeader';
import RadarToggle from '@/components/cabyDriver/RadarToggle';
import RadarAnimation from '@/components/cabyDriver/RadarAnimation';
import RadarEmptyState from '@/components/cabyDriver/RadarEmptyState';
import DriverBottomNav from '@/components/cabyDriver/DriverBottomNav';
import LegalBlockOverlay from '@/components/cabyDriver/LegalBlockOverlay';
import MotoSafetyChecklist from '@/components/cabyDriver/MotoSafetyChecklist';
import IncomingRideCard from '@/components/cabyDriver/IncomingRideCard';
import AcceptedRideOverlay from '@/components/cabyDriver/AcceptedRideOverlay';
import Logo from '@/components/shared/Logo';

const makeMeta = (source: string, sujet: string, desc: string) => ({
  date: new Date().toISOString(), source: source as any, sujet, lien: '', description: desc, eligible: true,
});

// 10 courses: 5 private_client + 5 pool général (caby_direct)
const demoCourses: RadarCourse[] = [
  // === 5 CLIENTS PRIVÉS ===
  {
    id: 'priv-1', type: 'private_client', source: 'qr_code',
    clientDisplayName: 'Sophie Laurent',
    clientAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    clientIsProtected: false, clientRating: 4.9,
    clientNote: 'Client régulier — aéroport',
    pickupAddress: 'Rue du Rhône 48, Genève',
    pickupLat: 46.2017, pickupLng: 6.1468,
    dropoffAddress: 'Aéroport de Genève (GVA)',
    dropoffLat: 46.2381, dropoffLng: 6.1089,
    estimatedPrice: 72, estimatedDistance: 12.4, estimatedDuration: 18,
    vehicleTypeRequired: 'premium',
    expiresAt: new Date(Date.now() + 30000), createdAt: new Date(),
    meta: makeMeta('qr_code', 'Course privée', 'Client affilié QR'),
  },
  {
    id: 'priv-2', type: 'private_client', source: 'qr_code',
    clientDisplayName: 'Marc Dupont',
    clientAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    clientIsProtected: false, clientRating: 4.7,
    clientNote: 'Toujours ponctuel',
    pickupAddress: 'Place Bel-Air, Genève',
    pickupLat: 46.2022, pickupLng: 6.1430,
    dropoffAddress: 'Hôpital Universitaire (HUG)',
    dropoffLat: 46.1929, dropoffLng: 6.1496,
    estimatedPrice: 18, estimatedDistance: 2.8, estimatedDuration: 7,
    vehicleTypeRequired: 'standard',
    expiresAt: new Date(Date.now() + 30000), createdAt: new Date(),
    meta: makeMeta('qr_code', 'Course privée', 'Client fidèle'),
  },
  {
    id: 'priv-3', type: 'private_client', source: 'phone',
    clientDisplayName: 'Émilie Favre',
    clientAvatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    clientIsProtected: false, clientRating: 5.0,
    clientNote: 'VIP — Hôtel Président Wilson',
    pickupAddress: 'Hôtel Président Wilson, Quai Wilson',
    pickupLat: 46.2130, pickupLng: 6.1560,
    dropoffAddress: 'Centre commercial Balexert',
    dropoffLat: 46.2190, dropoffLng: 6.1100,
    estimatedPrice: 35, estimatedDistance: 6.1, estimatedDuration: 14,
    vehicleTypeRequired: 'premium',
    expiresAt: new Date(Date.now() + 30000), createdAt: new Date(),
    meta: makeMeta('phone', 'Course privée', 'Appel direct VIP'),
  },
  {
    id: 'priv-4', type: 'private_client', source: 'qr_code',
    clientDisplayName: 'Jean-Pierre Morel',
    clientIsProtected: false, clientRating: 4.6,
    pickupAddress: 'Gare de Cornavin, Genève',
    pickupLat: 46.2100, pickupLng: 6.1420,
    dropoffAddress: 'Palexpo, Grand-Saconnex',
    dropoffLat: 46.2335, dropoffLng: 6.1120,
    estimatedPrice: 28, estimatedDistance: 5.3, estimatedDuration: 11,
    vehicleTypeRequired: 'standard',
    expiresAt: new Date(Date.now() + 30000), createdAt: new Date(),
    meta: makeMeta('qr_code', 'Course privée', 'Client QR habituel'),
  },
  {
    id: 'priv-5', type: 'private_client', source: 'qr_code',
    clientDisplayName: 'Nadia Benali',
    clientAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    clientIsProtected: false, clientRating: 4.8,
    clientNote: 'Préfère la musique classique',
    pickupAddress: 'Rue de la Servette 72, Genève',
    pickupLat: 46.2140, pickupLng: 6.1340,
    dropoffAddress: 'ONU — Palais des Nations',
    dropoffLat: 46.2265, dropoffLng: 6.1400,
    estimatedPrice: 22, estimatedDistance: 3.6, estimatedDuration: 9,
    vehicleTypeRequired: 'standard',
    expiresAt: new Date(Date.now() + 30000), createdAt: new Date(),
    meta: makeMeta('qr_code', 'Course privée', 'Client privé régulier'),
  },

  // === 5 POOL GÉNÉRAL ===
  {
    id: 'pool-1', type: 'caby_direct', source: 'caby_app',
    clientDisplayName: 'Thomas R.',
    clientIsProtected: false, clientRating: 4.5,
    pickupAddress: 'Plainpalais, Genève',
    pickupLat: 46.1967, pickupLng: 6.1420,
    dropoffAddress: 'Carouge, Place du Marché',
    dropoffLat: 46.1835, dropoffLng: 6.1395,
    estimatedPrice: 15, estimatedDistance: 2.1, estimatedDuration: 6,
    vehicleTypeRequired: 'standard',
    expiresAt: new Date(Date.now() + 20000), createdAt: new Date(),
    meta: makeMeta('caby_app', 'Caby Ride', 'Pool général'),
  },
  {
    id: 'pool-2', type: 'caby_direct', source: 'caby_app',
    clientDisplayName: 'Laura M.',
    clientAvatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    clientIsProtected: false, clientRating: 4.3,
    pickupAddress: 'Eaux-Vives, Genève',
    pickupLat: 46.2020, pickupLng: 6.1630,
    dropoffAddress: 'Champel, Av. de Champel 45',
    dropoffLat: 46.1910, dropoffLng: 6.1530,
    estimatedPrice: 19, estimatedDistance: 3.2, estimatedDuration: 8,
    vehicleTypeRequired: 'standard',
    expiresAt: new Date(Date.now() + 20000), createdAt: new Date(),
    meta: makeMeta('caby_app', 'Caby Ride', 'Pool général'),
  },
  {
    id: 'pool-3', type: 'caby_direct', source: 'caby_app',
    clientDisplayName: 'Ahmed K.',
    clientIsProtected: false, clientRating: 4.1,
    pickupAddress: 'Jonction, Bd Carl-Vogt',
    pickupLat: 46.1980, pickupLng: 6.1350,
    dropoffAddress: 'Vernier, Route de Meyrin 150',
    dropoffLat: 46.2170, dropoffLng: 6.0900,
    estimatedPrice: 25, estimatedDistance: 5.8, estimatedDuration: 13,
    vehicleTypeRequired: 'standard',
    expiresAt: new Date(Date.now() + 20000), createdAt: new Date(),
    meta: makeMeta('caby_app', 'Caby Ride', 'Pool général'),
  },
  {
    id: 'pool-4', type: 'caby_direct', source: 'caby_app',
    clientDisplayName: 'Isabelle C.',
    clientAvatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    clientIsProtected: false, clientRating: 4.8,
    pickupAddress: 'Pâquis, Rue de Berne 12',
    pickupLat: 46.2110, pickupLng: 6.1480,
    dropoffAddress: 'Lancy, Ch. des Palettes 18',
    dropoffLat: 46.1820, dropoffLng: 6.1190,
    estimatedPrice: 32, estimatedDistance: 6.9, estimatedDuration: 15,
    vehicleTypeRequired: 'standard',
    expiresAt: new Date(Date.now() + 20000), createdAt: new Date(),
    meta: makeMeta('caby_app', 'Caby Ride', 'Pool général'),
  },
  {
    id: 'pool-5', type: 'caby_direct', source: 'caby_app',
    clientDisplayName: 'Nicolas B.',
    clientIsProtected: false, clientRating: 4.4,
    pickupAddress: 'Acacias, Rue des Acacias',
    pickupLat: 46.1920, pickupLng: 6.1330,
    dropoffAddress: 'Thônex, Rue de Genève 60',
    dropoffLat: 46.1950, dropoffLng: 6.1980,
    estimatedPrice: 28, estimatedDistance: 7.5, estimatedDuration: 17,
    vehicleTypeRequired: 'standard',
    expiresAt: new Date(Date.now() + 20000), createdAt: new Date(),
    meta: makeMeta('caby_app', 'Caby Ride', 'Pool général'),
  },
];

const DriverRadarPage: React.FC = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [legalStatus] = useState<LegalStatus>('green');
  const [courses, setCourses] = useState<RadarCourse[]>([]);
  const [motoCheckCourse, setMotoCheckCourse] = useState<RadarCourse | null>(null);
  const [acceptedCourse, setAcceptedCourse] = useState<RadarCourse | null>(null);
  const [driverMode, setDriverMode] = useState<'passenger' | 'logistics'>('passenger');
  const [stats, setStats] = useState({ todayRides: 3, todayEarnings: 145, onlineMinutes: 127 });

  const handleSwitchMode = () => {
    if (driverMode === 'passenger') {
      navigate('/caby/driver/logistics');
    } else {
      setDriverMode('passenger');
    }
  };

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
          expiresAt: new Date(Date.now() + (c.type === 'private_client' ? 30000 : 20000)),
          createdAt: new Date(),
        })));
      }, 2000);
      toast.success('Radar activé', { description: 'Vous recevrez les courses à proximité' });
    } else {
      setCourses([]);
      toast.info('Radar désactivé');
    }
  }, [legalStatus]);

  const handleAccept = useCallback((courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    if (course.vehicleTypeRequired === 'moto') {
      setMotoCheckCourse(course);
      return;
    }
    setCourses(prev => prev.filter(c => c.id !== courseId));
    setAcceptedCourse(course);
  }, [courses]);

  const handleAcceptComplete = useCallback(() => {
    if (acceptedCourse) {
      setStats(prev => ({
        ...prev,
        todayRides: prev.todayRides + 1,
        todayEarnings: prev.todayEarnings + acceptedCourse.estimatedPrice,
      }));
    }
    setAcceptedCourse(null);
  }, [acceptedCourse]);

  const handleRefuse = useCallback((courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    toast.info('Course refusée — passée au chauffeur suivant');
  }, []);

  const handleShareToClub = useCallback((courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    const clubMembers = Math.floor(Math.random() * 8) + 3;
    const commission = course.estimatedPrice * 0.10;
    toast.success('Envoyé à votre Club', {
      description: `${clubMembers} membres notifiés · Rétrocession ${commission.toFixed(0)} ${APP_CONFIG.DEFAULT_CURRENCY}`,
      icon: '🏆',
    });
    setCourses(prev => prev.filter(c => c.id !== courseId));
  }, [courses]);

  const handleExpire = useCallback((courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    setCourses(prev => prev.filter(c => c.id !== courseId));
    if (course?.type === 'private_client') {
      toast.info('Course client privé redistribuée au Club', { icon: '🔄' });
    } else {
      toast.info('Course transmise au chauffeur suivant');
    }
  }, [courses]);

  const handleMotoCheckConfirm = useCallback(() => {
    if (!motoCheckCourse) return;
    setCourses(prev => prev.filter(c => c.id !== motoCheckCourse.id));
    setAcceptedCourse(motoCheckCourse);
    setMotoCheckCourse(null);
  }, [motoCheckCourse]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {legalStatus === 'red' && <LegalBlockOverlay />}

      <RadarHeader
        isOnline={isOnline}
        legalStatus={legalStatus}
        unreadNotifications={2}
        onNotificationClick={() => navigate('/caby/driver/notifications')}
      />

      <RadarToggle
        isOnline={isOnline}
        onToggle={handleToggleOnline}
        disabled={legalStatus === 'red'}
      />

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

      {isOnline && sortedCourses.length > 0 && (
        <div className="px-4 mb-3">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            {sortedCourses.length} course{sortedCourses.length > 1 ? 's' : ''} disponible{sortedCourses.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div className="px-4">
        {isOnline && courses.length === 0 && !acceptedCourse && (
          <>
            <RadarAnimation isActive={true} />
            <RadarEmptyState stats={stats} />
          </>
        )}

        {isOnline && sortedCourses.length > 0 && (
          <div className="relative" style={{ height: '520px' }}>
            {sortedCourses.slice(0, 3).map((course, index) => (
              <IncomingRideCard
                key={course.id}
                course={course}
                isPrivateClient={course.type === 'private_client'}
                isTop={index === 0}
                index={index}
                onAccept={handleAccept}
                onRefuse={handleRefuse}
                onShareToClub={handleShareToClub}
                onExpire={handleExpire}
              />
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

      <div className="fixed bottom-20 left-0 right-0 flex items-center justify-center gap-4 py-2 opacity-30">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Shield className="w-3 h-3" />
          <span>Caby LSE Certified</span>
        </div>
        {!APP_CONFIG.IS_TEST_MODE && (
          <span className="text-[8px] font-mono text-muted-foreground">
            ENCRYPTED_STREAM_V2_ACTIVE
          </span>
        )}
      </div>

      <DriverBottomNav />

      {motoCheckCourse && (
        <MotoSafetyChecklist
          onConfirm={handleMotoCheckConfirm}
          onClose={() => setMotoCheckCourse(null)}
        />
      )}

      {/* Accepted ride simulation overlay */}
      <AnimatePresence>
        {acceptedCourse && (
          <AcceptedRideOverlay
            course={acceptedCourse}
            onComplete={handleAcceptComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DriverRadarPage;
