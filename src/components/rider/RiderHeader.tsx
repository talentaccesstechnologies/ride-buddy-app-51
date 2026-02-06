import React from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RiderHeaderProps {
  transparent?: boolean;
  title?: string;
  showBack?: boolean;
  notificationCount?: number;
}

const RiderHeader: React.FC<RiderHeaderProps> = ({
  transparent = false,
  title,
  showBack = false,
  notificationCount = 0,
}) => {
  const navigate = useNavigate();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 safe-area-top ${
        transparent
          ? 'bg-transparent'
          : 'bg-background border-b border-border'
      }`}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        ) : (
          <div className="w-10" />
        )}

        {title && (
          <h1 className="text-lg font-semibold">{title}</h1>
        )}

        <button
          onClick={() => navigate('/rider/notifications')}
          className="relative w-10 h-10 flex items-center justify-center"
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default RiderHeader;
