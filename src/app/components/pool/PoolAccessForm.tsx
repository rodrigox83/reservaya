import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Waves, Clock, UserCircle, Users, AlertCircle, UserPlus, Home, UserCheck, Key, Plane, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { PoolGuest, PoolAccess, PoolStats, User, GuestType } from "../../types";

interface PoolAccessFormProps {
  currentUser: User;
  guests: PoolGuest[];
  poolStats: PoolStats;
  activeAccesses: PoolAccess[];
  maxHoursPerVisit?: number;
  onRegisterAccess: (access: Omit<PoolAccess, 'id' | 'entryTime' | 'expectedExitTime' | 'status'>) => void;
  onAddGuest: (guest: Omit<PoolGuest, 'id' | 'createdAt'>) => void;
  onRemoveGuest: (guestId: string) => void;
}

const GUEST_TYPE_LABELS: Record<GuestType, { label: string; icon: React.ReactNode; color: string }> = {
  resident: {
    label: "Residente",
    icon: <Home className="h-3 w-3" />,
    color: "bg-blue-100 text-blue-700 border-blue-200"
  },
  friend: {
    label: "Invitado",
    icon: <UserCheck className="h-3 w-3" />,
    color: "bg-green-100 text-green-700 border-green-200"
  },
  tenant: {
    label: "Inquilino",
    icon: <Key className="h-3 w-3" />,
    color: "bg-purple-100 text-purple-700 border-purple-200"
  },
  airbnb: {
    label: "Airbnb",
    icon: <Plane className="h-3 w-3" />,
    color: "bg-orange-100 text-orange-700 border-orange-200"
  },
};

export function PoolAccessForm({
  currentUser,
  guests,
  poolStats,
  activeAccesses,
  maxHoursPerVisit = 2,
  onRegisterAccess,
  onAddGuest,
  onRemoveGuest
}: PoolAccessFormProps) {
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [estimatedHours, setEstimatedHours] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Estado para el formulario de nuevo invitado
  const [newGuestFirstName, setNewGuestFirstName] = useState("");
  const [newGuestLastName, setNewGuestLastName] = useState("");
  const [newGuestDocument, setNewGuestDocument] = useState("");
  const [newGuestType, setNewGuestType] = useState<GuestType | "">("");

  const myGuests = guests.filter(g => g.departmentCode === currentUser.departmentCode);
  const isFull = poolStats.currentOccupancy >= poolStats.maxCapacity;

  // Verificar si la persona ya está en la piscina
  const isPersonInPool = (personId: string) => {
    return activeAccesses.some(a => a.personId === personId && a.status === 'active');
  };

  const ownerInPool = isPersonInPool(currentUser.owner?.id || currentUser.departmentCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPerson || !estimatedHours) {
      toast.error("Selecciona una persona y el tiempo estimado");
      return;
    }

    if (isFull) {
      toast.error("Piscina llena", {
        description: "El aforo máximo ha sido alcanzado. Intenta más tarde.",
      });
      return;
    }

    const isOwner = selectedPerson === "owner";
    let personName = "";
    let personId = "";
    let guestType = undefined;

    if (isOwner) {
      personName = currentUser.owner
        ? `${currentUser.owner.firstName} ${currentUser.owner.lastName}`
        : `Propietario ${currentUser.departmentCode}`;
      personId = currentUser.owner?.id || currentUser.departmentCode;
    } else {
      const guest = myGuests.find(g => g.id === selectedPerson);
      if (!guest) {
        toast.error("Invitado no encontrado");
        return;
      }
      personName = `${guest.firstName} ${guest.lastName}`;
      personId = guest.id;
      guestType = guest.guestType;
    }

    if (isPersonInPool(personId)) {
      toast.error("Ya en la piscina", {
        description: `${personName} ya tiene un acceso activo`,
      });
      return;
    }

    onRegisterAccess({
      personType: isOwner ? 'owner' : 'guest',
      personId,
      personName,
      departmentCode: currentUser.departmentCode,
      guestType,
      estimatedHours: parseInt(estimatedHours),
    });

    setSelectedPerson("");
    setEstimatedHours("");

    toast.success("Acceso registrado", {
      description: `${personName} ha ingresado a la piscina por ${estimatedHours} hora${parseInt(estimatedHours) !== 1 ? 's' : ''}`,
    });
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newGuestFirstName || !newGuestLastName || !newGuestType) {
      toast.error("Completa los campos requeridos");
      return;
    }

    onAddGuest({
      firstName: newGuestFirstName,
      lastName: newGuestLastName,
      documentNumber: newGuestDocument || undefined,
      guestType: newGuestType as GuestType,
      departmentCode: currentUser.departmentCode,
      registeredBy: currentUser.owner?.id || currentUser.departmentCode,
    });

    // Limpiar formulario y cerrar diálogo
    setNewGuestFirstName("");
    setNewGuestLastName("");
    setNewGuestDocument("");
    setNewGuestType("");
    setDialogOpen(false);

    toast.success("Invitado registrado", {
      description: `${newGuestFirstName} ${newGuestLastName} ha sido agregado`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Waves className="h-5 w-5 text-blue-600" />
            Registrar Acceso a Piscina
          </CardTitle>
          <CardDescription>
            Registra tu ingreso o el de tus invitados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Indicador de aforo */}
          <div className={`mb-6 p-4 rounded-lg ${isFull ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className={`h-5 w-5 ${isFull ? 'text-red-600' : 'text-blue-600'}`} />
                <span className="font-medium">Aforo actual</span>
              </div>
              <Badge variant={isFull ? "destructive" : "secondary"} className="text-lg px-3 py-1">
                {poolStats.currentOccupancy} / {poolStats.maxCapacity}
              </Badge>
            </div>
            {isFull && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>La piscina ha alcanzado su capacidad máxima</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="person">¿Quién ingresa?</Label>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Agregar invitado
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Registrar Nuevo Invitado
                      </DialogTitle>
                      <DialogDescription>
                        Agrega una persona para que pueda acceder a la piscina contigo
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddGuest} className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="guestFirstName">Nombre *</Label>
                          <Input
                            id="guestFirstName"
                            value={newGuestFirstName}
                            onChange={(e) => setNewGuestFirstName(e.target.value)}
                            placeholder="Nombre"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guestLastName">Apellido *</Label>
                          <Input
                            id="guestLastName"
                            value={newGuestLastName}
                            onChange={(e) => setNewGuestLastName(e.target.value)}
                            placeholder="Apellido"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="guestDocument">Documento (opcional)</Label>
                          <Input
                            id="guestDocument"
                            value={newGuestDocument}
                            onChange={(e) => setNewGuestDocument(e.target.value)}
                            placeholder="DNI"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guestType">Tipo *</Label>
                          <Select value={newGuestType} onValueChange={(v) => setNewGuestType(v as GuestType)}>
                            <SelectTrigger id="guestType">
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="resident">
                                <div className="flex items-center gap-2">
                                  <Home className="h-4 w-4" />
                                  Residente
                                </div>
                              </SelectItem>
                              <SelectItem value="friend">
                                <div className="flex items-center gap-2">
                                  <UserCheck className="h-4 w-4" />
                                  Amigo/Invitado
                                </div>
                              </SelectItem>
                              <SelectItem value="tenant">
                                <div className="flex items-center gap-2">
                                  <Key className="h-4 w-4" />
                                  Inquilino
                                </div>
                              </SelectItem>
                              <SelectItem value="airbnb">
                                <div className="flex items-center gap-2">
                                  <Plane className="h-4 w-4" />
                                  Huésped Airbnb
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button type="submit" className="w-full">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Agregar Invitado
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <Select value={selectedPerson} onValueChange={setSelectedPerson} disabled={isFull}>
                <SelectTrigger id="person">
                  <SelectValue placeholder="Selecciona una persona" />
                </SelectTrigger>
                <SelectContent>
                  {/* Propietario */}
                  <SelectItem value="owner" disabled={ownerInPool}>
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4" />
                      <span>
                        {currentUser.owner
                          ? `${currentUser.owner.firstName} ${currentUser.owner.lastName} (Yo)`
                          : `Propietario - ${currentUser.departmentCode}`
                        }
                      </span>
                      {ownerInPool && <Badge variant="secondary" className="ml-2">En piscina</Badge>}
                    </div>
                  </SelectItem>

                  {/* Invitados */}
                  {myGuests.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                        Mis Invitados ({myGuests.length})
                      </div>
                      {myGuests.map((guest) => {
                        const inPool = isPersonInPool(guest.id);
                        const typeInfo = GUEST_TYPE_LABELS[guest.guestType];
                        return (
                          <SelectItem key={guest.id} value={guest.id} disabled={inPool}>
                            <div className="flex items-center gap-2">
                              {typeInfo.icon}
                              <span>{guest.firstName} {guest.lastName}</span>
                              {inPool && <Badge variant="secondary" className="ml-2">En piscina</Badge>}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours">Tiempo estimado de uso</Label>
              <Select value={estimatedHours} onValueChange={setEstimatedHours} disabled={isFull}>
                <SelectTrigger id="hours">
                  <SelectValue placeholder="¿Cuántas horas?" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxHoursPerVisit }, (_, i) => i + 1).map((hour) => (
                    <SelectItem key={hour} value={hour.toString()}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {hour} {hour === 1 ? 'hora' : 'horas'}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isFull || !selectedPerson || !estimatedHours}>
              <Waves className="h-4 w-4 mr-2" />
              {isFull ? "Piscina Llena" : "Registrar Ingreso"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de invitados registrados */}
      {myGuests.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Mis Invitados Registrados ({myGuests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myGuests.map((guest) => {
                const typeInfo = GUEST_TYPE_LABELS[guest.guestType];
                const inPool = isPersonInPool(guest.id);
                return (
                  <div
                    key={guest.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{guest.firstName} {guest.lastName}</span>
                      <Badge variant="outline" className={`text-xs ${typeInfo.color}`}>
                        {typeInfo.icon}
                        <span className="ml-1">{typeInfo.label}</span>
                      </Badge>
                      {inPool && (
                        <Badge variant="secondary" className="text-xs">En piscina</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveGuest(guest.id)}
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={inPool}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
