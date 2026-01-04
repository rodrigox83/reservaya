import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Users, Search, Mail, Phone, Building, Calendar, Pencil, Loader2, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import type { Owner } from "../../types";
import { adminService } from "../../../services";

interface OwnersDirectoryProps {
  useMockData?: boolean;
  mockOwners?: Owner[];
}

export function OwnersDirectory({ useMockData = true, mockOwners = [] }: OwnersDirectoryProps) {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para el modal de edición
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    email: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  // Estado para el modal de registro
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    email: "",
    phone: "",
    tower: "A",
    floor: "1",
    apartment: "1",
  });
  const [creating, setCreating] = useState(false);
  const [checkingDepartment, setCheckingDepartment] = useState(false);
  const [existingOwner, setExistingOwner] = useState<Owner | null>(null);
  const [departmentChecked, setDepartmentChecked] = useState(false);

  useEffect(() => {
    const fetchOwners = async () => {
      if (useMockData) {
        setOwners(mockOwners);
        setLoading(false);
        return;
      }

      try {
        const data = await adminService.getOwners();
        setOwners(data);
      } catch (error) {
        console.error("Error fetching owners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, [useMockData, mockOwners]);

  const handleEditClick = (owner: Owner) => {
    setEditingOwner(owner);
    setEditForm({
      firstName: owner.firstName,
      lastName: owner.lastName,
      dni: owner.dni || "",
      email: owner.email,
      phone: owner.phone,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingOwner?.id) return;

    // Validaciones básicas
    if (!editForm.firstName || !editForm.lastName || !editForm.dni || !editForm.email || !editForm.phone) {
      toast.error("Todos los campos son requeridos");
      return;
    }

    if (editForm.dni.length < 8) {
      toast.error("El DNI debe tener al menos 8 caracteres");
      return;
    }

    if (editForm.phone.length < 9) {
      toast.error("El teléfono debe tener al menos 9 dígitos");
      return;
    }

    setSaving(true);

    try {
      const updatedOwner = await adminService.updateOwner(editingOwner.id, editForm);

      // Actualizar la lista local
      setOwners(owners.map(o =>
        o.id === editingOwner.id ? { ...o, ...updatedOwner } : o
      ));

      toast.success("Propietario actualizado", {
        description: `${editForm.firstName} ${editForm.lastName} ha sido actualizado correctamente`,
      });

      setEditDialogOpen(false);
      setEditingOwner(null);
    } catch (error: any) {
      toast.error("Error al actualizar", {
        description: error.message || "No se pudo actualizar el propietario",
      });
    } finally {
      setSaving(false);
    }
  };

  // Función para verificar si el departamento tiene propietario
  const checkDepartment = () => {
    const departmentCode = `${createForm.floor}0${createForm.apartment}${createForm.tower}`;
    const found = owners.find(o => o.departmentCode === departmentCode);
    setExistingOwner(found || null);
    setDepartmentChecked(true);
  };

  // Reset cuando se abre/cierra el modal
  const handleOpenCreateDialog = (open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) {
      // Limpiar al cerrar
      setExistingOwner(null);
      setDepartmentChecked(false);
      setCreateForm({
        firstName: "",
        lastName: "",
        dni: "",
        email: "",
        phone: "",
        tower: "A",
        floor: "1",
        apartment: "1",
      });
    }
  };

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!createForm.firstName || !createForm.lastName || !createForm.dni || !createForm.email || !createForm.phone) {
      toast.error("Todos los campos son requeridos");
      return;
    }

    if (createForm.dni.length < 8) {
      toast.error("El DNI debe tener al menos 8 caracteres");
      return;
    }

    if (createForm.phone.length < 9) {
      toast.error("El teléfono debe tener al menos 9 dígitos");
      return;
    }

    setCreating(true);

    try {
      const newOwner = await adminService.createOwner(createForm);

      // Agregar a la lista local
      setOwners([newOwner, ...owners]);

      toast.success("Propietario registrado", {
        description: `${newOwner.firstName} ${newOwner.lastName} ha sido registrado correctamente`,
      });

      // Limpiar formulario y cerrar modal
      setCreateDialogOpen(false);
      setCreateForm({
        firstName: "",
        lastName: "",
        dni: "",
        email: "",
        phone: "",
        tower: "A",
        floor: "1",
        apartment: "1",
      });
    } catch (error: any) {
      toast.error("Error al registrar", {
        description: error.message || "No se pudo registrar el propietario",
      });
    } finally {
      setCreating(false);
    }
  };

  const filteredOwners = owners.filter((owner) => {
    const search = searchTerm.toLowerCase();
    return (
      owner.firstName.toLowerCase().includes(search) ||
      owner.lastName.toLowerCase().includes(search) ||
      owner.email.toLowerCase().includes(search) ||
      owner.departmentCode.toLowerCase().includes(search) ||
      owner.phone.includes(search) ||
      (owner.dni && owner.dni.includes(search))
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
          <h2 className="text-2xl font-bold tracking-tight">Propietarios Registrados</h2>
          <p className="text-muted-foreground">
            Directorio de todos los propietarios del edificio
          </p>
        </div>
        <Button onClick={() => handleOpenCreateDialog(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Registrar Propietario
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, DNI, email, teléfono o departamento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredOwners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">
              {searchTerm ? "No se encontraron resultados" : "No hay propietarios registrados"}
            </h3>
            <p className="text-muted-foreground text-center mt-2">
              {searchTerm
                ? "Intenta con otros términos de búsqueda"
                : "Los propietarios aparecerán aquí cuando se registren"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredOwners.map((owner) => (
            <Card key={owner.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {owner.firstName} {owner.lastName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Building className="h-3 w-3" />
                      Departamento {owner.departmentCode}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {owner.departmentCode.slice(-1) === "A" ? "Torre A" : "Torre B"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditClick(owner)}
                      title="Editar propietario"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {owner.dni && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium">DNI:</span>
                      <span>{owner.dni}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <a
                      href={`mailto:${owner.email}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {owner.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <a
                      href={`tel:${owner.phone}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {owner.phone}
                    </a>
                  </div>
                </div>

                {(owner as any).createdAt && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                    <Calendar className="h-3 w-3" />
                    Registrado: {format(new Date((owner as any).createdAt), "d MMM yyyy", { locale: es })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        Mostrando {filteredOwners.length} de {owners.length} propietarios
      </div>

      {/* Modal de edición */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Editar Propietario
            </DialogTitle>
            <DialogDescription>
              Departamento {editingOwner?.departmentCode}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">Nombre *</Label>
                <Input
                  id="edit-firstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  placeholder="Nombre"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Apellido *</Label>
                <Input
                  id="edit-lastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  placeholder="Apellido"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-dni">DNI *</Label>
              <Input
                id="edit-dni"
                value={editForm.dni}
                onChange={(e) => setEditForm({ ...editForm, dni: e.target.value })}
                placeholder="DNI (mínimo 8 dígitos)"
                maxLength={8}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Teléfono *</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="999888777"
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setEditDialogOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de registro */}
      <Dialog open={createDialogOpen} onOpenChange={handleOpenCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {departmentChecked ? (existingOwner ? "Propietario Existente" : "Registrar Nuevo Propietario") : "Buscar Departamento"}
            </DialogTitle>
            <DialogDescription>
              {departmentChecked
                ? (existingOwner
                    ? `Departamento ${createForm.floor}0${createForm.apartment}${createForm.tower} ya tiene propietario`
                    : "Ingresa los datos del nuevo propietario")
                : "Selecciona el departamento para verificar si tiene propietario"}
            </DialogDescription>
          </DialogHeader>

          {/* Paso 1: Selección de departamento */}
          {!departmentChecked && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Torre *</Label>
                  <Select
                    value={createForm.tower}
                    onValueChange={(value) => setCreateForm({ ...createForm, tower: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Torre A</SelectItem>
                      <SelectItem value="B">Torre B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Piso *</Label>
                  <Select
                    value={createForm.floor}
                    onValueChange={(value) => setCreateForm({ ...createForm, floor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(20)].map((_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Depto *</Label>
                  <Select
                    value={createForm.apartment}
                    onValueChange={(value) => setCreateForm({ ...createForm, apartment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(4)].map((_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-sm text-muted-foreground text-center bg-muted/50 rounded p-2">
                Departamento: {createForm.floor}0{createForm.apartment}{createForm.tower}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleOpenCreateDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={checkDepartment}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Verificar Departamento
                </Button>
              </div>
            </div>
          )}

          {/* Paso 2a: Si existe propietario, mostrar información */}
          {departmentChecked && existingOwner && (
            <div className="space-y-4 mt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 font-medium mb-3">
                  <CheckCircle2 className="h-5 w-5" />
                  Propietario Registrado
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Departamento:</span>
                    <span>{existingOwner.departmentCode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Nombre:</span>
                    <span>{existingOwner.firstName} {existingOwner.lastName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium ml-6">DNI:</span>
                    <span>{existingOwner.dni}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{existingOwner.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{existingOwner.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setDepartmentChecked(false);
                    setExistingOwner(null);
                  }}
                >
                  Buscar Otro
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => {
                    handleOpenCreateDialog(false);
                    handleEditClick(existingOwner);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar Datos
                </Button>
              </div>
            </div>
          )}

          {/* Paso 2b: Si no existe, mostrar formulario de registro */}
          {departmentChecked && !existingOwner && (
            <form onSubmit={handleCreateOwner} className="space-y-4 mt-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-amber-700 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>No hay propietario registrado para el departamento <strong>{createForm.floor}0{createForm.apartment}{createForm.tower}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-firstName">Nombre *</Label>
                  <Input
                    id="create-firstName"
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                    placeholder="Nombre"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-lastName">Apellido *</Label>
                  <Input
                    id="create-lastName"
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                    placeholder="Apellido"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-dni">DNI *</Label>
                <Input
                  id="create-dni"
                  value={createForm.dni}
                  onChange={(e) => setCreateForm({ ...createForm, dni: e.target.value })}
                  placeholder="DNI (mínimo 8 dígitos)"
                  maxLength={8}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-phone">Teléfono *</Label>
                <Input
                  id="create-phone"
                  type="tel"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="999888777"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setDepartmentChecked(false);
                    setExistingOwner(null);
                  }}
                  disabled={creating}
                >
                  Volver
                </Button>
                <Button type="submit" className="flex-1" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    "Registrar Propietario"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
