import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Waves, Clock, Users, AlertCircle, Calendar, Home, Key, Plane, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { PoolAccess, PoolStats } from "../../types";

interface GuestSession {
  id: string;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  departmentCode: string;
  guestType: string;
}

interface GuestPoolAccessFormProps {
  currentGuest: GuestSession;
  poolStats: PoolStats;
  activeAccesses: PoolAccess[];
  maxHoursPerVisit?: number;
  onRegisterAccess: (access: Omit<PoolAccess, 'id' | 'entryTime' | 'expectedExitTime' | 'status'>) => void;
}

const GUEST_TYPE_INFO: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  AIRBNB: {
    label: "Huésped Airbnb",
    icon: <Plane className="h-4 w-4" />,
    color: "bg-orange-100 text-orange-700 border-orange-200"
  },
  TENANT: {
    label: "Inquilino",
    icon: <Key className="h-4 w-4" />,
    color: "bg-purple-100 text-purple-700 border-purple-200"
  },
  FRIEND: {
    label: "Invitado",
    icon: <UserCheck className="h-4 w-4" />,
    color: "bg-green-100 text-green-700 border-green-200"
  },
  RESIDENT: {
    label: "Residente",
    icon: <Home className="h-4 w-4" />,
    color: "bg-blue-100 text-blue-700 border-blue-200"
  },
};

export function GuestPoolAccessForm({
  currentGuest,
  poolStats,
  activeAccesses,
  maxHoursPerVisit = 2,
  onRegisterAccess,
}: GuestPoolAccessFormProps) {
  const isFull = poolStats.currentOccupancy >= poolStats.maxCapacity;
  const isInPool = activeAccesses.some(a => a.personId === currentGuest.id && a.status === 'active');
  const guestTypeInfo = GUEST_TYPE_INFO[currentGuest.guestType] || GUEST_TYPE_INFO.FRIEND;
  const now = new Date();

  const handleRegisterAccess = (hours: number) => {
    if (isFull) {
      toast.error("Piscina llena", {
        description: "El aforo máximo ha sido alcanzado.",
      });
      return;
    }

    if (isInPool) {
      toast.error("Ya estás en la piscina", {
        description: "Tu acceso ya fue registrado.",
      });
      return;
    }

    onRegisterAccess({
      personType: 'guest',
      personId: currentGuest.id,
      personName: `${currentGuest.firstName} ${currentGuest.lastName}`,
      departmentCode: currentGuest.departmentCode,
      guestType: currentGuest.guestType.toLowerCase(),
      estimatedHours: hours,
    });

    toast.success("Acceso registrado", {
      description: `Ingresaste a la piscina por ${hours} hora${hours !== 1 ? 's' : ''}`,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Waves className="h-5 w-5 text-blue-600" />
            Registrar Ingreso a Piscina
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(now, "EEEE d 'de' MMMM, yyyy - HH:mm", { locale: es })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Indicador de aforo */}
          <div className={`p-3 rounded-lg ${isFull ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className={`h-5 w-5 ${isFull ? 'text-red-600' : 'text-blue-600'}`} />
                <span className="font-medium">Aforo</span>
              </div>
              <Badge variant={isFull ? "destructive" : "secondary"} className="text-lg px-3 py-1">
                {poolStats.currentOccupancy} / {poolStats.maxCapacity}
              </Badge>
            </div>
            {isFull && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Capacidad máxima alcanzada</span>
              </div>
            )}
          </div>

          {/* Info del huésped */}
          <div className={`flex items-center justify-between p-4 rounded-lg border ${
            isInPool
              ? 'bg-green-50 border-green-300'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${guestTypeInfo.color}`}>
                {guestTypeInfo.icon}
              </div>
              <div>
                <p className="font-medium text-lg">
                  {currentGuest.firstName} {currentGuest.lastName}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{guestTypeInfo.label}</span>
                  <span>-</span>
                  <span>Depto {currentGuest.departmentCode}</span>
                </div>
              </div>
            </div>
            {isInPool && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                En piscina
              </Badge>
            )}
          </div>

          {isInPool ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
              <p className="text-green-700 font-medium">
                Ya estás registrado en la piscina
              </p>
              <p className="text-sm text-green-600 mt-1">
                Disfruta tu tiempo. Recuerda registrar tu salida al terminar.
              </p>
            </div>
          ) : (
            <>
              {/* Botones de tiempo */}
              <div className="pt-2 space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  Selecciona el tiempo de tu visita:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: maxHoursPerVisit }, (_, i) => i + 1).map((hour) => (
                    <Button
                      key={hour}
                      variant="outline"
                      size="lg"
                      className="h-16 text-lg hover:bg-blue-50 hover:border-blue-400"
                      disabled={isFull}
                      onClick={() => handleRegisterAccess(hour)}
                    >
                      <Clock className="h-5 w-5 mr-2" />
                      {hour} {hour === 1 ? 'Hora' : 'Horas'}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
