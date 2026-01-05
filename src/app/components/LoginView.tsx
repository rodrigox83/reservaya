import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Building, Home, Shield, ArrowLeft, Loader2, UserPlus, Users } from "lucide-react";
import api from "../services/api";

export type StaffRole = 'ADMIN' | 'RECEPTIONIST';

interface GuestData {
  id: string;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  departmentCode: string;
  guestType: string;
}

interface LoginViewProps {
  onLogin: (userData: { tower: string; floor: number; apartment: number; departmentCode: string; dni?: string; role?: 'USER' | 'ADMIN' }) => void;
  onStaffLogin?: (staffData: { id: string; username: string; firstName: string; lastName: string; role: StaffRole }) => void;
  onGuestLogin?: (guestData: GuestData) => void;
}

type LoginMode = 'select' | 'owner-department' | 'owner-dni' | 'owner-register' | 'admin' | 'guest-department' | 'guest-verify' | 'guest-register' | 'guest-success';

interface OwnerData {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  phone: string;
  departmentCode: string;
}

export function LoginView({ onLogin, onStaffLogin, onGuestLogin }: LoginViewProps) {
  const [loginMode, setLoginMode] = useState<LoginMode>('select');
  const [tower, setTower] = useState("");
  const [floor, setFloor] = useState("");
  const [apartment, setApartment] = useState("");
  const [dni, setDni] = useState("");
  const [ownerExists, setOwnerExists] = useState<OwnerData | null>(null);

  // Registration form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Admin login
  const [adminUser, setAdminUser] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  // Guest registration
  const [guestDocumentType, setGuestDocumentType] = useState("DNI");
  const [guestDocumentNumber, setGuestDocumentNumber] = useState("");
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestType, setGuestType] = useState("AIRBNB");
  const [guestExists, setGuestExists] = useState<any>(null);
  const [registeredGuest, setRegisteredGuest] = useState<any>(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const getDepartmentCode = () => {
    if (!floor || !apartment || !tower) return "";
    return `${floor}0${apartment}${tower}`;
  };

  const resetOwnerForm = () => {
    setTower("");
    setFloor("");
    setApartment("");
    setDni("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setOwnerExists(null);
    setError("");
  };

  const resetGuestForm = () => {
    setTower("");
    setFloor("");
    setApartment("");
    setGuestDocumentType("DNI");
    setGuestDocumentNumber("");
    setGuestFirstName("");
    setGuestLastName("");
    setGuestEmail("");
    setGuestPhone("");
    setGuestType("AIRBNB");
    setGuestExists(null);
    setRegisteredGuest(null);
    setError("");
  };

  const handleDepartmentCheck = async () => {
    if (!tower || !floor || !apartment) return;

    setIsLoading(true);
    setError("");

    try {
      const departmentCode = getDepartmentCode();
      const result = await api.getOwner(departmentCode);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.data) {
        // Department has owner - show DNI input
        setOwnerExists(result.data);
        setLoginMode('owner-dni');
      } else {
        // No owner - show registration form
        setOwnerExists(null);
        setLoginMode('owner-register');
      }
    } catch {
      setError("Error al verificar el departamento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tower || !floor || !apartment || !dni) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await api.login(tower, floor, apartment, dni);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.data?.needsRegistration) {
        setLoginMode('owner-register');
        return;
      }

      if (result.data?.user) {
        onLogin({
          tower,
          floor: parseInt(floor),
          apartment: parseInt(apartment),
          departmentCode: getDepartmentCode(),
          dni,
          role: 'USER',
        });
      }
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOwnerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !dni || !email || !phone) return;

    setIsLoading(true);
    setError("");

    try {
      const departmentCode = getDepartmentCode();
      const result = await api.registerOwner({
        firstName,
        lastName,
        dni,
        email,
        phone,
        departmentCode,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      // After registration, login automatically
      const loginResult = await api.login(tower, floor, apartment, dni);

      if (loginResult.error) {
        setError(loginResult.error);
        return;
      }

      if (loginResult.data?.user) {
        onLogin({
          tower,
          floor: parseInt(floor),
          apartment: parseInt(apartment),
          departmentCode,
          dni,
          role: 'USER',
        });
      }
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestDepartmentCheck = async () => {
    if (!tower || !floor || !apartment) return;

    setIsLoading(true);
    setError("");

    try {
      const departmentCode = getDepartmentCode();
      const result = await api.getOwner(departmentCode);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.data) {
        // Department has owner - proceed to guest verification
        setLoginMode('guest-verify');
      } else {
        // No owner - cannot register guests
        setError("Este departamento no tiene propietario registrado. No es posible registrar invitados.");
      }
    } catch {
      setError("Error al verificar el departamento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestDocumentNumber) return;

    setIsLoading(true);
    setError("");

    try {
      const departmentCode = getDepartmentCode();
      const result = await api.guestLogin(departmentCode, guestDocumentType, guestDocumentNumber);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.data?.needsRegistration) {
        // Guest doesn't exist - show registration form
        setLoginMode('guest-register');
      } else if (result.data?.guest && onGuestLogin) {
        // Guest exists - log them in and give pool access
        onGuestLogin({
          id: result.data.guest.id,
          firstName: result.data.guest.firstName,
          lastName: result.data.guest.lastName,
          documentType: result.data.guest.documentType,
          documentNumber: result.data.guest.documentNumber,
          departmentCode: result.data.guest.departmentCode,
          guestType: result.data.guest.guestType,
        });
      }
    } catch {
      setError("Error al verificar el invitado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestFirstName || !guestLastName || !guestDocumentNumber) return;

    setIsLoading(true);
    setError("");

    try {
      const departmentCode = getDepartmentCode();
      const result = await api.registerGuest({
        firstName: guestFirstName,
        lastName: guestLastName,
        documentType: guestDocumentType,
        documentNumber: guestDocumentNumber,
        email: guestEmail || undefined,
        phone: guestPhone || undefined,
        departmentCode,
        guestType,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.data?.guest) {
        // After registration, log them in automatically
        const loginResult = await api.guestLogin(departmentCode, guestDocumentType, guestDocumentNumber);

        if (loginResult.data?.guest && onGuestLogin) {
          onGuestLogin({
            id: loginResult.data.guest.id,
            firstName: loginResult.data.guest.firstName,
            lastName: loginResult.data.guest.lastName,
            documentType: loginResult.data.guest.documentType,
            documentNumber: loginResult.data.guest.documentNumber,
            departmentCode: loginResult.data.guest.departmentCode,
            guestType: loginResult.data.guest.guestType,
          });
        } else {
          // Fallback: show success screen
          setRegisteredGuest(result.data.guest);
          setLoginMode('guest-success');
        }
      }
    } catch {
      setError("Error al registrar invitado");
    } finally {
      setIsLoading(false);
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

  const isDepartmentSelected = tower && floor && apartment;
  const isDniValid = dni.length >= 8;
  const isRegistrationValid = firstName && lastName && dni.length >= 8 && email && phone.length >= 9;
  const isAdminValid = adminUser && adminPassword;
  const isGuestRegistrationValid = guestFirstName && guestLastName && guestDocumentNumber.length >= 6;
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
              onClick={() => setLoginMode('owner-department')}
              className="w-full h-16 text-lg"
              variant="default"
            >
              <Home className="mr-3 h-6 w-6" />
              Soy Propietario
            </Button>
            <Button
              onClick={() => setLoginMode('guest-department')}
              className="w-full h-16 text-lg"
              variant="outline"
            >
              <Users className="mr-3 h-6 w-6" />
              Invitado / Huésped
            </Button>
            <Button
              onClick={() => setLoginMode('admin')}
              className="w-full h-16 text-lg"
              variant="ghost"
            >
              <Shield className="mr-3 h-6 w-6" />
              Personal / Administrador
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
            <CardTitle>Acceso Personal</CardTitle>
            <CardDescription>
              Ingresa tus credenciales
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

  // Vista de selección de departamento (paso 1 para propietarios)
  if (loginMode === 'owner-department') {
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
                resetOwnerForm();
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Building className="w-8 h-8 text-indigo-600" />
            </div>
            <CardTitle>Selecciona tu Departamento</CardTitle>
            <CardDescription>
              Primero selecciona tu ubicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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

              {departmentCode && (
                <div className="bg-indigo-50 p-3 rounded-md text-center">
                  <p className="text-sm text-indigo-600">Código de departamento</p>
                  <p className="text-2xl font-bold text-indigo-900">{departmentCode}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
                  {error}
                </div>
              )}

              <Button
                onClick={handleDepartmentCheck}
                className="w-full"
                disabled={!isDepartmentSelected || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Home className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Verificando..." : "Continuar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vista de ingreso de DNI (cuando el departamento tiene propietario)
  if (loginMode === 'owner-dni') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4"
              onClick={() => {
                setLoginMode('owner-department');
                setDni("");
                setError("");
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Home className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle>Verificación de Identidad</CardTitle>
            <CardDescription>
              Departamento {departmentCode}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOwnerLogin} className="space-y-4">
              {ownerExists && (
                <div className="bg-green-50 p-3 rounded-md text-center">
                  <p className="text-sm text-green-600">Propietario registrado</p>
                  <p className="font-semibold text-green-900">
                    {ownerExists.firstName} {ownerExists.lastName}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="dni">Ingresa tu DNI para continuar</Label>
                <Input
                  id="dni"
                  type="text"
                  placeholder="Ingresa tu DNI"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  maxLength={8}
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!isDniValid || isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Home className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Verificando..." : "Ingresar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vista de registro de propietario (cuando el departamento no tiene propietario)
  if (loginMode === 'owner-register') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4"
              onClick={() => {
                setLoginMode('owner-department');
                setFirstName("");
                setLastName("");
                setDni("");
                setEmail("");
                setPhone("");
                setError("");
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle>Registro de Propietario</CardTitle>
            <CardDescription>
              Departamento {departmentCode} sin propietario registrado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOwnerRegister} className="space-y-4">
              <div className="bg-amber-50 p-3 rounded-md text-center mb-4">
                <p className="text-sm text-amber-700">
                  Este departamento no tiene propietario registrado.
                  Por favor completa tus datos.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Tu nombre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Tu apellido"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registerDni">DNI *</Label>
                <Input
                  id="registerDni"
                  type="text"
                  placeholder="Ingresa tu DNI (8 dígitos)"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  maxLength={8}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="999888777"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!isRegistrationValid || isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Registrando..." : "Registrarme e Ingresar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vista de selección de departamento para invitados
  if (loginMode === 'guest-department') {
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
                resetGuestForm();
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle>Registro de Invitado</CardTitle>
            <CardDescription>
              Selecciona el departamento al que te diriges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guestTower">Torre</Label>
                <Select value={tower} onValueChange={setTower}>
                  <SelectTrigger id="guestTower">
                    <SelectValue placeholder="Selecciona la torre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Torre A</SelectItem>
                    <SelectItem value="B">Torre B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestFloor">Piso</Label>
                <Select value={floor} onValueChange={setFloor}>
                  <SelectTrigger id="guestFloor">
                    <SelectValue placeholder="Selecciona el piso" />
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
                <Label htmlFor="guestApartment">Departamento</Label>
                <Select value={apartment} onValueChange={setApartment}>
                  <SelectTrigger id="guestApartment">
                    <SelectValue placeholder="Selecciona el departamento" />
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

              {departmentCode && (
                <div className="bg-purple-50 p-3 rounded-md text-center">
                  <p className="text-sm text-purple-600">Departamento destino</p>
                  <p className="text-2xl font-bold text-purple-900">{departmentCode}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
                  {error}
                </div>
              )}

              <Button
                onClick={handleGuestDepartmentCheck}
                className="w-full"
                disabled={!isDepartmentSelected || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Users className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Verificando..." : "Continuar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vista de verificación de invitado (si ya existe)
  if (loginMode === 'guest-verify') {
    const isDocumentValid = guestDocumentNumber.length >= 6;
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4"
              onClick={() => {
                setLoginMode('guest-department');
                setGuestDocumentType("DNI");
                setGuestDocumentNumber("");
                setError("");
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle>Verificación de Identidad</CardTitle>
            <CardDescription>
              Departamento destino: {departmentCode}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGuestVerify} className="space-y-4">
              <div className="bg-purple-50 p-3 rounded-md text-center mb-2">
                <p className="text-sm text-purple-700">
                  Ingresa tu documento para verificar si ya estás registrado
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verifyDocType">Tipo de Documento</Label>
                <Select value={guestDocumentType} onValueChange={setGuestDocumentType}>
                  <SelectTrigger id="verifyDocType">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                    <SelectItem value="CE">Carnet de Extranjería</SelectItem>
                    <SelectItem value="OTHER">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verifyDocNumber">Número de Documento</Label>
                <Input
                  id="verifyDocNumber"
                  type="text"
                  placeholder="Ingresa tu número de documento"
                  value={guestDocumentNumber}
                  onChange={(e) => setGuestDocumentNumber(e.target.value)}
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!isDocumentValid || isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Users className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Verificando..." : "Verificar e Ingresar"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-purple-600 hover:underline"
                  onClick={() => setLoginMode('guest-register')}
                >
                  No tengo registro, quiero registrarme
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vista de registro de invitado
  if (loginMode === 'guest-register') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4"
              onClick={() => {
                setLoginMode('guest-verify');
                setGuestFirstName("");
                setGuestLastName("");
                setGuestEmail("");
                setGuestPhone("");
                setGuestExists(null);
                setError("");
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle>Nuevo Registro de Invitado</CardTitle>
            <CardDescription>
              Departamento destino: {departmentCode}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGuestRegister} className="space-y-4">
              <div className="bg-amber-50 p-3 rounded-md text-center mb-2">
                <p className="text-sm text-amber-700">
                  No encontramos tu registro. Por favor completa tus datos.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guestFirstName">Nombre *</Label>
                  <Input
                    id="guestFirstName"
                    type="text"
                    placeholder="Tu nombre"
                    value={guestFirstName}
                    onChange={(e) => setGuestFirstName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestLastName">Apellido *</Label>
                  <Input
                    id="guestLastName"
                    type="text"
                    placeholder="Tu apellido"
                    value={guestLastName}
                    onChange={(e) => setGuestLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guestDocType">Tipo de Documento</Label>
                  <Select value={guestDocumentType} onValueChange={setGuestDocumentType} disabled>
                    <SelectTrigger id="guestDocType">
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DNI">DNI</SelectItem>
                      <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                      <SelectItem value="CE">Carnet de Extranjería</SelectItem>
                      <SelectItem value="OTHER">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestDocNumber">Número</Label>
                  <Input
                    id="guestDocNumber"
                    type="text"
                    placeholder="Número de documento"
                    value={guestDocumentNumber}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestType">Tipo de Visita</Label>
                <Select value={guestType} onValueChange={setGuestType}>
                  <SelectTrigger id="guestType">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AIRBNB">Airbnb / Alquiler temporal</SelectItem>
                    <SelectItem value="FRIEND">Familiar / Amigo</SelectItem>
                    <SelectItem value="TENANT">Inquilino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestEmail">Email (opcional)</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  placeholder="tu@email.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestPhone">Teléfono (opcional)</Label>
                <Input
                  id="guestPhone"
                  type="tel"
                  placeholder="999888777"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!isGuestRegistrationValid || isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Registrando..." : "Registrarme"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vista de registro exitoso de invitado
  if (loginMode === 'guest-success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle>Registro Exitoso</CardTitle>
            <CardDescription>
              Te has registrado correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-md text-center">
              <p className="text-lg font-semibold text-green-900">
                {registeredGuest?.firstName} {registeredGuest?.lastName}
              </p>
              <p className="text-sm text-green-700">
                Departamento: {departmentCode}
              </p>
              <p className="text-sm text-green-700">
                {guestDocumentType}: {guestDocumentNumber}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-800 text-center">
                Tu registro ha sido guardado. Ahora puedes acceder a las áreas comunes del edificio.
              </p>
            </div>

            <Button
              onClick={() => {
                setLoginMode('select');
                resetGuestForm();
              }}
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
