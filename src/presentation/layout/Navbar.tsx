import React from 'react';
import { Menu, Dumbbell } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-dark-surface/80 border-b border-dark-border sticky top-0 z-30 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-card"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 lg:hidden">
          <Dumbbell className="w-5 h-5 text-champagne-gold" />
          <span className="font-bold text-sm tracking-wide text-white">GESTIÓN GIMNASIO</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium text-gray-200">
            {user?.nombre} {user?.apellido}
          </p>
          <p className="text-[11px] text-gray-400">{user?.email}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-champagne-gold/20 border border-champagne-gold/40 flex items-center justify-center text-xs font-bold text-champagne-gold">
          {user?.nombre?.[0] || 'U'}
        </div>
      </div>
    </header>
  );
};
