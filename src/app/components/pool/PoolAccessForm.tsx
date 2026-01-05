import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Waves, Clock, UserCircle, Users, AlertCircle, UserPlus, Home, UserCheck, Key, Plane, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
  const [selectedPersons, setSelectedPersons] = useState<Set<string>>(new Set());
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

  const ownerInPool = isPersonInPool(currentUser.id || currentUser.departmentCode);

  const togglePerson = (personId: string) => {
    const newSelected = new Set(selectedPersons);
    if (newSelected.has(personId)) {
      newSelected.delete(personId);
    } else {
      newSelected.add(personId);
    }
    setSelectedPersons(newSelected);
  };

  const handleRegisterAccess = (hours: number) => {
    if (selectedPersons.size === 0) {
      toast.error("Selecciona al menos una persona");
      return;
    }

    if (isFull) {
      toast.error("Piscina llena", {
        description: "El aforo máximo ha sido alcanzado.",
      });
      return;
    }

    const spotsNeeded = selectedPersons.size;
    const availableSpots = poolStats.maxCapacity - poolStats.currentOccupancy;

    if (spotsNeeded > availableSpots) {
      toast.error("No hay suficientes lugares", {
        description: `Solo hay ${availableSpots} lugar${availableSpots !== 1 ? 'es' : ''} disponible${availableSpots !== 1 ? 's' : ''}.`,
      });
      return;
    }

    let registeredCount = 0;

    selectedPersons.forEach(personId => {
      const isOwner = personId === "owner";
      let personName = "";
      let guestType = undefined;
      let actualPersonId = personId;

      if (isOwner) {
        personName = currentUser.owner
          ? `${currentUser.owner.firstName} ${currentUser.owner.lastName}`
          : `Propietario ${currentUser.departmentCode}`;
        actualPersonId = currentUser.id || currentUser.departmentCode;
      } else {
        const guest = myGuests.find(g => g.id === personId);
        if (!guest) return;
        personName = `${guest.firstName} ${guest.lastName}`;
        guestType = guest.guestType;
      }

      onRegisterAccess({
        personType: isOwner ? 'owner' : 'guest',
        personId: actualPersonId,
        personName,
        departmentCode: currentUser.departmentCode,
        guestType,
        estimatedHours: hours,
      });
      registeredCount++;
    });

    setSelectedPersons(new Set());

    toast.success("Acceso registrado", {
      description: `${registeredCount} persona${registeredCount !== 1 ? 's' : ''} ingresaron por ${hours} hora${hours !== 1 ? 's' : ''}`,
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

  const now = new Date();

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

          {/* Lista de personas con switches */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Selecciona quién ingresa</Label>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Registrar Nuevo Invitado
                    </DialogTitle>
                    <DialogDescription>
                      Agrega una persona para que pueda acceder a la piscina
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

            {/* Propietario */}
            <div
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                ownerInPool
                  ? 'bg-gray-100 border-gray-200 opacity-60'
                  : selectedPersons.has("owner")
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">
                    {currentUser.owner
                      ? `${currentUser.owner.firstName} ${currentUser.owner.lastName}`
                      : `Propietario`
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">Depto {currentUser.departmentCode}</p>
                </div>
                {ownerInPool && (
                  <Badge variant="secondary" className="text-xs">En piscina</Badge>
                )}
              </div>
              <Switch
                checked={selectedPersons.has("owner")}
                onCheckedChange={() => togglePerson("owner")}
                disabled={ownerInPool || isFull}
              />
            </div>

            {/* Invitados */}
            {myGuests.map((guest) => {
              const typeInfo = GUEST_TYPE_LABELS[guest.guestType];
              const inPool = isPersonInPool(guest.id);
              return (
                <div
                  key={guest.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    inPool
                      ? 'bg-gray-100 border-gray-200 opacity-60'
                      : selectedPersons.has(guest.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded ${typeInfo.color}`}>
                      {typeInfo.icon}
                    </div>
                    <div>
                      <p className="font-medium">{guest.firstName} {guest.lastName}</p>
                      <p className="text-xs text-muted-foreground">{typeInfo.label}</p>
                    </div>
                    {inPool && (
                      <Badge variant="secondary" className="text-xs">En piscina</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveGuest(guest.id)}
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      disabled={inPool}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Switch
                      checked={selectedPersons.has(guest.id)}
                      onCheckedChange={() => togglePerson(guest.id)}
                      disabled={inPool || isFull}
                    />
                  </div>
                </div>
              );
            })}

            {myGuests.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                No tienes invitados registrados. Usa el botón "Agregar" para crear uno.
              </p>
            )}
          </div>

          {/* Botones de tiempo */}
          <div className="pt-2 space-y-2">
            <Label className="text-sm text-muted-foreground">
              {selectedPersons.size > 0
                ? `Registrar ${selectedPersons.size} persona${selectedPersons.size !== 1 ? 's' : ''} por:`
                : 'Selecciona personas y elige el tiempo:'
              }
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: maxHoursPerVisit }, (_, i) => i + 1).map((hour) => (
                <Button
                  key={hour}
                  variant="outline"
                  size="lg"
                  className={`h-14 text-lg ${selectedPersons.size > 0 ? 'hover:bg-blue-50 hover:border-blue-400' : ''}`}
                  disabled={isFull || selectedPersons.size === 0}
                  onClick={() => handleRegisterAccess(hour)}
                >
                  <Clock className="h-5 w-5 mr-2" />
                  {hour} {hour === 1 ? 'Hora' : 'Horas'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
