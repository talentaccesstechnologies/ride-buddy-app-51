import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

const GOLD = '#C9A84C';

/* ──────────────────────────────────────────────────────────────
   Bandeau d'instruction gris clair (style easyJet)
   "Now tell us who's flying" + optionnel CTA "Skip >" / "Continue >"
   ────────────────────────────────────────────────────────────── */
export const MobileInstructionBar: React.FC<{
  text: string;
  subtext?: string;
  ctaLabel?: string;
  onCta?: () => void;
  ctaDisabled?: boolean;
  ctaPrimary?: boolean; // true = bouton orange plein ; false = lien souligné
}> = ({ text, subtext, ctaLabel, onCta, ctaDisabled, ctaPrimary }) => (
  <div className="md:hidden bg-gray-100 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between gap-3">
    <div className="min-w-0 flex-1">
      <div className="text-[13px] font-semibold text-gray-900 leading-tight">{text}</div>
      {subtext && <div className="text-[11px] text-gray-600 mt-0.5">{subtext}</div>}
    </div>
    {ctaLabel && onCta && (
      ctaPrimary ? (
        <button
          onClick={onCta}
          disabled={ctaDisabled}
          className="text-[13px] font-bold px-4 py-2 rounded text-white shrink-0 disabled:opacity-50"
          style={{ background: ctaDisabled ? '#9CA3AF' : GOLD }}
        >
          {ctaLabel}
        </button>
      ) : (
        <button
          onClick={onCta}
          disabled={ctaDisabled}
          className="text-[13px] font-bold underline underline-offset-2 shrink-0 disabled:opacity-40"
          style={{ color: GOLD }}
        >
          {ctaLabel}
        </button>
      )
    )}
  </div>
);

/* ──────────────────────────────────────────────────────────────
   Section avec barre noire (titre blanc + Back optionnel)
   ────────────────────────────────────────────────────────────── */
export const MobileSectionHeader: React.FC<{
  title: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}> = ({ title, onBack, rightSlot }) => (
  <div className="md:hidden bg-[#1A1A1A] text-white px-4 py-3 flex items-center justify-between">
    <div>
      <div className="text-[16px] font-bold leading-tight">{title}</div>
      {onBack && (
        <button
          onClick={onBack}
          className="text-[12px] mt-0.5 underline underline-offset-2"
          style={{ color: GOLD }}
        >
          &lt; Back
        </button>
      )}
    </div>
    {rightSlot}
  </div>
);

/* ──────────────────────────────────────────────────────────────
   Input avec label flottant ("notch") + check ✓ orange si valide
   ────────────────────────────────────────────────────────────── */
interface MobileInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  valid?: boolean;          // affiche ✓
  required?: boolean;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
}

export const MobileInput: React.FC<MobileInputProps> = ({
  label, value, onChange, type = 'text', placeholder, valid, inputMode, autoComplete,
}) => {
  const [focused, setFocused] = useState(false);
  const showValid = valid ?? (value.trim().length > 0);
  const isActive = focused || showValid;
  const borderColor = focused ? GOLD : '#D1D5DB';

  return (
    <div className="relative" style={{ marginTop: 6 }}>
      <div
        className="rounded-md bg-white"
        style={{
          border: `1px solid ${borderColor}`,
          padding: '14px 12px 10px',
          transition: 'border-color .15s',
        }}
      >
        <input
          type={type}
          value={value}
          inputMode={inputMode}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isActive ? placeholder : ''}
          className="w-full bg-transparent outline-none text-[15px] text-gray-900 placeholder:text-gray-400"
        />
        {showValid && (
          <Check
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: GOLD }}
            strokeWidth={3}
          />
        )}
      </div>
      {/* Label flottant qui "casse" la bordure */}
      <span
        className="absolute bg-white px-1.5 text-[11px] font-medium pointer-events-none"
        style={{
          left: 10,
          top: -7,
          color: focused ? GOLD : '#6B7280',
          letterSpacing: 0.1,
        }}
      >
        {label}
      </span>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   Select avec label flottant + chevron
   ────────────────────────────────────────────────────────────── */
interface MobileSelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  valid?: boolean;
}

export const MobileSelect: React.FC<MobileSelectProps> = ({
  label, value, onChange, options, valid,
}) => {
  const [focused, setFocused] = useState(false);
  const showValid = valid ?? (value !== '' && value !== undefined);
  const borderColor = focused ? GOLD : '#D1D5DB';

  return (
    <div className="relative" style={{ marginTop: 6 }}>
      <div
        className="rounded-md bg-white relative"
        style={{
          border: `1px solid ${borderColor}`,
          padding: '14px 36px 10px 12px',
        }}
      >
        <select
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none text-[15px] text-gray-900 appearance-none"
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: showValid ? GOLD : '#9CA3AF' }}
        />
      </div>
      <span
        className="absolute bg-white px-1.5 text-[11px] font-medium pointer-events-none"
        style={{
          left: 10,
          top: -7,
          color: focused ? GOLD : '#6B7280',
        }}
      >
        {label}
      </span>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   "Carte" avec titre noir (style easyJet "Add a voucher")
   ────────────────────────────────────────────────────────────── */
export const MobileBlockCard: React.FC<{
  title: string;
  children: React.ReactNode;
  bordered?: boolean;
}> = ({ title, children, bordered }) => (
  <div
    className="md:hidden mb-4"
    style={bordered ? { border: `1.5px solid ${GOLD}`, borderRadius: 8, overflow: 'hidden' } : undefined}
  >
    <div className="bg-[#1A1A1A] text-white px-4 py-2.5 text-[15px] font-bold">
      {title}
    </div>
    <div className="bg-white px-4 py-4">{children}</div>
  </div>
);

/* ──────────────────────────────────────────────────────────────
   CTA orange/gold plein (full width)
   ────────────────────────────────────────────────────────────── */
export const MobilePrimaryButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}> = ({ children, onClick, disabled, icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="md:hidden w-full py-3.5 rounded text-white font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-50"
    style={{ background: disabled ? '#9CA3AF' : GOLD }}
  >
    {icon}
    {children}
  </button>
);

export { GOLD };
