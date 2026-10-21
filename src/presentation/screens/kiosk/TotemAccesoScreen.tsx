import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CornerDownLeft,
  RotateCcw,
} from 'lucide-react';
import { clientesApi } from '../../../core/clientes/clientes.api';
import { ResultadoIngresoDTO } from '../../../core/clientes/models/cliente.types';
import { cn } from '../../utils/cn';

export const TotemAccesoScreen: React.FC = () => {
  const [dniInput, setDniInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResultadoIngresoDTO | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  // Reloj digital en tiempo real
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

  // Limpieza manual (sin temporizador de 3 o 5 segundos)
  const handleClear = useCallback(() => {
    setResult(null);
    setDniInput('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 30);
  }, []);

  // Foco permanente en el campo (siempre listo para teclado o lector óptico)
  useEffect(() => {
    inputRef.current?.focus();
    const handleDocumentClick = () => {
      inputRef.current?.focus();
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  // Atajos de teclado: Enter, Espacio o Escape limpian la pantalla cuando no hay nuevo input
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (result && !dniInput) {
        if (e.key === 'Enter' || e.code === 'Space' || e.key === 'Escape') {
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
        mensaje: err instanceof Error ? err.message : 'Error al verificar ingreso en molinete.',
      });
      setDniInput('');
    } finally {
      setIsLoading(false);
      // Mantener el foco listo para el siguiente socio
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Si hay un resultado previo en pantalla, cualquier nuevo tipeo limpia la pantalla y arranca el nuevo DNI
    if (result) {
      setResult(null);
    }
    setDniInput(e.target.value.replace(/\D/g, ''));
  };

  const isTolerancia =
    result?.permitido &&
    (result.mensaje.toLowerCase().includes('tolerancia') ||
      result.mensaje.toLowerCase().includes('vencida'));

  return (
    <div
      className={cn(
        'h-screen w-screen text-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 font-sans selection:bg-volt selection:text-black overflow-hidden relative transition-colors duration-700',
        // Fondo reactivo que se tiñe según el estado del acceso
        !result && 'bg-[#07080A]',
        result && result.permitido && !isTolerancia && 'bg-[#031d10]',
        result && result.permitido && isTolerancia && 'bg-[#221404]',
        result && !result.permitido && 'bg-[#210609]'
      )}
    >
      {/* Iluminación Ambiental Reactiva Envolvente */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 transition-opacity duration-700 z-0',
          !result &&
            'opacity-30 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(204,255,0,0.08),transparent)]',
          result &&
            result.permitido &&
            !isTolerancia &&
            'opacity-70 bg-[radial-gradient(ellipse_90%_70%_at_50%_35%,rgba(16,185,129,0.35),transparent)]',
          result &&
            result.permitido &&
            isTolerancia &&
            'opacity-70 bg-[radial-gradient(ellipse_90%_70%_at_50%_35%,rgba(245,158,11,0.35),transparent)]',
          result &&
            !result.permitido &&
            'opacity-70 bg-[radial-gradient(ellipse_90%_70%_at_50%_35%,rgba(244,63,94,0.38),transparent)]'
        )}
      />

      {/* Header Superior del Kiosk */}
      <header className="w-full flex items-center justify-between pb-6 border-b border-white/10 relative z-10 flex-shrink-0">
        <div className="flex items-center gap-3.5">
          <div
            className={cn(
              'w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm tracking-tighter shadow-xl transition-colors duration-500',
              !result && 'bg-volt text-black shadow-volt/20',
              result && result.permitido && !isTolerancia && 'bg-emerald-400 text-black shadow-emerald-500/30',
              result && result.permitido && isTolerancia && 'bg-amber-400 text-black shadow-amber-500/30',
              result && !result.permitido && 'bg-rose-500 text-white shadow-rose-500/30'
            )}
          >
            GYM
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-[0.15em] text-white uppercase flex items-center gap-2">
              <span>Terminal de Acceso</span>
              <span className="hidden sm:inline text-zinc-500 text-xs font-mono font-normal">
                // Molinete 24/7
              </span>
            </h1>
            <p className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
              Control de Asistencia en Tiempo Real
            </p>
          </div>
        </div>

        {/* Reloj y Estado */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div
              className={cn(
                'text-xl sm:text-3xl font-mono font-bold tracking-wider transition-colors duration-500',
                !result && 'text-volt',
                result && result.permitido && !isTolerancia && 'text-emerald-400',
                result && result.permitido && isTolerancia && 'text-amber-400',
                result && !result.permitido && 'text-rose-400'
              )}
            >
              {currentTime || '--:--:--'}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 capitalize">
              {currentDate || 'En Línea'}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-zinc-300 backdrop-blur-md">
            <span
              className={cn(
                'w-2 h-2 rounded-full animate-pulse',
                !result && 'bg-volt',
                result && result.permitido && !isTolerancia && 'bg-emerald-400',
                result && result.permitido && isTolerancia && 'bg-amber-400',
                result && !result.permitido && 'bg-rose-500'
              )}
            />
            <span>Molinete Activo</span>
          </div>
        </div>
      </header>

      {/* Cuerpo Central Inmersivo (Grid 2 Columnas) */}
      <main className="flex-1 w-full my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-0 relative z-10">
        {/* Columna Izquierda: Escena Hero en reposo O Tarjeta de Acceso Pantalla Completa que tapa toda la imagen */}
        <div
          className={cn(
            'lg:col-span-7 relative rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between transition-all duration-500',
            !result
              ? 'border border-white/10 p-8 sm:p-12 bg-zinc-950/80 backdrop-blur-md'
              : result.permitido
              ? isTolerancia
                ? 'border-2 border-amber-400 bg-gradient-to-br from-[#1a0e02] via-[#2a1705] to-[#120a02] p-8 sm:p-12 shadow-[0_0_80px_rgba(245,158,11,0.25)] text-amber-50'
                : 'border-2 border-emerald-400 bg-gradient-to-br from-[#021f11] via-[#04331d] to-[#01140b] p-8 sm:p-12 shadow-[0_0_80px_rgba(16,185,129,0.25)] text-emerald-50'
              : 'border-2 border-rose-500 bg-gradient-to-br from-[#200407] via-[#35070d] to-[#140204] p-8 sm:p-12 shadow-[0_0_80px_rgba(244,63,94,0.3)] text-rose-50'
          )}
        >
          {!result ? (
            <>
              {/* Fondo Fotográfico Cinematográfico (Sólo en reposo) */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-700 filter brightness-[0.35] contrast-[1.15]"
                style={{ backgroundImage: `url('/gym_hero.jpg')` }}
              />

              {/* Gradientes para máxima legibilidad */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

              {/* Tag Superior */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-block px-3.5 py-1.5 rounded-full bg-black/70 border border-white/15 text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-200 backdrop-blur-md">
                  Pase Digital del Gimnasio
                </span>
              </div>

              {/* Mensaje de Reposo Limpio */}
              <div className="relative z-10 my-auto space-y-4">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-volt block">
                  Autenticación de Asistencia
                </span>
                <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-tight">
                  Entrená <br />
                  <span className="text-volt">sin límites.</span>
                </h2>
                <p className="text-sm sm:text-base text-zinc-300 max-w-md leading-relaxed font-light">
                  Ingresá tu DNI en el teclado físico y presioná Enter para habilitar el molinete.
                </p>
              </div>

              {/* Tip Inferior */}
              <div className="relative z-10 pt-4 text-xs font-mono text-zinc-400 flex items-center justify-between">
                <span>Terminal Automatizada GYM OS</span>
                <span>Uso Exclusivo de Socios</span>
              </div>
            </>
          ) : (
            <>
              {/* Tarjeta de Acceso Pantalla Completa: Tapa toda la imagen con la info */}
              <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-5">
                <div className="flex items-center gap-3">
                  {result.permitido ? (
                    isTolerancia ? (
                      <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-400 shadow-lg">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 border-2 border-emerald-400/60 flex items-center justify-center text-emerald-400 shadow-lg">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    )
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border-2 border-rose-500/60 flex items-center justify-center text-rose-400 shadow-lg">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <span
                      className={cn(
                        'text-xs font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full border inline-block mb-1',
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
                          : 'Paso Autorizado • Al Día'
                        : 'Acceso Denegado • Regularizar'}
                    </span>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      {result.permitido ? 'Molinete Habilitado // Pase Activo' : 'Molinete Bloqueado'}
                    </p>
                  </div>
                </div>

                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-[11px] font-mono text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  Pase Activo
                </span>
              </div>

              {/* Contenido Central de la Tarjeta con la Información */}
              <div className="relative z-10 my-auto py-6 space-y-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 block mb-1">
                    Nombre del Socio
                  </span>
                  <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-none">
                    {result.nombreCliente || (result.permitido ? 'Socio Habilitado' : 'Socio No Habilitado')}
                  </h2>
                </div>

                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-sm">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                    Estado Oficial
                  </span>
                  <p className="text-lg sm:text-2xl font-semibold text-white leading-snug">
                    {result.mensaje}
                  </p>
                </div>

                {/* Fechas de Vencimiento / Tolerancia en Cajas Grandes */}
                {(result.fechaVencimiento || result.fechaLimitePago) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.fechaVencimiento && (
                      <div className="bg-black/40 border border-white/10 rounded-2xl p-5">
                        <span className="text-zinc-400 block text-xs uppercase font-mono tracking-wider mb-1">
                          Vencimiento de Cuota
                        </span>
                        <strong className="text-white text-xl sm:text-2xl font-bold font-mono">
                          {new Date(result.fechaVencimiento).toLocaleDateString()}
                        </strong>
                      </div>
                    )}
                    {result.fechaLimitePago && (
                      <div className="bg-black/40 border border-white/10 rounded-2xl p-5">
                        <span className="text-zinc-400 block text-xs uppercase font-mono tracking-wider mb-1">
                          Límite de Tolerancia
                        </span>
                        <strong className="text-white text-xl sm:text-2xl font-bold font-mono">
                          {new Date(result.fechaLimitePago).toLocaleDateString()}
                        </strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer de la Tarjeta */}
              <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  Tipeá el próximo DNI o presioná Enter
                </span>
                <span className="hidden sm:inline">GYM OS • Terminal #01</span>
              </div>
            </>
          )}
        </div>

        {/* Columna Derecha: Entrada por Teclado Físico (Misma altura y alineación exacta) */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="bg-[#101116]/90 border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl flex flex-col justify-between h-full">
            <div className="space-y-2">
              <span
                className={cn(
                  'text-xs font-mono uppercase tracking-[0.2em] transition-colors',
                  !result ? 'text-volt' : result.permitido ? 'text-emerald-400' : 'text-rose-400'
                )}
              >
                Teclado Físico / Lector Óptico
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                {result ? 'Siguiente Socio' : 'Ingresá tu DNI'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                {result
                  ? 'Tipeá un nuevo DNI para validar, o presioná Enter / Siguiente para reiniciar la pantalla.'
                  : 'Escribí tu número de documento sin puntos ni comas.'}
              </p>
            </div>

            {/* Formulario y Visor Principal de DNI */}
            <form onSubmit={handleSubmit} className="my-auto space-y-6 w-full">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-zinc-400 px-1">
                  <span>Documento</span>
                  <span className="text-zinc-500">{dniInput.length} / 8 dígitos</span>
                </div>

                {/* Visor Numérico de Gran Escala */}
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    placeholder={result ? 'Próximo DNI...' : '••••••••'}
                    value={dniInput}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    maxLength={10}
                    className="w-full bg-[#161720] border-2 border-zinc-800 focus:border-volt rounded-2xl py-6 px-4 text-3xl sm:text-5xl font-mono font-black tracking-[0.2em] text-center text-white placeholder:text-zinc-700 focus:outline-none focus:ring-4 focus:ring-volt/15 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={!dniInput || isLoading}
                  className={cn(
                    'w-full py-5 px-6 rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all shadow-xl active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2',
                    !dniInput || isLoading
                      ? 'bg-zinc-800/60 text-zinc-600 border border-zinc-800/80 cursor-not-allowed'
                      : 'bg-volt hover:bg-[#b8e600] text-black shadow-volt/20'
                  )}
                >
                  {isLoading ? (
                    <span>Verificando estado...</span>
                  ) : (
                    <>
                      <span>Validar Ingreso</span>
                      <CornerDownLeft className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>

                {/* Botón para Limpiar / Siguiente Socio manual si hay resultado */}
                {result && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="w-full py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Reiniciar Pantalla (Enter o Espacio)</span>
                  </button>
                )}
              </div>
            </form>

            {/* Atajos de Teclado Físico */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-zinc-400">
                <span className="font-bold text-white block mb-0.5">Enter</span>
                <span>Confirmar / Siguiente</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-zinc-400">
                <span className="font-bold text-white block mb-0.5">Tipear DNI</span>
                <span>Limpia y valida</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="w-full flex items-center justify-between pt-4 border-t border-white/10 text-[10px] font-mono uppercase tracking-widest text-zinc-500 relative z-10 flex-shrink-0">
        <span>GYM OS • Terminal de Molinete Físico</span>
        <span className="flex items-center gap-2">
          <span>Acceso #01</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </span>
      </footer>
    </div>
  );
};
