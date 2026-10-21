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

  // Cálculo del turno actual (mañana / tarde / noche)
  const currentHour = new Date().getHours();
  const currentTurno =
    currentHour < 13 ? 'Turno Mañana (07:00 - 13:00)' : currentHour < 20 ? 'Turno Tarde (13:00 - 20:00)' : 'Turno Noche (20:00 - 23:00)';

  return (
    <div className="space-y-6 font-sans w-full">
      {/* Header Superior Dinámico con Distinción de Rol */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-dark-surface/60 border border-dark-border p-5 rounded-2xl backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
              <span>{isAdmin ? 'Panel de Administración' : 'Panel de Entrenador'}</span>
            </h1>

            {/* Badge de rol destacado */}
            {isAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-volt/10 border border-volt/30 text-volt text-xs font-bold font-mono tracking-wider shadow-[0_0_12px_rgba(204,255,0,0.15)]">
                <ShieldCheck className="w-3.5 h-3.5" />
                ADMIN // ACCESO TOTAL
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold font-mono tracking-wider shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                <Activity className="w-3.5 h-3.5" />
                TRAINER // SALA & SOCIOS
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400">
            {isAdmin
              ? 'Supervisión integral de socios, cobros de cuotas y rendimiento operativo.'
              : 'Control de alumnos en sala, estado de membresías y seguimiento de asistencia.'}
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedDniForRenewal(undefined);
              setIsRenovarModalOpen(true);
            }}
            className="text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Cobrar Cuota
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

      {/* Cinta de Métricas KPIs (Adaptada al Rol) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Total Socios */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div>
            <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider block">
              Total Socios
            </span>
            <span className="text-2xl font-black text-white font-mono mt-0.5 block">
              {stats.total}
            </span>
            <span className="text-[10px] text-zinc-500">Padrón registrado</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-dark-card border border-dark-border flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Al Día */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-volt/40 transition-colors">
          <div>
            <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider block">
              Al Día
            </span>
            <span className="text-2xl font-black text-volt font-mono mt-0.5 block">
              {stats.alDia}
            </span>
            <span className="text-[10px] text-volt/70 font-mono">{stats.tasaAlDia}% del total</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-volt/10 border border-volt/20 flex items-center justify-center text-volt">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: En Tolerancia */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div>
            <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider block">
              En Tolerancia
            </span>
            <span className="text-2xl font-black text-amber-400 font-mono mt-0.5 block">
              {stats.tolerancia}
            </span>
            <span className="text-[10px] text-amber-400/80">Vence en &le; 5 días</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Adaptado al rol (Cartera para Admin // Aptos Sala para Trainer) */}
        {isAdmin ? (
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div>
              <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider block">
                Cartera Mensual
              </span>
              <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block truncate">
                {formatCurrency(stats.ingresosTotales)}
              </span>
              <span className="text-[10px] text-zinc-500">Facturación estimada</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        ) : (
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
            <div>
              <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider block">
                Habilitados Sala
              </span>
              <span className="text-2xl font-black text-cyan-400 font-mono mt-0.5 block">
                {stats.alDia + stats.tolerancia}
              </span>
              <span className="text-[10px] text-cyan-400/80">Socios autorizados</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Dumbbell className="w-5 h-5" />
            </div>
          </div>
        )}
      </div>

      {/* Layout Principal Estirado: Tabla Operativa + Telemetría y Widgets */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda / Central: Tabla de Socios (8 columnas en XL, 9 en 2XL) */}
        <div className="xl:col-span-8 2xl:col-span-9 bg-dark-surface border border-dark-border rounded-2xl overflow-hidden shadow-xl">
          {/* Controles Dinámicos */}
          <div className="p-4 border-b border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-card/30">
            {/* Buscador Rápido */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por DNI o nombre del socio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-card border border-dark-border rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-volt/80 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtros Rápidos por Estado */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
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

          {/* Tabla Limpia y Rápida */}
          {isLoading ? (
            <div className="py-20 text-center text-xs text-zinc-500 font-mono">
              Cargando socios en tiempo real...
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="py-20 text-center text-xs text-zinc-500">
              {searchQuery
                ? `No se encontraron resultados para "${searchQuery}"`
                : 'No hay socios registrados en este estado.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 bg-dark-card/50 border-b border-dark-border">
                  <tr>
                    <th className="py-3 px-4 font-medium">Socio</th>
                    <th className="py-3 px-4 font-medium">DNI</th>
                    <th className="py-3 px-4 font-medium">Plan</th>
                    <th className="py-3 px-4 font-medium">Vencimiento</th>
                    <th className="py-3 px-4 font-medium">Estado</th>
                    <th className="py-3 px-4 font-medium text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/50 text-zinc-300">
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
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {c.nombre}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-zinc-400">
                          {c.dni}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400">
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
                        <td className="py-3.5 px-4 font-mono text-zinc-400">
                          {formatDate(c.fechaVencimiento)}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isVencidoOrTolerancia ? (
                            <button
                              type="button"
                              onClick={() => handleQuickRenew(c.dni)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-volt text-black font-bold text-[11px] hover:bg-volt-hover transition-all cursor-pointer shadow-sm"
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
            </div>
          )}
        </div>

        {/* Columna Derecha: Telemetría y Widgets Personalizados del Gimnasio (4 cols en XL) */}
        <div className="xl:col-span-4 2xl:col-span-3 space-y-5">
          {/* Widget 1: Monitor de Sala y Kiosk */}
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-4.5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-volt" />
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  Estado de la Sala
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                EN VIVO
              </div>
            </div>

            {/* Turno actual */}
            <div className="p-3 rounded-xl bg-dark-card border border-dark-border space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-mono">
                <Clock className="w-3.5 h-3.5 text-volt" />
                <span>Turno Activo</span>
              </div>
              <p className="text-xs font-semibold text-white">{currentTurno}</p>
            </div>

            {/* Ocupación estimada */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Capacidad Estimada</span>
                <span className="text-volt font-mono font-bold">42% (Óptimo)</span>
              </div>
              <div className="w-full bg-dark-card h-2 rounded-full overflow-hidden border border-dark-border">
                <div
                  className="bg-volt h-full rounded-full transition-all duration-500"
                  style={{ width: '42%' }}
                />
              </div>
            </div>

            {/* Acceso directo a Tótem Kiosk */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-dark-card hover:bg-zinc-800 text-zinc-300 hover:text-white border border-dark-border text-xs font-semibold transition-all group"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-volt group-hover:scale-110 transition-transform" />
                <span>Lanzar Pantalla Tótem Kiosk</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Molinete</span>
            </a>
          </div>

          {/* Widget 2: Distribución de Membresías */}
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-4.5 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 pb-3 border-b border-dark-border">
              <Dumbbell className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-xs uppercase tracking-wider text-white">
                Distribución de Membresías
              </span>
            </div>

            {/* Pase Libre */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-medium">Pase Libre</span>
                <span className="text-volt font-mono font-semibold">
                  {stats.paseLibreCount} ({stats.pctLibre}%)
                </span>
              </div>
              <div className="w-full bg-dark-card h-2 rounded-full overflow-hidden border border-dark-border">
                <div
                  className="bg-volt h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.pctLibre}%` }}
                />
              </div>
            </div>

            {/* Pase 3 Días */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-medium">Pase 3 Días</span>
                <span className="text-cyan-400 font-mono font-semibold">
                  {stats.paseTresDiasCount} ({stats.pctTresDias}% )
                </span>
              </div>
              <div className="w-full bg-dark-card h-2 rounded-full overflow-hidden border border-dark-border">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.pctTresDias}%` }}
                />
              </div>
            </div>

            {/* Cumplimiento de Cuotas */}
            <div className="p-3 rounded-xl bg-dark-card/60 border border-dark-border flex items-center justify-between">
              <div>
                <p className="text-[11px] text-zinc-400">Tasa al Día</p>
                <p className="text-sm font-bold text-white font-mono">{stats.tasaAlDia}%</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-zinc-400">Morosos / Vencidos</p>
                <p className="text-sm font-bold text-rose-400 font-mono">{stats.vencidos}</p>
              </div>
            </div>
          </div>

          {/* Widget 3: Acceso Directo por Rol */}
          {isAdmin ? (
            <div className="bg-dark-surface border border-dark-border rounded-2xl p-4.5 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 pb-2 border-b border-dark-border">
                <ShieldCheck className="w-4 h-4 text-volt" />
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  Equipo de Entrenadores
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Supervisa los accesos del personal y asignación de turnos.
              </p>
              <Link
                to="/trainers"
                className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-volt/10 hover:bg-volt/20 text-volt border border-volt/30 text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  <span>Gestionar Personal Trainers</span>
                </div>
                <span>&rarr;</span>
              </Link>
            </div>
          ) : (
            <div className="bg-dark-surface border border-dark-border rounded-2xl p-4.5 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 pb-2 border-b border-dark-border">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  Atención en Sala
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Los socios con estado en tolerancia tienen acceso permitido pero deben regularizar su cuota en recepción.
              </p>
              <Link
                to="/clientes"
                className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all"
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
