import { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Users, Search, Trash2, Plane, UserCheck, Key, Loader2, Home, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import type { Guest } from "../../types";
import api from "../../services/api";

interface GuestsDirectoryProps {
  useMockData?: boolean;
}

const GUEST_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  AIRBNB: {
    label: "Airbnb",
    icon: <Plane className="h-3 w-3" />,
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  FRIEND: {
    label: "Familiar/Amigo",
    icon: <UserCheck className="h-3 w-3" />,
    color: "bg-green-100 text-green-700 border-green-200",
  },
  TENANT: {
    label: "Inquilino",
    icon: <Key className="h-3 w-3" />,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  RESIDENT: {
    label: "Residente",
    icon: <Home className="h-3 w-3" />,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
};

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  DNI: "DNI",
  PASSPORT: "Pasaporte",
  CE: "C. Extranjería",
  OTHER: "Otro",
};

export function GuestsDirectory({ useMockData = true }: GuestsDirectoryProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Estado para el formulario de nuevo huésped
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newGuest, setNewGuest] = useState({
    firstName: "",
    lastName: "",
    documentType: "DNI",
    documentNumber: "",
    email: "",
    phone: "",
    departmentCode: "",
    guestType: "AIRBNB",
  });

  useEffect(() => {
    const fetchGuests = async () => {
      if (useMockData) {
        setGuests([]);
        setLoading(false);
        return;
      }

      try {
        const result = await api.getAdminGuests();
        if (result.data) {
          // Ordenar por fecha de registro (más recientes primero)
          const sortedGuests = result.data.sort((a: Guest, b: Guest) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          setGuests(sortedGuests);
        }
      } catch (error) {
        console.error("Error fetching guests:", error);
        toast.error("Error al cargar los invitados");
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();
  }, [useMockData]);

  const handleDeleteClick = (guest: Guest) => {
    setGuestToDelete(guest);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!guestToDelete) return;

    setDeleting(true);

    try {
      const result = await api.deleteAdminGuest(guestToDelete.id);

      if (result.error) {
        toast.error("Error al eliminar", {
          description: result.error,
        });
        return;
      }

      setGuests(guests.filter((g) => g.id !== guestToDelete.id));
      toast.success("Invitado eliminado", {
        description: `${guestToDelete.firstName} ${guestToDelete.lastName} ha sido eliminado`,
      });
    } catch (error: any) {
      toast.error("Error al eliminar", {
        description: error.message || "No se pudo eliminar el invitado",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setGuestToDelete(null);
    }
  };

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newGuest.firstName || !newGuest.lastName || !newGuest.documentNumber || !newGuest.departmentCode) {
      toast.error("Campos requeridos", {
        description: "Por favor completa todos los campos obligatorios",
      });
      return;
    }

    setCreating(true);

    try {
      const result = await api.registerGuest({
        firstName: newGuest.firstName,
        lastName: newGuest.lastName,
        documentType: newGuest.documentType,
        documentNumber: newGuest.documentNumber,
        email: newGuest.email || undefined,
        phone: newGuest.phone || undefined,
        departmentCode: newGuest.departmentCode.toUpperCase(),
        guestType: newGuest.guestType,
      });

      if (result.error) {
        toast.error("Error al registrar", {
          description: result.error,
        });
        return;
      }

      if (result.data) {
        // Agregar el nuevo huésped a la lista
        const newGuestData: Guest = {
          id: result.data.guest.id,
          firstName: newGuest.firstName,
          lastName: newGuest.lastName,
          documentType: newGuest.documentType as 'DNI' | 'PASSPORT' | 'CE' | 'OTHER',
          documentNumber: newGuest.documentNumber,
          email: newGuest.email || null,
          phone: newGuest.phone || null,
          departmentCode: newGuest.departmentCode.toUpperCase(),
          guestType: newGuest.guestType as 'AIRBNB' | 'FRIEND' | 'TENANT',
          createdAt: new Date().toISOString(),
        };

        setGuests([newGuestData, ...guests]);

        toast.success(result.data.isNew ? "Huésped registrado" : "Huésped ya existente", {
          description: `${newGuest.firstName} ${newGuest.lastName} - Depto ${newGuest.departmentCode.toUpperCase()}`,
        });

        // Limpiar formulario y cerrar diálogo
        setNewGuest({
          firstName: "",
          lastName: "",
          documentType: "DNI",
          documentNumber: "",
          email: "",
          phone: "",
          departmentCode: "",
          guestType: "AIRBNB",
        });
        setCreateDialogOpen(false);
      }
    } catch (error: any) {
      toast.error("Error al registrar", {
        description: error.message || "No se pudo registrar el huésped",
      });
    } finally {
      setCreating(false);
    }
  };

  const filteredGuests = guests.filter((guest) => {
    const search = searchTerm.toLowerCase();
    return (
      guest.firstName.toLowerCase().includes(search) ||
      guest.lastName.toLowerCase().includes(search) ||
      guest.documentNumber.toLowerCase().includes(search) ||
      guest.departmentCode.toLowerCase().includes(search) ||
      (guest.email && guest.email.toLowerCase().includes(search)) ||
      (guest.phone && guest.phone.includes(search))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Huéspedes / Invitados</h2>
          <p className="text-muted-foreground">
            Directorio de todos los visitantes registrados
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Huésped
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Registrar Nuevo Huésped
              </DialogTitle>
              <DialogDescription>
                Completa los datos del huésped o invitado
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateGuest} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombres *</Label>
                  <Input
                    id="firstName"
                    value={newGuest.firstName}
                    onChange={(e) => setNewGuest({ ...newGuest, firstName: e.target.value })}
                    placeholder="Juan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellidos *</Label>
                  <Input
                    id="lastName"
                    value={newGuest.lastName}
                    onChange={(e) => setNewGuest({ ...newGuest, lastName: e.target.value })}
                    placeholder="Pérez"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Tipo Documento *</Label>
                  <Select
                    value={newGuest.documentType}
                    onValueChange={(value) => setNewGuest({ ...newGuest, documentType: value })}
                  >
                    <SelectTrigger id="documentType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DNI">DNI</SelectItem>
                      <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                      <SelectItem value="CE">C. Extranjería</SelectItem>
                      <SelectItem value="OTHER">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Nro. Documento *</Label>
                  <Input
                    id="documentNumber"
                    value={newGuest.documentNumber}
                    onChange={(e) => setNewGuest({ ...newGuest, documentNumber: e.target.value })}
                    placeholder="12345678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departmentCode">Departamento *</Label>
                  <Input
                    id="departmentCode"
                    value={newGuest.departmentCode}
                    onChange={(e) => setNewGuest({ ...newGuest, departmentCode: e.target.value.toUpperCase() })}
                    placeholder="603A"
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestType">Tipo de Huésped *</Label>
                  <Select
                    value={newGuest.guestType}
                    onValueChange={(value) => setNewGuest({ ...newGuest, guestType: value })}
                  >
                    <SelectTrigger id="guestType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AIRBNB">
                        <div className="flex items-center gap-2">
                          <Plane className="h-3 w-3" />
                          Huésped Airbnb
                        </div>
                      </SelectItem>
                      <SelectItem value="FRIEND">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-3 w-3" />
                          Familiar/Amigo
                        </div>
                      </SelectItem>
                      <SelectItem value="TENANT">
                        <div className="flex items-center gap-2">
                          <Key className="h-3 w-3" />
                          Inquilino
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newGuest.email}
                    onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono (opcional)</Label>
                  <Input
                    id="phone"
                    value={newGuest.phone}
                    onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                    placeholder="999888777"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registrar Huésped
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, documento, email o departamento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredGuests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">
              {searchTerm ? "No se encontraron resultados" : "No hay invitados registrados"}
            </h3>
            <p className="text-muted-foreground text-center mt-2">
              {searchTerm
                ? "Intenta con otros términos de búsqueda"
                : "Los invitados aparecerán aquí cuando se registren"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Fecha Registro</TableHead>
                    <TableHead className="w-[100px]">Depto.</TableHead>
                    <TableHead className="w-[100px]">Tipo Doc.</TableHead>
                    <TableHead className="w-[120px]">Documento</TableHead>
                    <TableHead>Nombres</TableHead>
                    <TableHead>Apellidos</TableHead>
                    <TableHead className="w-[130px]">Tipo</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGuests.map((guest) => {
                    const guestTypeConfig = GUEST_TYPE_CONFIG[guest.guestType] || GUEST_TYPE_CONFIG.AIRBNB;

                    return (
                      <TableRow key={guest.id}>
                        <TableCell className="text-sm">
                          {guest.createdAt
                            ? format(new Date(guest.createdAt), "dd/MM/yyyy HH:mm", { locale: es })
                            : "-"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {guest.departmentCode}
                        </TableCell>
                        <TableCell className="text-sm">
                          {DOCUMENT_TYPE_LABELS[guest.documentType] || guest.documentType}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {guest.documentNumber}
                        </TableCell>
                        <TableCell>{guest.firstName}</TableCell>
                        <TableCell>{guest.lastName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${guestTypeConfig.color} text-xs`}>
                            {guestTypeConfig.icon}
                            <span className="ml-1">{guestTypeConfig.label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClick(guest)}
                            title="Eliminar invitado"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center text-sm text-muted-foreground">
        Mostrando {filteredGuests.length} de {guests.length} invitados
      </div>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar invitado?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente a{" "}
              <strong>{guestToDelete?.firstName} {guestToDelete?.lastName}</strong> del sistema.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
