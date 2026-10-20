import axios from 'axios';
import { axiosClient } from '../api/axiosClient';
import {
  ActualizarPagoDTO,
  ListaClientesDTO,
  RegistrarClienteDTO,
  RegistroIngresoDTO,
  ResultadoActualizarPagoDTO,
  ResultadoIngresoDTO,
} from './models/cliente.types';

export const clientesApi = {
  getClientes: async (): Promise<ListaClientesDTO[]> => {
    try {
      const { data } = await axiosClient.get<ListaClientesDTO[]>('/cliente/lista-clientes');
      return data;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.toLowerCase().includes('no se encontraron')) {
        return [];
      }
      throw err;
    }
  },

  registrarCliente: async (dto: RegistrarClienteDTO): Promise<number> => {
    const { data } = await axiosClient.post<number>('/cliente/registro', dto);
    return data;
  },

  registrarIngreso: async (dto: RegistroIngresoDTO): Promise<ResultadoIngresoDTO> => {
    try {
      const { data } = await axiosClient.post<ResultadoIngresoDTO>('/cliente/ingreso', dto);
      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data && typeof error.response.data === 'object' && 'permitido' in error.response.data) {
        return error.response.data as ResultadoIngresoDTO;
      }
      throw error;
    }
  },

  actualizarPago: async (dto: ActualizarPagoDTO): Promise<ResultadoActualizarPagoDTO> => {
    try {
      const { data } = await axiosClient.post<ResultadoActualizarPagoDTO>('/cliente/actualizar', dto);
      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data && typeof error.response.data === 'object' && 'exito' in error.response.data) {
        return error.response.data as ResultadoActualizarPagoDTO;
      }
      throw error;
    }
  },
};
