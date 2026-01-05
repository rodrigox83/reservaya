import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Waves, Users } from "lucide-react";
import { PoolAccessForm } from "./PoolAccessForm";
import { GuestPoolAccessForm } from "./GuestPoolAccessForm";
import { PoolOccupancy } from "./PoolOccupancy";
import type { PoolGuest, PoolAccess, PoolStats, User } from "../../types";

interface GuestSession {
  id: string;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  departmentCode: string;
  guestType: string;
}

interface PoolAccessViewProps {
  currentUser: User | null;
  currentGuest?: GuestSession | null;
  guests: PoolGuest[];
  activeAccesses: PoolAccess[];
  poolStats: PoolStats;
  maxHoursPerVisit?: number;
  onAddGuest: (guest: Omit<PoolGuest, 'id' | 'createdAt'>) => void;
  onRemoveGuest: (guestId: string) => void;
  onRegisterAccess: (access: Omit<PoolAccess, 'id' | 'entryTime' | 'expectedExitTime' | 'status'>) => void;
  onMarkExit: (accessId: string) => void;
  isStaffMode?: boolean;
}

export function PoolAccessView({
  currentUser,
  currentGuest,
  guests,
  activeAccesses,
  poolStats,
  maxHoursPerVisit = 2,
  onAddGuest,
  onRemoveGuest,
  onRegisterAccess,
  onMarkExit,
  isStaffMode = false
}: PoolAccessViewProps) {
  const isAdmin = isStaffMode || currentUser?.role === 'ADMIN';

  // Si es staff, mostrar solo vista de ocupación/aforo
  if (isStaffMode) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Waves className="h-6 w-6 text-blue-600" />
            Control de Piscina
          </h2>
          <p className="text-muted-foreground">
            Gestiona el aforo y registra salidas
          </p>
        </div>

        <PoolOccupancy
          poolStats={poolStats}
          activeAccesses={activeAccesses}
          onMarkExit={onMarkExit}
          currentUserDepartment="STAFF"
          isAdmin={true}
        />
      </div>
    );
  }

  // Si es guest (huésped), mostrar formulario simplificado solo para ellos
  if (currentGuest) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Waves className="h-6 w-6 text-blue-600" />
            Acceso a Piscina
          </h2>
          <p className="text-muted-foreground">
            Registra tu ingreso a la piscina
          </p>
        </div>

        <GuestPoolAccessForm
          currentGuest={currentGuest}
          poolStats={poolStats}
          activeAccesses={activeAccesses}
          companions={guests}
          maxHoursPerVisit={maxHoursPerVisit}
          onRegisterAccess={onRegisterAccess}
          onAddCompanion={onAddGuest}
        />
      </div>
    );
  }

  // Si no hay usuario ni guest, mostrar mensaje
  if (!currentUser) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Waves className="h-6 w-6 text-blue-600" />
            Acceso a Piscina
          </h2>
          <p className="text-muted-foreground">
            Inicia sesión para acceder
          </p>
        </div>
      </div>
    );
  }

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
            maxHoursPerVisit={maxHoursPerVisit}
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
