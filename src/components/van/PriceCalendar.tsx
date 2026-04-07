import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GOLD = '#C9A84C';
const DAYS_FR = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

interface PriceForDate { price: number; color: 'green' | 'gray' | 'orange' | 'red'; }

interface PriceCalendarProps {
  basePrice: number;
  roundTrip: boolean;
  onToggleRoundTrip: (v: boolean) => void;
  selectedDeparture: Date | null;
  selectedReturn: Date | null;
  onSelectDeparture: (d: Date) => void;
  onSelectReturn: (d: Date | null) => void;
  onApply: () => void;
  onClear: () => void;
}

function getPriceForDate(date: Date, basePrice: number): PriceForDate {
  const day = date.getDay();
  let multiplier = 1.0;
  if (day === 1 || day === 5) multiplier = 1.20;
  else if (day === 0 || day === 6) multiplier = 1.10;
  else multiplier = 0.90;
  const daysUntil = Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysUntil >= 14) multiplier *= 0.85;
  const price = Math.round(basePrice * multiplier);
  const color: PriceForDate['color'] =
    price <= basePrice * 0.85 ? 'green' :
    price <= basePrice ? 'gray' :
    price <= basePrice * 1.15 ? 'orange' : 'red';
  return { price, color };
}

const PRICE_COLORS = { green: '#059669', gray: '#6b7280', orange: '#d97706', red: '#dc2626' };

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;
  const days: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

function isSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBetween(d: Date, start: Date, end: Date) {
  return d.getTime() > start.getTime() && d.getTime() < end.getTime();
}

const MonthGrid: React.FC<{
  year: number; month: number; basePrice: number;
  selectedDeparture: Date | null; selectedReturn: Date | null;
  roundTrip: boolean; onClickDay: (d: Date) => void;
  cellH: number;
}> = ({ year, month, basePrice, selectedDeparture, selectedReturn, roundTrip, onClickDay, cellH }) => {
  const days = useMemo(() => getMonthDays(year, month), [year, month]);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  return (
    <div>
      <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
        {MONTHS_FR[month]} {year}
      </div>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 42px)', gap: '2px', justifyContent: 'center', marginBottom: 4 }}>
        {DAYS_FR.map(d => (
          <div key={d} style={{ width: 42, textAlign: 'center', fontSize: 11, color: '#999', fontWeight: 500 }}>{d}</div>
        ))}
      </div>
      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 42px)', gap: '2px', justifyContent: 'center' }}>
        {days.map((day, i) => {
          if (!day) return <div key={`e-${i}`} style={{ width: 42, height: cellH }} />;
          const isPast = day < today;
          const priceInfo = isPast ? null : getPriceForDate(day, basePrice);
          const isDep = isSameDay(day, selectedDeparture);
          const isRet = isSameDay(day, selectedReturn);
          const inRange = roundTrip && selectedDeparture && selectedReturn && isBetween(day, selectedDeparture, selectedReturn);
          const isSelected = isDep || isRet;

          return (
            <button
              key={day.toISOString()}
              disabled={isPast}
              onClick={() => !isPast && onClickDay(day)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: 42,
                height: cellH,
                borderRadius: 8,
                cursor: isPast ? 'not-allowed' : 'pointer',
                padding: '4px 0',
                gap: 3,
                border: 'none',
                opacity: isPast ? 0.3 : 1,
                backgroundColor: isSelected ? GOLD : inRange ? '#FEF3C7' : 'transparent',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => { if (!isPast && !isSelected) e.currentTarget.style.backgroundColor = inRange ? '#FEF3C7' : '#FFFBEB'; }}
              onMouseLeave={(e) => { if (!isPast && !isSelected) e.currentTarget.style.backgroundColor = inRange ? '#FEF3C7' : 'transparent'; }}
            >
              <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1, color: isSelected ? '#fff' : '#1a1a1a' }}>
                {day.getDate()}
              </span>
              {priceInfo && !isPast ? (
                <span style={{ fontSize: 10, lineHeight: 1, fontWeight: 600, color: isSelected ? 'rgba(255,255,255,0.8)' : PRICE_COLORS[priceInfo.color] }}>
                  {priceInfo.price}
                </span>
              ) : isPast ? (
                <span style={{ fontSize: 10, lineHeight: 1, color: '#ccc' }}>—</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const PriceCalendar: React.FC<PriceCalendarProps> = ({
  basePrice, roundTrip, onToggleRoundTrip,
  selectedDeparture, selectedReturn,
  onSelectDeparture, onSelectReturn,
  onApply, onClear,
}) => {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [selectingReturn, setSelectingReturn] = useState(false);

  const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;

  const goBack = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const goForward = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const handleDayClick = (d: Date) => {
    if (!roundTrip) { onSelectDeparture(d); onSelectReturn(null); setSelectingReturn(false); return; }
    if (!selectingReturn || !selectedDeparture) { onSelectDeparture(d); onSelectReturn(null); setSelectingReturn(true); }
    else if (d.getTime() <= selectedDeparture.getTime()) { onSelectDeparture(d); onSelectReturn(null); setSelectingReturn(true); }
    else { onSelectReturn(d); setSelectingReturn(false); }
  };

  const MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const formatDateLabel = (d: Date) => `${String(d.getDate()).padStart(2, '0')} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #e5e7eb',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      width: 560,
      maxHeight: '85vh',
      display: 'flex',
      flexDirection: 'column',
    }}
    className="max-md:!w-[320px]"
    >
      {/* Round trip toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px 8px' }}>
        <button onClick={() => { onToggleRoundTrip(false); onSelectReturn(null); setSelectingReturn(false); }}
          style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
            backgroundColor: !roundTrip ? GOLD : '#f3f4f6', color: !roundTrip ? '#fff' : '#4b5563',
          }}>
          Aller simple
        </button>
        <button onClick={() => onToggleRoundTrip(true)}
          style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
            backgroundColor: roundTrip ? GOLD : '#f3f4f6', color: roundTrip ? '#fff' : '#4b5563',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
          🔄 Aller-retour
          <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 10, background: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>-5%</span>
        </button>
      </div>

      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 4px' }}>
        <button onClick={goBack} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
          <ChevronLeft style={{ width: 14, height: 14, color: '#4b5563' }} />
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={goForward} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
          <ChevronRight style={{ width: 14, height: 14, color: '#4b5563' }} />
        </button>
      </div>

      {/* Calendar grids */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {/* Desktop: two months */}
        <div className="hidden md:grid" style={{ gridTemplateColumns: '1fr 1px 1fr', gap: '0 16px', padding: '4px 16px 12px' }}>
          <MonthGrid year={viewYear} month={viewMonth} basePrice={basePrice} selectedDeparture={selectedDeparture} selectedReturn={selectedReturn} roundTrip={roundTrip} onClickDay={handleDayClick} cellH={56} />
          <div style={{ background: '#e5e7eb' }} />
          <MonthGrid year={nextYear} month={nextMonth} basePrice={basePrice} selectedDeparture={selectedDeparture} selectedReturn={selectedReturn} roundTrip={roundTrip} onClickDay={handleDayClick} cellH={56} />
        </div>
        {/* Mobile: single month */}
        <div className="md:hidden" style={{ padding: '4px 12px 12px' }}>
          <MonthGrid year={viewYear} month={viewMonth} basePrice={basePrice} selectedDeparture={selectedDeparture} selectedReturn={selectedReturn} roundTrip={roundTrip} onClickDay={handleDayClick} cellH={48} />
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '6px 16px', borderTop: '1px solid #f3f4f6', fontSize: 9 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669' }} /> Meilleur prix</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9ca3af' }} /> Standard</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706' }} /> Élevé</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626' }} /> Rush</span>
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', background: '#fff', borderRadius: '0 0 16px 16px' }}>
        {roundTrip && selectedDeparture && selectedReturn && (
          <div style={{ marginBottom: 8, fontSize: 11, color: '#6b7280' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Aller</span><span style={{ fontWeight: 500, color: '#1a1a1a' }}>{formatDateLabel(selectedDeparture)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span>Retour</span><span style={{ fontWeight: 500, color: '#1a1a1a' }}>{formatDateLabel(selectedReturn)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, color: '#059669', fontWeight: 500 }}>
              <span>Remise aller-retour</span><span>-5% ✓</span>
            </div>
          </div>
        )}
        {!roundTrip && selectedDeparture && (
          <div style={{ marginBottom: 8, fontSize: 11, color: '#6b7280' }}>
            Aller : <span style={{ fontWeight: 500, color: '#1a1a1a' }}>{formatDateLabel(selectedDeparture)}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => { onClear(); setSelectingReturn(false); }}
            style={{ fontSize: 11, fontWeight: 500, color: GOLD, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
            Effacer
          </button>
          <Button
            onClick={onApply}
            disabled={!selectedDeparture || (roundTrip && !selectedReturn)}
            className="px-5 h-8 rounded-xl text-white text-xs font-bold disabled:opacity-40"
            style={{ backgroundColor: GOLD }}>
            Appliquer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PriceCalendar;
