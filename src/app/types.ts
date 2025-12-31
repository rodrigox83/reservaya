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
  email: string;
  phone: string;
  departmentCode: string;
}

export interface User {
  tower: string;
  floor: number;
  apartment: number;
  departmentCode: string; // Format: 603A
  owner?: Owner;
}