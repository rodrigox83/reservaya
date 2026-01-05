const API_URL = import.meta.env.VITE_API_URL || '';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_URL}/api${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || 'Error en la solicitud' };
      }

      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'Error de conexión con el servidor' };
    }
  }

  // Auth
  async login(tower: string, floor: string, apartment: string, dni: string) {
    const result = await this.request<{
      needsRegistration: boolean;
      user: any;
      token?: string;
      departmentCode?: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ tower, floor, apartment, dni }),
    });

    if (result.data?.token) {
      this.setToken(result.data.token);
    }

    return result;
  }

  async registerOwner(data: {
    firstName: string;
    lastName: string;
    dni: string;
    email: string;
    phone: string;
    departmentCode: string;
  }) {
    return this.request<any>('/auth/register-owner', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOwner(departmentCode: string) {
    return this.request<any>(`/auth/owner/${departmentCode}`);
  }

  async me() {
    return this.request<any>('/auth/me');
  }

  // Staff auth (admin/receptionist)
  async staffLogin(username: string, password: string) {
    const result = await this.request<{
      staff: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        role: 'ADMIN' | 'RECEPTIONIST';
      };
      token: string;
    }>('/auth/staff/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (result.data?.token) {
      this.setToken(result.data.token);
    }

    return result;
  }

  async staffMe() {
    return this.request<{
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      role: 'ADMIN' | 'RECEPTIONIST';
    }>('/auth/staff/me');
  }

  // Guest auth (airbnb, tenant, etc.)
  async guestLogin(departmentCode: string, documentType: string, documentNumber: string) {
    const result = await this.request<{
      needsRegistration: boolean;
      guest?: {
        id: string;
        firstName: string;
        lastName: string;
        documentType: string;
        documentNumber: string;
        email: string | null;
        phone: string | null;
        departmentCode: string;
        guestType: string;
      };
      token?: string;
      departmentCode?: string;
      documentType?: string;
      documentNumber?: string;
    }>('/auth/guest/login', {
      method: 'POST',
      body: JSON.stringify({ departmentCode, documentType, documentNumber }),
    });

    if (result.data?.token) {
      this.setToken(result.data.token);
    }

    return result;
  }

  async guestMe() {
    return this.request<{
      id: string;
      firstName: string;
      lastName: string;
      documentType: string;
      documentNumber: string;
      email: string | null;
      phone: string | null;
      departmentCode: string;
      guestType: string;
    }>('/auth/guest/me');
  }

  async registerGuest(data: {
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    email?: string;
    phone?: string;
    departmentCode: string;
    guestType: string;
  }) {
    return this.request<{
      message: string;
      guest: any;
      isNew: boolean;
    }>('/guests/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  logout() {
    this.setToken(null);
  }

  // Grills
  async getGrills() {
    return this.request<any[]>('/grills');
  }

  async getGrillsByTower(tower: string) {
    return this.request<any[]>(`/grills/tower/${tower}`);
  }

  // Reservations
  async getReservations() {
    return this.request<any[]>('/reservations');
  }

  async getMyReservations(userId: string) {
    return this.request<any[]>(`/reservations/user/${userId}`);
  }

  async createReservation(data: { grillId: string; date: string; notes?: string }) {
    return this.request<any>('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelReservation(id: string) {
    return this.request<any>(`/reservations/${id}`, {
      method: 'DELETE',
    });
  }

  async approveReservation(id: string) {
    return this.request<any>(`/reservations/${id}/approve`, {
      method: 'PATCH',
    });
  }

  async rejectReservation(id: string) {
    return this.request<any>(`/reservations/${id}/reject`, {
      method: 'PATCH',
    });
  }

  // Admin
  async getAdminStats() {
    return this.request<any>('/admin/stats');
  }

  async getPendingReservations() {
    return this.request<any[]>('/admin/reservations/pending');
  }

  async getAllOwners() {
    return this.request<any[]>('/admin/owners');
  }

  // Pool (se agregarán los endpoints en el backend)
  async getPoolGuests() {
    return this.request<any[]>('/pool/guests');
  }

  async addPoolGuest(data: {
    firstName: string;
    lastName: string;
    documentNumber?: string;
    guestType: string;
  }) {
    return this.request<any>('/pool/guests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removePoolGuest(id: string) {
    return this.request<any>(`/pool/guests/${id}`, {
      method: 'DELETE',
    });
  }

  async getPoolAccesses() {
    return this.request<any[]>('/pool/accesses');
  }

  async getActivePoolAccesses() {
    return this.request<any[]>('/pool/accesses/active');
  }

  async registerPoolAccess(data: {
    personType: 'owner' | 'guest';
    personId: string;
    estimatedHours: number;
  }) {
    return this.request<any>('/pool/accesses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markPoolExit(id: string) {
    return this.request<any>(`/pool/accesses/${id}/exit`, {
      method: 'PATCH',
    });
  }

  async getPoolStats() {
    return this.request<any>('/pool/stats');
  }

  // Admin - Guests management
  async getAdminGuests() {
    return this.request<any[]>('/admin/guests');
  }

  async deleteAdminGuest(id: string) {
    return this.request<any>(`/admin/guests/${id}`, {
      method: 'DELETE',
    });
  }

  // Pool Configuration
  async getPoolConfig() {
    return this.request<{
      id: string;
      maxCapacity: number;
      maxHoursPerVisit: number;
      openingTime: string;
      closingTime: string;
      isActive: boolean;
    }>('/admin/pool-config');
  }

  async updatePoolConfig(data: {
    maxCapacity?: number;
    maxHoursPerVisit?: number;
    openingTime?: string;
    closingTime?: string;
    isActive?: boolean;
  }) {
    return this.request<{
      id: string;
      maxCapacity: number;
      maxHoursPerVisit: number;
      openingTime: string;
      closingTime: string;
      isActive: boolean;
    }>('/admin/pool-config', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Guests (Invitados/Huéspedes)
  async checkGuest(documentType: string, documentNumber: string) {
    return this.request<{
      exists: boolean;
      guest: {
        id: string;
        firstName: string;
        lastName: string;
        documentType: string;
        documentNumber: string;
        email: string | null;
        phone: string | null;
        departmentCode: string;
        guestType: string;
      } | null;
    }>(`/guests/check?documentType=${documentType}&documentNumber=${encodeURIComponent(documentNumber)}`);
  }

}

export const api = new ApiService();
export default api;
