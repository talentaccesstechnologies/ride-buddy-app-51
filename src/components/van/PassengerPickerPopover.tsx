import React, { useEffect, useRef, useState } from 'react';

const GOLD = '#C9A84C';
const GOLD_HOVER = '#B89740';

export interface PassengerCounts {
  adults: number;
  children: number;
  babies: number;
}

interface PassengerPickerPopoverProps {
  fieldLabel?: string;
  value: PassengerCounts;
  onChange: (v: PassengerCounts) => void;
  maxTotal?: number; // total cap (adults + children); babies don't count toward seats
  width?: number | string;
}

const Row: React.FC<{
  icon: string;
  title: string;
  subtitle: string;
  count: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}> = ({ icon, title, subtitle, count, min, max, onChange }) => {
  const dec = () => onChange(Math.max(min, count - 1));
  const inc = () => onChange(Math.min(max, count + 1));
  const decDisabled = count <= min;
  const incDisabled = count >= max;
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 4px' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', color: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginRight: 14, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#8A867D', marginTop: 2, lineHeight: 1.2 }}>{subtitle}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={dec}
          disabled={decDisabled}
          style={{
            width: 32, height: 32, borderRadius: 8, border: 'none', cursor: decDisabled ? 'not-allowed' : 'pointer',
            background: decDisabled ? '#EDEAE2' : GOLD,
            color: decDisabled ? '#B8B5AD' : '#fff',
            fontSize: 18, fontWeight: 600, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { if (!decDisabled) (e.currentTarget as HTMLButtonElement).style.background = GOLD_HOVER; }}
          onMouseLeave={e => { if (!decDisabled) (e.currentTarget as HTMLButtonElement).style.background = GOLD; }}
          aria-label={`Diminuer ${title}`}
        >−</button>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', minWidth: 18, textAlign: 'center' }}>{count}</span>
        <button
          onClick={inc}
          disabled={incDisabled}
          style={{
            width: 32, height: 32, borderRadius: 8, border: 'none', cursor: incDisabled ? 'not-allowed' : 'pointer',
            background: incDisabled ? '#EDEAE2' : GOLD,
            color: incDisabled ? '#B8B5AD' : '#fff',
            fontSize: 18, fontWeight: 600, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { if (!incDisabled) (e.currentTarget as HTMLButtonElement).style.background = GOLD_HOVER; }}
          onMouseLeave={e => { if (!incDisabled) (e.currentTarget as HTMLButtonElement).style.background = GOLD; }}
          aria-label={`Augmenter ${title}`}
        >+</button>
      </div>
    </div>
  );
};

const PassengerPickerPopover: React.FC<PassengerPickerPopoverProps> = ({ fieldLabel = 'Qui', value, onChange, maxTotal = 7, width = '100%' }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<PassengerCounts>(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setDraft(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (open && ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const seatCount = draft.adults + draft.children;
  const totalTravelers = draft.adults + draft.children + draft.babies;

  const summary = (() => {
    const total = value.adults + value.children + value.babies;
    if (total === 0) return '0 voyageur';
    return `${total} voyageur${total > 1 ? 's' : ''}`;
  })();

  return (
    <div ref={ref} style={{ position: 'relative', width }}>
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
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#888780', lineHeight: 1, marginBottom: 3 }}>{fieldLabel}</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summary}</div>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 z-[1000] bg-white rounded-xl flex flex-col"
          style={{
            top: '100%',
            width: 'min(380px, calc(100vw - 24px))',
            boxShadow: '0 12px 32px rgba(0,0,0,0.16)',
            border: '1px solid #EDEAE2',
            padding: '18px 18px 16px',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>
            Sélectionnez la ou les personnes qui voyagent
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Row
              icon="👤"
              title="Adultes"
              subtitle="16 ans et plus"
              count={draft.adults}
              min={1}
              max={Math.max(1, maxTotal - draft.children)}
              onChange={(n) => setDraft(d => ({ ...d, adults: n }))}
            />
            <div style={{ height: 1, background: '#F1EEE6' }} />
            <Row
              icon="🧒"
              title="Enfants"
              subtitle="2-15 ans"
              count={draft.children}
              min={0}
              max={Math.max(0, maxTotal - draft.adults)}
              onChange={(n) => setDraft(d => ({ ...d, children: n }))}
            />
            <div style={{ height: 1, background: '#F1EEE6' }} />
            <Row
              icon="👶"
              title="Bébés"
              subtitle="Moins de 2 ans"
              count={draft.babies}
              min={0}
              max={Math.max(0, draft.adults)}
              onChange={(n) => setDraft(d => ({ ...d, babies: n }))}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
            <div style={{ fontSize: 13, color: '#8A867D' }}>
              {totalTravelers} voyageur{totalTravelers > 1 ? 's' : ''} · {seatCount} siège{seatCount > 1 ? 's' : ''}
            </div>
            <button
              onClick={() => { onChange(draft); setOpen(false); }}
              style={{
                background: GOLD, color: '#0A0A0A', border: 'none', borderRadius: 8,
                padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#E8C96A'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = GOLD; }}
            >
              Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerPickerPopover;
