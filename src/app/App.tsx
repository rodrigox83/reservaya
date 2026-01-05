import { useState, useEffect } from "react";
import { LoginView, StaffRole } from "./components/LoginView";
import { OwnerRegistrationView } from "./components/OwnerRegistrationView";
import { GrillsCalendarView } from "./components/GrillsCalendarView";
import { RequestDialog } from "./components/RequestDialog";
import { MyRequests } from "./components/MyRequests";
import { AdminView, AdminDashboard } from "./components/admin";
import { PoolAccessView } from "./components/pool";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { LogOut, Building, Calendar, List, Shield, Waves, Loader2, User as UserIcon, LayoutDashboard } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { Grill, Reservation, User, Owner, PoolGuest, PoolAccess, PoolStats } from "./types";
import { api } from "./services/api";

interface Staff {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
}

interface GuestSession {
  id: string;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  departmentCode: string;
  guestType: string;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [currentGuest, setCurrentGuest] = useState<GuestSession | null>(null);
  const [pendingDepartment, setPendingDepartment] = useState<{
    tower: string;
    floor: number;
    apartment: number;
    departmentCode: string;
    userId?: string;
  } | null>(null);

  // Datos desde API
  const [grills, setGrills] = useState<Grill[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [poolGuests, setPoolGuests] = useState<PoolGuest[]>([]);
  const [poolAccesses, setPoolAccesses] = useState<PoolAccess[]>([]);
  const [poolStats, setPoolStats] = useState<PoolStats>({
    currentOccupancy: 0,
    maxCapacity: 25,
    todayEntries: 0,
    activeOwners: 0,
    activeGuests: 0,
  });
  const [maxHoursPerVisit, setMaxHoursPerVisit] = useState(2);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{
    date: Date;
    grill: Grill;
  } | null>(null);

  // Verificar sesión al cargar
  useEffect(() => {
    const checkSession = async () => {
      const token = api.getToken();
      if (token) {
        // Primero intentar como staff
        const staffResult = await api.staffMe();
        if (staffResult.data) {
          setCurrentStaff(staffResult.data);
          setLoading(false);
          return;
        }

        // Intentar como guest
        const guestResult = await api.guestMe();
        if (guestResult.data) {
          setCurrentGuest({
            id: guestResult.data.id,
            firstName: guestResult.data.firstName,
            lastName: guestResult.data.lastName,
            documentType: guestResult.data.documentType,
            documentNumber: guestResult.data.documentNumber,
            departmentCode: guestResult.data.departmentCode,
            guestType: guestResult.data.guestType,
          });
          setLoading(false);
          return;
        }

        // Si no es staff ni guest, intentar como usuario normal
        const result = await api.me();
        if (result.data) {
          setCurrentUser({
            id: result.data.id,
            tower: result.data.tower,
            floor: parseInt(result.data.floor),
            apartment: parseInt(result.data.apartment),
            departmentCode: result.data.departmentCode,
            role: result.data.role,
            owner: result.data.owner,
          });
        } else {
          api.setToken(null);
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  // Cargar datos cuando el usuario, staff o guest está logueado
  useEffect(() => {
    if (currentUser || currentStaff || currentGuest) {
      loadData();
    }
  }, [currentUser, currentStaff, currentGuest]);

  const loadData = async () => {
    // Cargar parrillas
    const grillsResult = await api.getGrills();
    if (grillsResult.data) {
      setGrills(grillsResult.data.map((g: any) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        capacity: 20,
        location: `Torre ${g.tower}`,
        tower: g.tower,
        imageUrl: g.imageUrl,
      })));
    }

    // Cargar reservas
    const reservationsResult = await api.getReservations();
    if (reservationsResult.data) {
      setReservations(reservationsResult.data.map((r: any) => ({
        id: r.id,
        grillId: r.grillId,
        grillName: r.grill?.name || '',
        date: r.date,
        departmentCode: r.user?.tower && r.user?.floor && r.user?.apartment
          ? `${r.user.floor}0${r.user.apartment}${r.user.tower}`
          : '',
        status: r.status.toLowerCase(),
        requestedAt: r.createdAt,
        notes: r.notes,
        userId: r.userId,
      })));
    }

    // Cargar datos de piscina
    await loadPoolData();
  };

  const loadPoolData = async () => {
    // Cargar invitados
    const guestsResult = await api.getPoolGuests();
    if (guestsResult.data) {
      setPoolGuests(guestsResult.data.map((g: any) => ({
        id: g.id,
        firstName: g.firstName,
        lastName: g.lastName,
        documentNumber: g.documentNumber,
        guestType: g.guestType.toLowerCase(),
        departmentCode: g.departmentCode,
        registeredBy: g.registeredById,
        createdAt: g.createdAt,
      })));
    }

    // Cargar accesos activos
    const accessesResult = await api.getActivePoolAccesses();
    if (accessesResult.data) {
      setPoolAccesses(accessesResult.data.map((a: any) => ({
        id: a.id,
        personType: a.personType,
        personId: a.ownerId || a.guestId,
        personName: a.personName,
        departmentCode: a.departmentCode,
        guestType: a.guestType?.toLowerCase(),
        entryTime: a.entryTime,
        estimatedHours: a.estimatedHours,
        expectedExitTime: a.expectedExitTime,
        status: a.status.toLowerCase(),
        actualExitTime: a.actualExitTime,
      })));
    }

    // Cargar estadísticas
    const statsResult = await api.getPoolStats();
    if (statsResult.data) {
      setPoolStats({
        currentOccupancy: statsResult.data.currentOccupancy,
        maxCapacity: statsResult.data.maxCapacity,
        todayEntries: statsResult.data.currentOccupancy,
        activeOwners: statsResult.data.owners,
        activeGuests: statsResult.data.guests,
      });
      // Actualizar maxHoursPerVisit si viene en la respuesta
      if (statsResult.data.maxHoursPerVisit) {
        setMaxHoursPerVisit(statsResult.data.maxHoursPerVisit);
      }
    }
  };

  const handleLogin = async (userData: { tower: string; floor: number; apartment: number; departmentCode: string; dni?: string; role?: 'USER' | 'ADMIN' }) => {
    if (userData.role === 'ADMIN') {
      // Login como administrador con usuario/contraseña
      setCurrentUser({
        ...userData,
        role: 'ADMIN',
        owner: {
          id: "admin-1",
          firstName: "Administrador",
          lastName: "Sistema",
          dni: "00000000",
          email: "admin@reservaya.com",
          phone: "000000000",
          departmentCode: "ADMIN",
        },
      });
      toast.success("Bienvenido, Administrador!", {
        description: "Acceso de administrador activo",
      });
      return;
    }

    // Login como propietario usando API
    const result = await api.login(userData.tower, String(userData.floor), String(userData.apartment), userData.dni || '');

    if (result.error) {
      toast.error("Error de conexión", {
        description: result.error,
      });
      return;
    }

    if (result.data?.needsRegistration) {
      // Necesita registrar propietario
      setPendingDepartment({
        ...userData,
        userId: result.data.user?.id,
      });
    } else if (result.data?.user) {
      // Login exitoso
      setCurrentUser({
        id: result.data.user.id,
        tower: result.data.user.tower,
        floor: parseInt(result.data.user.floor),
        apartment: parseInt(result.data.user.apartment),
        departmentCode: result.data.user.departmentCode,
        role: result.data.user.role || 'USER',
        owner: result.data.user.owner,
      });
      toast.success(`Bienvenido, ${result.data.user.owner?.firstName || 'Usuario'}!`, {
        description: `Departamento ${result.data.user.departmentCode}`,
      });
    }
  };

  const handleStaffLogin = (staffData: Staff) => {
    setCurrentStaff(staffData);
    const roleLabel = staffData.role === 'ADMIN' ? 'Administrador' : 'Recepcionista';
    toast.success(`Bienvenido, ${staffData.firstName}!`, {
      description: `Acceso como ${roleLabel}`,
    });
  };

  const handleGuestLogin = (guestData: GuestSession) => {
    setCurrentGuest(guestData);
    const guestTypeLabel = guestData.guestType === 'AIRBNB' ? 'Huésped Airbnb' :
                           guestData.guestType === 'TENANT' ? 'Inquilino' : 'Invitado';
    toast.success(`Bienvenido, ${guestData.firstName}!`, {
      description: `${guestTypeLabel} - Depto ${guestData.departmentCode}`,
    });
  };

  const handleOwnerRegistration = async (owner: Owner) => {
    if (!pendingDepartment) return;

    const result = await api.registerOwner({
      firstName: owner.firstName,
      lastName: owner.lastName,
      email: owner.email,
      phone: owner.phone,
      departmentCode: pendingDepartment.departmentCode,
    });

    if (result.error) {
      toast.error("Error al registrar", {
        description: result.error,
      });
      return;
    }

    // Hacer login nuevamente para obtener el token
    const loginResult = await api.login(
      pendingDepartment.tower,
      String(pendingDepartment.floor),
      String(pendingDepartment.apartment)
    );

    if (loginResult.data?.user) {
      setCurrentUser({
        id: loginResult.data.user.id,
        tower: loginResult.data.user.tower,
        floor: parseInt(loginResult.data.user.floor),
        apartment: parseInt(loginResult.data.user.apartment),
        departmentCode: loginResult.data.user.departmentCode,
        role: loginResult.data.user.role || 'USER',
        owner: loginResult.data.user.owner,
      });
      setPendingDepartment(null);

      toast.success(`Bienvenido, ${owner.firstName}!`, {
        description: `Registro exitoso para el departamento ${pendingDepartment.departmentCode}`,
      });
    }
  };

  const handleBackToLogin = () => {
    setPendingDepartment(null);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setCurrentStaff(null);
    setCurrentGuest(null);
    setGrills([]);
    setReservations([]);
    setPoolGuests([]);
    setPoolAccesses([]);
    toast.info("Sesión cerrada");
  };

  const handleRequestReservation = (date: Date, grill: Grill) => {
    if (!currentUser) return;

    // Verificar si el usuario ya tiene una reserva activa
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeReservation = reservations.find(
      (r) =>
        r.departmentCode === currentUser.departmentCode &&
        (r.status === "pending" || (r.status === "approved" && new Date(r.date) >= today))
    );

    if (activeReservation) {
      const reservationDate = new Date(activeReservation.date);
      const status = activeReservation.status === "pending" ? "pendiente de aprobación" : "aprobada";
      toast.error("Ya tienes una reserva activa", {
        description: `Tu reserva para ${activeReservation.grillName} (${reservationDate.toLocaleDateString("es-ES")}) está ${status}. Solo puedes tener una reserva activa a la vez.`,
      });
      return;
    }

    setSelectedRequest({ date, grill });
    setDialogOpen(true);
  };

  const handleConfirmRequest = async (notes: string) => {
    if (!selectedRequest || !currentUser) return;

    const result = await api.createReservation({
      grillId: selectedRequest.grill.id,
      date: selectedRequest.date.toISOString(),
      notes: notes || undefined,
    });

    if (result.error) {
      toast.error("Error al crear reserva", {
        description: result.error,
      });
      return;
    }

    // Recargar reservas
    await loadData();

    toast.success("Solicitud enviada!", {
      description: "Tu solicitud está en proceso de revisión",
    });
  };

  const handleCancelRequest = async (reservationId: string) => {
    const result = await api.cancelReservation(reservationId);

    if (result.error) {
      toast.error("Error al cancelar", {
        description: result.error,
      });
      return;
    }

    setReservations(reservations.filter((r) => r.id !== reservationId));
    toast.success("Solicitud cancelada", {
      description: "Tu solicitud ha sido eliminada",
    });
  };

  const handleApproveReservation = async (reservationId: string) => {
    const result = await api.approveReservation(reservationId);

    if (result.error) {
      toast.error("Error al aprobar", {
        description: result.error,
      });
      return;
    }

    setReservations(reservations.map((r) =>
      r.id === reservationId ? { ...r, status: "approved" as const } : r
    ));
    toast.success("Reserva aprobada");
  };

  const handleRejectReservation = async (reservationId: string) => {
    const result = await api.rejectReservation(reservationId);

    if (result.error) {
      toast.error("Error al rechazar", {
        description: result.error,
      });
      return;
    }

    setReservations(reservations.map((r) =>
      r.id === reservationId ? { ...r, status: "rejected" as const } : r
    ));
    toast.success("Reserva rechazada");
  };

  // Handlers del módulo de piscina
  const handleAddGuest = async (guestData: Omit<PoolGuest, 'id' | 'createdAt'>) => {
    const result = await api.addPoolGuest({
      firstName: guestData.firstName,
      lastName: guestData.lastName,
      documentNumber: guestData.documentNumber,
      guestType: guestData.guestType.toUpperCase(),
    });

    if (result.error) {
      toast.error("Error al agregar invitado", {
        description: result.error,
      });
      return;
    }

    await loadPoolData();
    toast.success("Invitado agregado");
  };

  const handleRemoveGuest = async (guestId: string) => {
    const result = await api.removePoolGuest(guestId);

    if (result.error) {
      toast.error("Error al eliminar invitado", {
        description: result.error,
      });
      return;
    }

    setPoolGuests(poolGuests.filter(g => g.id !== guestId));
    toast.success("Invitado eliminado");
  };

  const handleRegisterPoolAccess = async (accessData: Omit<PoolAccess, 'id' | 'entryTime' | 'expectedExitTime' | 'status'>) => {
    const result = await api.registerPoolAccess({
      personType: accessData.personType as 'owner' | 'guest',
      personId: accessData.personId,
      estimatedHours: accessData.estimatedHours,
    });

    if (result.error) {
      toast.error("Error al registrar acceso", {
        description: result.error,
      });
      return;
    }

    await loadPoolData();
    toast.success("Acceso registrado", {
      description: `${accessData.personName} ingresó a la piscina`,
    });
  };

  const handleMarkPoolExit = async (accessId: string) => {
    const result = await api.markPoolExit(accessId);

    if (result.error) {
      toast.error("Error al registrar salida", {
        description: result.error,
      });
      return;
    }

    await loadPoolData();
    toast.success("Salida registrada");
  };

  const activePoolAccesses = poolAccesses.filter(a => a.status === 'active');
  const isStaff = !!currentStaff;
  const isAdmin = currentStaff?.role === 'ADMIN';
  const isReceptionist = currentStaff?.role === 'RECEPTIONIST';
  const isGuest = !!currentGuest;

  // Mostrar loading inicial
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
          <p className="mt-2 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Mostrar formulario de registro si hay un departamento pendiente
  if (pendingDepartment) {
    return (
      <OwnerRegistrationView
        departmentCode={pendingDepartment.departmentCode}
        onRegister={handleOwnerRegistration}
        onBack={handleBackToLogin}
      />
    );
  }

  // Mostrar login si no hay usuario, staff ni guest
  if (!currentUser && !currentStaff && !currentGuest) {
    return <LoginView onLogin={handleLogin} onStaffLogin={handleStaffLogin} onGuestLogin={handleGuestLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isStaff ? 'bg-amber-100' : isGuest ? 'bg-purple-100' : 'bg-indigo-100'
              }`}>
                {isStaff ? (
                  <Shield className={`w-6 h-6 ${isAdmin ? 'text-amber-600' : 'text-blue-600'}`} />
                ) : isGuest ? (
                  <Waves className="w-6 h-6 text-purple-600" />
                ) : (
                  <Building className="w-6 h-6 text-indigo-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold">{isGuest ? 'Acceso Piscina' : 'Sistema de Reservas'}</h1>
                  {isAdmin && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {isReceptionist && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      <UserIcon className="h-3 w-3 mr-1" />
                      Recepcionista
                    </Badge>
                  )}
                  {isGuest && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      <Waves className="h-3 w-3 mr-1" />
                      {currentGuest?.guestType === 'AIRBNB' ? 'Airbnb' :
                       currentGuest?.guestType === 'TENANT' ? 'Inquilino' : 'Invitado'}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isStaff ? (
                    <span className="font-medium">{currentStaff?.firstName} {currentStaff?.lastName}</span>
                  ) : isGuest ? (
                    <>
                      <span className="font-medium">{currentGuest?.firstName} {currentGuest?.lastName}</span>
                      {' - '}Depto: <span className="font-semibold text-purple-600">{currentGuest?.departmentCode}</span>
                    </>
                  ) : (
                    <>
                      {currentUser?.owner && (
                        <span className="font-medium">{currentUser.owner.firstName} {currentUser.owner.lastName} - </span>
                      )}
                      Depto: <span className="font-semibold text-indigo-600">{currentUser?.departmentCode}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue={isGuest ? "pool" : (isStaff ? "dashboard" : "calendar")} className="space-y-6">
          {!isGuest && (
            <TabsList className={`grid w-full max-w-2xl ${isStaff ? 'grid-cols-5' : 'grid-cols-3'}`}>
              {isStaff && (
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Dash</span>
                </TabsTrigger>
              )}
              {isStaff && (
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Administración</span>
                  <span className="sm:hidden">Admin</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Parrillas</span>
                <span className="sm:hidden">Parrillas</span>
              </TabsTrigger>
              <TabsTrigger value="pool" className="flex items-center gap-2">
                <Waves className="h-4 w-4" />
                <span className="hidden sm:inline">Piscina</span>
                <span className="sm:hidden">Piscina</span>
              </TabsTrigger>
              {!isStaff && (
                <TabsTrigger value="requests" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Mis Solicitudes</span>
                  <span className="sm:hidden">Solicitudes</span>
                </TabsTrigger>
              )}
            </TabsList>
          )}

          {isStaff && (
            <TabsContent value="dashboard">
              <AdminDashboard useMockData={false} />
            </TabsContent>
          )}

          {isStaff && (
            <TabsContent value="admin">
              <AdminView
                useMockData={false}
                mockReservations={reservations}
                mockOwners={[]}
                onApproveReservation={handleApproveReservation}
                onRejectReservation={handleRejectReservation}
                staffRole={currentStaff?.role}
              />
            </TabsContent>
          )}

          <TabsContent value="calendar">
            <GrillsCalendarView
              grills={grills}
              reservations={reservations}
              currentUser={currentUser}
              onRequestReservation={handleRequestReservation}
            />
          </TabsContent>

          <TabsContent value="pool">
            <PoolAccessView
              currentUser={currentUser}
              currentGuest={currentGuest}
              guests={poolGuests}
              activeAccesses={activePoolAccesses}
              poolStats={poolStats}
              maxHoursPerVisit={maxHoursPerVisit}
              onAddGuest={handleAddGuest}
              onRemoveGuest={handleRemoveGuest}
              onRegisterAccess={handleRegisterPoolAccess}
              onMarkExit={handleMarkPoolExit}
              isStaffMode={isStaff}
            />
          </TabsContent>

          <TabsContent value="requests">
            <MyRequests
              reservations={reservations}
              currentUser={currentUser}
              onCancelRequest={handleCancelRequest}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Request Dialog */}
      {selectedRequest && currentUser && (
        <RequestDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          date={selectedRequest.date}
          grill={selectedRequest.grill}
          currentUser={currentUser}
          onConfirm={handleConfirmRequest}
        />
      )}
    </div>
  );
}
