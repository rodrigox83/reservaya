import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Users, Clock, LogOut, UserCircle, Home, UserCheck, Key, Plane } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { es } from "date-fns/locale";
import type { PoolAccess, PoolStats, GuestType } from "../../types";

interface PoolOccupancyProps {
  poolStats: PoolStats;
  activeAccesses: PoolAccess[];
  onMarkExit: (accessId: string) => void;
  currentUserDepartment: string;
  isAdmin?: boolean;
}

const GUEST_TYPE_CONFIG: Record<GuestType, { label: string; icon: React.ReactNode; color: string }> = {
  resident: {
    label: "Residente",
    icon: <Home className="h-3 w-3" />,
    color: "bg-blue-100 text-blue-700"
  },
  friend: {
    label: "Invitado",
    icon: <UserCheck className="h-3 w-3" />,
    color: "bg-green-100 text-green-700"
  },
  tenant: {
    label: "Inquilino",
    icon: <Key className="h-3 w-3" />,
    color: "bg-purple-100 text-purple-700"
  },
  airbnb: {
    label: "Airbnb",
    icon: <Plane className="h-3 w-3" />,
    color: "bg-orange-100 text-orange-700"
  },
};

function getTimeRemaining(expectedExitTime: string): { text: string; isOvertime: boolean } {
  const now = new Date();
  const exit = new Date(expectedExitTime);
  const diffMinutes = differenceInMinutes(exit, now);

  if (diffMinutes < 0) {
    return { text: `${Math.abs(diffMinutes)} min excedido`, isOvertime: true };
  } else if (diffMinutes < 60) {
    return { text: `${diffMinutes} min restantes`, isOvertime: false };
  } else {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return { text: `${hours}h ${mins}m restantes`, isOvertime: false };
  }
}

export function PoolOccupancy({
  poolStats,
  activeAccesses,
  onMarkExit,
  currentUserDepartment,
  isAdmin = false
}: PoolOccupancyProps) {
  const occupancyPercentage = (poolStats.currentOccupancy / poolStats.maxCapacity) * 100;

  const getOccupancyColor = () => {
    if (occupancyPercentage >= 90) return "bg-red-500";
    if (occupancyPercentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Panel de estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aforo Actual</p>
                <p className="text-2xl font-bold">{poolStats.currentOccupancy}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Capacidad</p>
                <p className="text-2xl font-bold">{poolStats.maxCapacity}</p>
              </div>
              <div className={`w-8 h-8 rounded-full ${getOccupancyColor()} flex items-center justify-center`}>
                <span className="text-white text-xs font-bold">
                  {Math.round(occupancyPercentage)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Propietarios</p>
                <p className="text-2xl font-bold">{poolStats.activeOwners}</p>
              </div>
              <UserCircle className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Invitados</p>
                <p className="text-2xl font-bold">{poolStats.activeGuests}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de ocupación */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Ocupación de la piscina</span>
              <span className="font-medium">{poolStats.currentOccupancy} de {poolStats.maxCapacity} personas</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getOccupancyColor()}`}
                style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className={occupancyPercentage >= 70 ? "text-yellow-600 font-medium" : ""}>70%</span>
              <span className={occupancyPercentage >= 90 ? "text-red-600 font-medium" : ""}>90%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de personas en la piscina */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Personas en la Piscina
          </CardTitle>
          <CardDescription>
            {activeAccesses.length === 0
              ? "No hay nadie en la piscina actualmente"
              : `${activeAccesses.length} persona${activeAccesses.length !== 1 ? 's' : ''} actualmente`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeAccesses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>La piscina está vacía</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAccesses.map((access) => {
                const timeInfo = getTimeRemaining(access.expectedExitTime);
                const canMarkExit = isAdmin || access.departmentCode === currentUserDepartment;
                const guestConfig = access.guestType ? GUEST_TYPE_CONFIG[access.guestType] : null;

                return (
                  <div
                    key={access.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      timeInfo.isOvertime ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        access.personType === 'owner' ? 'bg-indigo-100' : 'bg-green-100'
                      }`}>
                        {access.personType === 'owner' ? (
                          <UserCircle className="h-5 w-5 text-indigo-600" />
                        ) : (
                          <Users className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{access.personName}</p>
                          {guestConfig && (
                            <Badge variant="outline" className={guestConfig.color}>
                              {guestConfig.icon}
                              <span className="ml-1">{guestConfig.label}</span>
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>Depto: {access.departmentCode}</span>
                          <span>•</span>
                          <span>Ingreso: {format(new Date(access.entryTime), "HH:mm", { locale: es })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1 text-sm ${
                        timeInfo.isOvertime ? 'text-red-600 font-medium' : 'text-muted-foreground'
                      }`}>
                        <Clock className="h-4 w-4" />
                        <span>{timeInfo.text}</span>
                      </div>

                      {canMarkExit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMarkExit(access.id)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          <LogOut className="h-4 w-4 mr-1" />
                          Salir
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
