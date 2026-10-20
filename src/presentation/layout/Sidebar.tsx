import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
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
      label: 'Control de Acceso',
      to: '/ingreso',
      icon: ShieldCheck,
      adminOnly: false,
    },
    {
      label: 'Clientes y Cuotas',
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
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-dark-surface border-r border-dark-border flex flex-col justify-between transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Top brand */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-dark-card border border-dark-border flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-champagne-gold" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-wide text-white block">GESTIÓN</span>
                <span className="text-[10px] uppercase font-semibold text-champagne-gold tracking-widest block -mt-1">
                  Gimnasio
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-card"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-1.5">
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
                        'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                        isActive
                          ? 'bg-champagne-gold/10 text-champagne-gold border border-champagne-gold/30'
                          : 'text-gray-400 hover:text-gray-100 hover:bg-dark-card'
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
              <div className="w-9 h-9 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-center font-bold text-xs text-champagne-gold">
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
                      'inline-block w-1.5 h-1.5 rounded-full',
                      isAdmin ? 'bg-champagne-gold' : 'bg-brand-500'
                    )}
                  />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                    {isAdmin ? 'Admin' : 'Personal Trainer'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
