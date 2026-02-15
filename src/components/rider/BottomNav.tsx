import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, Clock, Tag, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/caby', icon: Home, label: 'Home', end: true },
    { to: '/caby/services', icon: LayoutGrid, label: 'Services' },
    { to: '/caby/activity', icon: Clock, label: 'Activité' },
    { to: '/caby/offers', icon: Tag, label: 'Offres' },
    { to: '/caby/account', icon: User, label: 'Compte' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
