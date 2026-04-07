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
  year: number; month: number;
  selectedDeparture: Date | null; selectedReturn: Date | null;
  roundTrip: boolean; onClickDay: (d: Date) => void;
}> = ({ year, month, selectedDeparture, selectedReturn, roundTrip, onClickDay }) => {
  const days = useMemo(() => getMonthDays(year, month), [year, month]);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  return (
    <div>
      <div className="text-center text-sm font-bold uppercase tracking-widest mb-4" style={{ color: GOLD }}>
        {MONTHS_FR[month]} {year}
      </div>
      <div className="grid grid-cols-7 mb-2">
        {DAYS_FR.map(d => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="aspect-square" />;
          const isPast = day < today;
          const isDep = isSameDay(day, selectedDeparture);
          const isRet = isSameDay(day, selectedReturn);
          const inRange = roundTrip && selectedDeparture && selectedReturn && isBetween(day, selectedDeparture, selectedReturn);
          const isRangeStart = isDep && roundTrip && selectedReturn;
          const isRangeEnd = isRet && roundTrip && selectedDeparture;

          let bg = 'transparent';
          let textColor = '#1a1a1a';
          let fontWeight = 400;
          let radius = '9999px';

          if (isPast) {
            textColor = '#d1d5db';
          } else if (isRangeStart) {
            bg = GOLD; textColor = '#fff'; fontWeight = 700; radius = '9999px 0 0 9999px';
          } else if (isRangeEnd) {
            bg = GOLD; textColor = '#fff'; fontWeight = 700; radius = '0 9999px 9999px 0';
          } else if (isDep || isRet) {
            bg = GOLD; textColor = '#fff'; fontWeight = 700;
          } else if (inRange) {
            bg = '#f5f0e8'; textColor = GOLD; radius = '0';
          }

          return (
            <button
              key={day.toISOString()}
              disabled={isPast}
              onClick={() => !isPast && onClickDay(day)}
              className="aspect-square flex items-center justify-center text-[15px] transition-colors"
              style={{
                backgroundColor: bg,
                color: textColor,
                fontWeight,
                borderRadius: radius,
                cursor: isPast ? 'not-allowed' : 'pointer',
                border: 'none',
              }}
              onMouseEnter={(e) => {
                if (!isPast && !(isDep || isRet)) {
                  e.currentTarget.style.backgroundColor = inRange ? '#f5f0e8' : '#f5f0e8';
                  e.currentTarget.style.color = GOLD;
                  e.currentTarget.style.fontWeight = '600';
                }
              }}
              onMouseLeave={(e) => {
                if (!isPast && !(isDep || isRet)) {
                  e.currentTarget.style.backgroundColor = inRange ? '#f5f0e8' : 'transparent';
                  e.currentTarget.style.color = inRange ? GOLD : '#1a1a1a';
                  e.currentTarget.style.fontWeight = inRange ? '400' : '400';
                }
              }}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const PriceCalendar: React.FC<PriceCalendarProps> = ({
  roundTrip, onToggleRoundTrip,
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

  const formatDateLabel = (d: Date) => `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;

  return (
    <div className="bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] flex flex-col w-[calc(100vw-32px)] md:w-[900px]"
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

      {/* Navigation arrows + months */}
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

      {/* Calendar grids */}
      <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-4">
        {/* Desktop: two months */}
        <div className="hidden md:grid grid-cols-2 gap-x-10">
          <MonthGrid year={viewYear} month={viewMonth} selectedDeparture={selectedDeparture} selectedReturn={selectedReturn} roundTrip={roundTrip} onClickDay={handleDayClick} />
          <MonthGrid year={nextYear} month={nextMonth} selectedDeparture={selectedDeparture} selectedReturn={selectedReturn} roundTrip={roundTrip} onClickDay={handleDayClick} />
        </div>
        {/* Mobile: single month */}
        <div className="md:hidden">
          <MonthGrid year={viewYear} month={viewMonth} selectedDeparture={selectedDeparture} selectedReturn={selectedReturn} roundTrip={roundTrip} onClickDay={handleDayClick} />
        </div>
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
          <Button
            onClick={onApply}
            disabled={!selectedDeparture || (roundTrip && !selectedReturn)}
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
