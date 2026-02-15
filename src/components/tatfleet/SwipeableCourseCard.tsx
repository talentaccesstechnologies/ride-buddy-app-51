import React, { useState } from 'react';
import { Shield, UserCheck, Car, Clock, MapPin, Share2, Edit3 } from 'lucide-react';
import { RadarCourse } from '@/types/radar.types';
import CourseBadge from './CourseBadge';
import CourseTimer from './CourseTimer';
import { APP_CONFIG } from '@/config/app.config';

interface SwipeableCourseCardProps {
  course: RadarCourse;
  onShare: (id: string) => void;
  onExpire: (id: string) => void;
}

const SwipeableCourseCard: React.FC<SwipeableCourseCardProps> = ({
  course,
  onShare,
  onExpire,
}) => {
  const [editingPrice, setEditingPrice] = useState(false);
  const [customPrice, setCustomPrice] = useState(course.estimatedPrice);

  const canEditPrice = course.type === 'private_client';
  const canShare = course.type === 'private_client';
  const showCommission = course.type === 'private_client';

  const formatPrice = (price: number) => `${price.toFixed(0)} ${APP_CONFIG.DEFAULT_CURRENCY}`;

  const getSourceLabel = () => {
    switch (course.source) {
      case 'qr_code': return 'via QR Code';
      case 'private_dispatch': return `via Dispatch de ${course.senderDriverName}`;
      case 'whatsapp_parsed': return 'via WhatsApp';
      case 'phone': return 'via Téléphone';
      default: return 'via Caby App';
    }
  };

  const getTimeAgo = () => {
    const diff = Date.now() - course.createdAt.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "à l'instant";
    if (minutes === 1) return 'il y a 1 min';
    return `il y a ${minutes} min`;
  };

  return (
    <div className="card-premium relative p-5 h-full flex flex-col">
      {/* Badge de type */}
      <CourseBadge type={course.type} />

      {/* Client & Prix */}
      <div className="flex items-start justify-between pr-28">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
            Passager
          </p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold text-foreground">{course.clientDisplayName}</p>
            {course.type === 'private_client' && (
              <UserCheck className="w-4 h-4 text-[hsl(var(--caby-blue))]" />
            )}
            {course.clientIsProtected && (
              <div className="flex items-center gap-1 text-[hsl(var(--caby-purple))]">
                <Shield className="w-3 h-3" />
                <span className="text-[9px] font-medium">Protégé</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          {canEditPrice && editingPrice ? (
            <input
              type="number"
              value={customPrice}
              onChange={(e) => setCustomPrice(Number(e.target.value))}
              onBlur={() => setEditingPrice(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingPrice(false)}
              autoFocus
              className="w-20 text-2xl font-black text-foreground bg-transparent border-b-2 border-primary text-right outline-none"
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <p className="text-2xl font-black text-foreground">{formatPrice(customPrice)}</p>
              {canEditPrice && (
                <button onClick={() => setEditingPrice(true)} className="text-muted-foreground hover:text-primary transition-colors">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
          {course.networkCommission && (
            <p className="text-[10px] text-[hsl(var(--caby-purple))] mt-0.5">
              -{formatPrice(course.networkCommission)} Com. Réseau
            </p>
          )}
          {showCommission && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              10% rétrocession si partagée
            </p>
          )}
          {course.netPriceForDriver && (
            <p className="text-xs text-[hsl(var(--caby-green))] font-semibold">
              Net: {formatPrice(course.netPriceForDriver)}
            </p>
          )}
        </div>
      </div>

      {/* Trajet */}
      <div className="mt-4 space-y-1 flex-1">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
          <p className="text-sm text-muted-foreground truncate">{course.pickupAddress}</p>
        </div>
        <div className="ml-1 w-px h-4 border-l border-dashed border-border" />
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <p className="text-sm text-foreground font-semibold truncate">{course.dropoffAddress}</p>
        </div>
      </div>

      {/* Infos */}
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{course.estimatedDistance.toFixed(1)} km</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>~{course.estimatedDuration} min</span>
        </div>
        <div className="flex items-center gap-1">
          <Car className="w-3 h-3" />
          <span className="capitalize">{course.vehicleTypeRequired}</span>
        </div>
      </div>

      {/* Source */}
      <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
        <span>{getSourceLabel()}</span>
        <span>{getTimeAgo()}</span>
      </div>

      {/* Timer */}
      <CourseTimer expiresAt={course.expiresAt} onExpire={() => onExpire(course.id)} />

      {/* Share button */}
      {canShare && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare(course.id);
          }}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[hsl(var(--caby-purple))]/20 border border-[hsl(var(--caby-purple))]/30 text-[hsl(var(--caby-purple))] font-bold text-sm uppercase tracking-wide active:scale-95 transition-all"
        >
          <Share2 className="w-4 h-4" />
          Partager au Club Privé
        </button>
      )}

      {/* Swipe hint */}
      <div className="mt-3 flex items-center justify-center gap-6 text-[10px] text-muted-foreground">
        <span>← Ignorer</span>
        <span className="w-1 h-1 rounded-full bg-border" />
        <span>Accepter →</span>
      </div>
    </div>
  );
};

export default SwipeableCourseCard;
