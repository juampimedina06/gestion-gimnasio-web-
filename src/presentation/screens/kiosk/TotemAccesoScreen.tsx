import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Calendar,
  Clock,
  Delete,
  CornerDownLeft,
  Sparkles,
  Dumbbell,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { clientesApi } from '../../../core/clientes/clientes.api';
import { ResultadoIngresoDTO } from '../../../core/clientes/models/cliente.types';
import { cn } from '../../utils/cn';

const AUTO_RESET_SECONDS = 5;

export const TotemAccesoScreen: React.FC = () => {
  const [dniInput, setDniInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResultadoIngresoDTO | null>(null);
  const [countdown, setCountdown] = useState<number>(AUTO_RESET_SECONDS);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reloj digital en vivo
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('es-AR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
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

  // Temporizador de auto-reseteo silencioso
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

  // Foco automático inicial y permanente
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Atajo de teclado: Espacio, Enter o Escape resetean inmediatamente si hay resultado en pantalla
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (result) {
        if (e.code === 'Space' || e.code === 'Escape' || (e.code === 'Enter' && !dniInput)) {
          e.preventDefault();
          handleClear();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [result, dniInput, handleClear]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const dniNumber = parseInt(dniInput.trim(), 10);
    if (!dniNumber || isNaN(dniNumber)) return;

    setIsLoading(true);
    try {
      const res = await clientesApi.registrarIngreso({ dni: dniNumber });
      setResult(res);
      setDniInput(''); // Limpiamos el input para que el siguiente pueda escribir directo
    } catch (err: unknown) {
      setResult({
        permitido: false,
        mensaje: err instanceof Error ? err.message : 'Error al verificar ingreso.',
      });
      setDniInput('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Si hay un resultado previo, escribir un nuevo DNI limpia el resultado al instante
    if (result) {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setResult(null);
    }
    setDniInput(e.target.value.replace(/\D/g, ''));
  };

  const handleKeypadPress = (val: string) => {
    // Si hay un resultado previo en pantalla, presionar un número cambia la pantalla de una vez
    if (result) {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setResult(null);

      if (val === 'clear' || val === 'backspace') {
        setDniInput('');
      } else {
        setDniInput(val); // El primer dígito del nuevo socio entra directamente
      }
      inputRef.current?.focus();
      return;
    }

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
    <div className="min-h-screen w-full bg-[#08090C] text-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 font-sans selection:bg-volt selection:text-black relative overflow-hidden">
      {/* Resplandor ambiental de fondo */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-volt/5 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 bg-volt/5 rounded-full blur-3xl" />

      {/* Header Superior Completo */}
      <header className="w-full flex items-center justify-between pb-6 border-b border-zinc-800/80 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-volt/10 border border-volt/30 flex items-center justify-center text-volt shadow-lg shadow-volt/10">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                Control de Ingreso
              </span>
              <span className="w-2 h-2 rounded-full bg-volt animate-ping" />
            </div>
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 capitalize">
              {currentDate || 'Terminal de Acceso'}
            </p>
          </div>
        </div>

        {/* Reloj Digital Gigante */}
        <div className="text-right">
          <div className="text-2xl sm:text-4xl font-mono font-black text-volt tracking-wider">
            {currentTime || '--:--:--'}
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-volt" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500">
              Molinete Online
            </span>
          </div>
        </div>
      </header>

      {/* Contenido Principal a Pantalla Completa (2 Columnas en Pantalla Ancha) */}
      <main className="flex-1 w-full my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Columna Izquierda: Feedback de Estado o Mensaje de Bienvenida */}
        <div className="lg:col-span-6 flex flex-col justify-center h-full">
          {result ? (
            /* Tarjeta de Resultado de Acceso (Sin botones molestos, cambia al tipear o con espacio/enter) */
            <div
              className={cn(
                'rounded-3xl p-8 sm:p-10 border-2 shadow-2xl transition-all duration-300 relative overflow-hidden backdrop-blur-xl',
                result.permitido
                  ? isTolerancia
                    ? 'bg-amber-950/40 border-amber-500 text-amber-100 shadow-amber-950/40'
                    : 'bg-emerald-950/40 border-emerald-400 text-emerald-100 shadow-emerald-950/40'
                  : 'bg-rose-950/40 border-rose-500 text-rose-100 shadow-rose-950/40'
              )}
            >
              {/* Barra de progreso de auto-reseteo discreta */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/60">
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

              <div className="space-y-6 pt-2">
                {/* Icono y Badge de Estado */}
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl',
                      result.permitido
                        ? isTolerancia
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    )}
                  >
                    {result.permitido ? (
                      isTolerancia ? (
                        <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12" />
                      ) : (
                        <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
                      )
                    ) : (
                      <XCircle className="w-10 h-10 sm:w-12 sm:h-12" />
                    )}
                  </div>

                  <div>
                    <span
                      className={cn(
                        'inline-block text-xs sm:text-sm font-mono uppercase tracking-widest px-3 py-1 rounded-full border font-bold',
                        result.permitido
                          ? isTolerancia
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      )}
                    >
                      {result.permitido
                        ? isTolerancia
                          ? 'Acceso Permitido (Tolerancia)'
                          : 'Paso Habilitado'
                        : 'Acceso Denegado'}
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-2">
                      {result.nombreCliente || (result.permitido ? 'Bienvenido' : 'Atención')}
                    </h2>
                  </div>
                </div>

                {/* Motivo o Mensaje del Sistema */}
                <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
                  <p className="text-base sm:text-lg font-medium opacity-95 leading-relaxed">
                    {result.mensaje}
                  </p>
                </div>

                {/* Fechas de Vencimiento */}
                {(result.fechaVencimiento || result.fechaLimitePago) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm pt-2">
                    {result.fechaVencimiento && (
                      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5">
                        <Calendar className="w-5 h-5 text-volt flex-shrink-0" />
                        <div>
                          <span className="text-zinc-400 block text-xs">Vencimiento</span>
                          <strong className="text-white font-mono text-base">
                            {new Date(result.fechaVencimiento).toLocaleDateString()}
                          </strong>
                        </div>
                      </div>
                    )}
                    {result.fechaLimitePago && (
                      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5">
                        <Clock className="w-5 h-5 text-volt flex-shrink-0" />
                        <div>
                          <span className="text-zinc-400 block text-xs">Límite de pago</span>
                          <strong className="text-white font-mono text-base">
                            {new Date(result.fechaLimitePago).toLocaleDateString()}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Estado en Reposo (Informativo y Limpio) */
            <div className="space-y-6 max-w-lg">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-volt/10 border border-volt/30 text-volt text-xs font-mono font-bold tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Molinete Automático
              </div>

              <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-none">
                Ingresá <br />
                <span className="text-volt">tu DNI</span>
              </h2>

              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                Digitá tu número de documento en el teclado o escanealo para habilitar tu pase y registrar la asistencia.
              </p>

              <div className="pt-4 flex items-center gap-4 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Cuota al día</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>En tolerancia</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna Derecha: Entrada Numérica y Teclado Táctil */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div className="w-full max-w-md bg-[#111217] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {/* Formulario y Visor Principal de DNI */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-zinc-400 px-1">
                <span>Documento</span>
                <span>{dniInput.length} / 8 dígitos</span>
              </div>

              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  placeholder="••••••••"
                  value={dniInput}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  maxLength={10}
                  className="w-full bg-[#181920] border-2 border-zinc-700 focus:border-volt rounded-2xl py-4 px-4 text-3xl sm:text-4xl font-mono font-black tracking-[0.2em] text-center text-white placeholder:text-zinc-700 focus:outline-none focus:ring-4 focus:ring-volt/15 transition-all shadow-inner"
                />
              </div>

              {/* Botón de Confirmación Principal */}
              <button
                type="submit"
                disabled={!dniInput || isLoading}
                className={cn(
                  'w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer active:scale-[0.98]',
                  !dniInput || isLoading
                    ? 'bg-zinc-800/80 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                    : 'bg-volt hover:bg-[#b8e600] text-black shadow-volt/20'
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Validando estado...</span>
                  </div>
                ) : (
                  <>
                    <CornerDownLeft className="w-5 h-5 stroke-[2.5]" />
                    <span>Habilitar Ingreso</span>
                  </>
                )}
              </button>
            </form>

            {/* Teclado Táctil de Botones Grandes para Tablet */}
            <div className="mt-6 pt-6 border-t border-zinc-800/80">
              <div className="grid grid-cols-3 gap-3">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    disabled={isLoading}
                    className="h-14 sm:h-16 rounded-2xl bg-[#181920] border border-zinc-800 hover:border-zinc-600 text-2xl sm:text-3xl font-mono font-bold text-zinc-100 hover:text-white hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    {digit}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handleKeypadPress('clear')}
                  disabled={isLoading}
                  className="h-14 sm:h-16 rounded-2xl bg-[#181920] border border-zinc-800 hover:border-rose-800 text-xs font-mono font-bold text-rose-400 hover:bg-rose-950/20 transition-all active:scale-95 flex items-center justify-center cursor-pointer uppercase tracking-wider"
                >
                  Limpiar
                </button>

                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  disabled={isLoading}
                  className="h-14 sm:h-16 rounded-2xl bg-[#181920] border border-zinc-800 hover:border-zinc-600 text-2xl sm:text-3xl font-mono font-bold text-zinc-100 hover:text-white hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-sm"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={() => handleKeypadPress('backspace')}
                  disabled={isLoading}
                  className="h-14 sm:h-16 rounded-2xl bg-[#181920] border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                  aria-label="Borrar dígito"
                >
                  <Delete className="w-6 h-6 stroke-[1.8]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Fijo Minimalista */}
      <footer className="w-full flex items-center justify-between pt-4 border-t border-zinc-800/80 text-xs font-mono text-zinc-600 relative z-10">
        <span>GYM OS • Terminal de Acceso Permanente</span>
        <span>Molinete #01</span>
      </footer>
    </div>
  );
};
