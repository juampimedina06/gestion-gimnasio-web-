import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5270';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    let errorMessage = 'Ocurrió un error inesperado al procesar la solicitud.';

    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (typeof error.response.data === 'object' && 'mensaje' in (error.response.data as Record<string, unknown>)) {
        errorMessage = (error.response.data as { mensaje: string }).mensaje;
      } else if (typeof error.response.data === 'object' && 'title' in (error.response.data as Record<string, unknown>)) {
        errorMessage = (error.response.data as { title: string }).title;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return Promise.reject(new Error(errorMessage));
  }
);
