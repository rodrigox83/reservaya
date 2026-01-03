import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Waves, Users } from "lucide-react";
import { PoolAccessForm } from "./PoolAccessForm";
import { PoolOccupancy } from "./PoolOccupancy";
import type { PoolGuest, PoolAccess, PoolStats, User } from "../../types";

interface PoolAccessViewProps {
  currentUser: User;
  guests: PoolGuest[];
  activeAccesses: PoolAccess[];
  poolStats: PoolStats;
  onAddGuest: (guest: Omit<PoolGuest, 'id' | 'createdAt'>) => void;
  onRemoveGuest: (guestId: string) => void;
  onRegisterAccess: (access: Omit<PoolAccess, 'id' | 'entryTime' | 'expectedExitTime' | 'status'>) => void;
  onMarkExit: (accessId: string) => void;
}

export function PoolAccessView({
  currentUser,
  guests,
  activeAccesses,
  poolStats,
  onAddGuest,
  onRemoveGuest,
  onRegisterAccess,
  onMarkExit
}: PoolAccessViewProps) {
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Waves className="h-6 w-6 text-blue-600" />
          Acceso a Piscina
        </h2>
        <p className="text-muted-foreground">
          Registra tu acceso y gestiona tus invitados
        </p>
      </div>

      <Tabs defaultValue="access" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="access" className="flex items-center gap-2">
            <Waves className="h-4 w-4" />
            <span>Ingresar</span>
          </TabsTrigger>
          <TabsTrigger value="occupancy" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Aforo</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="access">
          <PoolAccessForm
            currentUser={currentUser}
            guests={guests}
            poolStats={poolStats}
            activeAccesses={activeAccesses}
            onRegisterAccess={onRegisterAccess}
            onAddGuest={onAddGuest}
            onRemoveGuest={onRemoveGuest}
          />
        </TabsContent>

        <TabsContent value="occupancy">
          <PoolOccupancy
            poolStats={poolStats}
            activeAccesses={activeAccesses}
            onMarkExit={onMarkExit}
            currentUserDepartment={currentUser.departmentCode}
            isAdmin={isAdmin}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
