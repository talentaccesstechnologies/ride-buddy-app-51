import React from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GOLD = '#C9A84C';

const STEPS = [
  { icon: '🚐', label: 'Trajet' },
  { icon: '📦', label: 'Pack' },
  { icon: '👤', label: 'Passagers' },
  { icon: '💺', label: 'Siège' },
  { icon: '🧳', label: 'Bagages' },
  { icon: '➕', label: 'Options' },
  { icon: '💳', label: 'Paiement' },
];

interface BookingStepperProps {
  currentStep: number; // 0-indexed
}

export default function BookingStepper({ currentStep }: BookingStepperProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {currentStep > 0 && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Retour</span>
            </button>
          )}
          <div className="flex items-center justify-between flex-1">
            {STEPS.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-1 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        done ? 'bg-green-500 text-white' : active ? 'text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                      style={active ? { backgroundColor: GOLD } : undefined}
                    >
                      {done ? <Check className="w-4 h-4" /> : <span>{step.icon}</span>}
                    </div>
                    <span
                      className={`text-[10px] md:text-xs font-medium text-center leading-tight ${
                        active ? 'text-gray-900' : done ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 ${done ? 'bg-green-400' : 'bg-gray-200'}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
