import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Plus,
  ArrowRight,
  Server,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { useClientes } from '../../hooks/useClientes';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { NuevoClienteModal } from '../clientes/NuevoClienteModal';
import { RenovarPagoModal } from '../pagos/RenovarPagoModal';
import {
  formatCurrency,
  formatDate,
  getClientPaymentStatus,
} from '../../utils/formatters';

export const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: clientes = [], isLoading, refetch } = useClientes();

  const [isNuevoModalOpen, setIsNuevoModalOpen] = useState(false);
  const [isRenovarModalOpen, setIsRenovarModalOpen] = useState(false);

  const stats = useMemo(() => {
    let alDia = 0;
    let tolerancia = 0;
    let vencidos = 0;
    let ingresosTotales = 0;

    clientes.forEach((c) => {
      const { status } = getClientPaymentStatus(c.fechaVencimiento, c.plan?.toleranciaDias ?? 5);
      if (status === 'al_dia') alDia++;
      else if (status === 'tolerancia') tolerancia++;
      else if (status === 'vencido') vencidos++;

      ingresosTotales += c.plan?.precio ?? 0;
    });

    return {
      total: clientes.length,
      alDia,
      tolerancia,
      vencidos,
      ingresosTotales,
    };
  }, [clientes]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-surface via-dark-card to-dark-surface border border-dark-border p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne-gold/15 border border-champagne-gold/30 text-xs font-semibold text-champagne-gold mb-3">
            <Activity className="w-3.5 h-3.5" />
            Sistema de Gestión Activo
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ¡Hola, {user?.nombre}! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-300 mt-2">
            Panel de control general del gimnasio. Monitoreá el estado de cuotas de tus socios, gestioná ingresos por molinete y renová membresías en tiempo real.
          </p>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/ingreso')}
          className="group p-5 rounded-2xl bg-dark-surface border border-dark-border hover:border-champagne-gold/50 cursor-pointer transition-all shadow-lg hover:shadow-champagne-gold/5"
        >
          <div className="w-12 h-12 rounded-xl bg-champagne-gold/15 text-champagne-gold flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Control de Acceso</h3>
          <p className="text-xs text-gray-400 mt-1">
            Escanear o ingresar DNI para validar ingreso con cálculo de tolerancia.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-medium text-champagne-gold mt-4">
            <span>Abrir molinete</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => setIsNuevoModalOpen(true)}
          className="group p-5 rounded-2xl bg-dark-surface border border-dark-border hover:border-emerald-500/50 cursor-pointer transition-all shadow-lg hover:shadow-emerald-500/5"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Registrar Nuevo Socio</h3>
          <p className="text-xs text-gray-400 mt-1">
            Dar de alta un nuevo cliente con plan y cobro inicial obligatorio.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 mt-4">
            <span>Nuevo cliente</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => setIsRenovarModalOpen(true)}
          className="group p-5 rounded-2xl bg-dark-surface border border-dark-border hover:border-brand-500/50 cursor-pointer transition-all shadow-lg hover:shadow-brand-500/5"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-500/15 text-brand-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Renovar Cuota Vencida</h3>
          <p className="text-xs text-gray-400 mt-1">
            Asentar nuevo pago de cuota para un cliente con membresía vencida.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-medium text-brand-500 mt-4">
            <span>Renovar cuota</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-gray-400">Padrón Total</span>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">Clientes registrados</p>
        </div>

        <div className="bg-dark-surface border border-emerald-900/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-emerald-400">Cuotas al Día</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-300 mt-2">{stats.alDia}</p>
          <p className="text-xs text-gray-500 mt-1">Acceso sin restricciones</p>
        </div>

        <div className="bg-dark-surface border border-amber-900/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-amber-400">En Tolerancia</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-amber-300 mt-2">{stats.tolerancia}</p>
          <p className="text-xs text-gray-500 mt-1">Hasta 5 días para pagar</p>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-champagne-gold">Volumen Planes</span>
            <TrendingUp className="w-5 h-5 text-champagne-gold" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-2">
            {formatCurrency(stats.ingresosTotales)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Cartera activa valorizada</p>
        </div>
      </div>

      {/* Recent Clients Snapshot & Server Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent clients table (Left 8 cols) */}
        <div className="lg:col-span-8 bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Socios Recientes</h2>
              <p className="text-xs text-gray-400 mt-0.5">Últimos socios con cuota registrada</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/clientes')}
              className="text-xs text-champagne-gold hover:text-yellow-400"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          {isLoading ? (
            <p className="text-xs text-gray-500 py-6 text-center">Cargando datos...</p>
          ) : clientes.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">No hay clientes registrados aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="text-[11px] uppercase font-semibold text-gray-400 border-b border-dark-border">
                  <tr>
                    <th className="pb-3">Socio</th>
                    <th className="pb-3">DNI</th>
                    <th className="pb-3">Vencimiento</th>
                    <th className="pb-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {clientes.slice(0, 5).map((c) => {
                    const status = getClientPaymentStatus(c.fechaVencimiento, c.plan?.toleranciaDias ?? 5);
                    return (
                      <tr key={c.id} className="hover:bg-dark-card/40">
                        <td className="py-3 font-medium text-white">{c.nombre}</td>
                        <td className="py-3 font-mono text-gray-400">{c.dni}</td>
                        <td className="py-3">{formatDate(c.fechaVencimiento)}</td>
                        <td className="py-3 text-right">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Backend & Environment Status (Right 4 cols) */}
        <div className="lg:col-span-4 bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-champagne-gold" />
            Servicio Backend
          </h2>

          <div className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Endpoint API</span>
              <span className="font-mono text-champagne-gold">
                {import.meta.env.VITE_API_URL || 'http://localhost:5270'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Arquitectura</span>
              <span className="text-gray-200">Clean Architecture</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Framework</span>
              <span className="text-gray-200">React 18 + Vite + TS</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Estilos</span>
              <span className="text-gray-200">Tailwind CSS (Dark)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/30 flex items-center gap-2.5 text-xs text-emerald-300">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Todos los endpoints sincronizados y listos.</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NuevoClienteModal
        isOpen={isNuevoModalOpen}
        onClose={() => setIsNuevoModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <RenovarPagoModal
        isOpen={isRenovarModalOpen}
        onClose={() => setIsRenovarModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
