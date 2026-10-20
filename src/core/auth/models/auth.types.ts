import { TipoRol } from '../../shared/enums';

export interface LoginDTO {
  email: string;
  contrasena: string;
}

export interface RolDTO {
  id: number;
  tipo: TipoRol;
}

export interface LoginRespuestaDTO {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  idRol: number;
  rol: RolDTO;
}

export type UserSession = LoginRespuestaDTO;
