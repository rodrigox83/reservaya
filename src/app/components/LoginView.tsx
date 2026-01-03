import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Building, Home, Shield, ArrowLeft, Loader2 } from "lucide-react";
import api from "../services/api";

export type StaffRole = 'ADMIN' | 'RECEPTIONIST';

interface LoginViewProps {
  onLogin: (userData: { tower: string; floor: number; apartment: number; departmentCode: string; dni?: string; role?: 'USER' | 'ADMIN' }) => void;
  onStaffLogin?: (staffData: { id: string; username: string; firstName: string; lastName: string; role: StaffRole }) => void;
}

export function LoginView({ onLogin, onStaffLogin }: LoginViewProps) {
  const [loginMode, setLoginMode] = useState<'select' | 'owner' | 'admin'>('select');
  const [tower, setTower] = useState("");
  const [floor, setFloor] = useState("");
  const [apartment, setApartment] = useState("");
  const [dni, setDni] = useState("");
  const [adminUser, setAdminUser] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getDepartmentCode = () => {
    if (!floor || !apartment || !tower) return "";
    return `${floor}0${apartment}${tower}`;
  };

  const handleOwnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tower && floor && apartment && dni) {
      onLogin({
        tower,
        floor: parseInt(floor),
        apartment: parseInt(apartment),
        departmentCode: getDepartmentCode(),
        dni,
        role: 'USER',
      });
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    setIsLoading(true);

    try {
      const result = await api.staffLogin(adminUser, adminPassword);

      if (result.error) {
        setAdminError(result.error);
        return;
      }

      if (result.data?.staff && onStaffLogin) {
        onStaffLogin(result.data.staff);
      } else {
        // Fallback para compatibilidad
        onLogin({
          tower: "A",
          floor: 1,
          apartment: 1,
          departmentCode: "ADMIN",
          role: 'ADMIN',
        });
      }
    } catch {
      setAdminError("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const isOwnerValid = tower && floor && apartment && dni.length >= 8;
  const isAdminValid = adminUser && adminPassword;
  const departmentCode = getDepartmentCode();

  // Vista de selección de tipo de login
  if (loginMode === 'select') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Building className="w-8 h-8 text-indigo-600" />
            </div>
            <CardTitle>Sistema de Reservas</CardTitle>
            <CardDescription>
              Bienvenido al sistema de reserva de parrillas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setLoginMode('owner')}
              className="w-full h-16 text-lg"
              variant="default"
            >
              <Home className="mr-3 h-6 w-6" />
              Soy Propietario
            </Button>
            <Button
              onClick={() => setLoginMode('admin')}
              className="w-full h-16 text-lg"
              variant="outline"
            >
              <Shield className="mr-3 h-6 w-6" />
              Administrador
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vista de login de administrador
  if (loginMode === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4"
              onClick={() => {
                setLoginMode('select');
                setAdminUser("");
                setAdminPassword("");
                setAdminError("");
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle>Acceso Administrador</CardTitle>
            <CardDescription>
              Ingresa tus credenciales de administrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminUser">Usuario</Label>
                <Input
                  id="adminUser"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">Contraseña</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>

              {adminError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
                  {adminError}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!isAdminValid || isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vista de login de propietario
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-4"
            onClick={() => {
              setLoginMode('select');
              setTower("");
              setFloor("");
              setApartment("");
              setDni("");
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Building className="w-8 h-8 text-indigo-600" />
          </div>
          <CardTitle>Ingreso Propietario</CardTitle>
          <CardDescription>
            Selecciona tu departamento para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOwnerSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tower">Torre</Label>
              <Select value={tower} onValueChange={setTower}>
                <SelectTrigger id="tower">
                  <SelectValue placeholder="Selecciona tu torre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Torre A</SelectItem>
                  <SelectItem value="B">Torre B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor">Piso</Label>
              <Select value={floor} onValueChange={setFloor}>
                <SelectTrigger id="floor">
                  <SelectValue placeholder="Selecciona tu piso" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      Piso {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apartment">Departamento</Label>
              <Select value={apartment} onValueChange={setApartment}>
                <SelectTrigger id="apartment">
                  <SelectValue placeholder="Selecciona tu departamento" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      Depto {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                type="text"
                placeholder="Ingresa tu DNI"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                maxLength={8}
              />
            </div>

            {departmentCode && (
              <div className="bg-indigo-50 p-3 rounded-md text-center">
                <p className="text-sm text-indigo-600">Código de departamento</p>
                <p className="text-2xl font-bold text-indigo-900">{departmentCode}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={!isOwnerValid}>
              <Home className="mr-2 h-4 w-4" />
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}