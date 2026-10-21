import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Lock, Mail, AlertCircle } from 'lucide-react';
import { authApi } from '../../../core/auth/auth.api';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

const loginSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Correo electrónico inválido'),
  contrasena: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      contrasena: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await authApi.login({
        email: data.email,
        contrasena: data.contrasena,
      });
      setUser(response);
      navigate('/dashboard', { replace: true });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Credenciales inválidas o error de conexión.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setTestAccount = (email: string, contrasena: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('contrasena', contrasena, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-gym-black flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-dark-surface border border-dark-border mb-3 text-volt shadow-lg shadow-black/60">
            <Dumbbell className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase">
            GYM OS
          </h1>
          <p className="text-xs text-zinc-400 mt-1 uppercase font-mono tracking-widest">
            Acceso Administrativo
          </p>
        </div>

        {/* Card */}
        <div className="bg-dark-surface border border-dark-border rounded-3xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {errorMessage && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="admin@gimnasio.com"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              error={errors.contrasena?.message}
              {...register('contrasena')}
            />

            <Button type="submit" variant="volt" className="w-full" size="lg" isLoading={isLoading}>
              Ingresar al Sistema
            </Button>
          </form>

          {/* Quick Test Accounts */}
          <div className="mt-8 pt-6 border-t border-dark-border">
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 text-center mb-3">
              Cuentas de prueba rápidas
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTestAccount('admin@gimnasio.com', 'admin123')}
                className="p-2.5 rounded-xl bg-dark-card border border-dark-border hover:border-volt/60 text-zinc-300 hover:text-white text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-volt">Admin</div>
                <div className="text-[10px] font-mono text-zinc-500 truncate">admin@gimnasio.com</div>
              </button>
              <button
                type="button"
                onClick={() => setTestAccount('juan@gimnasio.com', 'juan123')}
                className="p-2.5 rounded-xl bg-dark-card border border-dark-border hover:border-volt/60 text-zinc-300 hover:text-white text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-cyan-400">Trainer</div>
                <div className="text-[10px] font-mono text-zinc-500 truncate">juan@gimnasio.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
