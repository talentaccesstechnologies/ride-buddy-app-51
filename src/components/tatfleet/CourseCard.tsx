import React from 'react';
import { Shield, UserCheck, Car, Clock, MapPin } from 'lucide-react';
import { RadarCourse } from '@/types/radar.types';
import CourseBadge from './CourseBadge';
import CourseTimer from './CourseTimer';
import CourseActions from './CourseActions';
import { APP_CONFIG } from '@/config/app.config';

interface CourseCardProps {
  course: RadarCourse;
  onAccept: (id: string) => void;
  onTransfer: (id: string) => void;
  onExpire: (id: string) => void;
  disabled?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onAccept,
  onTransfer,
  onExpire,
  disabled = false,
}) => {
  const formatPrice = (price: number) => {
    return `${price.toFixed(0)} ${APP_CONFIG.DEFAULT_CURRENCY}`;
  };

  const getSourceLabel = () => {
    switch (course.source) {
      case 'qr_code':
        return 'via QR Code';
      case 'private_dispatch':
        return `via Dispatch de ${course.senderDriverName}`;
      case 'whatsapp_parsed':
        return 'via WhatsApp';
      case 'phone':
        return 'via Téléphone';
      default:
        return 'via Caby App';
    }
  };

  const getTimeAgo = () => {
    const diff = Date.now() - course.createdAt.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'à l\'instant';
    if (minutes === 1) return 'il y a 1 min';
    return `il y a ${minutes} min`;
  };

  return (
    <div className="card-premium relative p-5 animate-bounce-in">
      {/* Badge de type */}
      <CourseBadge type={course.type} />

      {/* Ligne 1 - Client & Prix */}
      <div className="flex items-start justify-between pr-28">
        <div>
          <p className="text-[10px] text-caby-muted uppercase font-bold tracking-wider mb-1">
            Passager
          </p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold text-white">{course.clientDisplayName}</p>
            {course.type === 'private_client' && (
              <UserCheck className="w-4 h-4 text-caby-blue" />
            )}
            {course.clientIsProtected && (
              <div className="flex items-center gap-1 text-caby-purple">
                <Shield className="w-3 h-3" />
                <span className="text-[9px] font-medium">Protégé</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-black text-white">{formatPrice(course.estimatedPrice)}</p>
          {course.networkCommission && (
            <p className="text-[10px] text-caby-purple mt-0.5">
              -{formatPrice(course.networkCommission)} Com. Réseau
            </p>
          )}
          {course.netPriceForDriver && (
            <p className="text-xs text-caby-green font-semibold">
              Net: {formatPrice(course.netPriceForDriver)}
            </p>
          )}
        </div>
      </div>

      {/* Ligne 2 - Trajet */}
      <div className="mt-4 space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-zinc-500" />
          <p className="text-sm text-caby-muted truncate">{course.pickupAddress}</p>
        </div>
        <div className="ml-1 w-px h-4 border-l border-dashed border-caby-border" />
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-caby-gold" />
          <p className="text-sm text-white font-semibold truncate">{course.dropoffAddress}</p>
        </div>
      </div>

      {/* Ligne 3 - Infos */}
      <div className="flex items-center gap-4 mt-4 text-xs text-caby-muted">
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

      {/* Ligne 4 - Source */}
      <div className="flex items-center justify-between mt-3 text-[10px] text-caby-muted">
        <span>{getSourceLabel()}</span>
        <span>{getTimeAgo()}</span>
      </div>

      {/* Timer */}
      <CourseTimer expiresAt={course.expiresAt} onExpire={() => onExpire(course.id)} />

      {/* Actions */}
      <CourseActions
        courseId={course.id}
        courseType={course.type}
        onAccept={onAccept}
        onTransfer={onTransfer}
        disabled={disabled}
      />
    </div>
  );
};

export default CourseCard;
