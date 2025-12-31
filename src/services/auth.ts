import api from '../api';
import type { User, Owner } from '../app/types';

export interface LoginRequest {
  tower: string;
  floor: string;
  apartment: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  needsRegistration: boolean;
}

export interface RegisterOwnerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentCode: string;
}

export const authService = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),

  logout: () => api.post<void>('/auth/logout'),

  me: () => api.get<User>('/auth/me'),

  refreshToken: () => api.post<{ token: string }>('/auth/refresh'),

  registerOwner: (data: RegisterOwnerRequest) => api.post<Owner>('/auth/register-owner', data),

  getOwner: (departmentCode: string) => api.get<Owner | null>(`/auth/owner/${departmentCode}`),
};
