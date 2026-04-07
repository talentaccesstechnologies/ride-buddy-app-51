import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GOLD = '#C9A84C';
const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

interface PriceForDate {
  price: number;
  color: 'green' | 'gray' | 'orange' | 'red';
}

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
  const isWeekend = day === 0 || day === 6;
  const isMondayMorning = day === 1;
  const isFridayEvening = day === 5;

  let multiplier = 1.0;
  if (isMondayMorning || isFridayEvening) multiplier = 1.20;
  else if (isWeekend) multiplier = 1.10;
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

const COLOR_MAP = {
  green: 'text-emerald-600',
  gray: 'text-gray-500',
  orange: 'text-amber-600',
  red: 'text-red-600',
};

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
  compact?: boolean;
}> = ({ year, month, basePrice, selectedDeparture, selectedReturn, roundTrip, onClickDay, compact }) => {
  const days = useMemo(() => getMonthDays(year, month), [year, month]);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  return (
    <div className="flex-1 min-w-0">
      <h3 className="text-xs font-bold text-gray-900 text-center mb-2">
        {MONTHS_FR[month]} {year}
      </h3>
      <div className="grid grid-cols-7 gap-0">
        {DAYS_FR.map(d => (
          <div key={d} className="text-center text-[9px] font-bold text-gray-400 pb-1">{d}</div>
        ))}
        {days.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className={compact ? 'h-10' : 'h-11'} />;
          const isPast = day < today;
          const priceInfo = isPast ? null : getPriceForDate(day, basePrice);
          const isDep = isSameDay(day, selectedDeparture);
          const isRet = isSameDay(day, selectedReturn);
          const inRange = roundTrip && selectedDeparture && selectedReturn && isBetween(day, selectedDeparture, selectedReturn);

          return (
            <button
              key={day.toISOString()}
              disabled={isPast}
              onClick={() => !isPast && onClickDay(day)}
              className={`relative flex flex-col items-center justify-center ${compact ? 'h-10' : 'h-11'} transition-all text-center rounded-md mx-px mb-px
                ${isPast ? 'opacity-30 cursor-not-allowed' : 'hover:bg-amber-50 cursor-pointer'}
                ${isDep || isRet ? 'text-white rounded-lg' : ''}
                ${inRange ? 'bg-amber-50' : ''}
              `}
              style={(isDep || isRet) ? { backgroundColor: GOLD } : {}}
            >
              <span className={`text-[11px] font-bold leading-none ${isDep || isRet ? 'text-white' : 'text-gray-900'}`}>
                {day.getDate()}
              </span>
              {priceInfo && !isPast ? (
                <span className={`text-[8px] font-semibold leading-none mt-0.5 ${isDep || isRet ? 'text-white/80' : COLOR_MAP[priceInfo.color]}`}>
                  {priceInfo.price}
                </span>
              ) : isPast ? (
                <span className="text-[8px] text-gray-300 mt-0.5">—</span>
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
    if (!roundTrip) {
      onSelectDeparture(d);
      onSelectReturn(null);
      setSelectingReturn(false);
      return;
    }
    if (!selectingReturn || !selectedDeparture) {
      onSelectDeparture(d);
      onSelectReturn(null);
      setSelectingReturn(true);
    } else {
      if (d.getTime() <= selectedDeparture.getTime()) {
        onSelectDeparture(d);
        onSelectReturn(null);
        setSelectingReturn(true);
      } else {
        onSelectReturn(d);
        setSelectingReturn(false);
      }
    }
  };

  const MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const formatDateLabel = (d: Date) => `${String(d.getDate()).padStart(2, '0')} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-2xl max-h-[85vh] md:max-h-[480px] overflow-hidden flex flex-col">
      {/* Round trip toggle */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 shrink-0">
        <button onClick={() => { onToggleRoundTrip(false); onSelectReturn(null); setSelectingReturn(false); }}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${!roundTrip ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          style={!roundTrip ? { backgroundColor: GOLD } : {}}>
          Aller simple
        </button>
        <button onClick={() => onToggleRoundTrip(true)}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${roundTrip ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          style={roundTrip ? { backgroundColor: GOLD } : {}}>
          🔄 Aller-retour
          <span className="text-[8px] px-1 py-0.5 rounded-full bg-white/20 font-bold">-5%</span>
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 pb-1 shrink-0">
        <button onClick={goBack} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
        </button>
        <div className="flex-1" />
        <button onClick={goForward} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
        </button>
      </div>

      {/* Calendar grids — scrollable area */}
      <div className="flex-1 overflow-y-auto px-4 min-h-0">
        <div className="hidden md:flex gap-4">
          <MonthGrid year={viewYear} month={viewMonth} basePrice={basePrice} selectedDeparture={selectedDeparture} selectedReturn={selectedReturn} roundTrip={roundTrip} onClickDay={handleDayClick} />
          <div className="w-px bg-gray-200 shrink-0" />
          <MonthGrid year={nextYear} month={nextMonth} basePrice={basePrice} selectedDeparture={selectedDeparture} selectedReturn={selectedReturn} roundTrip={roundTrip} onClickDay={handleDayClick} />
        </div>
        <div className="md:hidden">
          <MonthGrid year={viewYear} month={viewMonth} basePrice={basePrice} selectedDeparture={selectedDeparture} selectedReturn={selectedReturn} roundTrip={roundTrip} onClickDay={handleDayClick} compact />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 px-4 py-1.5 text-[9px] shrink-0 border-t border-gray-100">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Meilleur prix</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Standard</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Élevé</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Rush</span>
      </div>

      {/* Footer — sticky bottom */}
      <div className="px-4 py-2.5 border-t border-gray-100 bg-white shrink-0">
        {roundTrip && selectedDeparture && selectedReturn && (
          <div className="mb-2 space-y-1 text-[11px] text-gray-600">
            <div className="flex justify-between">
              <span>Aller</span>
              <span className="font-medium text-gray-900">{formatDateLabel(selectedDeparture)}</span>
            </div>
            <div className="flex justify-between">
              <span>Retour</span>
              <span className="font-medium text-gray-900">{formatDateLabel(selectedReturn)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Remise aller-retour</span>
              <span>-5% ✓</span>
            </div>
          </div>
        )}
        {!roundTrip && selectedDeparture && (
          <div className="mb-2 text-[11px] text-gray-600">
            <span>Aller : </span>
            <span className="font-medium text-gray-900">{formatDateLabel(selectedDeparture)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <button onClick={() => { onClear(); setSelectingReturn(false); }}
            className="text-[11px] font-medium hover:underline" style={{ color: GOLD }}>
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
