import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Wallet, User } from 'lucide-react';

const navItems = [
  { to: '/tatfleet/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tatfleet/club', icon: Users, label: 'Club' },
  { to: '/tatfleet/earnings', icon: Wallet, label: 'Gains' },
  { to: '/tatfleet/profile', icon: User, label: 'Profil' },
];

const DriverBottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-caby-dark border-t border-caby-border safe-area-bottom z-40">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="relative flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors"
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-caby-gold rounded-full" />
              )}
              
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-caby-gold' : 'text-caby-muted'
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-caby-gold' : 'text-caby-muted'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default DriverBottomNav;
