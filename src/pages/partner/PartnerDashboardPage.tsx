import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartner, PartnerRide } from '@/contexts/PartnerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Car, TrendingUp, Users, Star, Plus, MapPin, Clock, Calendar, FileText,
  Download, Eye, EyeOff, LogOut, Search, Filter, CheckCircle, Loader2,
  AlertCircle, Package, Shield, Heart, Copy, Check, ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

const SERVICE_TYPES = [
  { value: 'ride', label: 'Ride', icon: Car, color: '#007AFF' },
  { value: 'van', label: 'Van', icon: Package, color: '#FF9500' },
  { value: 'secure', label: 'Secure', icon: Shield, color: '#FF3B30' },
  { value: 'express', label: 'Express', icon: TrendingUp, color: '#34C759' },
  { value: 'care', label: 'Care', icon: Heart, color: '#AF52DE' },
];

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  searching: { label: 'En recherche', color: '#FF9500', icon: Loader2 },
  driver_arriving: { label: 'En route', color: '#007AFF', icon: Car },
  in_progress: { label: 'En cours', color: '#34C759', icon: MapPin },
  completed: { label: 'Terminé', color: '#8E8E93', icon: CheckCircle },
  cancelled: { label: 'Annulé', color: '#FF3B30', icon: AlertCircle },
};

const PartnerDashboardPage: React.FC = () => {
  const { partner, rides, invoices, orderRide, logout } = usePartner();
  const navigate = useNavigate();

  // Order form state
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [serviceType, setServiceType] = useState('ride');
  const [reference, setReference] = useState('');
  const [scheduleMode, setScheduleMode] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [ordering, setOrdering] = useState(false);

  // History filters
  const [historyFilter, setHistoryFilter] = useState('all');
  const [historySearch, setHistorySearch] = useState('');

  // API key visibility
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // KPIs
  const thisMonthRides = rides.filter(r => {
    const d = new Date(r.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalBilled = thisMonthRides.filter(r => r.status === 'completed').reduce((s, r) => s + (r.price || 0), 0);
  const avgRating = thisMonthRides.filter(r => r.driverRating).reduce((s, r, _, a) => s + (r.driverRating || 0) / a.length, 0);
  const activeDrivers = rides.filter(r => ['driver_arriving', 'in_progress'].includes(r.status)).length;

  const activeRides = rides.filter(r => ['searching', 'driver_arriving', 'in_progress'].includes(r.status));
  const completedRides = useMemo(() => {
    let filtered = rides.filter(r => r.status === 'completed' || r.status === 'cancelled');
    if (historyFilter !== 'all') filtered = filtered.filter(r => r.serviceType === historyFilter);
    if (historySearch) filtered = filtered.filter(r =>
      r.reference.toLowerCase().includes(historySearch.toLowerCase()) ||
      r.pickupAddress.toLowerCase().includes(historySearch.toLowerCase()) ||
      r.dropoffAddress.toLowerCase().includes(historySearch.toLowerCase())
    );
    return filtered;
  }, [rides, historyFilter, historySearch]);

  const handleOrder = () => {
    if (!pickup || !dropoff) { toast.error('Adresses requises'); return; }
    setOrdering(true);
    setTimeout(() => {
      orderRide({
        pickupAddress: pickup, dropoffAddress: dropoff,
        serviceType, reference: reference || `REF-${Date.now().toString(36).toUpperCase()}`,
        scheduledAt: scheduleMode === 'scheduled' ? scheduledDate : undefined,
      });
      toast.success('Course commandée avec succès');
      setPickup(''); setDropoff(''); setReference('');
      setOrdering(false);
    }, 600);
  };

  const copyApiKey = () => {
    if (partner) navigator.clipboard.writeText(partner.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const exportCSV = () => {
    const header = 'Date,Référence,Départ,Destination,Chauffeur,Durée (min),Prix (CHF),Statut\n';
    const rows = completedRides.map(r =>
      `${format(new Date(r.createdAt), 'dd/MM/yyyy HH:mm')},${r.reference},${r.pickupAddress},${r.dropoffAddress},${r.driverName || '-'},${r.duration || '-'},${r.price || '-'},${STATUS_MAP[r.status]?.label}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `caby-courses-${format(new Date(), 'yyyy-MM')}.csv`; a.click();
    toast.success('Export CSV téléchargé');
  };

  const handleLogout = () => { logout(); navigate('/partner/login'); };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E5EA] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-extrabold tracking-tight text-[#1A1A1A]">
              <span className="text-[#C9A84C]">C</span>ABY
            </h1>
            <div className="h-6 w-px bg-[#E5E5EA]" />
            <span className="font-semibold text-[#1A1A1A]">{partner?.name}</span>
            <Badge className="bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/30 hover:bg-[#C9A84C]/15 text-xs">
              Partenaire Certifié Caby ✓
            </Badge>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-[#888] hover:text-[#1A1A1A]">
            <LogOut className="w-4 h-4 mr-2" /> Déconnexion
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Courses ce mois', value: thisMonthRides.length, icon: Car, color: '#007AFF' },
            { label: 'Total facturé', value: `${totalBilled.toFixed(0)} CHF`, icon: TrendingUp, color: '#34C759' },
            { label: 'Chauffeurs actifs', value: activeDrivers, icon: Users, color: '#C9A84C' },
            { label: 'Note moyenne', value: avgRating ? avgRating.toFixed(1) : '—', icon: Star, color: '#FF9500' },
          ].map((kpi, i) => (
            <Card key={i} className="bg-white border-0 shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                  <kpi.icon className="w-6 h-6" style={{ color: kpi.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{kpi.value}</p>
                  <p className="text-xs text-[#888]">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="order" className="space-y-6">
          <TabsList className="bg-white border border-[#E5E5EA] p-1 h-auto rounded-xl">
            {[
              { value: 'order', label: 'Commander', icon: Plus },
              { value: 'active', label: `En cours (${activeRides.length})`, icon: MapPin },
              { value: 'history', label: 'Historique', icon: FileText },
              { value: 'billing', label: 'Facturation', icon: Download },
              { value: 'api', label: 'Mon API', icon: Shield },
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}
                className="data-[state=active]:bg-[#C9A84C] data-[state=active]:text-white rounded-lg px-4 py-2 text-sm text-[#888]">
                <tab.icon className="w-4 h-4 mr-2" />{tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ORDER */}
          <TabsContent value="order">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader><CardTitle className="text-[#1A1A1A] text-lg">Commander une course</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#555]">Adresse de départ</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#34C759]" />
                      <Input value={pickup} onChange={e => setPickup(e.target.value)}
                        placeholder="Ex: Gare Cornavin, Genève"
                        className="pl-10 h-12 bg-[#F9F9F9] border-[#E0E0E0] text-[#1A1A1A] rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#555]">Adresse de destination</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF3B30]" />
                      <Input value={dropoff} onChange={e => setDropoff(e.target.value)}
                        placeholder="Ex: Aéroport de Genève"
                        className="pl-10 h-12 bg-[#F9F9F9] border-[#E0E0E0] text-[#1A1A1A] rounded-xl" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#555]">Type de service</label>
                    <Select value={serviceType} onValueChange={setServiceType}>
                      <SelectTrigger className="h-12 bg-[#F9F9F9] border-[#E0E0E0] text-[#1A1A1A] rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_TYPES.map(s => (
                          <SelectItem key={s.value} value={s.value}>
                            <span className="flex items-center gap-2">
                              <s.icon className="w-4 h-4" style={{ color: s.color }} />
                              {s.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#555]">Quand</label>
                    <Select value={scheduleMode} onValueChange={v => setScheduleMode(v as 'now' | 'scheduled')}>
                      <SelectTrigger className="h-12 bg-[#F9F9F9] border-[#E0E0E0] text-[#1A1A1A] rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="now"><Clock className="w-4 h-4 inline mr-2" />Immédiat</SelectItem>
                        <SelectItem value="scheduled"><Calendar className="w-4 h-4 inline mr-2" />Planifié</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#555]">Référence interne</label>
                    <Input value={reference} onChange={e => setReference(e.target.value)}
                      placeholder="N° dossier, nom client..."
                      className="h-12 bg-[#F9F9F9] border-[#E0E0E0] text-[#1A1A1A] rounded-xl" />
                  </div>
                </div>

                {scheduleMode === 'scheduled' && (
                  <Input type="datetime-local" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
                    className="h-12 bg-[#F9F9F9] border-[#E0E0E0] text-[#1A1A1A] rounded-xl max-w-xs" />
                )}

                <Button onClick={handleOrder} disabled={ordering}
                  className="h-12 px-8 bg-[#C9A84C] hover:bg-[#B8973F] text-white font-semibold rounded-xl">
                  {ordering ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                  Commander
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ACTIVE RIDES */}
          <TabsContent value="active">
            <div className="space-y-4">
              {activeRides.length === 0 ? (
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="py-16 text-center">
                    <Car className="w-12 h-12 text-[#CCC] mx-auto mb-3" />
                    <p className="text-[#888]">Aucune course en cours</p>
                  </CardContent>
                </Card>
              ) : activeRides.map(ride => {
                const st = STATUS_MAP[ride.status];
                const svc = SERVICE_TYPES.find(s => s.value === ride.serviceType);
                return (
                  <Card key={ride.id} className="bg-white border-0 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge style={{ backgroundColor: `${svc?.color}15`, color: svc?.color, borderColor: `${svc?.color}40` }}
                            className="text-xs font-semibold">{svc?.label}</Badge>
                          <span className="text-sm font-mono text-[#888]">{ride.reference}</span>
                        </div>
                        <Badge style={{ backgroundColor: `${st.color}15`, color: st.color }} className="text-xs">
                          {ride.status === 'searching' && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                          {st.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#34C759] mt-1.5 shrink-0" />
                            <p className="text-sm text-[#1A1A1A]">{ride.pickupAddress}</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#FF3B30] mt-1.5 shrink-0" />
                            <p className="text-sm text-[#1A1A1A]">{ride.dropoffAddress}</p>
                          </div>
                        </div>
                        {ride.driverName && (
                          <div className="flex items-center gap-3 bg-[#F9F9F9] rounded-xl p-3">
                            <div className="w-10 h-10 rounded-full bg-[#C9A84C]/15 flex items-center justify-center">
                              <span className="text-[#C9A84C] font-bold">{ride.driverName[0]}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-[#1A1A1A]">{ride.driverName}</p>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-[#FF9500] fill-[#FF9500]" />
                                <span className="text-xs text-[#888]">{ride.driverRating}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* HISTORY */}
          <TabsContent value="history">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="text-[#1A1A1A] text-lg">Historique des courses</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]" />
                      <Input value={historySearch} onChange={e => setHistorySearch(e.target.value)}
                        placeholder="Rechercher..." className="pl-9 h-9 w-48 bg-[#F9F9F9] border-[#E0E0E0] text-[#1A1A1A] rounded-lg text-sm" />
                    </div>
                    <Select value={historyFilter} onValueChange={setHistoryFilter}>
                      <SelectTrigger className="h-9 w-32 bg-[#F9F9F9] border-[#E0E0E0] text-[#1A1A1A] rounded-lg text-sm">
                        <Filter className="w-3 h-3 mr-1" /><SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        {SERVICE_TYPES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={exportCSV} className="h-9 text-sm border-[#E0E0E0] text-[#555] rounded-lg">
                      <Download className="w-4 h-4 mr-1" /> CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#F0F0F0]">
                        <TableHead className="text-[#888] text-xs">Date</TableHead>
                        <TableHead className="text-[#888] text-xs">Référence</TableHead>
                        <TableHead className="text-[#888] text-xs">Départ</TableHead>
                        <TableHead className="text-[#888] text-xs">Destination</TableHead>
                        <TableHead className="text-[#888] text-xs">Chauffeur</TableHead>
                        <TableHead className="text-[#888] text-xs">Durée</TableHead>
                        <TableHead className="text-[#888] text-xs">Prix</TableHead>
                        <TableHead className="text-[#888] text-xs">Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedRides.slice(0, 20).map(ride => {
                        const st = STATUS_MAP[ride.status];
                        return (
                          <TableRow key={ride.id} className="border-[#F0F0F0] hover:bg-[#FAFAFA]">
                            <TableCell className="text-sm text-[#1A1A1A]">{format(new Date(ride.createdAt), 'dd/MM/yy HH:mm')}</TableCell>
                            <TableCell className="text-sm font-mono text-[#888]">{ride.reference}</TableCell>
                            <TableCell className="text-sm text-[#1A1A1A] max-w-[180px] truncate">{ride.pickupAddress}</TableCell>
                            <TableCell className="text-sm text-[#1A1A1A] max-w-[180px] truncate">{ride.dropoffAddress}</TableCell>
                            <TableCell className="text-sm text-[#1A1A1A]">{ride.driverName || '—'}</TableCell>
                            <TableCell className="text-sm text-[#888]">{ride.duration ? `${ride.duration} min` : '—'}</TableCell>
                            <TableCell className="text-sm font-semibold text-[#1A1A1A]">{ride.price ? `${ride.price} CHF` : '—'}</TableCell>
                            <TableCell>
                              <Badge style={{ backgroundColor: `${st.color}15`, color: st.color }} className="text-xs">{st.label}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BILLING */}
          <TabsContent value="billing">
            <div className="space-y-4">
              {invoices.map(inv => (
                <Card key={inv.id} className="bg-white border-0 shadow-sm">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-[#C9A84C]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#1A1A1A]">
                          {format(new Date(inv.month + '-01'), 'MMMM yyyy', { locale: fr })}
                        </p>
                        <p className="text-sm text-[#888]">{inv.rideCount} courses · {inv.totalAmount.toFixed(2)} CHF</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={
                        inv.status === 'paid' ? 'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/30' :
                        inv.status === 'pending' ? 'bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/30' :
                        'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/30'
                      }>
                        {inv.status === 'paid' ? 'Payé' : inv.status === 'pending' ? 'En attente' : 'En retard'}
                      </Badge>
                      <Button variant="outline" className="h-9 text-sm border-[#E0E0E0] text-[#555] rounded-lg">
                        <Download className="w-4 h-4 mr-1" /> PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* API */}
          <TabsContent value="api">
            <div className="space-y-6">
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader><CardTitle className="text-[#1A1A1A] text-lg">Clé API</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-[#F9F9F9] rounded-xl px-4 py-3 font-mono text-sm text-[#1A1A1A]">
                      {showApiKey ? partner?.apiKey : '••••••••••••••••••••••••••••••••••••'}
                    </div>
                    <Button variant="outline" onClick={() => setShowApiKey(!showApiKey)}
                      className="h-10 border-[#E0E0E0] text-[#555] rounded-xl">
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" onClick={copyApiKey}
                      className="h-10 border-[#E0E0E0] text-[#555] rounded-xl">
                      {copiedKey ? <Check className="w-4 h-4 text-[#34C759]" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardHeader><CardTitle className="text-[#1A1A1A] text-lg">Exemple de requête</CardTitle></CardHeader>
                <CardContent>
                  <pre className="bg-[#1A1A1A] text-[#E5E5EA] rounded-xl p-5 text-sm overflow-x-auto">
{`curl -X POST https://api.caby.ch/v1/rides \\
  -H "Authorization: Bearer ${showApiKey ? partner?.apiKey : 'caby_pk_live_...'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "pickup_address": "Gare Cornavin, Genève",
    "dropoff_address": "Aéroport de Genève",
    "service_type": "ride",
    "reference": "DOSSIER-12345",
    "scheduled_at": null
  }'`}
                  </pre>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardHeader><CardTitle className="text-[#1A1A1A] text-lg">Webhook</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#555]">URL de callback</label>
                    <Input value={partner?.webhookUrl || ''} readOnly
                      className="h-12 bg-[#F9F9F9] border-[#E0E0E0] text-[#1A1A1A] font-mono text-sm rounded-xl" />
                  </div>
                  <p className="text-xs text-[#888]">
                    Événements envoyés : <code className="bg-[#F0F0F0] px-1 rounded">ride.accepted</code> ·{' '}
                    <code className="bg-[#F0F0F0] px-1 rounded">ride.started</code> ·{' '}
                    <code className="bg-[#F0F0F0] px-1 rounded">ride.completed</code> ·{' '}
                    <code className="bg-[#F0F0F0] px-1 rounded">ride.cancelled</code>
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PartnerDashboardPage;
