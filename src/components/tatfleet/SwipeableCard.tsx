import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
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
  const rotate = useTransform(x, [-250, 0, 250], [-18, 0, 18]);
  const acceptOpacity = useTransform(x, [0, 60, 120], [0, 0.5, 1]);
  const rejectOpacity = useTransform(x, [-120, -60, 0], [1, 0.5, 0]);
  
  // Glow effects
  const acceptGlow = useTransform(x, [0, 100, 200], ['rgba(34,197,94,0)', 'rgba(34,197,94,0.1)', 'rgba(34,197,94,0.25)']);
  const rejectGlow = useTransform(x, [-200, -100, 0], ['rgba(239,68,68,0.25)', 'rgba(239,68,68,0.1)', 'rgba(239,68,68,0)']);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    
    if (info.offset.x > threshold || velocity > 500) {
      setExitDirection('right');
      setTimeout(onSwipeRight, 250);
    } else if (info.offset.x < -threshold || velocity < -500) {
      setExitDirection('left');
      setTimeout(onSwipeLeft, 250);
    }
  };

  // Stack effect
  const stackScale = 1 - index * 0.05;
  const stackY = index * 10;

  if (exitDirection) {
    return (
      <motion.div
        className="absolute inset-0"
        style={{ zIndex: 10 - index }}
        initial={{ x: exitDirection === 'right' ? 100 : -100, rotate: exitDirection === 'right' ? 10 : -10 }}
        animate={{
          x: exitDirection === 'right' ? 600 : -600,
          opacity: 0,
          rotate: exitDirection === 'right' ? 25 : -25,
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    );
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        scale: stackScale,
        y: stackY,
        zIndex: 10 - index,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={isTop ? handleDragEnd : undefined}
      initial={{ scale: stackScale, y: stackY, opacity: index < 3 ? 1 : 0 }}
      animate={{ scale: stackScale, y: stackY, opacity: index < 3 ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      whileDrag={{ cursor: 'grabbing' }}
    >
      {/* Accept glow overlay */}
      {isTop && (
        <motion.div
          className="absolute inset-0 rounded-[2rem] pointer-events-none z-10"
          style={{ boxShadow: useTransform(x, [0, 150], ['inset 0 0 0 0 rgba(34,197,94,0)', 'inset 0 0 60px 0 rgba(34,197,94,0.15)']) }}
        />
      )}

      {/* Reject glow overlay */}
      {isTop && (
        <motion.div
          className="absolute inset-0 rounded-[2rem] pointer-events-none z-10"
          style={{ boxShadow: useTransform(x, [-150, 0], ['inset 0 0 60px 0 rgba(239,68,68,0.15)', 'inset 0 0 0 0 rgba(239,68,68,0)']) }}
        />
      )}

      {/* Accept stamp */}
      {isTop && (
        <motion.div
          className="absolute top-8 left-6 z-20 flex items-center gap-2 px-5 py-2.5 rounded-2xl border-3 border-[hsl(var(--caby-green))] bg-[hsl(var(--caby-green))]/90 text-black font-black text-base uppercase tracking-wider"
          style={{ opacity: acceptOpacity, rotate: -12 }}
        >
          <Check className="w-5 h-5" strokeWidth={3} />
          J'ACCEPTE
        </motion.div>
      )}

      {/* Reject stamp */}
      {isTop && (
        <motion.div
          className="absolute top-8 right-6 z-20 flex items-center gap-2 px-5 py-2.5 rounded-2xl border-3 border-[hsl(var(--caby-red))] bg-[hsl(var(--caby-red))]/90 text-white font-black text-base uppercase tracking-wider"
          style={{ opacity: rejectOpacity, rotate: 12 }}
        >
          IGNORER
          <X className="w-5 h-5" strokeWidth={3} />
        </motion.div>
      )}

      <div className={`h-full ${isTop ? 'cursor-grab active:cursor-grabbing' : ''}`}>
        {children}
      </div>
    </motion.div>
  );
};

export default SwipeableCard;
