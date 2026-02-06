import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Clock, CreditCard, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/rider', icon: Home, label: 'Accueil', end: true },
    { to: '/rider/activity', icon: Clock, label: 'Activité' },
    { to: '/rider/payment', icon: CreditCard, label: 'Paiement' },
    { to: '/rider/account', icon: User, label: 'Compte' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border safe-area-bottom z-50">
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
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
