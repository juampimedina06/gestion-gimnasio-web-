import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  UserPlus,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useClientes } from '../../hooks/useClientes';
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
    <div className="space-y-8 font-sans">
      {/* Header Minimalista */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-dark-border">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-volt animate-pulse" />
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-zinc-400">
              Operaciones en vivo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
            Panel de Control
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Gestión y seguimiento de socios activos, molinetes y cuotas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRenovarModalOpen(true)}
            className="text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Renovar Cuota
          </Button>

          <Button
            variant="volt"
            size="sm"
            onClick={() => setIsNuevoModalOpen(true)}
            className="text-xs"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Nuevo Socio
          </Button>
        </div>
      </div>

      {/* KPI Cards Principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Padrón Total */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-5 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Total Socios
            </span>
            <Users className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {stats.total}
          </div>
          <div className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            <span>Padrón registrado</span>
          </div>
        </div>

        {/* Cuotas al Día */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-5 relative overflow-hidden group hover:border-volt/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-volt">
              Al Día
            </span>
            <CheckCircle2 className="w-4 h-4 text-volt" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-volt tracking-tight">
            {stats.alDia}
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-volt" />
            <span>Acceso habilitado</span>
          </div>
        </div>

        {/* En Tolerancia */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
              Tolerancia
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-amber-300 tracking-tight">
            {stats.tolerancia}
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Próximos a vencer</span>
          </div>
        </div>

        {/* Cartera Activa */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-5 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Volumen Mensual
            </span>
            <TrendingUp className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            {formatCurrency(stats.ingresosTotales)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            <span>Facturación de planes</span>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas y Molinete */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/ingreso')}
          className="bg-dark-surface border border-dark-border hover:border-volt rounded-2xl p-6 cursor-pointer transition-all group relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-volt/10 text-volt border border-volt/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base uppercase tracking-wide">
            Control de Acceso
          </h3>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
            Punto de control interno para validar DNI de socios y monitorear el molinete.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-volt">
            <span>Abrir terminal</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => setIsNuevoModalOpen(true)}
          className="bg-dark-surface border border-dark-border hover:border-zinc-600 rounded-2xl p-6 cursor-pointer transition-all group relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white border border-zinc-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <UserPlus className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base uppercase tracking-wide">
            Registrar Socio
          </h3>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
            Alta inmediata de nuevo cliente con asignación de plan y registro de pago.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-zinc-300 group-hover:text-white">
            <span>Iniciar alta</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => setIsRenovarModalOpen(true)}
          className="bg-dark-surface border border-dark-border hover:border-zinc-600 rounded-2xl p-6 cursor-pointer transition-all group relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white border border-zinc-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base uppercase tracking-wide">
            Cobrar Cuota
          </h3>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
            Asentar nuevo pago mensual o pase libre para extender vencimiento.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-zinc-300 group-hover:text-white">
            <span>Registrar cobro</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Socios Recientes */}
      <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-dark-border">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Socios Registrados
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Últimos movimientos en el padrón</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/clientes')}
            className="text-xs hover:text-volt"
          >
            Ver padrón completo <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-zinc-500">Cargando socios...</div>
        ) : clientes.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            No hay clientes registrados en el sistema.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 border-b border-dark-border">
                <tr>
                  <th className="pb-3 font-medium">Socio</th>
                  <th className="pb-3 font-medium">DNI</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Vencimiento</th>
                  <th className="pb-3 font-medium text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/60">
                {clientes.slice(0, 6).map((c) => {
                  const status = getClientPaymentStatus(c.fechaVencimiento, c.plan?.toleranciaDias ?? 5);
                  return (
                    <tr key={c.id} className="hover:bg-dark-card/50 transition-colors">
                      <td className="py-3.5 font-medium text-white">{c.nombre}</td>
                      <td className="py-3.5 font-mono text-zinc-400">{c.dni}</td>
                      <td className="py-3.5 text-zinc-400">
                        {c.plan?.precio ? formatCurrency(c.plan.precio) : 'Plan Activo'}
                      </td>
                      <td className="py-3.5 font-mono text-zinc-400">
                        {formatDate(c.fechaVencimiento)}
                      </td>
                      <td className="py-3.5 text-right">
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
