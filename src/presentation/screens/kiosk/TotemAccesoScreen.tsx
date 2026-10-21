import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldX,
  Calendar,
  AlertTriangle,
  Clock,
  Delete,
  CornerDownLeft,
  RotateCcw,
  Sparkles,
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

  // Live clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
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

  // Auto-reset when result appears
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

  // Focus input on initial mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanDni = dniInput.trim();
    const dniNumber = parseInt(cleanDni, 10);
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
    if (result) {
      handleClear();
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
    <div className="min-h-screen bg-obsidian text-gray-100 flex flex-col justify-between selection:bg-champagne-gold selection:text-black">
      {/* Top Bar with Gym Branding & Clock */}
      <header className="px-6 py-5 border-b border-dark-border/60 backdrop-blur-md bg-dark-bg/60 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-champagne-gold/10 border border-champagne-gold/30 flex items-center justify-center text-champagne-gold shadow-lg shadow-champagne-gold/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Punto de Acceso
              </h1>
              <p className="text-xs text-gray-400 capitalize">{currentDate || 'Control de Ingreso'}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl sm:text-2xl font-mono font-bold text-champagne-gold tracking-wider">
              {currentTime || '--:--:--'}
            </div>
            <div className="text-[11px] text-gray-500 uppercase tracking-widest font-medium">
              Terminal de Ingreso
            </div>
          </div>
        </div>
      </header>

      {/* Main Interactive Screen */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl">
          {result ? (
            /* Result Feedback Screen */
            <div
              className={cn(
                'rounded-3xl p-8 border shadow-2xl transition-all duration-300 relative overflow-hidden backdrop-blur-xl',
                result.permitido
                  ? isTolerancia
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-100 shadow-amber-950/40'
                    : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100 shadow-emerald-950/40'
                  : 'bg-red-950/40 border-red-500/50 text-red-100 shadow-red-950/40'
              )}
            >
              {/* Progress bar countdown */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/10">
                <div
                  className={cn(
                    'h-full transition-all duration-1000 ease-linear',
                    result.permitido
                      ? isTolerancia
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                      : 'bg-red-400'
                  )}
                  style={{ width: `${(countdown / AUTO_RESET_SECONDS) * 100}%` }}
                />
              </div>

              <div className="flex flex-col items-center text-center space-y-5 pt-2">
                {/* Status Icon */}
                <div
                  className={cn(
                    'w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl transition-transform animate-bounce',
                    result.permitido
                      ? isTolerancia
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  )}
                >
                  {result.permitido ? (
                    isTolerancia ? (
                      <AlertTriangle className="w-14 h-14" />
                    ) : (
                      <ShieldCheck className="w-14 h-14" />
                    )
                  ) : (
                    <ShieldX className="w-14 h-14" />
                  )}
                </div>

                {/* Status Badge */}
                <div>
                  <span
                    className={cn(
                      'inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border',
                      result.permitido
                        ? isTolerancia
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                    )}
                  >
                    {result.permitido
                      ? isTolerancia
                        ? 'Ingreso Permitido (En Tolerancia)'
                        : '¡Bienvenido al Gimnasio!'
                      : 'Acceso No Autorizado'}
                  </span>
                </div>

                {/* Member Name */}
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {result.nombreCliente || (result.permitido ? 'Socio' : 'Atención')}
                </h2>

                {/* Message */}
                <p className="text-base sm:text-lg max-w-md opacity-90 leading-relaxed">
                  {result.mensaje}
                </p>

                {/* Expiration Details if present */}
                {(result.fechaVencimiento || result.fechaLimitePago) && (
                  <div className="w-full max-w-md bg-black/30 border border-white/10 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {result.fechaVencimiento && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 opacity-75 text-champagne-gold" />
                        <span>
                          Vencimiento:{' '}
                          <strong className="text-white">
                            {new Date(result.fechaVencimiento).toLocaleDateString()}
                          </strong>
                        </span>
                      </div>
                    )}
                    {result.fechaLimitePago && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-4 h-4 opacity-75 text-champagne-gold" />
                        <span>
                          Límite pago:{' '}
                          <strong className="text-white">
                            {new Date(result.fechaLimitePago).toLocaleDateString()}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Reset Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Siguiente persona ({countdown}s)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* DNI Input & Keypad Form */
            <div className="bg-dark-surface/90 border border-dark-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-champagne-gold/10 border border-champagne-gold/25 mb-3 text-champagne-gold">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Ingresá tu DNI
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Digitá tu documento para registrar tu asistencia
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="Ej: 40123456"
                    value={dniInput}
                    onChange={(e) => setDniInput(e.target.value.replace(/\D/g, ''))}
                    disabled={isLoading}
                    className="w-full bg-dark-card border-2 border-dark-border rounded-2xl px-4 py-4 text-3xl sm:text-4xl font-extrabold tracking-widest text-center text-white placeholder:text-gray-700 focus:outline-none focus:border-champagne-gold focus:ring-4 focus:ring-champagne-gold/20 transition-all shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!dniInput || isLoading}
                  className={cn(
                    'w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer',
                    !dniInput || isLoading
                      ? 'bg-zinc-800 text-gray-500 cursor-not-allowed border border-dark-border'
                      : 'bg-gradient-to-r from-amber-500 to-champagne-gold text-black hover:brightness-110 active:scale-[0.99] shadow-champagne-gold/20'
                  )}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Verificando estado...</span>
                    </div>
                  ) : (
                    <>
                      <CornerDownLeft className="w-5 h-5" />
                      <span>Habilitar Ingreso</span>
                    </>
                  )}
                </button>
              </form>

              {/* Touch Keypad */}
              <div className="mt-6 pt-6 border-t border-dark-border/80">
                <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleKeypadPress(digit)}
                      disabled={isLoading}
                      className="h-14 rounded-2xl bg-dark-card/90 border border-dark-border text-2xl font-bold text-gray-200 hover:text-white hover:bg-zinc-800 hover:border-gray-500 transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-sm"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('clear')}
                    disabled={isLoading}
                    className="h-14 rounded-2xl bg-dark-card/90 border border-dark-border text-sm font-bold text-red-400 hover:bg-red-950/30 hover:border-red-800 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                  >
                    BORRAR
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('0')}
                    disabled={isLoading}
                    className="h-14 rounded-2xl bg-dark-card/90 border border-dark-border text-2xl font-bold text-gray-200 hover:text-white hover:bg-zinc-800 hover:border-gray-500 transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('backspace')}
                    disabled={isLoading}
                    className="h-14 rounded-2xl bg-dark-card/90 border border-dark-border text-gray-400 hover:text-white hover:bg-zinc-800 hover:border-gray-500 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                    aria-label="Borrar último dígito"
                  >
                    <Delete className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Discreet footer without any link to login */}
      <footer className="py-4 text-center text-xs text-gray-600">
        <span>Sistema de Gestión y Control de Acceso</span>
      </footer>
    </div>
  );
};
