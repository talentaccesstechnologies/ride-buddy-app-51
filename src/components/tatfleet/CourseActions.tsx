import React from 'react';
import { CheckCircle, ArrowRightLeft } from 'lucide-react';
import { CourseType } from '@/types/radar.types';
import { Button } from '@/components/ui/button';

interface CourseActionsProps {
  courseId: string;
  courseType: CourseType;
  onAccept: (id: string) => void;
  onTransfer: (id: string) => void;
  disabled?: boolean;
}

const CourseActions: React.FC<CourseActionsProps> = ({
  courseId,
  courseType,
  onAccept,
  onTransfer,
  disabled = false,
}) => {
  // On ne peut pas re-transférer une course déjà transférée
  const canTransfer = courseType !== 'network_dispatch';

  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={() => onAccept(courseId)}
        disabled={disabled}
        className={`
          flex-[2] flex items-center justify-center gap-2
          bg-white text-black py-4 rounded-2xl
          font-black text-sm uppercase tracking-wide
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 hover:bg-gray-100'}
        `}
      >
        <CheckCircle className="w-5 h-5" />
        <span>Accepter</span>
      </button>

      {canTransfer && (
        <button
          onClick={() => onTransfer(courseId)}
          disabled={disabled}
          className={`
            flex-1 flex items-center justify-center gap-2
            bg-caby-card text-white py-4 rounded-2xl
            font-bold text-sm
            border border-caby-border
            transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 hover:bg-caby-border'}
          `}
          title="Transférer au Club Privé"
        >
          <ArrowRightLeft className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default CourseActions;
