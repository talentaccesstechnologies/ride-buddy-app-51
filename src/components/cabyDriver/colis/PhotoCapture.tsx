import React from 'react';
import { X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  title: string;
  description: string;
  onCapture: () => void;
  onClose: () => void;
}

const PhotoCapture: React.FC<Props> = ({ title, description, onCapture, onClose }) => (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
    <div className="w-full bg-card rounded-t-3xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-lg">{title}</h2>
        <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <div className="w-full h-48 bg-muted rounded-xl flex items-center justify-center mb-4">
        <Camera className="w-12 h-12 text-muted-foreground" />
      </div>
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 h-12" onClick={onClose}>Annuler</Button>
        <Button onClick={onCapture} className="flex-1 h-12 btn-gold font-bold">
          <Camera className="w-5 h-5 mr-2" /> Simuler photo
        </Button>
      </div>
    </div>
  </div>
);

export default PhotoCapture;
