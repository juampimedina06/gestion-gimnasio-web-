export enum TipoRol {
  Admin = 1,
  PersonalTrainer = 2,
}

export enum EstadoCliente {
  Activo = 1,
  Inactivo = 2,
  Baja = 3,
}

export enum EstadoPago {
  AlDia = 1,
  Vencido = 2,
  EnTolerancia = 3,
}

export enum MetodoPago {
  Efectivo = 1,
  Transferencia = 2,
}

export enum PlanPase {
  Libre = 1,
  TresDias = 2,
}

export enum PlanTipo {
  Mensual = 1,
  Semanal = 2,
}

export enum PlanValidez {
  TreintaDias = 30,
  TresDias = 3,
}

export enum TipoNotificacion {
  Email = 1,
  WhatsApp = 2,
}
