import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface MotoSafetyChecklistProps {
  onConfirm: () => void;
  onClose: () => void;
}

const checklistItems = [
  { id: 'helmet', label: 'Casque client fourni', detail: 'Taille M / L / XL disponible' },
  { id: 'charlotte', label: 'Charlotte cheveux neuve donnée', detail: 'Emballage scellé' },
  { id: 'gloves', label: 'Gants fournis', detail: 'Taille adaptée au client' },
  { id: 'undergloves', label: 'Sous-gants hygiéniques donnés', detail: 'Usage unique' },
];

const MotoSafetyChecklist: React.FC<MotoSafetyChecklistProps> = ({ onConfirm, onClose }) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const allChecked = checklistItems.every(item => checked[item.id]);

  const toggle = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
      <div className="w-full bg-card rounded-t-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Checklist Sécurité Moto</h2>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-5">
          Confirmez avoir fourni l'équipement de sécurité au client avant de démarrer la course.
        </p>

        <div className="space-y-3 mb-6">
          {checklistItems.map(item => (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                checked[item.id] ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/30'
              }`}
            >
              <Checkbox checked={!!checked[item.id]} onCheckedChange={() => toggle(item.id)} />
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.detail}</p>
              </div>
            </button>
          ))}
        </div>

        <Button
          onClick={onConfirm}
          disabled={!allChecked}
          className="w-full h-12 btn-gold font-bold"
        >
          {allChecked ? 'Démarrer la course' : 'Cochez toutes les cases'}
        </Button>
      </div>
    </div>
  );
};

export default MotoSafetyChecklist;
