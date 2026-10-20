export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export type ClientPaymentStatus = 'al_dia' | 'tolerancia' | 'vencido';

export function getClientPaymentStatus(
  fechaVencimiento: string,
  toleranciaDias: number = 5
): {
  status: ClientPaymentStatus;
  label: string;
  variant: 'success' | 'warning' | 'danger';
} {
  const vencimiento = new Date(fechaVencimiento);
  const hoy = new Date();

  // Reset time portions for pure date comparison
  vencimiento.setHours(0, 0, 0, 0);
  hoy.setHours(0, 0, 0, 0);

  const limiteTolerancia = new Date(vencimiento);
  limiteTolerancia.setDate(limiteTolerancia.getDate() + toleranciaDias);

  if (hoy <= vencimiento) {
    return {
      status: 'al_dia',
      label: 'Al Día',
      variant: 'success',
    };
  }

  if (hoy <= limiteTolerancia) {
    return {
      status: 'tolerancia',
      label: 'En Tolerancia',
      variant: 'warning',
    };
  }

  return {
    status: 'vencido',
    label: 'Vencido',
    variant: 'danger',
  };
}
