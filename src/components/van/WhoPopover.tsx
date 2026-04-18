import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

const GOLD = '#C9A84C';

interface WhoPopoverProps {
  adults: number;
  children: number;
  babies: number;
  onChange: (next: { adults: number; children: number; babies: number }) => void;
  maxTotal?: number;
}

const Row: React.FC<{
  icon: string;
  label: string;
  sub: string;
  value: number;
  min?: number;
  onDec: () => void;
  onInc: () => void;
  decDisabled?: boolean;
  incDisabled?: boolean;
}> = ({ icon, label, sub, value, onDec, onInc, decDisabled, incDisabled }) => (
  <div className="flex items-center justify-between py-4">
    <div className="flex items-center gap-3">
      <span className="text-xl" style={{ color: GOLD }}>{icon}</span>
      <div>
        <div className="text-[15px] font-bold text-gray-900 leading-tight">{label}</div>
        <div className="text-xs text-gray-500 leading-tight mt-0.5">{sub}</div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onDec}
        disabled={decDisabled}
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-lg font-bold transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ backgroundColor: decDisabled ? '#D1D5DB' : GOLD }}
      >
        −
      </button>
      <span className="w-5 text-center text-[15px] font-bold text-gray-900">{value}</span>
      <button
        type="button"
        onClick={onInc}
        disabled={incDisabled}
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-lg font-bold transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ backgroundColor: incDisabled ? '#D1D5DB' : GOLD }}
      >
        +
      </button>
    </div>
  </div>
);

const WhoPopover: React.FC<WhoPopoverProps> = ({ adults, children, babies, onChange, maxTotal = 7 }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ adults, children, babies });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setDraft({ adults, children, babies });
  }, [open, adults, children, babies]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (open && ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const total = draft.adults + draft.children + draft.babies;
  const reachedMax = total >= maxTotal;

  const summary = `${adults + children} voyageur${adults + children > 1 ? 's' : ''}${babies > 0 ? ` · ${babies} bébé${babies > 1 ? 's' : ''}` : ''}`;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', flexDirection: 'column', gap: 2,
          border: '1.5px solid #E0DDD5', borderRadius: 8, padding: '0 14px',
          height: 48, cursor: 'pointer', justifyContent: 'center', background: '#fff',
          boxSizing: 'border-box', width: '100%', textAlign: 'left', fontFamily: 'inherit',
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#888780', lineHeight: 1, marginBottom: 3 }}>Qui</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summary}</div>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 z-[1000] bg-white rounded-2xl overflow-hidden"
          style={{
            top: '100%',
            width: 'min(420px, calc(100vw - 24px))',
            boxShadow: '0 18px 48px rgba(0,0,0,0.16)',
          }}
        >
          <div className="px-6 pt-5 pb-1">
            <p className="text-[15px] font-bold text-gray-900">Sélectionnez la ou les personnes qui voyagent</p>
          </div>
          <div className="px-6 divide-y divide-gray-100">
            <Row
              icon="👤" label="Adultes" sub="16 ans et plus" value={draft.adults}
              decDisabled={draft.adults <= 1}
              incDisabled={reachedMax}
              onDec={() => setDraft(d => ({ ...d, adults: Math.max(1, d.adults - 1) }))}
              onInc={() => setDraft(d => (d.adults + d.children + d.babies < maxTotal ? { ...d, adults: d.adults + 1 } : d))}
            />
            <Row
              icon="🧒" label="Enfants" sub="2-15 ans" value={draft.children}
              decDisabled={draft.children <= 0}
              incDisabled={reachedMax}
              onDec={() => setDraft(d => ({ ...d, children: Math.max(0, d.children - 1) }))}
              onInc={() => setDraft(d => (d.adults + d.children + d.babies < maxTotal ? { ...d, children: d.children + 1 } : d))}
            />
            <Row
              icon="👶" label="Bébés" sub="Moins de 2 ans" value={draft.babies}
              decDisabled={draft.babies <= 0}
              incDisabled={reachedMax}
              onDec={() => setDraft(d => ({ ...d, babies: Math.max(0, d.babies - 1) }))}
              onInc={() => setDraft(d => (d.adults + d.children + d.babies < maxTotal ? { ...d, babies: d.babies + 1 } : d))}
            />
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">{draft.adults + draft.children + draft.babies} voyageur{draft.adults + draft.children + draft.babies > 1 ? 's' : ''} sélectionné{draft.adults + draft.children + draft.babies > 1 ? 's' : ''}</span>
            <Button
              onClick={() => { onChange(draft); setOpen(false); }}
              className="px-5 h-10 rounded-xl text-white text-sm font-bold"
              style={{ backgroundColor: GOLD }}
            >
              Appliquer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhoPopover;