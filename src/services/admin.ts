import api from '../api';
import type { Owner, Reservation, DashboardStats } from '../app/types';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const adminService = {
  getDashboardStats: () =>
    api.get<DashboardStats>('/admin/dashboard', {
      headers: getAuthHeaders(),
    }),

  getOwners: () =>
    api.get<Owner[]>('/admin/owners', {
      headers: getAuthHeaders(),
    }),

  updateOwner: (id: string, data: Partial<Omit<Owner, 'id' | 'departmentCode'>>) =>
    api.patch<Owner>(`/admin/owners/${id}`, data, {
      headers: getAuthHeaders(),
    }),

  createOwner: (data: {
    firstName: string;
    lastName: string;
    dni: string;
    email: string;
    phone: string;
    tower: string;
    floor: string;
    apartment: string;
  }) =>
    api.post<Owner>('/admin/owners', data, {
      headers: getAuthHeaders(),
    }),

  getPendingReservations: () =>
    api.get<Reservation[]>('/admin/reservations/pending', {
      headers: getAuthHeaders(),
    }),

  getAllReservations: () =>
    api.get<Reservation[]>('/admin/reservations', {
      headers: getAuthHeaders(),
    }),

  approveReservation: (id: string) =>
    api.patch<Reservation>(`/reservations/${id}/approve`, undefined, {
      headers: getAuthHeaders(),
    }),

  rejectReservation: (id: string) =>
    api.patch<Reservation>(`/reservations/${id}/reject`, undefined, {
      headers: getAuthHeaders(),
    }),
};
