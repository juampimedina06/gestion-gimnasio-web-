import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Calendar,
  AlertTriangle,
  Clock,
  Delete,
  CornerDownLeft,
} from 'lucide-react';
import { clientesApi } from '../../../core/clientes/clientes.api';
import { ResultadoIngresoDTO } from '../../../core/clientes/models/cliente.types';
import { Button } from '../../components/Button';
import { cn } from '../../utils/cn';

interface LogEntry {
  id: string;
  hora: string;
  dni: number;
  resultado: ResultadoIngresoDTO;
}

export const ControlAccesoScreen: React.FC = () => {
  const [dniInput, setDniInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ResultadoIngresoDTO | null>(null);
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleValidarDni = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const dniNumber = parseInt(dniInput.trim(), 10);
    if (!dniNumber || isNaN(dniNumber)) return;

    setIsLoading(true);
    try {
      const res = await clientesApi.registrarIngreso({ dni: dniNumber });
      setLastResult(res);

      const newLog: LogEntry = {
        id: Math.random().toString(),
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        dni: dniNumber,
        resultado: res,
      };
      setRecentLogs((prev) => [newLog, ...prev.slice(0, 9)]);
      setDniInput('');
    } catch (err: unknown) {
      const errorResult: ResultadoIngresoDTO = {
        permitido: false,
        mensaje: err instanceof Error ? err.message : 'Error al verificar ingreso',
      };
      setLastResult(errorResult);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleKeypadPress = (val: string) => {
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
    lastResult?.permitido &&
    (lastResult.mensaje.toLowerCase().includes('tolerancia') ||
      lastResult.mensaje.toLowerCase().includes('vencida'));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-champagne-gold" />
          Control de Acceso (Molinete)
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Validación de acceso para socios mediante escaneo o ingreso de DNI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: DNI Input & Keypad */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-xl">
            <form onSubmit={handleValidarDni} className="space-y-4">
              <label className="block text-sm font-medium text-gray-300">
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
                  className="flex-1 bg-dark-card border border-dark-border rounded-xl px-4 py-3.5 text-2xl font-bold tracking-wider text-white text-center focus:outline-none focus:ring-2 focus:ring-champagne-gold/50 focus:border-champagne-gold placeholder:text-gray-600"
                />
                <Button
                  type="submit"
                  size="lg"
                  isLoading={isLoading}
                  disabled={!dniInput}
                  className="px-6"
                >
                  <CornerDownLeft className="w-5 h-5 mr-1" />
                  Validar
                </Button>
              </div>
            </form>

            {/* Virtual Keypad for Front Desk Tablets */}
            <div className="mt-6 pt-6 border-t border-dark-border">
              <p className="text-xs uppercase font-semibold tracking-wider text-gray-400 mb-3 text-center">
                Teclado Numérico
              </p>
              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="h-12 rounded-xl bg-dark-card border border-dark-border text-lg font-bold text-gray-200 hover:text-white hover:bg-zinc-800 hover:border-gray-600 transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('clear')}
                  className="h-12 rounded-xl bg-dark-card border border-dark-border text-xs font-bold text-red-400 hover:bg-red-950/30 transition-colors flex items-center justify-center cursor-pointer"
                >
                  C
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-12 rounded-xl bg-dark-card border border-dark-border text-lg font-bold text-gray-200 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('backspace')}
                  className="h-12 rounded-xl bg-dark-card border border-dark-border text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Validation Result Feedback Display */}
          {lastResult && (
            <div
              className={cn(
                'rounded-2xl p-6 border shadow-2xl transition-all duration-300',
                lastResult.permitido
                  ? isTolerancia
                    ? 'bg-amber-950/30 border-amber-600/50 text-amber-200 shadow-amber-950/20'
                    : 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200 shadow-emerald-950/20'
                  : 'bg-red-950/30 border-red-600/50 text-red-200 shadow-red-950/20'
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                    lastResult.permitido
                      ? isTolerancia
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  )}
                >
                  {lastResult.permitido ? (
                    isTolerancia ? (
                      <AlertTriangle className="w-7 h-7" />
                    ) : (
                      <ShieldCheck className="w-7 h-7" />
                    )
                  ) : (
                    <ShieldX className="w-7 h-7" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full',
                        lastResult.permitido
                          ? isTolerancia
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      )}
                    >
                      {lastResult.permitido
                        ? isTolerancia
                          ? 'Acceso Permitido (En Tolerancia)'
                          : 'Acceso Permitido'
                        : 'Acceso Denegado'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mt-1.5">
                    {lastResult.nombreCliente || 'Socio no registrado'}
                  </h3>
                  <p className="text-sm opacity-90 mt-1">{lastResult.mensaje}</p>

                  {/* Dates Details */}
                  {(lastResult.fechaVencimiento || lastResult.fechaLimitePago) && (
                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {lastResult.fechaVencimiento && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 opacity-70" />
                          <span>
                            Vencimiento:{' '}
                            <strong className="text-white">
                              {new Date(lastResult.fechaVencimiento).toLocaleDateString()}
                            </strong>
                          </span>
                        </div>
                      )}
                      {lastResult.fechaLimitePago && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 opacity-70" />
                          <span>
                            Límite de pago:{' '}
                            <strong className="text-white">
                              {new Date(lastResult.fechaLimitePago).toLocaleDateString()}
                            </strong>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Recent Checks of Current Session */}
        <div className="lg:col-span-5">
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-xl h-full flex flex-col">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-champagne-gold" />
              Últimos Ingresos de la Sesión
            </h2>

            {recentLogs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-gray-500">
                <ShieldAlert className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm">Aún no se registraron ingresos en esta sesión.</p>
              </div>
            ) : (
              <div className="space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full flex-shrink-0',
                          log.resultado.permitido ? 'bg-emerald-400' : 'bg-red-400'
                        )}
                      />
                      <div className="truncate">
                        <p className="font-semibold text-gray-200 truncate">
                          {log.resultado.nombreCliente || `DNI: ${log.dni}`}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          DNI {log.dni} • {log.resultado.mensaje}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-gray-500 flex-shrink-0">
                      {log.hora}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
