import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Car, ChevronRight, Phone, UserX, Wrench, MapPin, Bug, KeyRound, ExternalLink, Clock, Banknote } from 'lucide-react';
import DriverBottomNav from '@/components/cabyDriver/DriverBottomNav';

const recentMissions = [
  {
    id: '1',
    location: 'Av. de la Gare des Eaux-Vives 19',
    date: '14 Fév · 13:13',
    amount: 'CHF 40.73',
    duration: '22 min',
  },
  {
    id: '2',
    location: 'Rue du Mont-Blanc 24, Genève',
    date: '13 Fév · 18:53',
    amount: 'CHF 32.50',
    duration: '15 min',
  },
  {
    id: '3',
    location: 'Aéroport de Genève',
    date: '13 Fév · 09:15',
    amount: 'CHF 55.00',
    duration: '35 min',
  },
];

const missionActions = [
  { icon: UserX, label: 'Le client n\'est pas venu' },
  { icon: Wrench, label: 'Le client a dégradé le véhicule' },
];

const helpTopics = [
  { icon: MapPin, label: 'Navigation & GPS', desc: 'Problème de GPS, itinéraire incorrect' },
  { icon: Bug, label: 'Bugs de l\'App', desc: 'Bug lors de la clôture de course' },
  { icon: KeyRound, label: 'Accès & Compte', desc: 'Comment activer mon compte sur Caby' },
];

const DriverHelpPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMission, setSelectedMission] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-caby-dark pb-24 text-white">
      {/* Header */}
      <div className="px-5 pt-12 pb-2">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/caby/driver/dashboard')} className="p-1">
            <X className="w-6 h-6" />
          </button>
        </div>
        <h1 className="text-3xl font-bold">Aide Chauffeur</h1>
      </div>

      <div className="px-5 pt-4">
        {/* Recent missions */}
        <h2 className="text-lg font-bold mb-4">Dernières missions</h2>
        <div className="space-y-3 mb-8">
          {recentMissions.map((mission) => (
            <div key={mission.id}>
              <button
                onClick={() => setSelectedMission(selectedMission === mission.id ? null : mission.id)}
                className="w-full flex items-center gap-4 bg-caby-card border border-caby-border rounded-xl p-4 text-left hover:border-caby-gold/30 transition-colors"
              >
                <div className="w-14 h-14 bg-caby-border rounded-lg flex items-center justify-center flex-shrink-0">
                  <Car className="w-6 h-6 text-caby-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{mission.location}</p>
                  <p className="text-sm text-caby-muted">{mission.date}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-sm text-caby-muted flex items-center gap-1">
                      <Banknote className="w-3 h-3" /> {mission.amount}
                    </span>
                    <span className="text-sm text-caby-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {mission.duration}
                    </span>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-caby-muted flex-shrink-0 transition-transform ${selectedMission === mission.id ? 'rotate-90' : ''}`} />
              </button>

              {selectedMission === mission.id && (
                <div className="mt-1 ml-4 space-y-1">
                  {missionActions.map((action, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center gap-3 bg-caby-card/50 border border-caby-border rounded-lg px-4 py-3 text-left hover:border-caby-gold/30 transition-colors"
                    >
                      <action.icon className="w-4 h-4 text-caby-muted" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Help topics */}
        <h2 className="text-lg font-bold mb-4">Thèmes d'aide</h2>
        <div className="space-y-3 mb-6">
          {helpTopics.map((topic, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-4 bg-caby-card border border-caby-border rounded-xl p-4 text-left hover:border-caby-gold/30 transition-colors"
            >
              <topic.icon className="w-5 h-5 text-caby-muted" />
              <div className="flex-1">
                <p className="font-bold text-sm">{topic.label}</p>
                <p className="text-xs text-caby-muted mt-0.5">{topic.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-caby-muted" />
            </button>
          ))}
        </div>

        {/* Caby external link */}
        <button className="w-full flex items-center gap-4 bg-caby-gold/10 border border-caby-gold/30 rounded-xl p-4 text-left hover:bg-caby-gold/20 transition-colors mb-8">
          <ExternalLink className="w-5 h-5 text-caby-gold" />
          <div className="flex-1">
            <p className="font-bold text-sm text-caby-gold">Questions sur mon Salaire & Social</p>
            <p className="text-xs text-caby-muted mt-0.5">Redirige vers le support Caby (payroll, AVS, LPP)</p>
          </div>
          <ChevronRight className="w-4 h-4 text-caby-gold" />
        </button>
      </div>

      {/* Floating call button */}
      <div className="fixed bottom-24 right-5 z-40">
        <button className="flex items-center gap-2 bg-caby-gold text-caby-dark rounded-full px-5 py-3 shadow-lg hover:bg-caby-gold/90 transition-colors">
          <Phone className="w-5 h-5" />
          <span className="font-bold text-sm">Appeler le Support</span>
        </button>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default DriverHelpPage;
