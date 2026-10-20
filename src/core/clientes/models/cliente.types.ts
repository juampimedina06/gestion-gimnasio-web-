import {
  EstadoCliente,
  MetodoPago,
  PlanPase,
  PlanTipo,
  PlanValidez,
} from '../../shared/enums';

export interface PlanDTO {
  id: number;
  pase: PlanPase;
  tipo: PlanTipo;
  diasValidez: PlanValidez;
  diasPorSemana: number;
  precio: number;
  toleranciaDias: number;
}

export interface ListaClientesDTO {
  id: number;
  nombre: string;
  dni: number;
  email: string;
  telefono: string;
  fechaPago: string;
  fechaVencimiento: string;
  plan: PlanDTO;
}

export interface RegistrarClienteDTO {
  nombre: string;
  dni: number;
  telefono: string;
  email: string;
  idPlan: number;
  metodoPago: MetodoPago;
}

export interface RegistroIngresoDTO {
  dni: number;
}

export interface ResultadoIngresoDTO {
  permitido: boolean;
  mensaje: string;
  nombreCliente?: string;
  fechaVencimiento?: string;
  fechaLimitePago?: string;
}

export interface ActualizarPagoDTO {
  dni: number;
  idPlan: number;
  metodoPago: MetodoPago;
}

export interface ResultadoActualizarPagoDTO {
  exito: boolean;
  mensaje: string;
  nombreCliente?: string;
  fechaPago?: string;
  fechaVencimiento?: string;
  monto?: number;
}

export interface Cliente {
  id: number;
  nombre: string;
  dni: number;
  telefono: string;
  email: string;
  fechaAlta: string;
  estado: EstadoCliente;
  idUsuario?: number;
}
