import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  UserCheck,
  UserPlus,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Shield,
  KeyRound,
} from 'lucide-react';
import { usuariosApi } from '../../../core/usuarios/usuarios.api';
import { UsuarioDTO } from '../../../core/usuarios/models/usuario.types';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';

const ptSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100),
  apellido: z.string().min(1, 'El apellido es obligatorio').max(100),
  email: z.string().min(1, 'El email es obligatorio').email('Formato de email inválido'),
  contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  activo: z.boolean(),
});

type PTFormData = z.infer<typeof ptSchema>;

interface PersonalTrainerItem {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
}

export const PersonalTrainersScreen: React.FC = () => {
  const [trainers, setTrainers] = useState<PersonalTrainerItem[]>([
    {
      id: 2,
      nombre: 'Juan',
      apellido: 'Medina',
      email: 'juan@gimnasio.com',
      activo: true,
    },
    {
      id: 3,
      nombre: 'María',
      apellido: 'García',
      email: 'maria@gimnasio.com',
      activo: true,
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PTFormData>({
    resolver: zodResolver(ptSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      contrasena: '',
      activo: true,
    },
  });

  const onSubmit = async (data: PTFormData) => {
    setIsLoading(true);
    setServerError(null);
    setSuccessMessage(null);

    const dto: UsuarioDTO = {
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      contrasena: data.contrasena,
      activo: data.activo,
    };

    try {
      const id = await usuariosApi.registrarUsuario(dto);
      setTrainers((prev) => [
        {
          id,
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          activo: data.activo,
        },
        ...prev,
      ]);
      setSuccessMessage(`Personal Trainer "${data.nombre} ${data.apellido}" registrado con éxito (ID #${id}).`);
      reset();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Error al registrar Personal Trainer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <UserCheck className="w-7 h-7 text-champagne-gold" />
          Administración de Personal Trainers
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Alta y gestión de entrenadores con permisos para registrar socios y cuotas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Registration Form (Left) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-champagne-gold" />
              Dar de Alta Personal Trainer
            </h2>

            {serverError && (
              <div className="mb-4 flex items-start gap-3 p-3.5 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 flex items-start gap-3 p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  placeholder="Ej: Marcos"
                  icon={<User className="w-4 h-4" />}
                  error={errors.nombre?.message}
                  {...register('nombre')}
                />
                <Input
                  label="Apellido"
                  placeholder="Ej: Rossi"
                  icon={<User className="w-4 h-4" />}
                  error={errors.apellido?.message}
                  {...register('apellido')}
                />
              </div>

              <Input
                label="Correo Electrónico"
                type="email"
                placeholder="marcos@gimnasio.com"
                icon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Contraseña de Acceso"
                type="password"
                placeholder="Mínimo 6 caracteres"
                icon={<Lock className="w-4 h-4" />}
                error={errors.contrasena?.message}
                {...register('contrasena')}
              />

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activo"
                  className="rounded bg-dark-card border-dark-border text-champagne-gold focus:ring-champagne-gold/50 cursor-pointer"
                  {...register('activo')}
                />
                <label htmlFor="activo" className="text-xs text-gray-300 cursor-pointer">
                  Habilitar cuenta inmediatamente
                </label>
              </div>

              <div className="pt-2">
                <Button type="submit" size="md" className="w-full" isLoading={isLoading}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Registrar Entrenador
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Trainers Directory & Seeding Reference (Right) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-champagne-gold" />
              Entrenadores Registrados
            </h2>

            <div className="space-y-3">
              {trainers.map((pt) => (
                <div
                  key={pt.email}
                  className="p-4 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-center font-bold text-sm text-champagne-gold">
                      {pt.nombre[0]}
                      {pt.apellido[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm truncate">
                        {pt.nombre} {pt.apellido}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{pt.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={pt.activo ? 'success' : 'danger'}>
                      {pt.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Note box */}
            <div className="mt-6 p-4 rounded-xl bg-champagne-gold/10 border border-champagne-gold/20 flex items-start gap-3 text-xs text-champagne-gold">
              <KeyRound className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Credenciales del Sistema</p>
                <p className="text-gray-300 mt-0.5">
                  Los Personal Trainers pueden iniciar sesión desde el login con su email y contraseña para registrar socios y validar ingresos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
