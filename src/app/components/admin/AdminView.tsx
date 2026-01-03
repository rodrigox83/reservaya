import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { LayoutDashboard, Clock, Users } from "lucide-react";
import { AdminDashboard } from "./AdminDashboard";
import { PendingReservations } from "./PendingReservations";
import { OwnersDirectory } from "./OwnersDirectory";
import type { Reservation, Owner } from "../../types";

type StaffRole = 'ADMIN' | 'RECEPTIONIST';

interface AdminViewProps {
  useMockData?: boolean;
  mockReservations?: Reservation[];
  mockOwners?: Owner[];
  onApproveReservation?: (id: string) => void;
  onRejectReservation?: (id: string) => void;
  staffRole?: StaffRole;
}

export function AdminView({
  useMockData = true,
  mockReservations = [],
  mockOwners = [],
  onApproveReservation,
  onRejectReservation,
  staffRole = 'ADMIN',
}: AdminViewProps) {
  const isAdmin = staffRole === 'ADMIN';

  return (
    <Tabs defaultValue="dashboard" className="space-y-6">
      <TabsList className={`grid w-full max-w-lg ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <TabsTrigger value="dashboard" className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </TabsTrigger>
        {isAdmin && (
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Pendientes</span>
          </TabsTrigger>
        )}
        <TabsTrigger value="owners" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Propietarios</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <AdminDashboard useMockData={useMockData} />
      </TabsContent>

      {isAdmin && (
        <TabsContent value="pending">
          <PendingReservations
            useMockData={useMockData}
            mockReservations={mockReservations}
            onApprove={onApproveReservation}
            onReject={onRejectReservation}
          />
        </TabsContent>
      )}

      <TabsContent value="owners">
        <OwnersDirectory useMockData={useMockData} mockOwners={mockOwners} />
      </TabsContent>
    </Tabs>
  );
}
