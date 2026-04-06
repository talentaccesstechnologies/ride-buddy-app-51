import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Check, Users, FileText, Shield, Zap, Clock, ChevronRight, Download, AlertTriangle, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const benefits = [
  { icon: Users, text: 'Chauffeur dédié assigné à votre entreprise' },
  { icon: FileText, text: 'Facturation mensuelle groupée avec TVA — zéro note de frais' },
  { icon: Shield, text: 'Dashboard RH : profil, courses et dépenses par collaborateur' },
  { icon: AlertTriangle, text: 'Plafond de dépense par collaborateur paramétrable' },
  { icon: Download, text: 'Rapport mensuel PDF automatique pour la comptabilité' },
  { icon: Zap, text: 'Priorité dispatch absolue — même pendant les rushes' },
  { icon: Clock, text: 'Véhicule premium garanti (pas de Caby standard)' },
];

interface Employee {
  id: string;
  name: string;
  email: string;
  rides: number;
  spent: number;
  limit: number;
}

const mockEmployees: Employee[] = [
  { id: '1', name: 'Marie Dupont', email: 'marie@sixt.ch', rides: 12, spent: 420, limit: 500 },
  { id: '2', name: 'Jean Martin', email: 'jean@sixt.ch', rides: 8, spent: 310, limit: 500 },
  { id: '3', name: 'Sophie Laurent', email: 'sophie@sixt.ch', rides: 15, spent: 485, limit: 500 },
  { id: '4', name: 'Pierre Morel', email: 'pierre@sixt.ch', rides: 3, spent: 95, limit: 300 },
];

const CabyBusinessPage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'landing' | 'form' | 'dashboard'>('landing');
  const [formData, setFormData] = useState({ company: '', employees: '', volume: '', email: '' });

  // Landing
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <button onClick={() => navigate('/caby/services')} className="flex items-center gap-1 text-muted-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[hsl(43,75%,52%)]/15 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-[hsl(43,75%,52%)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Caby Business Pro</h1>
                <p className="text-muted-foreground">Un chauffeur dédié pour votre entreprise. Facturé en fin de mois.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-10">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-card border border-border p-4">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(43,75%,52%)]/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-[hsl(43,75%,52%)]" />
                  </div>
                  <p className="text-sm mt-1">{b.text}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-10">
              <Button onClick={() => setView('form')} className="bg-[hsl(43,75%,52%)] hover:bg-[hsl(43,75%,45%)] text-black font-bold rounded-xl h-12 px-8">
                Demander un devis
              </Button>
              <Button onClick={() => setView('dashboard')} variant="outline" className="rounded-xl h-12 px-8">
                Voir la démo dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Contact form
  if (view === 'form') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-6 py-16">
          <button onClick={() => setView('landing')} className="flex items-center gap-1 text-muted-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <h2 className="text-2xl font-bold mb-6">Contact entreprise</h2>
          <div className="space-y-4">
            {[
              { key: 'company', label: 'Nom de la société', placeholder: 'Ex: SIXT Suisse SA' },
              { key: 'employees', label: 'Nombre de collaborateurs', placeholder: 'Ex: 25' },
              { key: 'volume', label: 'Volume de courses estimé/mois', placeholder: 'Ex: 100 courses' },
              { key: 'email', label: 'Email RH / Responsable', placeholder: 'rh@entreprise.ch' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-sm font-medium mb-1.5 block">{f.label}</label>
                <input
                  value={formData[f.key as keyof typeof formData]}
                  onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full h-12 rounded-xl bg-muted/30 border border-border px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[hsl(43,75%,52%)]/50"
                />
              </div>
            ))}
            <Button onClick={() => setView('dashboard')} className="w-full bg-[hsl(43,75%,52%)] hover:bg-[hsl(43,75%,45%)] text-black font-bold rounded-xl h-12 mt-4">
              Envoyer la demande
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard RH
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[hsl(43,75%,52%)]/15 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[hsl(43,75%,52%)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SIXT Suisse SA</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[hsl(43,75%,52%)]/15 text-[hsl(43,75%,52%)]">
                Partenaire Certifié Caby ✓
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-lg gap-1">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg gap-1">
              <FileText className="w-3.5 h-3.5" /> Facture PDF
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Courses ce mois', value: '38', color: 'text-foreground' },
            { label: 'Montant facturé', value: 'CHF 1\'310', color: 'text-[hsl(43,75%,52%)]' },
            { label: 'Collaborateurs actifs', value: '4', color: 'text-foreground' },
            { label: 'Note moyenne', value: '4.9 ⭐', color: 'text-foreground' },
          ].map((kpi, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className={`text-2xl font-black mt-1 ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Employees table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <h2 className="font-bold text-sm">Collaborateurs</h2>
            <Button size="sm" variant="outline" className="rounded-lg gap-1 text-xs">
              <Plus className="w-3 h-3" /> Ajouter
            </Button>
          </div>
          <div className="divide-y divide-border">
            {mockEmployees.map(emp => {
              const pct = (emp.spent / emp.limit) * 100;
              const nearLimit = pct >= 90;
              return (
                <div key={emp.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{emp.name}</p>
                    <p className="text-[10px] text-muted-foreground">{emp.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{emp.rides} courses</p>
                    <p className="text-[10px] text-muted-foreground">CHF {emp.spent} / {emp.limit}</p>
                  </div>
                  <div className="w-20">
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${nearLimit ? 'bg-red-500' : 'bg-[hsl(43,75%,52%)]'}`} style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                    {nearLimit && <p className="text-[9px] text-red-400 mt-0.5">⚠️ Proche du plafond</p>}
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-muted">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 text-center">
          <button onClick={() => setView('landing')} className="text-xs text-muted-foreground hover:text-foreground">
            ← Retour à la présentation
          </button>
        </div>
      </div>
    </div>
  );
};

export default CabyBusinessPage;
