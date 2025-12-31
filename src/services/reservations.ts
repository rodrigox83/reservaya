import api from '../api';
import type { Reservation, Grill } from '../app/types';

export const reservationsService = {
  getAll: () => api.get<Reservation[]>('/reservations'),

  getByUser: (userId: string) => api.get<Reservation[]>(`/reservations/user/${userId}`),

  getByGrill: (grillId: string) => api.get<Reservation[]>(`/reservations/grill/${grillId}`),

  create: (data: Omit<Reservation, 'id'>) => api.post<Reservation>('/reservations', data),

  update: (id: string, data: Partial<Reservation>) =>
    api.patch<Reservation>(`/reservations/${id}`, data),

  cancel: (id: string) => api.delete<void>(`/reservations/${id}`),

  approve: (id: string) => api.patch<Reservation>(`/reservations/${id}/approve`),

  reject: (id: string) => api.patch<Reservation>(`/reservations/${id}/reject`),
};

export const grillsService = {
  getAll: () => api.get<Grill[]>('/grills'),

  getById: (id: string) => api.get<Grill>(`/grills/${id}`),

  getAvailability: (grillId: string, date: string) =>
    api.get<{ available: boolean }>(`/grills/${grillId}/availability`, {
      params: { date },
    }),
};
