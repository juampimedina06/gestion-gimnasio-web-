import { axiosClient } from '../api/axiosClient';
import { UsuarioDTO } from './models/usuario.types';

export const usuariosApi = {
  registrarUsuario: async (dto: UsuarioDTO): Promise<number> => {
    const { data } = await axiosClient.post<number>('/admin/registro-usuario', dto);
    return data;
  },
};
