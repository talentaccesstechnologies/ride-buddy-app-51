import React, { useState } from 'react';
import { Shield, UserCheck, Clock, MapPin, Share2, Edit3, Package, Check, X, Pen } from 'lucide-react';
import { RadarCourse, CourseType } from '@/types/radar.types';
import CourseBadge from './CourseBadge';
import CourseTimer from './CourseTimer';
import { APP_CONFIG } from '@/config/app.config';

interface SwipeableCourseCardProps {
  course: RadarCourse;
  onShare: (id: string) => void;
  onExpire: (id: string) => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

const cardBorderStyles: Record<CourseType, string> = {
  private_client: 'border-2 border-[hsl(var(--caby-gold))] shadow-[0_0_30px_rgba(212,168,83,0.4),0_0_60px_rgba(212,168,83,0.15)]',
  network_dispatch: 'border-2 border-[hsl(var(--caby-purple))]/60 shadow-[0_0_15px_rgba(147,51,234,0.2)]',
  caby_direct: 'border border-[hsl(var(--caby-blue))]/50 shadow-[0_0_12px_rgba(59,130,246,0.15)]',
  livraison: 'border border-[hsl(var(--caby-green))]/50 shadow-[0_0_12px_rgba(34,197,94,0.15)]',
  uber_sync: 'border border-[hsl(var(--caby-muted))]/40',
};

const SwipeableCourseCard: React.FC<SwipeableCourseCardProps> = ({
  course,
  onShare,
  onExpire,
  onAccept,
  onReject,
}) => {
  const [editingPrice, setEditingPrice] = useState(false);
  const [customPrice, setCustomPrice] = useState(course.estimatedPrice);

  const canEditPrice = course.type === 'private_client';
  const canShare = course.type === 'private_client' || course.type === 'caby_direct';
  const showRetrocession = course.type === 'private_client';
  const isLivraison = course.type === 'livraison';
  const isPrivate = course.type === 'private_client';

  const formatPrice = (price: number) => `${price.toFixed(2)} ${APP_CONFIG.DEFAULT_CURRENCY}`;

  return (
    <div className={`relative p-5 h-full flex flex-col bg-card rounded-[2rem] overflow-hidden ${cardBorderStyles[course.type]}`}>
      
      {/* Watermark for livraison */}
      {isLivraison && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <Package className="w-40 h-40 text-[hsl(var(--caby-green))]/[0.06]" strokeWidth={0.8} />
        </div>
      )}

      {/* Gold shimmer for private courses */}
      {isPrivate && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-[2rem]">
          <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_top_left,rgba(212,168,83,0.1)_0%,transparent_50%)]" />
          <div className="absolute -bottom-1/2 -right-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_bottom_right,rgba(212,168,83,0.06)_0%,transparent_50%)]" />
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full">
        
        {/* Top: Avatar + Name + Badge */}
        <div className="flex items-start gap-4 mb-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className={`w-16 h-16 rounded-full overflow-hidden ${isPrivate ? 'ring-3 ring-[hsl(var(--caby-gold))]' : 'ring-2 ring-border'}`}>
              {course.clientAvatarUrl ? (
                <img src={course.clientAvatarUrl} alt={course.clientDisplayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                  {course.clientDisplayName.charAt(0)}
                </div>
              )}
            </div>
            {course.clientIsProtected && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[hsl(var(--caby-purple))] flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            )}
            {isPrivate && !course.clientIsProtected && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[hsl(var(--caby-gold))] flex items-center justify-center">
                <UserCheck className="w-3 h-3 text-black" />
              </div>
            )}
          </div>

          {/* Name + Rating */}
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-foreground truncate">{course.clientDisplayName}</p>
            {course.clientRating && (
              <p className="text-sm text-muted-foreground">{course.clientRating.toFixed(1)}/5</p>
            )}
          </div>

          {/* Badge */}
          <CourseBadge type={course.type} />
        </div>

        {/* Route: DE / À */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground w-8 flex-shrink-0">DE :</span>
            <p className="text-sm text-muted-foreground truncate flex-1">{course.pickupAddress}</p>
          </div>
          <div className="ml-4 w-px h-3 border-l-2 border-dashed border-border" />
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-foreground w-8 flex-shrink-0">À :</span>
            <p className="text-sm text-foreground font-semibold truncate flex-1">{course.dropoffAddress}</p>
          </div>
        </div>

        {/* Distance + Duration */}
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span>{course.estimatedDistance.toFixed(1)} km</span>
          <span className="text-border">•</span>
          <Clock className="w-3.5 h-3.5" />
          <span>{course.estimatedDuration} min</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 mb-2">
          {canEditPrice && editingPrice ? (
            <input
              type="number"
              value={customPrice}
              onChange={(e) => setCustomPrice(Number(e.target.value))}
              onBlur={() => setEditingPrice(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingPrice(false)}
              autoFocus
              className="w-32 text-3xl font-black text-foreground bg-transparent border-b-2 border-[hsl(var(--caby-gold))] outline-none"
            />
          ) : (
            <p className={`text-3xl font-black ${isPrivate ? 'text-[hsl(var(--caby-gold))]' : 'text-foreground'}`}>
              {formatPrice(customPrice)}
            </p>
          )}
          {canEditPrice && !editingPrice && (
            <button
              onClick={() => setEditingPrice(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold hover:bg-muted/80 transition-colors"
            >
              <Pen className="w-3 h-3" />
              Éditer
            </button>
          )}
        </div>

        {/* Network commission */}
        {course.networkCommission && (
          <p className="text-xs text-[hsl(var(--caby-purple))] mb-1">
            -{formatPrice(course.networkCommission)} Com. Réseau
          </p>
        )}
        {course.netPriceForDriver && (
          <p className="text-sm text-[hsl(var(--caby-green))] font-semibold mb-2">
            Net: {formatPrice(course.netPriceForDriver)}
          </p>
        )}

        {/* Client note */}
        {course.clientNote && (
          <p className="text-xs text-muted-foreground italic mb-3">*{course.clientNote}</p>
        )}

        {/* Timer */}
        <div className="mb-4">
          <CourseTimer expiresAt={course.expiresAt} onExpire={() => onExpire(course.id)} />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons: Reject / Share / Accept */}
        <div className="flex items-center gap-3 justify-center">
          {/* Reject button */}
          <button
            onClick={(e) => { e.stopPropagation(); onReject?.(course.id); }}
            className="w-12 h-12 rounded-full bg-[hsl(var(--caby-red))] flex items-center justify-center active:scale-90 transition-transform shadow-lg"
          >
            <X className="w-6 h-6 text-white" strokeWidth={3} />
          </button>

          {/* Share button */}
          {canShare && (
            <button
              onClick={(e) => { e.stopPropagation(); onShare(course.id); }}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[hsl(var(--caby-gold))] to-[hsl(var(--caby-gold))]/80 text-black font-black text-sm uppercase tracking-wider active:scale-95 transition-transform shadow-lg"
            >
              <Share2 className="w-4 h-4" />
              Partager
            </button>
          )}

          {/* Accept button */}
          <button
            onClick={(e) => { e.stopPropagation(); onAccept?.(course.id); }}
            className="w-12 h-12 rounded-full bg-[hsl(var(--caby-green))] flex items-center justify-center active:scale-90 transition-transform shadow-lg"
          >
            <Check className="w-6 h-6 text-white" strokeWidth={3} />
          </button>
        </div>

        {/* Retrocession notice */}
        {showRetrocession && (
          <p className="text-center text-xs text-[hsl(var(--caby-gold))]/70 mt-3 font-medium">
            Si partagé : vous recevez 10%.
          </p>
        )}
      </div>
    </div>
  );
};

export default SwipeableCourseCard;
