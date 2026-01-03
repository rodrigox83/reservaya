export interface Grill {
  id: string;
  name: string;
  description: string;
  capacity: number;
  location: string;
  tower: "A" | "B";
}

export interface Reservation {
  id: string;
  grillId: string;
  grillName: string;
  date: string;
  departmentCode: string; // Format: 603A
  userName?: string;
  notes?: string;
  status: "available" | "pending" | "approved" | "rejected";
  requestedAt: string; // ISO timestamp for ordering
}

export interface Owner {
  id?: string;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  phone: string;
  departmentCode: string;
}

export interface User {
  id?: string;
  tower: string;
  floor: number;
  apartment: number;
  departmentCode: string; // Format: 603A
  role?: 'USER' | 'ADMIN';
  owner?: Owner;
}

export interface DashboardStats {
  totalOwners: number;
  totalReservations: number;
  pendingReservations: number;
  approvedReservations: number;
  rejectedReservations: number;
  totalGrills: number;
}

// Tipos para el módulo de piscina
export type GuestType = 'resident' | 'friend' | 'tenant' | 'airbnb';

export interface PoolGuest {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber?: string;
  guestType: GuestType;
  departmentCode: string; // Departamento del propietario que lo registra
  registeredBy: string; // ID o código del propietario
  createdAt: string;
}

export interface PoolAccess {
  id: string;
  personType: 'owner' | 'guest';
  personId: string; // ID del propietario o invitado
  personName: string;
  departmentCode: string;
  guestType?: GuestType;
  entryTime: string; // ISO timestamp
  estimatedHours: number;
  expectedExitTime: string; // ISO timestamp calculado
  actualExitTime?: string; // ISO timestamp cuando sale
  status: 'active' | 'completed';
}

export interface PoolConfig {
  maxCapacity: number;
  openingTime: string; // "08:00"
  closingTime: string; // "22:00"
}

export interface PoolStats {
  currentOccupancy: number;
  maxCapacity: number;
  todayEntries: number;
  activeOwners: number;
  activeGuests: number;
}