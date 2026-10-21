import React, { useState, useRef, useEffect, useCallback } from 'react';
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

  // Temporizador de reseteo automático discreto
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

  // Foco permanente en el campo
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Atajos de teclado: Espacio, Enter o Escape resetean en el acto
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
      setDniInput('');
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
    // Si hay un resultado previo, escribir limpia de inmediato y arranca el nuevo socio
    if (result) {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setResult(null);
    }
    setDniInput(e.target.value.replace(/\D/g, ''));
  };

  const handleKeypadPress = (val: string) => {
    // Si hay un resultado previo, tocar cualquier número limpia y setea ese número de una vez
    if (result) {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setResult(null);

      if (val === 'clear' || val === 'backspace') {
        setDniInput('');
      } else {
        setDniInput(val);
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
    <div className="h-screen w-screen bg-[#07080A] text-white flex flex-col justify-between p-4 sm:p-8 lg:p-10 font-sans selection:bg-volt selection:text-black overflow-hidden relative">
      {/* Luz ambiental sutil en esquinas */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 bg-volt/5 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-80 h-80 bg-volt/5 rounded-full blur-3xl" />

      {/* Header Superior Limpio y Arquitectónico */}
      <header className="w-full flex items-center justify-between pb-4 border-b border-zinc-800/60 relative z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Isotipo geométrico minimalista en lugar de emoji/icono genérico */}
          <div className="w-9 h-9 rounded-xl bg-volt flex items-center justify-center text-black font-black text-sm tracking-tighter shadow-lg shadow-volt/20">
            GYM
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-[0.15em] text-white uppercase">
              Control de Acceso
            </h1>
            <p className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase">
              Terminal de Ingreso
            </p>
          </div>
        </div>

        {/* Reloj y Estado */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-mono font-bold text-volt tracking-wider">
              {currentTime || '--:--:--'}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 capitalize">
              {currentDate || 'En Vivo'}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-volt animate-pulse" />
            <span>Molinete Activo</span>
          </div>
        </div>
      </header>

      {/* Cuerpo Central Inmersivo (Grid 2 Columnas) */}
      <main className="flex-1 w-full my-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-0 relative z-10">
        {/* Columna Izquierda: Imagen Heroica Cinematográfica con Overlay de Estado */}
        <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-zinc-800/80 shadow-2xl flex flex-col justify-between p-6 sm:p-10 bg-zinc-950">
          {/* Fondo Fotográfico Cinematográfico */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 filter brightness-[0.45] contrast-[1.1]"
            style={{ backgroundImage: `url('/gym_hero.jpg')` }}
          />

          {/* Gradientes oscuros para máxima legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07080A] via-[#07080A]/60 to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#07080A]/80" />

          {/* Contenido Superior Izquierdo */}
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-300 backdrop-blur-md">
              Pase Digital
            </span>
          </div>

          {/* Contenido Inferior Izquierdo: Estado o Bienvenida */}
          <div className="relative z-10">
            {result ? (
              /* Tarjeta de Confirmación de Acceso */
              <div
                className={cn(
                  'rounded-2xl p-6 sm:p-8 border backdrop-blur-xl shadow-2xl transition-all duration-300 relative overflow-hidden',
                  result.permitido
                    ? isTolerancia
                      ? 'bg-amber-950/70 border-amber-500/80 text-amber-100'
                      : 'bg-emerald-950/70 border-emerald-400/80 text-emerald-100'
                    : 'bg-rose-950/70 border-rose-500/80 text-rose-100'
                )}
              >
                {/* Línea de reseteo automático */}
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

                {/* Encabezado del Estado */}
                <div className="flex items-center justify-between mb-3 pt-1">
                  <span
                    className={cn(
                      'text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full border',
                      result.permitido
                        ? isTolerancia
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                          : 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    )}
                  >
                    {result.permitido
                      ? isTolerancia
                        ? 'Acceso Permitido • En Tolerancia'
                        : 'Paso Habilitado'
                      : 'Acceso Denegado'}
                  </span>
                  <span className="text-[11px] font-mono opacity-60">
                    Auto-limpieza en {countdown}s
                  </span>
                </div>

                {/* Nombre del Socio */}
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
                  {result.nombreCliente || (result.permitido ? 'Socio' : 'Atención')}
                </h2>

                {/* Mensaje Oficial */}
                <p className="text-sm sm:text-base mt-2 font-normal opacity-90 leading-relaxed">
                  {result.mensaje}
                </p>

                {/* Fechas de Vencimiento */}
                {(result.fechaVencimiento || result.fechaLimitePago) && (
                  <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-xs font-mono">
                    {result.fechaVencimiento && (
                      <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                        <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">
                          Vencimiento
                        </span>
                        <strong className="text-white text-sm sm:text-base font-bold">
                          {new Date(result.fechaVencimiento).toLocaleDateString()}
                        </strong>
                      </div>
                    )}
                    {result.fechaLimitePago && (
                      <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                        <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">
                          Límite de pago
                        </span>
                        <strong className="text-white text-sm sm:text-base font-bold">
                          {new Date(result.fechaLimitePago).toLocaleDateString()}
                        </strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Mensaje de Reposo Inspirador y Limpio */
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-volt block">
                  Autenticación de Asistencia
                </span>
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase leading-tight">
                  Entrená <br />
                  <span className="text-volt">sin límites.</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed font-light">
                  Ingresá tu DNI en el panel numérico para habilitar el pase y registrar tu ingreso al gimnasio.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Panel Táctil de Ingreso de DNI */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="bg-[#101116] border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
            {/* Input de DNI y Botón Principal */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-zinc-400 px-1">
                <span>Número de DNI</span>
                <span className="text-zinc-600">{dniInput.length} / 8</span>
              </div>

              {/* Visor Numérico */}
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
                  className="w-full bg-[#161720] border-2 border-zinc-800 focus:border-volt rounded-2xl py-4 px-4 text-3xl sm:text-4xl font-mono font-black tracking-[0.25em] text-center text-white placeholder:text-zinc-800 focus:outline-none focus:ring-4 focus:ring-volt/10 transition-all shadow-inner"
                />
              </div>

              {/* Botón de Confirmar Ingreso */}
              <button
                type="submit"
                disabled={!dniInput || isLoading}
                className={cn(
                  'w-full py-4 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-[0.15em] transition-all shadow-lg active:scale-[0.98] cursor-pointer',
                  !dniInput || isLoading
                    ? 'bg-zinc-800/60 text-zinc-600 border border-zinc-800/80 cursor-not-allowed'
                    : 'bg-volt hover:bg-[#b8e600] text-black shadow-volt/20'
                )}
              >
                {isLoading ? 'Verificando estado...' : 'Habilitar Ingreso'}
              </button>
            </form>

            {/* Teclado Táctil Industrial de Alta Sensibilidad */}
            <div className="mt-6 pt-5 border-t border-zinc-800/80">
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    disabled={isLoading}
                    className="h-13 sm:h-15 rounded-2xl bg-[#161720] border border-zinc-800 hover:border-zinc-600 text-xl sm:text-2xl font-mono font-bold text-zinc-100 hover:text-white hover:bg-zinc-800/80 transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-sm select-none"
                  >
                    {digit}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handleKeypadPress('clear')}
                  disabled={isLoading}
                  className="h-13 sm:h-15 rounded-2xl bg-[#161720] border border-zinc-800 hover:border-rose-800 text-[11px] font-mono font-bold text-rose-400 hover:bg-rose-950/20 transition-all active:scale-95 flex items-center justify-center cursor-pointer uppercase tracking-wider select-none"
                >
                  Borrar
                </button>

                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  disabled={isLoading}
                  className="h-13 sm:h-15 rounded-2xl bg-[#161720] border border-zinc-800 hover:border-zinc-600 text-xl sm:text-2xl font-mono font-bold text-zinc-100 hover:text-white hover:bg-zinc-800/80 transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-sm select-none"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={() => handleKeypadPress('backspace')}
                  disabled={isLoading}
                  className="h-13 sm:h-15 rounded-2xl bg-[#161720] border border-zinc-800 hover:border-zinc-600 text-xs font-mono font-bold text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all active:scale-95 flex items-center justify-center cursor-pointer uppercase tracking-wider select-none"
                >
                  ←
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Fijo Minimalista */}
      <footer className="w-full flex items-center justify-between pt-3 border-t border-zinc-800/60 text-[10px] font-mono uppercase tracking-widest text-zinc-600 relative z-10 flex-shrink-0">
        <span>GYM OS • Terminal de Acceso</span>
        <span>Molinete #01</span>
      </footer>
    </div>
  );
};
