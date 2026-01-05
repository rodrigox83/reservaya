import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Users, UserPlus } from "lucide-react";
import { OwnersDirectory } from "./OwnersDirectory";
import { GuestsDirectory } from "./GuestsDirectory";
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
  mockOwners = [],
}: AdminViewProps) {
  return (
    <Tabs defaultValue="owners" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="owners" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Propietarios</span>
        </TabsTrigger>
        <TabsTrigger value="guests" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Huéspedes</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="owners">
        <OwnersDirectory useMockData={useMockData} mockOwners={mockOwners} />
      </TabsContent>

      <TabsContent value="guests">
        <GuestsDirectory useMockData={useMockData} />
      </TabsContent>
    </Tabs>
  );
}
