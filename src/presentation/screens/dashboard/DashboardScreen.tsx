import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  UserPlus,
  RotateCcw,
  CreditCard,
  X,
  Users,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Dumbbell,
  ShieldCheck,
  Activity,
  ExternalLink,
  Clock,
  UserCheck,
  Flame,
} from 'lucide-react';
import { useClientes } from '../../hooks/useClientes';
import { useAuthStore } from '../../store/useAuthStore';
import { TipoRol, PlanPase } from '../../../core/shared/enums';
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
  const { data: clientes = [], isLoading, refetch } = useClientes();
  const { user } = useAuthStore();
  const isAdmin = user?.idRol === TipoRol.Admin;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'al_dia' | 'tolerancia' | 'vencido'>('todos');
  const [isNuevoModalOpen, setIsNuevoModalOpen] = useState(false);
  const [isRenovarModalOpen, setIsRenovarModalOpen] = useState(false);
  const [selectedDniForRenewal, setSelectedDniForRenewal] = useState<number | undefined>(undefined);

  // Estadísticas consolidadas
  const stats = useMemo(() => {
    let alDia = 0;
    let tolerancia = 0;
    let vencidos = 0;
    let ingresosTotales = 0;
    let paseLibreCount = 0;
    let paseTresDiasCount = 0;

    clientes.forEach((c) => {
      const { status } = getClientPaymentStatus(c.fechaVencimiento, c.plan?.toleranciaDias ?? 5);
      if (status === 'al_dia') alDia++;
      else if (status === 'tolerancia') tolerancia++;
      else if (status === 'vencido') vencidos++;

      ingresosTotales += c.plan?.precio ?? 0;

      if (c.plan?.pase === PlanPase.Libre) paseLibreCount++;
      else if (c.plan?.pase === PlanPase.TresDias) paseTresDiasCount++;
    });

    const total = clientes.length;
    const tasaAlDia = total > 0 ? Math.round((alDia / total) * 100) : 0;
    const pctLibre = total > 0 ? Math.round((paseLibreCount / total) * 100) : 0;
    const pctTresDias = total > 0 ? Math.round((paseTresDiasCount / total) * 100) : 0;

    return {
      total,
      alDia,
      tolerancia,
      vencidos,
      ingresosTotales,
      paseLibreCount,
      paseTresDiasCount,
      tasaAlDia,
      pctLibre,
      pctTresDias,
    };
  }, [clientes]);

  // Filtrado reactivo en tiempo real
  const filteredClientes = useMemo(() => {
    return clientes.filter((c) => {
      const matchesSearch =
        searchQuery === '' ||
        c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.dni.toString().includes(searchQuery.trim());

      if (!matchesSearch) return false;

      if (statusFilter === 'todos') return true;
      const { status } = getClientPaymentStatus(c.fechaVencimiento, c.plan?.toleranciaDias ?? 5);
      return status === statusFilter;
    });
  }, [clientes, searchQuery, statusFilter]);

  const handleQuickRenew = (dni: number) => {
    setSelectedDniForRenewal(dni);
    setIsRenovarModalOpen(true);
  };

  // Cálculo del turno actual
  const currentHour = new Date().getHours();
  const currentTurno =
    currentHour < 13
      ? 'Turno Mañana (07:00 - 13:00)'
      : currentHour < 20
      ? 'Turno Tarde (13:00 - 20:00)'
      : 'Turno Noche (20:00 - 23:00)';

  return (
    <div className="h-full flex flex-col space-y-3 font-sans w-full min-h-0">
      {/* 1. Header Compacto (Sin desperdicio vertical) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-dark-surface/80 border border-dark-border px-4 py-2.5 rounded-2xl flex-shrink-0 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
            <span>{isAdmin ? 'Panel de Administración' : 'Panel de Entrenador'}</span>
          </h1>

          {/* Badge de Rol */}
          {isAdmin ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-volt/10 border border-volt/30 text-volt text-[11px] font-bold font-mono tracking-wider shadow-[0_0_8px_rgba(204,255,0,0.1)]">
              <ShieldCheck className="w-3.5 h-3.5" />
              ADMIN
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold font-mono tracking-wider shadow-[0_0_8px_rgba(6,182,212,0.1)]">
              <Activity className="w-3.5 h-3.5" />
              TRAINER
            </span>
          )}

          <span className="hidden md:inline text-xs text-zinc-500 font-mono">
            // GYM OS v1.0
          </span>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedDniForRenewal(undefined);
              setIsRenovarModalOpen(true);
            }}
            className="text-xs h-8 px-3"
          >
            <RotateCcw className="w-3 h-3 mr-1.5" />
            Cobrar Cuota
          </Button>

          <Button
            variant="volt"
            size="sm"
            onClick={() => setIsNuevoModalOpen(true)}
            className="text-xs h-8 px-3"
          >
            <UserPlus className="w-3 h-3 mr-1.5" />
            Nuevo Socio
          </Button>
        </div>
      </div>

      {/* 2. Cinta de KPIs Compacta (4 Indicadores Clave) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 flex-shrink-0">
        {/* KPI 1: Total Socios */}
        <div className="bg-dark-surface border border-dark-border rounded-xl px-3.5 py-2 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider block">
              Total Socios
            </span>
            <span className="text-xl font-black text-white font-mono leading-tight block">
              {stats.total}
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center text-zinc-400">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 2: Al Día */}
        <div className="bg-dark-surface border border-dark-border rounded-xl px-3.5 py-2 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider block">
              Al Día
            </span>
            <div className="flex items-baseline gap-1.5 leading-tight">
              <span className="text-xl font-black text-volt font-mono">{stats.alDia}</span>
              <span className="text-[10px] text-volt/80 font-mono">({stats.tasaAlDia}%)</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-volt/10 border border-volt/20 flex items-center justify-center text-volt">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 3: En Tolerancia */}
        <div className="bg-dark-surface border border-dark-border rounded-xl px-3.5 py-2 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider block">
              En Tolerancia
            </span>
            <span className="text-xl font-black text-amber-400 font-mono leading-tight block">
              {stats.tolerancia}
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 4: Adaptado al Rol */}
        {isAdmin ? (
          <div className="bg-dark-surface border border-dark-border rounded-xl px-3.5 py-2 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider block">
                Cartera Mensual
              </span>
              <span className="text-lg font-black text-emerald-400 font-mono leading-tight block truncate">
                {formatCurrency(stats.ingresosTotales)}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        ) : (
          <div className="bg-dark-surface border border-dark-border rounded-xl px-3.5 py-2 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider block">
                Habilitados Sala
              </span>
              <span className="text-xl font-black text-cyan-400 font-mono leading-tight block">
                {stats.alDia + stats.tolerancia}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      {/* 3. Área de Trabajo Principal (Ocupa todo el alto restante SIN scrollear la ventana) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-stretch">
        {/* Columna Izquierda / Central: Tabla de Socios con Scroll Interno Exclusivo */}
        <div className="xl:col-span-8 2xl:col-span-9 bg-dark-surface border border-dark-border rounded-2xl flex flex-col min-h-0 shadow-xl overflow-hidden">
          {/* Barra de Filtros y Buscador */}
          <div className="p-3 border-b border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-dark-card/40 flex-shrink-0">
            {/* Buscador Rápido */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por DNI o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-card border border-dark-border rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-volt/80 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filtros de Estado */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              {(
                [
                  { id: 'todos', label: 'Todos' },
                  { id: 'al_dia', label: 'Al Día' },
                  { id: 'tolerancia', label: 'Tolerancia' },
                  { id: 'vencido', label: 'Vencidos' },
                ] as const
              ).map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === filter.id
                      ? 'bg-zinc-100 text-black font-semibold'
                      : 'bg-dark-card text-zinc-400 hover:text-white border border-dark-border'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contenedor de Tabla con Scroll Interno Suave */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="py-16 text-center text-xs text-zinc-500 font-mono">
                Cargando socios en tiempo real...
              </div>
            ) : filteredClientes.length === 0 ? (
              <div className="py-16 text-center text-xs text-zinc-500">
                {searchQuery
                  ? `No se encontraron resultados para "${searchQuery}"`
                  : 'No hay socios registrados en este estado.'}
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 bg-dark-surface sticky top-0 z-10 border-b border-dark-border shadow-sm">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">Socio</th>
                    <th className="py-2.5 px-4 font-medium">DNI</th>
                    <th className="py-2.5 px-4 font-medium">Plan</th>
                    <th className="py-2.5 px-4 font-medium">Vencimiento</th>
                    <th className="py-2.5 px-4 font-medium">Estado</th>
                    <th className="py-2.5 px-4 font-medium text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40 text-zinc-300">
                  {filteredClientes.map((c) => {
                    const status = getClientPaymentStatus(
                      c.fechaVencimiento,
                      c.plan?.toleranciaDias ?? 5
                    );
                    const isVencidoOrTolerancia =
                      status.status === 'vencido' || status.status === 'tolerancia';

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-dark-card/60 transition-colors group"
                      >
                        <td className="py-2.5 px-4 font-semibold text-white">
                          {c.nombre}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-zinc-400">
                          {c.dni}
                        </td>
                        <td className="py-2.5 px-4 text-zinc-400">
                          {c.plan?.pase === PlanPase.Libre ? (
                            <span className="inline-flex items-center gap-1 text-volt font-mono text-[11px]">
                              Pase Libre
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-cyan-400 font-mono text-[11px]">
                              Pase 3 Días
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-zinc-400">
                          {formatDate(c.fechaVencimiento)}
                        </td>
                        <td className="py-2.5 px-4">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {isVencidoOrTolerancia ? (
                            <button
                              type="button"
                              onClick={() => handleQuickRenew(c.dni)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-volt text-black font-bold text-[11px] hover:bg-volt-hover transition-all cursor-pointer shadow-sm"
                            >
                              <CreditCard className="w-3 h-3" />
                              Cobrar
                            </button>
                          ) : (
                            <span className="text-[11px] text-zinc-600 font-mono">
                              Al día
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Columna Derecha: Widgets Compactos de Telemetría (Encajan sin scroll de ventana) */}
        <div className="xl:col-span-4 2xl:col-span-3 flex flex-col justify-between gap-3 min-h-0">
          {/* Widget 1: Monitor de Sala y Kiosk */}
          <div className="bg-dark-surface border border-dark-border rounded-xl p-3.5 space-y-2.5 shadow-md flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-volt" />
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  Estado de Sala
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                EN VIVO
              </div>
            </div>

            {/* Turno Actual */}
            <div className="px-2.5 py-1.5 rounded-lg bg-dark-card border border-dark-border flex items-center justify-between text-xs">
              <span className="text-zinc-400 text-[11px] flex items-center gap-1.5 font-mono">
                <Clock className="w-3 h-3 text-volt" /> Turno
              </span>
              <span className="font-semibold text-white text-[11px]">{currentTurno}</span>
            </div>

            {/* Capacidad Estimada */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 text-[11px]">Capacidad Estimada</span>
                <span className="text-volt font-mono font-bold text-[11px]">42% (Óptimo)</span>
              </div>
              <div className="w-full bg-dark-card h-1.5 rounded-full overflow-hidden border border-dark-border">
                <div
                  className="bg-volt h-full rounded-full transition-all duration-500"
                  style={{ width: '42%' }}
                />
              </div>
            </div>

            {/* Acceso Kiosk */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-dark-card hover:bg-zinc-800 text-zinc-300 hover:text-white border border-dark-border text-xs font-semibold transition-all group"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-volt group-hover:scale-110 transition-transform" />
                <span>Lanzar Pantalla Kiosk</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Molinete</span>
            </a>
          </div>

          {/* Widget 2: Distribución de Membresías */}
          <div className="bg-dark-surface border border-dark-border rounded-xl p-3.5 space-y-2.5 shadow-md flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-2 pb-2 border-b border-dark-border">
              <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-xs uppercase tracking-wider text-white">
                Distribución de Membresías
              </span>
            </div>

            {/* Pase Libre */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 text-[11px]">Pase Libre</span>
                <span className="text-volt font-mono font-semibold text-[11px]">
                  {stats.paseLibreCount} ({stats.pctLibre}%)
                </span>
              </div>
              <div className="w-full bg-dark-card h-1.5 rounded-full overflow-hidden border border-dark-border">
                <div
                  className="bg-volt h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.pctLibre}%` }}
                />
              </div>
            </div>

            {/* Pase 3 Días */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 text-[11px]">Pase 3 Días</span>
                <span className="text-cyan-400 font-mono font-semibold text-[11px]">
                  {stats.paseTresDiasCount} ({stats.pctTresDias}%)
                </span>
              </div>
              <div className="w-full bg-dark-card h-1.5 rounded-full overflow-hidden border border-dark-border">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.pctTresDias}%` }}
                />
              </div>
            </div>

            {/* Cumplimiento de Cuotas */}
            <div className="px-2.5 py-1.5 rounded-lg bg-dark-card border border-dark-border flex items-center justify-between text-xs">
              <span className="text-zinc-400 text-[11px]">Tasa al Día: <strong className="text-white font-mono">{stats.tasaAlDia}%</strong></span>
              <span className="text-zinc-400 text-[11px]">Vencidos: <strong className="text-rose-400 font-mono">{stats.vencidos}</strong></span>
            </div>
          </div>

          {/* Widget 3: Acceso Directo por Rol */}
          {isAdmin ? (
            <div className="bg-dark-surface border border-dark-border rounded-xl p-3.5 space-y-2 shadow-md">
              <div className="flex items-center gap-2 pb-1.5 border-b border-dark-border">
                <ShieldCheck className="w-3.5 h-3.5 text-volt" />
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  Equipo de Entrenadores
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Supervisá los accesos del personal y asignación de turnos.
              </p>
              <Link
                to="/trainers"
                className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg bg-volt/10 hover:bg-volt/20 text-volt border border-volt/30 text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Gestionar Personal Trainers</span>
                </div>
                <span>&rarr;</span>
              </Link>
            </div>
          ) : (
            <div className="bg-dark-surface border border-dark-border rounded-xl p-3.5 space-y-2 shadow-md">
              <div className="flex items-center gap-2 pb-1.5 border-b border-dark-border">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  Atención en Sala
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Socios en tolerancia pueden ingresar pero deben regularizar cuota.
              </p>
              <Link
                to="/clientes"
                className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all"
              >
                <span>Ver Padrón Completo</span>
                <span>&rarr;</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Modales Operativos */}
      <NuevoClienteModal
        isOpen={isNuevoModalOpen}
        onClose={() => setIsNuevoModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <RenovarPagoModal
        isOpen={isRenovarModalOpen}
        onClose={() => {
          setIsRenovarModalOpen(false);
          setSelectedDniForRenewal(undefined);
        }}
        initialDni={selectedDniForRenewal}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
