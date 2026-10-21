import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Check,
  X,
  AlertCircle,
  Delete,
  ArrowRight,
  RotateCcw,
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

  const inputRef = useRef<HTMLInputElement>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reloj en tiempo real
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

  // Temporizador de auto-reseteo
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

  // Foco automático
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
    <div className="relative min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-between selection:bg-zinc-800 selection:text-white font-sans overflow-hidden">
      {/* Luz ambiental sutil en el fondo */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(212,175,55,0.06),transparent)]" />

      {/* Header Minimalista */}
      <header className="relative z-10 px-8 py-6 flex items-center justify-between max-w-5xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-champagne-gold animate-pulse" />
          <span className="text-xs font-semibold tracking-[0.25em] text-zinc-400 uppercase">
            Acceso
          </span>
        </div>

        <div className="text-sm font-mono tracking-wider text-zinc-400">
          {currentTime || '--:--'}
        </div>
      </header>

      {/* Área Central de Interacción */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {result ? (
            /* Vista de Feedback de Acceso */
            <div className="relative backdrop-blur-2xl bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl transition-all duration-500 overflow-hidden text-center">
              {/* Barra de progreso de auto-reseteo ultra-fina */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-zinc-800/50">
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

              {/* Indicador de estado */}
              <div className="flex justify-center mb-6">
                <div
                  className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500',
                    result.permitido
                      ? isTolerancia
                        ? 'bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/30'
                        : 'bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/30'
                      : 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30'
                  )}
                >
                  {result.permitido ? (
                    isTolerancia ? (
                      <AlertCircle className="w-7 h-7 stroke-[1.5]" />
                    ) : (
                      <Check className="w-7 h-7 stroke-[2]" />
                    )
                  ) : (
                    <X className="w-7 h-7 stroke-[2]" />
                  )}
                </div>
              </div>

              {/* Estado e Identidad */}
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-2">
                {result.permitido
                  ? isTolerancia
                    ? 'Acceso en Tolerancia'
                    : 'Paso Autorizado'
                  : 'Ingreso No Permitido'}
              </p>

              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-2">
                {result.nombreCliente || (result.permitido ? 'Bienvenido' : 'Atención')}
              </h2>

              <p className="text-sm text-zinc-400 font-normal leading-relaxed max-w-xs mx-auto mb-6">
                {result.mensaje}
              </p>

              {/* Detalles de vencimiento */}
              {(result.fechaVencimiento || result.fechaLimitePago) && (
                <div className="border-t border-zinc-800/80 pt-5 mt-4 text-xs text-zinc-400 space-y-2 max-w-xs mx-auto text-left">
                  {result.fechaVencimiento && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Vencimiento</span>
                      <span className="text-zinc-200 font-mono">
                        {new Date(result.fechaVencimiento).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {result.fechaLimitePago && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Límite de pago</span>
                      <span className="text-zinc-200 font-mono">
                        {new Date(result.fechaLimitePago).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Botón de reseteo manual */}
              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-800/60 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer border border-zinc-700/40"
                >
                  <RotateCcw className="w-3.5 h-3.5 opacity-70" />
                  <span>Siguiente ({countdown}s)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Pantalla Principal: Ingreso de DNI */
            <div className="flex flex-col items-center">
              {/* Título Minimalista */}
              <div className="text-center mb-8">
                <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-champagne-gold/90 block mb-2">
                  Identificación
                </span>
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                  Ingresá tu documento
                </h2>
              </div>

              {/* Campo de Documento Minimalista */}
              <form onSubmit={handleSubmit} className="w-full max-w-xs mb-8">
                <div className="relative flex justify-center items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={dniInput}
                    onChange={(e) => setDniInput(e.target.value.replace(/\D/g, ''))}
                    disabled={isLoading}
                    className="w-full bg-transparent border-b border-zinc-700 focus:border-champagne-gold pb-3 text-3xl sm:text-4xl font-light tracking-[0.25em] text-center text-white focus:outline-none transition-colors placeholder:text-zinc-700 placeholder:font-light"
                    placeholder="••••••••"
                  />
                </div>

                {/* Botón de Confirmación Principal */}
                <button
                  type="submit"
                  disabled={!dniInput || isLoading}
                  className={cn(
                    'mt-6 w-full py-3.5 rounded-full text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer',
                    !dniInput || isLoading
                      ? 'bg-zinc-900 text-zinc-600 border border-zinc-800/60 cursor-not-allowed'
                      : 'bg-zinc-100 hover:bg-white text-zinc-950 active:scale-[0.98] shadow-lg shadow-white/5'
                  )}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-200 rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Ingresar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Teclado Táctil Circular Estilo Apple */}
              <div className="grid grid-cols-3 gap-3.5 max-w-[260px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    disabled={isLoading}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border border-zinc-800/80 bg-zinc-900/30 text-xl font-light text-zinc-200 hover:bg-zinc-800/60 hover:border-zinc-700 hover:text-white active:scale-95 transition-all flex items-center justify-center cursor-pointer backdrop-blur-sm"
                  >
                    {digit}
                  </button>
                ))}

                {/* Botón Limpiar */}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('clear')}
                  disabled={isLoading}
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border border-transparent text-xs tracking-wider text-zinc-500 hover:text-rose-400 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                  aria-label="Limpiar todo"
                >
                  C
                </button>

                {/* Dígito 0 */}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  disabled={isLoading}
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border border-zinc-800/80 bg-zinc-900/30 text-xl font-light text-zinc-200 hover:bg-zinc-800/60 hover:border-zinc-700 hover:text-white active:scale-95 transition-all flex items-center justify-center cursor-pointer backdrop-blur-sm"
                >
                  0
                </button>

                {/* Botón Borrar un dígito */}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('backspace')}
                  disabled={isLoading}
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border border-transparent text-zinc-400 hover:text-zinc-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                  aria-label="Borrar último dígito"
                >
                  <Delete className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Pie de pantalla discreto */}
      <footer className="relative z-10 py-6 text-center">
        <span className="text-[11px] tracking-[0.2em] uppercase text-zinc-600 font-light">
          Terminal de Control
        </span>
      </footer>
    </div>
  );
};
