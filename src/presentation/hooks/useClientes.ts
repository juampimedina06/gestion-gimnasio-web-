import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesApi } from '../../core/clientes/clientes.api';
import { RegistrarClienteDTO, ActualizarPagoDTO } from '../../core/clientes/models/cliente.types';

export const CLIENTES_QUERY_KEY = ['clientes'];

export function useClientes() {
  return useQuery({
    queryKey: CLIENTES_QUERY_KEY,
    queryFn: () => clientesApi.getClientes(),
  });
}

export function useRegistrarCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: RegistrarClienteDTO) => clientesApi.registrarCliente(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTES_QUERY_KEY });
    },
  });
}

export function useActualizarPago() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: ActualizarPagoDTO) => clientesApi.actualizarPago(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTES_QUERY_KEY });
    },
  });
}
