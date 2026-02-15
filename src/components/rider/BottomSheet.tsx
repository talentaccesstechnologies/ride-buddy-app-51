import React, { useState } from 'react';
import { Search, Home, Briefcase, Clock, MapPin, Car, Package, CalendarClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BottomSheet: React.FC = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const savedPlaces = [
    { id: '1', name: 'Maison', icon: Home, address: '15 Rue de Lausanne, Genève' },
    { id: '2', name: 'Travail', icon: Briefcase, address: '1 Place de Cornavin' },
  ];

  const suggestions = [
    { id: '1', label: 'Course', icon: Car, color: 'bg-primary/20 text-primary' },
    { id: '2', label: 'Livraison', icon: Package, color: 'bg-[hsl(var(--caby-blue))]/20 text-[hsl(var(--caby-blue))]' },
    { id: '3', label: 'Planifier', icon: CalendarClock, color: 'bg-[hsl(var(--caby-purple))]/20 text-[hsl(var(--caby-purple))]' },
  ];

  const recentPlaces = [
    { id: '1', address: 'Gare Cornavin, Genève', shortAddress: 'Gare Cornavin' },
    { id: '2', address: 'Aéroport de Genève', shortAddress: 'Aéroport GVA' },
    { id: '3', address: '25 Rue du Rhône, Genève', shortAddress: '25 Rue du Rhône' },
  ];

  const handleSearchClick = () => {
    navigate('/caby/search');
  };

  return (
    <div
      className={`bottom-sheet shadow-sheet transition-all duration-300 ${
        expanded ? 'h-[85vh]' : 'h-auto'
      }`}
    >
      {/* Drag handle */}
      <div
        className="flex justify-center pt-3 pb-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
      </div>

      <div className="px-4 pb-6 safe-area-bottom">
        {/* Search bar */}
        <button
          onClick={handleSearchClick}
          className="w-full flex items-center gap-3 bg-card hover:bg-card/80 rounded-xl px-4 py-4 transition-colors mb-5 border border-border"
        >
          <Search className="w-5 h-5 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">Où allez-vous ?</span>
        </button>

        {/* Suggestion tiles */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={handleSearchClick}
              className="flex flex-col items-center gap-2 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Saved places */}
        <div className="flex gap-2 mb-5">
          {savedPlaces.map((place) => (
            <button
              key={place.id}
              onClick={handleSearchClick}
              className="flex items-center gap-2 bg-card border border-border hover:border-primary/30 rounded-full px-4 py-2.5 transition-colors"
            >
              <place.icon className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">{place.name}</span>
            </button>
          ))}
        </div>

        {/* Recent places */}
        <div className="space-y-1">
          <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2 uppercase tracking-wider">
            <Clock className="w-3 h-3" />
            Récents
          </h3>
          {recentPlaces.map((place) => (
            <button
              key={place.id}
              onClick={handleSearchClick}
              className="w-full flex items-center gap-3 p-3 hover:bg-card rounded-xl transition-colors text-left"
            >
              <div className="w-9 h-9 bg-card border border-border rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{place.shortAddress}</p>
                <p className="text-xs text-muted-foreground truncate">{place.address}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
