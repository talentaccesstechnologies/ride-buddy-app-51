import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  isTop: boolean;
  index: number;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeRight,
  onSwipeLeft,
  isTop,
  index,
}) => {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const acceptOpacity = useTransform(x, [0, 80, 150], [0, 0.6, 1]);
  const rejectOpacity = useTransform(x, [-150, -80, 0], [1, 0.6, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      setExitDirection('right');
      onSwipeRight();
    } else if (info.offset.x < -threshold) {
      setExitDirection('left');
      onSwipeLeft();
    }
  };

  // Stack effect: cards behind are slightly scaled down and offset
  const stackScale = 1 - index * 0.04;
  const stackY = index * 8;

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        scale: stackScale,
        y: stackY,
        zIndex: 10 - index,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={isTop ? handleDragEnd : undefined}
      animate={
        exitDirection === 'right'
          ? { x: 500, opacity: 0, transition: { duration: 0.3 } }
          : exitDirection === 'left'
          ? { x: -500, opacity: 0, transition: { duration: 0.3 } }
          : {}
      }
      initial={{ scale: stackScale, y: stackY }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Accept indicator */}
      {isTop && (
        <motion.div
          className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-2xl bg-[hsl(var(--caby-green))] text-black font-black text-lg uppercase tracking-wide"
          style={{ opacity: acceptOpacity }}
        >
          <Check className="w-6 h-6" strokeWidth={3} />
          J'ACCEPTE
        </motion.div>
      )}

      {/* Reject indicator */}
      {isTop && (
        <motion.div
          className="absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2 rounded-2xl bg-[hsl(var(--caby-red))] text-white font-black text-lg uppercase tracking-wide"
          style={{ opacity: rejectOpacity }}
        >
          IGNORER
          <X className="w-6 h-6" strokeWidth={3} />
        </motion.div>
      )}

      {children}
    </motion.div>
  );
};

export default SwipeableCard;
