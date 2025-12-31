import api from '../api';
import type { User } from '../app/types';

export interface LoginRequest {
  tower: string;
  floor: string;
  apartment: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),

  logout: () => api.post<void>('/auth/logout'),

  me: () => api.get<User>('/auth/me'),

  refreshToken: () => api.post<{ token: string }>('/auth/refresh'),
};
