import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Clock, Wallet, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/caby', icon: Home, label: 'Home', end: true },
    { to: '/caby/activity', icon: Clock, label: 'Activité' },
    { to: '/caby/payment', icon: Wallet, label: 'Portefeuille' },
    { to: '/caby/account', icon: User, label: 'Profil' },
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
              `flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors ${
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
