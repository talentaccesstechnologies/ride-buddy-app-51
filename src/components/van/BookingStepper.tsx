import React from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CabyLogo from '@/components/shared/CabyLogo';

const GOLD = '#C9A84C';

const STEPS = [
  { icon: '🚐', label: 'Trajet',     path: '/caby/van/select' },
  { icon: '📍', label: 'RDV',        path: '/caby/van/rdv' },
  { icon: '📦', label: 'Pack',       path: '/caby/van/pack' },
  { icon: '👤', label: 'Passagers',  path: '/caby/van/passengers' },
  { icon: '💺', label: 'Siège',      path: '/caby/van/seat' },
  { icon: '🧳', label: 'Bagages',    path: '/caby/van/luggage' },
  { icon: '➕', label: 'Options',    path: '/caby/van/options' },
  { icon: '💳', label: 'Paiement',   path: '/caby/van/payment' },
];

const STEP_TITLES_MOBILE = [
  'Pick trip',
  'Meeting point',
  'Choose a bundle',
  'Passenger details',
  'Pick your seat',
  'Add luggage',
  'Extras for your trip',
  'Pay & confirm',
];

const STEP_SUBTITLES_MOBILE = [
  'Now select a trip',
  'Choose your pickup & dropoff point',
  'Select your bundle preference',
  "Now tell us who's travelling",
  'Pick your favourite spot',
  'Add cabin & hold luggage',
  'Add Flex Pass and Travel Insurance',
  'Review and pay',
];

interface BookingStepperProps {
  currentStep: number;
  basketAmount?: number;
}

export default function BookingStepper({
  currentStep,
  basketAmount,
}: BookingStepperProps) {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const goToStep = (i: number) => {
    if (i > currentStep) return;
    const target = STEPS[i].path;
    const qs = params.toString();
    navigate(qs ? `${target}?${qs}` : target);
  };

  const handleClose = () => navigate('/caby');
  const handleBack = () => {
    if (currentStep > 0) goToStep(currentStep - 1);
    else navigate('/caby');
  };

  const title = STEP_TITLES_MOBILE[currentStep] ?? 'Book Trip';
  const subtitle = STEP_SUBTITLES_MOBILE[currentStep] ?? '';

  return (
    <>
      {/* ── MOBILE HEADER ── */}
      <div className="md:hidden sticky top-0 z-30">
        {/* Gold bar */}
        <div style={{ background: GOLD }} className="text-white">
          <div className="flex items-start justify-between px-4 pt-3 pb-3">
            <button onClick={handleClose} aria-label="Fermer" className="p-1 -ml-1 active:opacity-60">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
            <div className="text-[15px] font-semibold pt-0.5">Book Trip</div>
            <div className="flex items-center gap-1.5 -mr-1">
              {basketAmount !== undefined && (
                <div className="text-right leading-tight pr-1">
                  <div className="text-[15px] font-bold">CHF {basketAmount.toFixed(2)}</div>
                  <div className="text-[10px] opacity-90">show basket</div>
                </div>
              )}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7h18l-2 12H5L3 7z" />
                <path d="M8 7l4-4 4 4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Dark sub-header */}
        <div className="bg-[#1A1A1A] text-white px-4 py-2.5">
          <div className="text-[17px] font-bold leading-tight">{title}</div>
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="text-[13px] mt-0.5 underline underline-offset-2"
              style={{ color: GOLD }}
            >
              &lt; Back
            </button>
          )}
        </div>

        {/* Instruction strip */}
        {subtitle && (
          <div className="bg-gray-100 px-4 py-2.5 border-b border-gray-200">
            <div className="text-[13px] font-medium text-gray-800">{subtitle}</div>
          </div>
        )}

        {/* ── Progress dots — mobile ── */}
        <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '8px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {STEPS.map((_, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <React.Fragment key={i}>
                  <div style={{
                    width: active ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: done ? '#22C55E' : active ? GOLD : '#E5E7EB',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }} />
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: done ? '#22C55E' : '#E5E7EB', borderRadius: 1 }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#9CA3AF' }}>Étape {currentStep + 1}/{STEPS.length}</span>
            <span style={{ fontSize: 10, color: GOLD, fontWeight: 600 }}>{STEPS[currentStep]?.label}</span>
          </div>
        </div>
      </div>

      {/* ── DESKTOP STEPPER ── */}
      <div className="hidden md:block bg-white border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/caby/van')}
              className="flex items-center shrink-0 hover:opacity-80 transition-opacity"
              aria-label="Retour à Caby Van"
              style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <CabyLogo size={28} />
              <span className="ml-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hidden sm:inline">
                Van
              </span>
            </button>
            <div className="h-8 w-px bg-gray-200 hidden sm:block" />
            {currentStep > 0 && (
              <button
                onClick={() => goToStep(currentStep - 1)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">Retour</span>
              </button>
            )}
            <div className="flex items-center justify-between flex-1">
              {STEPS.map((step, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                const clickable = i < currentStep;
                const isRdv = step.path === '/caby/van/rdv';
                return (
                  <React.Fragment key={i}>
                    <button
                      type="button"
                      onClick={() => goToStep(i)}
                      disabled={!clickable}
                      className={`flex flex-col items-center gap-1 min-w-0 ${clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                          done ? 'bg-green-500 text-white'
                          : active ? 'text-white'
                          : 'bg-gray-100 text-gray-400'
                        }`}
                        style={active ? { backgroundColor: GOLD } : undefined}
                      >
                        {done ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <span>{step.icon}</span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] md:text-xs font-medium text-center leading-tight ${
                          active ? 'text-gray-900'
                          : done ? 'text-green-600'
                          : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                        {/* Badge "Nouveau" sur l'étape RDV */}
                        {isRdv && !done && (
                          <span style={{
                            display: 'block',
                            fontSize: 8,
                            fontWeight: 700,
                            color: GOLD,
                            letterSpacing: '0.3px',
                          }}>
                            Point RDV
                          </span>
                        )}
                      </span>
                    </button>
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
    </>
  );
}
