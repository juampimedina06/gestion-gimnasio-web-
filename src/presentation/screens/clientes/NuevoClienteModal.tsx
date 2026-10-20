import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, User, Mail, Phone, CreditCard, Banknote, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MetodoPago } from '../../../core/shared/enums';
import { useRegistrarCliente } from '../../hooks/useClientes';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { cn } from '../../utils/cn';

const nuevoClienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  dni: z
    .number({ invalid_type_error: 'El DNI debe ser numérico' })
    .min(1000000, 'El DNI no es válido (mínimo 7 cifras)')
    .max(99999999, 'El DNI no es válido (máximo 8 cifras)'),
  telefono: z.string().min(1, 'El teléfono es obligatorio').max(20, 'Máximo 20 caracteres'),
  email: z.string().min(1, 'El email es obligatorio').email('Formato de correo inválido'),
  idPlan: z.number().min(1, 'Debe seleccionar un plan'),
  metodoPago: z.nativeEnum(MetodoPago),
});

type NuevoClienteFormData = z.infer<typeof nuevoClienteSchema>;

interface NuevoClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NuevoClienteModal: React.FC<NuevoClienteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const registrarMutation = useRegistrarCliente();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  const plans = [
    {
      id: 1,
      nombre: 'Pase Libre Mensual',
      descripcion: 'Acceso todos los días (Lunes a Domingo)',
      precio: 35000,
    },
    {
      id: 2,
      nombre: 'Pase 3 Días Mensual',
      descripcion: '3 días por semana a elección',
      precio: 25000,
    },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<NuevoClienteFormData>({
    resolver: zodResolver(nuevoClienteSchema),
    defaultValues: {
      nombre: '',
      dni: undefined,
      telefono: '',
      email: '',
      idPlan: 1,
      metodoPago: MetodoPago.Efectivo,
    },
  });

  const selectedPlan = watch('idPlan');
  const selectedMetodoPago = watch('metodoPago');

  const onSubmit = async (data: NuevoClienteFormData) => {
    setServerError(null);
    try {
      const idCliente = await registrarMutation.mutateAsync(data);
      setSuccessId(idCliente);
      setTimeout(() => {
        reset();
        setSuccessId(null);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('No se pudo registrar el socio. Verificá los datos.');
      }
    }
  };

  const handleClose = () => {
    reset();
    setServerError(null);
    setSuccessId(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar Nuevo Socio"
      description="Alta de socio con plan y pago inicial obligatorio"
      maxWidth="lg"
    >
      {successId ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-xl font-bold text-white">¡Socio Registrado Exitosamente!</h4>
          <p className="text-sm text-gray-400">
            Socio #{successId} dado de alta con su primer pago asentado.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre y Apellido"
              placeholder="Ej: Sofía López"
              icon={<User className="w-4 h-4" />}
              error={errors.nombre?.message}
              {...register('nombre')}
            />

            <Input
              label="DNI"
              type="number"
              placeholder="Ej: 38450123"
              error={errors.dni?.message}
              {...register('dni', { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Teléfono"
              placeholder="Ej: 1123456789"
              icon={<Phone className="w-4 h-4" />}
              error={errors.telefono?.message}
              {...register('telefono')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="sofia@ejemplo.com"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          {/* Select Plan */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Seleccionar Plan de Acceso
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setValue('idPlan', p.id, { shouldValidate: true })}
                  className={cn(
                    'p-3.5 rounded-xl border cursor-pointer transition-all',
                    selectedPlan === p.id
                      ? 'bg-champagne-gold/15 border-champagne-gold text-white shadow-md shadow-champagne-gold/10'
                      : 'bg-dark-card border-dark-border text-gray-400 hover:border-gray-600'
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm text-gray-100">{p.nombre}</span>
                    <span className="text-xs font-bold text-champagne-gold">
                      ${p.precio.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{p.descripcion}</p>
                </div>
              ))}
            </div>
            {errors.idPlan && (
              <p className="mt-1 text-xs text-red-400">{errors.idPlan.message}</p>
            )}
          </div>

          {/* Select Metodo de Pago */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Método de Pago del Primer Mes
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('metodoPago', MetodoPago.Efectivo)}
                className={cn(
                  'flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer',
                  selectedMetodoPago === MetodoPago.Efectivo
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                    : 'bg-dark-card border-dark-border text-gray-400 hover:border-gray-600'
                )}
              >
                <Banknote className="w-4 h-4" />
                Efectivo
              </button>
              <button
                type="button"
                onClick={() => setValue('metodoPago', MetodoPago.Transferencia)}
                className={cn(
                  'flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer',
                  selectedMetodoPago === MetodoPago.Transferencia
                    ? 'bg-blue-950/40 border-blue-500 text-blue-300'
                    : 'bg-dark-card border-dark-border text-gray-400 hover:border-gray-600'
                )}
              >
                <CreditCard className="w-4 h-4" />
                Transferencia
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-border">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={registrarMutation.isPending}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Confirmar Alta
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
