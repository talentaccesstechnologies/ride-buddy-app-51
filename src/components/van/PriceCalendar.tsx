import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GOLD = '#C9A84C';
const DAYS_FR = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const MONTHS_FR = ['JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'];
const MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

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

function getPriceForDate(date: Date, basePrice: number) {
  const day = date.getDay();
  let m = 1.0;
  if (day === 1 || day === 5) m = 1.20;
  else if (day === 0 || day === 6) m = 1.10;
  else m = 0.90;
  const daysUntil = Math.floor((date.getTime() - Date.now()) / 86400000);
  if (daysUntil >= 14) m *= 0.85;
  return Math.round(basePrice * m);
}

function getPriceColor(price: number, basePrice: number) {
  if (price <= basePrice * 0.80) return '#22c55e';
  if (price <= basePrice) return '#6b7280';
  if (price <= basePrice * 1.15) return '#f59e0b';
  return '#ef4444';
}

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

// Cell sizes
const CELL_W = 52;
const CELL_H = 60;
const CELL_W_M = 42;
const CELL_H_M = 52;

const MonthGrid: React.FC<{
  year: number; month: number; basePrice: number;
  selectedDeparture: Date | null; selectedReturn: Date | null;
  roundTrip: boolean; onClickDay: (d: Date) => void;
  mobile?: boolean;
}> = ({ year, month, basePrice, selectedDeparture, selectedReturn, roundTrip, onClickDay, mobile }) => {
  const days = useMemo(() => getMonthDays(year, month), [year, month]);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const cw = mobile ? CELL_W_M : CELL_W;
  const ch = mobile ? CELL_H_M : CELL_H;

  return (
    <div>
      <div className="text-center font-bold uppercase tracking-widest mb-3" style={{ color: GOLD, fontSize: mobile ? 13 : 14 }}>
        {MONTHS_FR[month]} {year}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(7, ${cw}px)`, gap: '3px', justifyContent: 'center', marginBottom: 4 }}>
        {DAYS_FR.map(d => (
          <div key={d} style={{ width: cw, textAlign: 'center', fontSize: 11, color: '#999', fontWeight: 500 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(7, ${cw}px)`, gap: '3px', justifyContent: 'center' }}>
        {days.map((day, i) => {
          if (!day) return <div key={`e-${i}`} style={{ width: cw, height: ch }} />;
          const isPast = day < today;
          const price = isPast ? null : getPriceForDate(day, basePrice);
          const pColor = price != null ? getPriceColor(price, basePrice) : '#ccc';
          const isDep = isSameDay(day, selectedDeparture);
          const isRet = isSameDay(day, selectedReturn);
          const inRange = roundTrip && selectedDeparture && selectedReturn && isBetween(day, selectedDeparture, selectedReturn);
          const isSelected = isDep || isRet;

          let bg = 'transparent';
          let textColor = '#1a1a1a';
          let radius = '8px';
          if (isPast) { textColor = '#d1d5db'; }
          else if (isDep && roundTrip && selectedReturn) { bg = GOLD; textColor = '#fff'; radius = '8px 0 0 8px'; }
          else if (isRet && roundTrip && selectedDeparture) { bg = GOLD; textColor = '#fff'; radius = '0 8px 8px 0'; }
          else if (isSelected) { bg = GOLD; textColor = '#fff'; }
          else if (inRange) { bg = '#f5f0e8'; textColor = GOLD; radius = '0'; }

          return (
            <button
              key={day.toISOString()}
              disabled={isPast}
              onClick={() => !isPast && onClickDay(day)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                width: cw, height: ch, borderRadius: radius, gap: 4,
                backgroundColor: bg, color: textColor, border: 'none',
                cursor: isPast ? 'not-allowed' : 'pointer', opacity: isPast ? 0.35 : 1,
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => { if (!isPast && !isSelected) { e.currentTarget.style.backgroundColor = '#f5f0e8'; e.currentTarget.style.color = GOLD; }}}
              onMouseLeave={(e) => { if (!isPast && !isSelected) { e.currentTarget.style.backgroundColor = inRange ? '#f5f0e8' : 'transparent'; e.currentTarget.style.color = inRange ? GOLD : '#1a1a1a'; }}}
            >
              <span style={{ fontSize: mobile ? 13 : 15, fontWeight: isSelected ? 700 : 500, lineHeight: 1 }}>
                {day.getDate()}
              </span>
              {price != null && (
                <span style={{ fontSize: mobile ? 10 : 11, fontWeight: 600, lineHeight: 1, color: isSelected ? 'rgba(255,255,255,0.8)' : pColor }}>
                  {price}
                </span>
              )}
              {isPast && <span style={{ fontSize: 10, lineHeight: 1, color: '#d1d5db' }}>—</span>}
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
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const goBack = () => {
    if (isCurrentMonth) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1);
  };
  const goForward = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1);
  };

  const handleDayClick = (d: Date) => {
    if (!roundTrip) { onSelectDeparture(d); onSelectReturn(null); setSelectingReturn(false); return; }
    if (!selectingReturn || !selectedDeparture) { onSelectDeparture(d); onSelectReturn(null); setSelectingReturn(true); }
    else if (d.getTime() <= selectedDeparture.getTime()) { onSelectDeparture(d); onSelectReturn(null); setSelectingReturn(true); }
    else { onSelectReturn(d); setSelectingReturn(false); }
  };

  const formatDateLabel = (d: Date) => `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;

  return (
    <div className="bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] flex flex-col w-[calc(100vw-32px)] md:w-[960px] md:min-w-[960px]"
      style={{ maxHeight: '85vh' }}>
      {/* Toggle */}
      <div className="flex items-center gap-2 px-6 pt-5 pb-3">
        <button onClick={() => { onToggleRoundTrip(false); onSelectReturn(null); setSelectingReturn(false); }}
          className="px-4 py-2 rounded-full text-xs font-bold transition-all"
          style={{ backgroundColor: !roundTrip ? GOLD : '#f3f4f6', color: !roundTrip ? '#fff' : '#6b7280' }}>
          Aller simple
        </button>
        <button onClick={() => onToggleRoundTrip(true)}
          className="px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
          style={{ backgroundColor: roundTrip ? GOLD : '#f3f4f6', color: roundTrip ? '#fff' : '#6b7280' }}>
          🔄 Aller-retour
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/20">-5%</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center px-6 pb-2">
        <button onClick={goBack} disabled={isCurrentMonth}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1" />
        <button onClick={goForward}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Grids */}
      <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-4">
        <div className="hidden md:grid grid-cols-2 gap-x-8">
          <MonthGrid year={viewYear} month={viewMonth} basePrice={basePrice} selectedDeparture={selectedDeparture} selectedReturn={selectedReturn} roundTrip={roundTrip} onClickDay={handleDayClick} />
          <MonthGrid year={nextYear} month={nextMonth} basePrice={basePrice} selectedDeparture={selectedDeparture} selectedReturn={selectedReturn} roundTrip={roundTrip} onClickDay={handleDayClick} />
        </div>
        <div className="md:hidden">
          <MonthGrid year={viewYear} month={viewMonth} basePrice={basePrice} selectedDeparture={selectedDeparture} selectedReturn={selectedReturn} roundTrip={roundTrip} onClickDay={handleDayClick} mobile />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 px-6 py-2 border-t border-gray-100 text-[10px] text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} /> Meilleur prix</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: '#6b7280' }} /> Standard</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} /> Élevé</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} /> Très élevé</span>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-6 py-4">
        {roundTrip && selectedDeparture && selectedReturn && (
          <div className="mb-3 text-xs text-gray-500 flex items-center gap-3 flex-wrap">
            <span>Aller : <strong className="text-gray-900">{formatDateLabel(selectedDeparture)}</strong></span>
            <span>·</span>
            <span>Retour : <strong className="text-gray-900">{formatDateLabel(selectedReturn)}</strong></span>
            <span>·</span>
            <span className="text-emerald-600 font-semibold">Remise -5% ✓</span>
          </div>
        )}
        {!roundTrip && selectedDeparture && (
          <div className="mb-3 text-xs text-gray-500">
            Aller : <strong className="text-gray-900">{formatDateLabel(selectedDeparture)}</strong>
          </div>
        )}
        <div className="flex items-center justify-between">
          <button onClick={() => { onClear(); setSelectingReturn(false); }}
            className="text-xs font-medium hover:underline" style={{ color: GOLD }}>
            Effacer la sélection
          </button>
          <Button onClick={onApply} disabled={!selectedDeparture || (roundTrip && !selectedReturn)}
            className="px-6 h-9 rounded-xl text-white text-xs font-bold disabled:opacity-40"
            style={{ backgroundColor: GOLD }}>
            Appliquer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PriceCalendar;
