import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Dumbbell,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { TipoRol } from '../../core/shared/enums';
import { cn } from '../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();
  const isAdmin = user?.idRol === TipoRol.Admin;

  const navItems = [
    {
      label: 'Panel Principal',
      to: '/dashboard',
      icon: LayoutDashboard,
      adminOnly: false,
    },
    {
      label: 'Socios y Cuotas',
      to: '/clientes',
      icon: Users,
      adminOnly: false,
    },
    {
      label: 'Personal Trainers',
      to: '/trainers',
      icon: UserCheck,
      adminOnly: true,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-dark-surface border-r border-dark-border flex flex-col justify-between transition-transform duration-200 ease-in-out font-sans',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Top brand */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-dark-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center text-volt">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <span className="font-extrabold text-sm tracking-wider text-white block">
                  GYM OS
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 block">
                  Control & Acceso
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-dark-card cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="p-3.5 space-y-1">
            {navItems
              .filter((item) => !item.adminOnly || isAdmin)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => onClose()}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all',
                        isActive
                          ? 'bg-volt/10 text-volt border border-volt/20'
                          : 'text-zinc-400 hover:text-white hover:bg-dark-card'
                      )
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
          </nav>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-dark-border bg-dark-surface">
          <div className="p-3 rounded-xl bg-dark-card border border-dark-border mb-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border',
                  isAdmin
                    ? 'bg-volt/10 border-volt/30 text-volt shadow-[0_0_8px_rgba(204,255,0,0.1)]'
                    : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.1)]'
                )}
              >
                {user?.nombre?.[0]}
                {user?.apellido?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.nombre} {user?.apellido}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      'inline-block w-2 h-2 rounded-full',
                      isAdmin ? 'bg-volt' : 'bg-cyan-400'
                    )}
                  />
                  <span
                    className={cn(
                      'text-[10px] uppercase font-mono font-bold tracking-wider',
                      isAdmin ? 'text-volt' : 'text-cyan-400'
                    )}
                  >
                    {isAdmin ? 'Administrador' : 'Personal Trainer'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-colors cursor-pointer border border-transparent hover:border-rose-900/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
