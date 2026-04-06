import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ANCILLARY_PRICES, ANCILLARY_META, type AncillaryOptions } from '@/utils/cabyVanPricing';

const GOLD = '#C9A84C';

interface AncillarySelectorProps {
  selected: Partial<AncillaryOptions>;
  onChange: (opts: Partial<AncillaryOptions>) => void;
  basePrice: number;
}

const AncillarySelector: React.FC<AncillarySelectorProps> = ({ selected, onChange, basePrice }) => {
  const total = Object.entries(selected).reduce((sum, [k, v]) => v ? sum + ANCILLARY_PRICES[k as keyof AncillaryOptions] : sum, 0);

  const toggle = (key: keyof AncillaryOptions) => {
    onChange({ ...selected, [key]: !selected[key] });
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Personnalisez votre trajet</h3>
      <div className="space-y-2.5">
        {(Object.keys(ANCILLARY_PRICES) as (keyof AncillaryOptions)[]).map((key) => {
          const meta = ANCILLARY_META[key];
          const price = ANCILLARY_PRICES[key];
          const checked = !!selected[key];
          return (
            <label key={key} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${checked ? 'bg-amber-50 border border-amber-200' : 'hover:bg-gray-50 border border-transparent'}`}>
              <Checkbox checked={checked} onCheckedChange={() => toggle(key)} />
              <span className="text-base">{meta.icon}</span>
              <span className="flex-1 text-sm text-gray-800 font-medium">{meta.label}</span>
              {meta.popular && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Populaire</span>}
              <span className="text-sm font-bold text-gray-600">+CHF {price}</span>
            </label>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-500">Total</span>
        <div className="text-right">
          <span className="text-sm text-gray-500">CHF {basePrice}</span>
          {total > 0 && <span className="text-sm text-gray-500"> + CHF {total} options</span>}
          <span className="text-lg font-black text-gray-900 ml-2">= CHF {basePrice + total}</span>
        </div>
      </div>
    </div>
  );
};

export default AncillarySelector;
