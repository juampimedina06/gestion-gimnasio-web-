import React, { useMemo, useState } from 'react';
import {
  Search,
  UserPlus,
  RotateCcw,
  CreditCard,
  X,
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
  const { data: clientes = [], isLoading, refetch } = useClientes();

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

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      {/* Barra Superior Limpia: Título + Acciones Principales */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
            Gestión de Gimnasio
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Control de socios, cuotas y acceso en tiempo real
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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

      {/* Cinta de Métricas Compacta (Sin cajas gigantes) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-dark-surface border border-dark-border rounded-2xl p-4 text-xs">
        <div className="flex items-center justify-between sm:justify-start sm:gap-3 px-2">
          <span className="text-zinc-500 font-mono uppercase text-[11px]">Total Socios</span>
          <span className="text-base font-bold text-white font-mono">{stats.total}</span>
        </div>

        <div className="flex items-center justify-between sm:justify-start sm:gap-3 px-2 sm:border-l border-dark-border">
          <span className="text-zinc-500 font-mono uppercase text-[11px]">Al Día</span>
          <span className="text-base font-bold text-volt font-mono">{stats.alDia}</span>
        </div>

        <div className="flex items-center justify-between sm:justify-start sm:gap-3 px-2 sm:border-l border-dark-border">
          <span className="text-zinc-500 font-mono uppercase text-[11px]">En Tolerancia</span>
          <span className="text-base font-bold text-amber-400 font-mono">{stats.tolerancia}</span>
        </div>

        <div className="flex items-center justify-between sm:justify-start sm:gap-3 px-2 sm:border-l border-dark-border">
          <span className="text-zinc-500 font-mono uppercase text-[11px]">Cartera</span>
          <span className="text-base font-bold text-zinc-100 font-mono">
            {formatCurrency(stats.ingresosTotales)}
          </span>
        </div>
      </div>

      {/* Panel Principal Dinámico: Buscador + Filtros Rápidos + Lista */}
      <div className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden shadow-xl">
        {/* Controles Dinámicos */}
        <div className="p-4 border-b border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Buscador Rápido con Auto-focus */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por DNI o nombre..."
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
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
          <div className="py-16 text-center text-xs text-zinc-500 font-mono">
            Cargando socios...
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="py-16 text-center text-xs text-zinc-500">
            {searchQuery
              ? `No se encontraron resultados para "${searchQuery}"`
              : 'No hay socios registrados en este estado.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 bg-dark-card/40 border-b border-dark-border">
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
                        {c.plan?.precio ? formatCurrency(c.plan.precio) : 'Plan'}
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

      {/* Modals Operativos */}
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
