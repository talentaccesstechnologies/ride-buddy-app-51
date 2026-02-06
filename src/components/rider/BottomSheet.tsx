import React, { useState } from 'react';
import { Search, Home, Briefcase, Clock, ChevronUp, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecentPlace {
  id: string;
  address: string;
  shortAddress: string;
}

const BottomSheet: React.FC = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const savedPlaces = [
    { id: '1', name: 'Maison', icon: Home, address: '15 Rue de la Paix, Paris' },
    { id: '2', name: 'Travail', icon: Briefcase, address: '1 Avenue des Champs-Élysées' },
  ];

  const recentPlaces: RecentPlace[] = [
    { id: '1', address: 'Gare du Nord, Paris', shortAddress: 'Gare du Nord' },
    { id: '2', address: 'Aéroport CDG Terminal 2', shortAddress: 'CDG T2' },
    { id: '3', address: '25 Rue de Rivoli, Paris', shortAddress: '25 Rue de Rivoli' },
  ];

  const handleSearchClick = () => {
    navigate('/rider/search');
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
        <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
      </div>

      <div className="px-4 pb-6 safe-area-bottom">
        {/* Search bar */}
        <button
          onClick={handleSearchClick}
          className="w-full flex items-center gap-3 bg-secondary hover:bg-secondary/80 rounded-xl px-4 py-4 transition-colors mb-6"
        >
          <Search className="w-5 h-5 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">Où allez-vous ?</span>
        </button>

        {/* Saved places */}
        <div className="flex gap-3 mb-6">
          {savedPlaces.map((place) => (
            <button
              key={place.id}
              onClick={handleSearchClick}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 rounded-full px-4 py-2.5 transition-colors"
            >
              <place.icon className="w-4 h-4" />
              <span className="font-medium text-sm">{place.name}</span>
            </button>
          ))}
        </div>

        {/* Recent places */}
        {(expanded || true) && (
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Récents
            </h3>
            {recentPlaces.map((place) => (
              <button
                key={place.id}
                onClick={handleSearchClick}
                className="w-full flex items-center gap-3 p-3 hover:bg-secondary rounded-xl transition-colors text-left"
              >
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{place.shortAddress}</p>
                  <p className="text-sm text-muted-foreground truncate">{place.address}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Expand indicator */}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full flex items-center justify-center gap-1 text-muted-foreground text-sm mt-4"
          >
            <span>Voir plus</span>
            <ChevronUp className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default BottomSheet;
