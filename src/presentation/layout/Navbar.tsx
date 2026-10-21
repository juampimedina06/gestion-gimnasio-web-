import React from 'react';
import { Menu, Dumbbell, ShieldCheck, Activity, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { TipoRol } from '../../core/shared/enums';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user } = useAuthStore();
  const isAdmin = user?.idRol === TipoRol.Admin;

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

        {/* Live operational badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-dark-card border border-dark-border text-[11px] font-mono text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-volt opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-volt" />
          </span>
          <span>SISTEMA ACTIVO</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Shortcut to launch public Kiosk / Totem in new tab */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-card hover:bg-zinc-800 text-zinc-300 hover:text-white border border-dark-border text-xs font-medium transition-colors"
          title="Abrir la pantalla de control de acceso para el molinete o recepción"
        >
          <ExternalLink className="w-3.5 h-3.5 text-volt" />
          <span>Abrir Tótem Kiosk</span>
        </a>

        {/* Role Distinction Badge */}
        {isAdmin ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-volt/10 border border-volt/30 text-volt text-[11px] font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(204,255,0,0.1)]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Administrador</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(6,182,212,0.1)]">
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Personal Trainer</span>
          </div>
        )}

        {/* User Info & Avatar */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block leading-tight">
            <p className="text-xs font-semibold text-white">
              {user?.nombre} {user?.apellido}
            </p>
            <p className="text-[10px] font-mono text-zinc-500">{user?.email}</p>
          </div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
              isAdmin
                ? 'bg-volt/15 border-volt/40 text-volt shadow-[0_0_10px_rgba(204,255,0,0.15)]'
                : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
            }`}
          >
            {user?.nombre?.[0] || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

