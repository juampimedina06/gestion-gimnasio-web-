import { axiosClient } from '../api/axiosClient';
import { LoginDTO, LoginRespuestaDTO } from './models/auth.types';

export const authApi = {
  login: async (dto: LoginDTO): Promise<LoginRespuestaDTO> => {
    const { data } = await axiosClient.post<LoginRespuestaDTO>('/admin/login', dto);
    return data;
  },
};
