import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, MapPin, Shield, Camera, KeyRound, Truck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import BottomNav from '@/components/rider/BottomNav';

const timeSlots = [
  '08:00 – 08:30', '08:30 – 09:00', '09:00 – 09:30', '09:30 – 10:00',
  '10:00 – 10:30', '10:30 – 11:00', '11:00 – 11:30', '11:30 – 12:00',
  '12:00 – 12:30', '12:30 – 13:00', '13:00 – 13:30', '13:30 – 14:00',
  '14:00 – 14:30', '14:30 – 15:00', '15:00 – 15:30', '15:30 – 16:00',
  '16:00 – 16:30', '16:30 – 17:00', '17:00 – 17:30', '17:30 – 18:00',
  '18:00 – 18:30', '18:30 – 19:00', '19:00 – 19:30', '19:30 – 20:00',
];

const packageSizes = [
  { id: 'small', label: 'Petit', desc: 'Enveloppe, pli', icon: '✉️' },
  { id: 'medium', label: 'Moyen', desc: 'Colis standard', icon: '📦' },
  { id: 'large', label: 'Grand', desc: 'Gros colis', icon: '🗃️' },
];

const CabyExpressPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('medium');
  const [pinEnabled, setPinEnabled] = useState(true);
  const [doorDrop, setDoorDrop] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

  const generatedPin = '4829';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <button onClick={() => navigate('/caby/services')} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Services</span>
        </button>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Caby Express</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">Express 30 min</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Livraison rapide de colis e-commerce et plis. Suivi en temps réel et preuve de livraison.
        </p>
      </div>

      <div className="px-5 space-y-6">
        {/* Package size */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Taille du colis</h2>
          <div className="grid grid-cols-3 gap-2">
            {packageSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => setSelectedSize(size.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors ${
                  selectedSize === size.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card'
                }`}
              >
                <span className="text-xl">{size.icon}</span>
                <span className="text-xs font-bold">{size.label}</span>
                <span className="text-[10px] text-muted-foreground">{size.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Scheduling */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Planifier la réception
            </h2>
            <Switch checked={isScheduled} onCheckedChange={setIsScheduled} />
          </div>
          {isScheduled && (
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto scrollbar-hide">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`text-xs py-2 px-2 rounded-lg border transition-colors ${
                    selectedSlot === slot
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border bg-card text-muted-foreground'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
          {!isScheduled && (
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <Truck className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-bold">Livraison immédiate</p>
                <p className="text-xs text-muted-foreground">Estimé en 30 minutes</p>
              </div>
            </div>
          )}
        </section>

        {/* PIN verification */}
        <section className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <KeyRound className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-bold">Code PIN de livraison</p>
                <p className="text-xs text-muted-foreground">Le chauffeur doit saisir ce code pour confirmer la remise</p>
              </div>
            </div>
            <Switch checked={pinEnabled} onCheckedChange={setPinEnabled} />
          </div>
          {pinEnabled && (
            <div className="mt-4 flex items-center justify-center gap-3">
              {generatedPin.split('').map((digit, i) => (
                <div key={i} className="w-12 h-14 rounded-xl bg-muted flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{digit}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Door drop / photo proof */}
        <section className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-bold">Dépôt devant la porte</p>
                <p className="text-xs text-muted-foreground">Le chauffeur prendra une photo comme preuve de livraison</p>
              </div>
            </div>
            <Switch checked={doorDrop} onCheckedChange={setDoorDrop} />
          </div>
        </section>

        {/* Live tracking info */}
        <section className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-bold">Suivi en temps réel</p>
            <p className="text-xs text-muted-foreground">
              Suivez la position du chauffeur et de votre colis en direct sur la carte, comme pour une course VTC.
            </p>
          </div>
        </section>

        {/* Trust badge */}
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
          <Shield className="w-6 h-6 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-bold text-foreground">Certifié Caby Safety</span> · Chauffeurs vérifiés · Assurance colis incluse
          </p>
        </div>

        {/* CTA */}
        <Button
          onClick={() => navigate('/caby/search')}
          className="w-full h-14 text-base font-bold rounded-2xl btn-gold"
        >
          <Package className="w-5 h-5 mr-2" />
          {isScheduled && selectedSlot
            ? `Planifier · ${selectedSlot}`
            : 'Envoyer maintenant · Express 30 min'}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default CabyExpressPage;
