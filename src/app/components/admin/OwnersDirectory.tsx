import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Users, Search, Mail, Phone, Building, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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

  const filteredOwners = owners.filter((owner) => {
    const search = searchTerm.toLowerCase();
    return (
      owner.firstName.toLowerCase().includes(search) ||
      owner.lastName.toLowerCase().includes(search) ||
      owner.email.toLowerCase().includes(search) ||
      owner.departmentCode.toLowerCase().includes(search) ||
      owner.phone.includes(search)
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Propietarios Registrados</h2>
        <p className="text-muted-foreground">
          Directorio de todos los propietarios del edificio
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email, teléfono o departamento..."
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
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {owner.departmentCode.slice(-1) === "A" ? "Torre A" : "Torre B"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
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
    </div>
  );
}
