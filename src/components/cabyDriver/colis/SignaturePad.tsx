import React, { useRef, useState } from 'react';
import { X, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onSign: () => void;
  onSkip: () => void;
  onClose: () => void;
}

const SignaturePad: React.FC<Props> = ({ onSign, onSkip, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    setDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'hsl(var(--foreground))';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
      <div className="w-full bg-card rounded-t-3xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg flex items-center gap-2"><PenTool className="w-5 h-5" /> Signature</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Le destinataire signe ici pour confirmer la réception.</p>
        <canvas
          ref={canvasRef}
          width={320}
          height={150}
          className="w-full h-36 bg-muted rounded-xl border border-border touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={() => setDrawing(false)}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={() => setDrawing(false)}
        />
        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1 h-11" onClick={onSkip}>Passer</Button>
          <Button onClick={onSign} className="flex-1 h-11 btn-gold font-bold">Valider</Button>
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;
