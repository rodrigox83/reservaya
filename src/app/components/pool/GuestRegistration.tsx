import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { UserPlus, Users, Trash2, Home, UserCheck, Key, Plane } from "lucide-react";
import { toast } from "sonner";
import type { PoolGuest, GuestType, User } from "../../types";

interface GuestRegistrationProps {
  guests: PoolGuest[];
  currentUser: User;
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
    label: "Amigo/Invitado",
    icon: <UserCheck className="h-3 w-3" />,
    color: "bg-green-100 text-green-700 border-green-200"
  },
  tenant: {
    label: "Inquilino",
    icon: <Key className="h-3 w-3" />,
    color: "bg-purple-100 text-purple-700 border-purple-200"
  },
  airbnb: {
    label: "Huésped Airbnb",
    icon: <Plane className="h-3 w-3" />,
    color: "bg-orange-100 text-orange-700 border-orange-200"
  },
};

export function GuestRegistration({
  guests,
  currentUser,
  onAddGuest,
  onRemoveGuest
}: GuestRegistrationProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [guestType, setGuestType] = useState<GuestType | "">("");

  const myGuests = guests.filter(g => g.departmentCode === currentUser.departmentCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !guestType) {
      toast.error("Completa los campos requeridos");
      return;
    }

    onAddGuest({
      firstName,
      lastName,
      documentNumber: documentNumber || undefined,
      guestType: guestType as GuestType,
      departmentCode: currentUser.departmentCode,
      registeredBy: currentUser.owner?.id || currentUser.departmentCode,
    });

    // Limpiar formulario
    setFirstName("");
    setLastName("");
    setDocumentNumber("");
    setGuestType("");

    toast.success("Invitado registrado", {
      description: `${firstName} ${lastName} ha sido agregado a tu lista de invitados`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Formulario de registro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Registrar Nuevo Invitado
          </CardTitle>
          <CardDescription>
            Registra las personas que pueden acceder a la piscina contigo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nombre del invitado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Apellido del invitado"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentNumber">Documento (opcional)</Label>
                <Input
                  id="documentNumber"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="DNI o documento"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestType">Tipo de invitado *</Label>
                <Select value={guestType} onValueChange={(v) => setGuestType(v as GuestType)}>
                  <SelectTrigger id="guestType">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resident">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Residente (vive en el depto)
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

            <Button type="submit" className="w-full md:w-auto">
              <UserPlus className="h-4 w-4 mr-2" />
              Registrar Invitado
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de invitados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mis Invitados Registrados
          </CardTitle>
          <CardDescription>
            {myGuests.length} invitado{myGuests.length !== 1 ? 's' : ''} registrado{myGuests.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myGuests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tienes invitados registrados</p>
              <p className="text-sm">Registra invitados para que puedan acceder a la piscina</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myGuests.map((guest) => {
                const typeInfo = GUEST_TYPE_LABELS[guest.guestType];
                return (
                  <div
                    key={guest.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">
                          {guest.firstName[0]}{guest.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {guest.firstName} {guest.lastName}
                        </p>
                        {guest.documentNumber && (
                          <p className="text-sm text-muted-foreground">
                            Doc: {guest.documentNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={typeInfo.color}>
                        {typeInfo.icon}
                        <span className="ml-1">{typeInfo.label}</span>
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveGuest(guest.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
