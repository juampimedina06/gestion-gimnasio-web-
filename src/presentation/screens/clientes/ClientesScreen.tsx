import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  CreditCard,
  RotateCcw,
} from 'lucide-react';
import { useClientes } from '../../hooks/useClientes';
import { ListaClientesDTO } from '../../../core/clientes/models/cliente.types';
import { PlanPase, PlanTipo } from '../../../core/shared/enums';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { NuevoClienteModal } from './NuevoClienteModal';
import { RenovarPagoModal } from '../pagos/RenovarPagoModal';
import {
  formatCurrency,
  formatDate,
  getClientPaymentStatus,
  ClientPaymentStatus,
} from '../../utils/formatters';

export const ClientesScreen: React.FC = () => {
  const { data: clientes = [], isLoading, isError, error, refetch, isFetching } = useClientes();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClientPaymentStatus>('all');
  const [isNuevoModalOpen, setIsNuevoModalOpen] = useState(false);
  const [isRenovarModalOpen, setIsRenovarModalOpen] = useState(false);
  const [selectedDniForRenewal, setSelectedDniForRenewal] = useState<number | undefined>(undefined);

  const filteredClientes = useMemo(() => {
    return clientes.filter((c) => {
      const matchSearch =
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.dni.toString().includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (statusFilter === 'all') return true;

      const { status } = getClientPaymentStatus(c.fechaVencimiento, c.plan?.toleranciaDias ?? 5);
      return status === statusFilter;
    });
  }, [clientes, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    let alDia = 0;
    let tolerancia = 0;
    let vencidos = 0;

    clientes.forEach((c) => {
      const { status } = getClientPaymentStatus(c.fechaVencimiento, c.plan?.toleranciaDias ?? 5);
      if (status === 'al_dia') alDia++;
      else if (status === 'tolerancia') tolerancia++;
      else if (status === 'vencido') vencidos++;
    });

    return { total: clientes.length, alDia, tolerancia, vencidos };
  }, [clientes]);

  const handleOpenRenewal = (dni?: number) => {
    setSelectedDniForRenewal(dni);
    setIsRenovarModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-champagne-gold" />
            Padrón de Socios y Cuotas
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gestión de clientes, historial de pagos y estados de suscripción
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>

          <Button
            variant="outline"
            onClick={() => handleOpenRenewal()}
            className="h-10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Renovar Cuota
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsNuevoModalOpen(true)}
            className="h-10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Socio
          </Button>
        </div>
      </div>

      {/* Quick Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-surface border border-dark-border rounded-xl p-4">
          <p className="text-xs uppercase font-semibold text-gray-400">Total Socios</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-dark-surface border border-emerald-900/30 rounded-xl p-4">
          <p className="text-xs uppercase font-semibold text-emerald-400">Al Día</p>
          <p className="text-2xl font-bold text-emerald-300 mt-1">{stats.alDia}</p>
        </div>
        <div className="bg-dark-surface border border-amber-900/30 rounded-xl p-4">
          <p className="text-xs uppercase font-semibold text-amber-400">En Tolerancia</p>
          <p className="text-2xl font-bold text-amber-300 mt-1">{stats.tolerancia}</p>
        </div>
        <div className="bg-dark-surface border border-red-900/30 rounded-xl p-4">
          <p className="text-xs uppercase font-semibold text-red-400">Vencidos</p>
          <p className="text-2xl font-bold text-red-300 mt-1">{stats.vencidos}</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por Nombre, DNI o Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-champagne-gold/50 focus:border-champagne-gold"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'al_dia', label: 'Al Día' },
            { id: 'tolerancia', label: 'En Tolerancia' },
            { id: 'vencido', label: 'Vencidos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as 'all' | ClientPaymentStatus)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-champagne-gold/20 text-champagne-gold border border-champagne-gold/40'
                  : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-champagne-gold" />
            <p className="text-sm">Cargando padrón de socios...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-400 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p className="text-sm font-semibold">Error al cargar la lista de socios</p>
            <p className="text-xs text-gray-500">
              {error instanceof Error ? error.message : 'Verificá que el backend esté en ejecución.'}
            </p>
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <Users className="w-12 h-12 mx-auto opacity-30" />
            <p className="text-base font-semibold text-gray-400">No se encontraron clientes</p>
            <p className="text-xs">
              {searchTerm || statusFilter !== 'all'
                ? 'Probá modificando los filtros de búsqueda.'
                : 'Registrá el primer cliente para comenzar.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-dark-card text-xs uppercase font-semibold text-gray-400 border-b border-dark-border">
                <tr>
                  <th className="px-6 py-4">Socio</th>
                  <th className="px-6 py-4">DNI</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Plan Actual</th>
                  <th className="px-6 py-4">Vencimiento</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredClientes.map((cliente: ListaClientesDTO) => {
                  const statusInfo = getClientPaymentStatus(
                    cliente.fechaVencimiento,
                    cliente.plan?.toleranciaDias ?? 5
                  );

                  return (
                    <tr
                      key={cliente.id}
                      className="hover:bg-dark-card/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-dark-card border border-dark-border flex items-center justify-center font-bold text-xs text-champagne-gold">
                            {cliente.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-white block">
                              {cliente.nombre}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              ID #{cliente.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-gray-300">
                        {cliente.dni}
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <Mail className="w-3.5 h-3.5 text-gray-500" />
                            <span>{cliente.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <Phone className="w-3.5 h-3.5 text-gray-500" />
                            <span>{cliente.telefono}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-xs">
                          <span className="font-medium text-white block">
                            {cliente.plan?.pase === PlanPase.Libre ? 'Pase Libre' : 'Pase 3 Días'}
                            {' - '}
                            {cliente.plan?.tipo === PlanTipo.Mensual ? 'Mensual' : 'Semanal'}
                          </span>
                          <span className="text-champagne-gold font-mono">
                            {formatCurrency(cliente.plan?.precio ?? 0)}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          <span className="font-medium text-gray-200">
                            {formatDate(cliente.fechaVencimiento)}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 block mt-0.5">
                          Pagó: {formatDate(cliente.fechaPago)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenRenewal(cliente.dni)}
                          className="text-xs"
                        >
                          <CreditCard className="w-3.5 h-3.5 mr-1" />
                          Renovar
                        </Button>
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
        initialDni={selectedDniForRenewal}
        onClose={() => setIsRenovarModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
