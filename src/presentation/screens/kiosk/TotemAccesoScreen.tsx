import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Calendar,
  Clock,
  Delete,
  CornerDownLeft,
  RotateCcw,
} from 'lucide-react';
import { clientesApi } from '../../../core/clientes/clientes.api';
import { ResultadoIngresoDTO } from '../../../core/clientes/models/cliente.types';
import { Button } from '../../components/Button';
import { cn } from '../../utils/cn';

const AUTO_RESET_SECONDS = 5;

export const TotemAccesoScreen: React.FC = () => {
  const [dniInput, setDniInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResultadoIngresoDTO | null>(null);
  const [countdown, setCountdown] = useState<number>(AUTO_RESET_SECONDS);
  const [currentTime, setCurrentTime] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reloj en tiempo real
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClear = useCallback(() => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setResult(null);
    setDniInput('');
    setCountdown(AUTO_RESET_SECONDS);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, []);

  // Temporizador de reseteo automático
  useEffect(() => {
    if (!result) return;

    setCountdown(AUTO_RESET_SECONDS);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    resetTimerRef.current = setTimeout(() => {
      handleClear();
    }, AUTO_RESET_SECONDS * 1000);

    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [result, handleClear]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const dniNumber = parseInt(dniInput.trim(), 10);
    if (!dniNumber || isNaN(dniNumber)) return;

    setIsLoading(true);
    try {
      const res = await clientesApi.registrarIngreso({ dni: dniNumber });
      setResult(res);
    } catch (err: unknown) {
      setResult({
        permitido: false,
        mensaje: err instanceof Error ? err.message : 'Error al verificar ingreso.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (result) handleClear();

    if (val === 'backspace') {
      setDniInput((prev) => prev.slice(0, -1));
    } else if (val === 'clear') {
      setDniInput('');
    } else {
      if (dniInput.length < 10) {
        setDniInput((prev) => prev + val);
      }
    }
    inputRef.current?.focus();
  };

  const isTolerancia =
    result?.permitido &&
    (result.mensaje.toLowerCase().includes('tolerancia') ||
      result.mensaje.toLowerCase().includes('vencida'));

  return (
    <div className="min-h-screen bg-gym-black text-zinc-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-volt selection:text-black">
      {/* Header Limpio con Reloj */}
      <header className="max-w-xl w-full mx-auto flex items-center justify-between pb-6 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-volt/10 border border-volt/30 flex items-center justify-center text-volt">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white uppercase tracking-wide">
              Control de Acceso
            </h1>
            <p className="text-xs text-zinc-400">
              Validación de ingreso al gimnasio
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xl font-mono font-bold text-volt tracking-wider">
            {currentTime || '--:--:--'}
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
            Molinete Activo
          </span>
        </div>
      </header>

      {/* Área Central Interactiva */}
      <main className="flex-1 flex items-center justify-center my-6">
        <div className="w-full max-w-xl space-y-6">
          {/* Card de Entrada y Teclado */}
          <div className="bg-dark-surface border border-dark-border rounded-3xl p-6 sm:p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 text-center sm:text-left">
                Número de DNI del Socio
              </label>

              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 40123456"
                  value={dniInput}
                  onChange={(e) => setDniInput(e.target.value.replace(/\D/g, ''))}
                  disabled={isLoading}
                  className="flex-1 bg-dark-card border-2 border-dark-border rounded-2xl px-4 py-3.5 text-2xl sm:text-3xl font-extrabold tracking-widest text-white text-center focus:outline-none focus:border-volt focus:ring-4 focus:ring-volt/10 transition-all placeholder:text-zinc-700"
                />

                <Button
                  type="submit"
                  variant="volt"
                  size="lg"
                  isLoading={isLoading}
                  disabled={!dniInput}
                  className="px-6 rounded-2xl"
                >
                  <CornerDownLeft className="w-5 h-5 mr-1" />
                  Validar
                </Button>
              </div>
            </form>

            {/* Teclado Numérico Táctil */}
            <div className="mt-6 pt-6 border-t border-dark-border">
              <p className="text-[11px] uppercase font-mono tracking-widest text-zinc-500 text-center mb-3">
                Teclado Numérico
              </p>
              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    disabled={isLoading}
                    className="h-12 rounded-xl bg-dark-card border border-dark-border text-lg font-bold text-zinc-200 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('clear')}
                  disabled={isLoading}
                  className="h-12 rounded-xl bg-dark-card border border-dark-border text-xs font-bold text-rose-400 hover:bg-rose-950/30 transition-colors flex items-center justify-center cursor-pointer"
                >
                  C
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  disabled={isLoading}
                  className="h-12 rounded-xl bg-dark-card border border-dark-border text-lg font-bold text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('backspace')}
                  disabled={isLoading}
                  className="h-12 rounded-xl bg-dark-card border border-dark-border text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Borrar último dígito"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Resultado de Validación */}
          {result && (
            <div
              className={cn(
                'rounded-3xl p-6 border shadow-2xl transition-all duration-300 relative overflow-hidden',
                result.permitido
                  ? isTolerancia
                    ? 'bg-amber-950/30 border-amber-600/50 text-amber-200 shadow-amber-950/20'
                    : 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200 shadow-emerald-950/20'
                  : 'bg-rose-950/30 border-rose-600/50 text-rose-200 shadow-rose-950/20'
              )}
            >
              {/* Barra de reseteo automático */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-black/40">
                <div
                  className={cn(
                    'h-full transition-all duration-1000 ease-linear',
                    result.permitido
                      ? isTolerancia
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                      : 'bg-rose-500'
                  )}
                  style={{ width: `${(countdown / AUTO_RESET_SECONDS) * 100}%` }}
                />
              </div>

              <div className="flex items-start gap-4 pt-1">
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0',
                    result.permitido
                      ? isTolerancia
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  )}
                >
                  {result.permitido ? (
                    isTolerancia ? (
                      <AlertTriangle className="w-7 h-7" />
                    ) : (
                      <ShieldCheck className="w-7 h-7" />
                    )
                  ) : (
                    <ShieldX className="w-7 h-7" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border',
                        result.permitido
                          ? isTolerancia
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      )}
                    >
                      {result.permitido
                        ? isTolerancia
                          ? 'Acceso Permitido (En Tolerancia)'
                          : 'Acceso Permitido'
                        : 'Acceso Denegado'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mt-1.5 truncate">
                    {result.nombreCliente || (result.permitido ? 'Socio' : 'Atención')}
                  </h3>
                  <p className="text-sm opacity-90 mt-1 leading-relaxed">
                    {result.mensaje}
                  </p>

                  {/* Fechas de Vencimiento */}
                  {(result.fechaVencimiento || result.fechaLimitePago) && (
                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {result.fechaVencimiento && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 opacity-70" />
                          <span>
                            Vencimiento:{' '}
                            <strong className="text-white">
                              {new Date(result.fechaVencimiento).toLocaleDateString()}
                            </strong>
                          </span>
                        </div>
                      )}
                      {result.fechaLimitePago && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 opacity-70" />
                          <span>
                            Límite de pago:{' '}
                            <strong className="text-white">
                              {new Date(result.fechaLimitePago).toLocaleDateString()}
                            </strong>
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botón manual de reseteo */}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleClear}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Siguiente persona ({countdown}s)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Discreto */}
      <footer className="text-center py-2 text-[11px] font-mono text-zinc-600">
        Control de Acceso • Modo Kiosco
      </footer>
    </div>
  );
};
