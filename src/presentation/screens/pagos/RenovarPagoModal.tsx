import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RotateCcw, CreditCard, Banknote, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MetodoPago } from '../../../core/shared/enums';
import { useActualizarPago } from '../../hooks/useClientes';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { cn } from '../../utils/cn';

const renovarPagoSchema = z.object({
  dni: z
    .number({ invalid_type_error: 'El DNI debe ser numérico' })
    .min(1000000, 'El DNI no es válido')
    .max(99999999, 'El DNI no es válido'),
  idPlan: z.number().min(1, 'Debe seleccionar un plan'),
  metodoPago: z.nativeEnum(MetodoPago),
});

type RenovarPagoFormData = z.infer<typeof renovarPagoSchema>;

interface RenovarPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDni?: number;
  onSuccess?: () => void;
}

export const RenovarPagoModal: React.FC<RenovarPagoModalProps> = ({
  isOpen,
  onClose,
  initialDni,
  onSuccess,
}) => {
  const renovarMutation = useActualizarPago();
  const [feedback, setFeedback] = useState<{
    exito: boolean;
    mensaje: string;
    nombreCliente?: string;
  } | null>(null);

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
  } = useForm<RenovarPagoFormData>({
    resolver: zodResolver(renovarPagoSchema),
    defaultValues: {
      dni: initialDni || undefined,
      idPlan: 1,
      metodoPago: MetodoPago.Efectivo,
    },
  });

  useEffect(() => {
    if (initialDni) {
      setValue('dni', initialDni);
    }
  }, [initialDni, setValue]);

  const selectedPlan = watch('idPlan');
  const selectedMetodoPago = watch('metodoPago');

  const onSubmit = async (data: RenovarPagoFormData) => {
    setFeedback(null);
    try {
      const res = await renovarMutation.mutateAsync(data);
      setFeedback({
        exito: res.exito,
        mensaje: res.mensaje,
        nombreCliente: res.nombreCliente,
      });

      if (res.exito) {
        setTimeout(() => {
          reset();
          setFeedback(null);
          onClose();
          if (onSuccess) onSuccess();
        }, 1500);
      }
    } catch (err: unknown) {
      setFeedback({
        exito: false,
        mensaje: err instanceof Error ? err.message : 'Error al procesar la renovación.',
      });
    }
  };

  const handleClose = () => {
    reset();
    setFeedback(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Renovar Cuota de Socio"
      description="Registra un nuevo pago para una cuota vencida"
      maxWidth="md"
    >
      {feedback?.exito ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-xl font-bold text-white">¡Cuota Renovada con Éxito!</h4>
          <p className="text-sm text-gray-300 font-medium">{feedback.nombreCliente}</p>
          <p className="text-xs text-gray-400">{feedback.mensaje}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {feedback && !feedback.exito && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{feedback.mensaje}</p>
                {feedback.nombreCliente && (
                  <p className="text-xs mt-0.5 text-red-200">Socio: {feedback.nombreCliente}</p>
                )}
              </div>
            </div>
          )}

          <Input
            label="DNI del Socio a Renovar"
            type="number"
            placeholder="Ej: 40123456"
            error={errors.dni?.message}
            {...register('dni', { valueAsNumber: true })}
          />

          {/* Select Plan */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Plan para el Nuevo Período
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {plans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setValue('idPlan', p.id, { shouldValidate: true })}
                  className={cn(
                    'p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between',
                    selectedPlan === p.id
                      ? 'bg-volt/10 border-volt text-white shadow-md shadow-volt/10'
                      : 'bg-dark-card border-dark-border text-zinc-400 hover:border-zinc-600'
                  )}
                >
                  <div>
                    <span className="font-semibold text-sm text-zinc-100 block">{p.nombre}</span>
                    <span className="text-[11px] text-zinc-400">{p.descripcion}</span>
                  </div>
                  <span className="text-sm font-bold text-volt font-mono">
                    ${p.precio.toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Metodo de Pago */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Método de Pago
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
              isLoading={renovarMutation.isPending}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Renovar Cuota
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
