import React, { useEffect, useMemo, useRef, useState } from 'react';

const GOLD = '#C9A84C';

export interface CityOption {
  label: string;
  country: string;
  isAirport?: boolean;
}

interface CityPickerPopoverProps {
  fieldLabel: string;
  placeholder: string;
  value: string;
  cities: string[];
  onSelect: (city: string) => void;
  width?: number | string;
}

const COUNTRY_BY_KEYWORD: { match: (c: string) => boolean; country: string }[] = [
  { match: c => /annecy|lyon|annemasse|ferney|gex|chamb|grenoble|thonon|évian|paris|chamonix|morzine|courchevel|val d'isère|strasbourg/i.test(c), country: 'France' },
  { match: c => /milan/i.test(c), country: 'Italie' },
  { match: c => /munich/i.test(c), country: 'Allemagne' },
  { match: c => /./.test(c), country: 'Suisse' },
];

const enrich = (label: string): CityOption => {
  const isAirport = /\(GVA\)|\(ZRH\)|\(LYS\)|aéroport/i.test(label);
  const country = COUNTRY_BY_KEYWORD.find(k => k.match(label))!.country;
  return { label, country, isAirport };
};

const PlaneIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-30deg)' }}>
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill={color} />
  </svg>
);

const PinIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill={color} />
  </svg>
);

const CityPickerPopover: React.FC<CityPickerPopoverProps> = ({ fieldLabel, placeholder, value, cities, onSelect, width = '100%' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  const options = useMemo(() => cities.map(enrich), [cities]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect('');
  };

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
          position: 'relative',
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#888780', lineHeight: 1, marginBottom: 3 }}>{fieldLabel}</div>
        <div style={{ fontSize: 14, fontWeight: value ? 500 : 400, color: value ? '#1A1A1A' : '#B8B5AD', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: value ? 22 : 0 }}>
          {value || placeholder}
        </div>
        {value && (
          <span
            onClick={handleClear}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888780', fontSize: 14, lineHeight: 1 }}
            aria-label="Effacer"
          >✕</span>
        )}
      </button>

      {open && (
        <div
          className="absolute left-0 mt-2 z-[1000] bg-white rounded-xl overflow-hidden flex flex-col"
          style={{
            top: '100%',
            width: 'min(380px, calc(100vw - 24px))',
            maxHeight: 420,
            boxShadow: '0 10px 32px rgba(0,0,0,0.14)',
            border: '1px solid #EDEAE2',
          }}
        >
          <div className="overflow-y-auto py-2" style={{ scrollbarGutter: 'stable' }}>
            {options.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-400">Aucune ville disponible</div>
            )}
            {options.map(opt => {
              const selected = opt.label === value;
              const iconColor = selected ? GOLD : '#9A968C';
              return (
                <button
                  key={opt.label}
                  onClick={() => { onSelect(opt.label); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                  style={{ background: selected ? 'rgba(201,168,76,0.06)' : 'transparent' }}
                  onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLButtonElement).style.background = '#FAF8F2'; }}
                  onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <span style={{ width: 24, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                    {opt.isAirport ? <PlaneIcon color={iconColor} /> : <PinIcon color={iconColor} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] leading-tight truncate" style={{ color: selected ? GOLD : '#1A1A1A', fontWeight: selected ? 600 : 500 }}>
                      {opt.label}
                    </div>
                    <div className="text-xs leading-tight mt-0.5" style={{ color: '#8A867D' }}>{opt.country}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CityPickerPopover;
