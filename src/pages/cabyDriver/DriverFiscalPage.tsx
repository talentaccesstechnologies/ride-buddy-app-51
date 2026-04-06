import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, FileText, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DriverBottomNav from '@/components/cabyDriver/DriverBottomNav';
import { toast } from 'sonner';

const MONTHS = [
  '2026-03', '2026-02', '2026-01', '2025-12', '2025-11',
];

const DOCUMENT_TYPES = [
  { id: 'monthly_summary', label: 'Récapitulatif mensuel des gains', icon: '📊' },
  { id: 'annual_summary', label: 'Récapitulatif annuel (déclaration)', icon: '📋' },
  { id: 'activity_cert', label: "Attestation d'activité", icon: '📄' },
  { id: 'commission_invoice', label: 'Facture de commission Caby', icon: '🧾' },
];

const DriverFiscalPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0]);

  const handleDownload = (docType: string) => {
    toast.success('Document téléchargé', {
      description: `${DOCUMENT_TYPES.find(d => d.id === docType)?.label} — ${selectedMonth}`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-14 pb-8">
        <button onClick={() => navigate('/caby/driver/profile')} className="flex items-center gap-1 text-muted-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Profil
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📑</span>
            <h1 className="text-2xl font-bold tracking-tight">Fiscalité & Documents</h1>
          </div>

          {/* Info box */}
          <div className="mt-4 rounded-2xl bg-card border border-border p-4 space-y-3">
            <p className="text-sm font-bold">🇫🇷 Pour chauffeurs Cross-Border français</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>• Vos revenus Caby Cross-Border sont déclarables en France comme revenus d'activité indépendante</li>
              <li>• Caby vous fournit un récapitulatif annuel de vos gains pour votre déclaration</li>
              <li>• Conservez tous vos justificatifs de trajets pour votre comptabilité</li>
            </ul>
            <a href="https://www.impots.gouv.fr" target="_blank" rel="noopener noreferrer"
              className="inline-block text-xs text-primary underline">
              Service des impôts français →
            </a>
          </div>

          {/* Month selector */}
          <div className="mt-6">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Période
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {MONTHS.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedMonth === m
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-muted-foreground'
                  }`}
                >
                  {new Date(m + '-01').toLocaleDateString('fr-CH', { month: 'long', year: 'numeric' })}
                </button>
              ))}
            </div>
          </div>

          {/* Documents list */}
          <div className="mt-6 space-y-3">
            <p className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Mes Documents
            </p>
            {DOCUMENT_TYPES.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{doc.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{doc.label}</p>
                    <p className="text-xs text-muted-foreground">{selectedMonth} · PDF</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => handleDownload(doc.id)}
                >
                  <Download className="w-3 h-3 mr-1" /> PDF
                </Button>
              </div>
            ))}

            {/* Excel export */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <span className="text-lg">📊</span>
                <div>
                  <p className="text-sm font-medium">Export Excel complet</p>
                  <p className="text-xs text-muted-foreground">Tous les trajets avec montants</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => toast.success('Export Excel téléchargé')}
              >
                <Download className="w-3 h-3 mr-1" /> XLSX
              </Button>
            </div>
          </div>

          {/* Simulated summary */}
          <div className="mt-6 rounded-2xl bg-primary/5 border border-primary/20 p-4">
            <p className="text-xs font-bold text-primary mb-2">Résumé — {selectedMonth}</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-muted-foreground">Trajets effectués</span><p className="font-bold text-lg">47</p></div>
              <div><span className="text-muted-foreground">Revenus bruts</span><p className="font-bold text-lg">CHF 3'240</p></div>
              <div><span className="text-muted-foreground">Commission Caby</span><p className="font-bold text-lg text-destructive">- CHF 648</p></div>
              <div><span className="text-muted-foreground">Net à déclarer</span><p className="font-bold text-lg text-emerald-400">CHF 2'592</p></div>
            </div>
          </div>
        </motion.div>
      </div>
      <DriverBottomNav />
    </div>
  );
};

export default DriverFiscalPage;
