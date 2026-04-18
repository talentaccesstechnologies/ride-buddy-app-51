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

const CityPickerPopover: React.FC<CityPickerPopoverProps> = ({ fieldLabel, placeholder, value, cities, onSelect, width = '100%' }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery('');
  }, [open]);

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

  const options = useMemo(() => {
    const enriched = cities.map(enrich);
    if (!query.trim()) return enriched;
    const q = query.toLowerCase();
    return enriched.filter(o => o.label.toLowerCase().includes(q) || o.country.toLowerCase().includes(q));
  }, [cities, query]);

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
        <div style={{ fontSize: 14, fontWeight: value ? 500 : 400, color: value ? '#1A1A1A' : '#B8B5AD', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value || placeholder}
        </div>
      </button>

      {open && (
        <div
          className="absolute left-0 mt-2 z-[1000] bg-white rounded-2xl overflow-hidden flex flex-col"
          style={{
            top: '100%',
            width: 'min(420px, calc(100vw - 24px))',
            maxHeight: 460,
            boxShadow: '0 18px 48px rgba(0,0,0,0.16)',
          }}
        >
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 h-11">
              <span style={{ color: GOLD }}>🔎</span>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Rechercher une ville, un pays..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
              )}
            </div>
          </div>
          <div className="overflow-y-auto px-2 pb-3" style={{ scrollbarGutter: 'stable' }}>
            {options.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-400">Aucun résultat</div>
            )}
            {options.map(opt => {
              const selected = opt.label === value;
              return (
                <button
                  key={opt.label}
                  onClick={() => { onSelect(opt.label); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-50 transition-colors text-left"
                >
                  <span className="text-lg w-6 text-center" style={{ color: GOLD }}>
                    {opt.isAirport ? '✈️' : '📍'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm leading-tight truncate ${selected ? 'font-bold' : 'font-medium text-gray-900'}`} style={selected ? { color: GOLD } : undefined}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-gray-500 leading-tight mt-0.5">{opt.country}</div>
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