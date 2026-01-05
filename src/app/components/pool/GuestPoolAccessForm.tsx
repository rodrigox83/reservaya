import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Waves, Clock, Users, AlertCircle, Calendar, Home, Key, Plane, UserCheck, UserPlus, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { PoolAccess, PoolStats, PoolGuest, GuestType } from "../../types";

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
  companions: PoolGuest[];
  maxHoursPerVisit?: number;
  onRegisterAccess: (access: Omit<PoolAccess, 'id' | 'entryTime' | 'expectedExitTime' | 'status'>) => void;
  onAddCompanion: (guest: Omit<PoolGuest, 'id' | 'createdAt'>) => void;
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

// Tipos de acompañante permitidos para huéspedes
const ALLOWED_COMPANION_TYPES: { value: GuestType; label: string; icon: React.ReactNode }[] = [
  { value: 'airbnb', label: 'Huésped Airbnb', icon: <Plane className="h-4 w-4" /> },
  { value: 'friend', label: 'Invitado/Amigo', icon: <UserCheck className="h-4 w-4" /> },
];

export function GuestPoolAccessForm({
  currentGuest,
  poolStats,
  activeAccesses,
  companions,
  maxHoursPerVisit = 2,
  onRegisterAccess,
  onAddCompanion,
}: GuestPoolAccessFormProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCompanionFirstName, setNewCompanionFirstName] = useState("");
  const [newCompanionLastName, setNewCompanionLastName] = useState("");
  const [newCompanionDocument, setNewCompanionDocument] = useState("");
  const [newCompanionType, setNewCompanionType] = useState<GuestType | "">("");

  const isFull = poolStats.currentOccupancy >= poolStats.maxCapacity;
  const myAccess = activeAccesses.find(a => a.personId === currentGuest.id && a.status === 'active');
  const isInPool = !!myAccess;
  const guestTypeInfo = GUEST_TYPE_INFO[currentGuest.guestType] || GUEST_TYPE_INFO.FRIEND;
  const now = new Date();

  // Filtrar acompañantes del mismo departamento
  const myCompanions = companions.filter(c => c.departmentCode === currentGuest.departmentCode);

  // Verificar si un acompañante está en la piscina
  const isCompanionInPool = (companionId: string) => {
    return activeAccesses.some(a => a.personId === companionId && a.status === 'active');
  };

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

  const handleRegisterCompanionAccess = (companionId: string, hours: number) => {
    const companion = myCompanions.find(c => c.id === companionId);
    if (!companion) return;

    if (isFull) {
      toast.error("Piscina llena", {
        description: "El aforo máximo ha sido alcanzado.",
      });
      return;
    }

    onRegisterAccess({
      personType: 'guest',
      personId: companion.id,
      personName: `${companion.firstName} ${companion.lastName}`,
      departmentCode: currentGuest.departmentCode,
      guestType: companion.guestType,
      estimatedHours: hours,
    });

    toast.success("Acceso registrado", {
      description: `${companion.firstName} ingresó a la piscina por ${hours} hora${hours !== 1 ? 's' : ''}`,
    });
  };

  const handleAddCompanion = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCompanionFirstName || !newCompanionLastName || !newCompanionType) {
      toast.error("Completa los campos requeridos");
      return;
    }

    onAddCompanion({
      firstName: newCompanionFirstName,
      lastName: newCompanionLastName,
      documentNumber: newCompanionDocument || undefined,
      guestType: newCompanionType as GuestType,
      departmentCode: currentGuest.departmentCode,
      registeredBy: currentGuest.id,
    });

    // Limpiar formulario y cerrar diálogo
    setNewCompanionFirstName("");
    setNewCompanionLastName("");
    setNewCompanionDocument("");
    setNewCompanionType("");
    setDialogOpen(false);

    toast.success("Acompañante registrado", {
      description: `${newCompanionFirstName} ${newCompanionLastName} ha sido agregado`,
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

          {isInPool && myAccess ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-3">
              <p className="text-green-700 font-medium text-center">
                Ya estás registrado en la piscina
              </p>

              {/* Mostrar hora de entrada y salida esperada */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/60 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    <LogIn className="h-4 w-4" />
                    <span className="text-xs font-medium">Entrada</span>
                  </div>
                  <p className="text-lg font-bold text-green-800">
                    {format(new Date(myAccess.entryTime), "HH:mm", { locale: es })}
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    <LogOut className="h-4 w-4" />
                    <span className="text-xs font-medium">Salida esperada</span>
                  </div>
                  <p className="text-lg font-bold text-green-800">
                    {format(new Date(myAccess.expectedExitTime), "HH:mm", { locale: es })}
                  </p>
                </div>
              </div>

              <p className="text-sm text-green-600 text-center">
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

      {/* Card de acompañantes - solo para Airbnb o Friend */}
      {(currentGuest.guestType === 'AIRBNB' || currentGuest.guestType === 'FRIEND') && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                  Mis Acompañantes
                </CardTitle>
                <CardDescription>
                  Registra personas que te acompañan
                </CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Agregar Acompañante
                    </DialogTitle>
                    <DialogDescription>
                      Registra a una persona que te acompaña a la piscina
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCompanion} className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companionFirstName">Nombre *</Label>
                        <Input
                          id="companionFirstName"
                          value={newCompanionFirstName}
                          onChange={(e) => setNewCompanionFirstName(e.target.value)}
                          placeholder="Nombre"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companionLastName">Apellido *</Label>
                        <Input
                          id="companionLastName"
                          value={newCompanionLastName}
                          onChange={(e) => setNewCompanionLastName(e.target.value)}
                          placeholder="Apellido"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companionDocument">Documento (opcional)</Label>
                        <Input
                          id="companionDocument"
                          value={newCompanionDocument}
                          onChange={(e) => setNewCompanionDocument(e.target.value)}
                          placeholder="DNI"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companionType">Tipo *</Label>
                        <Select value={newCompanionType} onValueChange={(v) => setNewCompanionType(v as GuestType)}>
                          <SelectTrigger id="companionType">
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            {ALLOWED_COMPANION_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  {type.icon}
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Agregar Acompañante
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {myCompanions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tienes acompañantes registrados. Usa el botón "Agregar" para crear uno.
              </p>
            ) : (
              myCompanions.map((companion) => {
                const typeInfo = GUEST_TYPE_INFO[companion.guestType.toUpperCase()] || GUEST_TYPE_INFO.FRIEND;
                const inPool = isCompanionInPool(companion.id);
                const companionAccess = activeAccesses.find(a => a.personId === companion.id && a.status === 'active');

                return (
                  <div
                    key={companion.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      inPool
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded ${typeInfo.color}`}>
                          {typeInfo.icon}
                        </div>
                        <div>
                          <p className="font-medium">{companion.firstName} {companion.lastName}</p>
                          <p className="text-xs text-muted-foreground">{typeInfo.label}</p>
                        </div>
                      </div>
                      {inPool && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                          En piscina
                        </Badge>
                      )}
                    </div>

                    {inPool && companionAccess ? (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/60 rounded p-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-green-600">
                            <LogIn className="h-3 w-3" />
                            <span>Entrada</span>
                          </div>
                          <p className="font-bold text-green-800">
                            {format(new Date(companionAccess.entryTime), "HH:mm")}
                          </p>
                        </div>
                        <div className="bg-white/60 rounded p-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-green-600">
                            <LogOut className="h-3 w-3" />
                            <span>Salida</span>
                          </div>
                          <p className="font-bold text-green-800">
                            {format(new Date(companionAccess.expectedExitTime), "HH:mm")}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex gap-2">
                        {Array.from({ length: maxHoursPerVisit }, (_, i) => i + 1).map((hour) => (
                          <Button
                            key={hour}
                            variant="outline"
                            size="sm"
                            className="flex-1 hover:bg-blue-50 hover:border-blue-400"
                            disabled={isFull}
                            onClick={() => handleRegisterCompanionAccess(companion.id, hour)}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {hour}h
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
