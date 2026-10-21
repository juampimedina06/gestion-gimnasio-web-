import React from 'react';
import { Menu, Dumbbell } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-dark-surface/90 border-b border-dark-border sticky top-0 z-30 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between font-sans">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-dark-card cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 lg:hidden">
          <Dumbbell className="w-4 h-4 text-volt" />
          <span className="font-extrabold text-xs tracking-wider text-white">GYM OS</span>
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-white">
            {user?.nombre} {user?.apellido}
          </p>
          <p className="text-[11px] font-mono text-zinc-500">{user?.email}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-volt/10 border border-volt/30 flex items-center justify-center text-xs font-bold text-volt">
          {user?.nombre?.[0] || 'U'}
        </div>
      </div>
    </header>
  );
};
