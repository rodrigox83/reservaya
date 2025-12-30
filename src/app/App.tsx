import { useState } from "react";
import { LoginView } from "./components/LoginView";
import { GrillsCalendarView } from "./components/GrillsCalendarView";
import { RequestDialog } from "./components/RequestDialog";
import { MyRequests } from "./components/MyRequests";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { LogOut, Building, Flame, Calendar, List } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { Grill, Reservation, User } from "./types";

// Mock data - Torre A: 2 parrillas, Torre B: 6 parrillas
const GRILLS: Grill[] = [
  // Torre A - 2 parrillas cerca de la piscina
  {
    id: "grill-a1",
    name: "Parrilla Piscina A1",
    description: "Parrilla grande junto a la piscina, vista panorámica",
    capacity: 20,
    location: "Área de piscina - Torre A",
    tower: "A",
  },
  {
    id: "grill-a2",
    name: "Parrilla Piscina A2",
    description: "Parrilla mediana junto a la piscina, ambiente familiar",
    capacity: 15,
    location: "Área de piscina - Torre A",
    tower: "A",
  },
  // Torre B - 6 parrillas
  {
    id: "grill-b1",
    name: "Parrilla B1",
    description: "Parrilla techada, protegida de la lluvia",
    capacity: 18,
    location: "Área común - Torre B",
    tower: "B",
  },
  {
    id: "grill-b2",
    name: "Parrilla B2",
    description: "Parrilla al aire libre, zona jardín",
    capacity: 16,
    location: "Jardín - Torre B",
    tower: "B",
  },
  {
    id: "grill-b3",
    name: "Parrilla B3",
    description: "Parrilla familiar, ambiente tranquilo",
    capacity: 12,
    location: "Jardín - Torre B",
    tower: "B",
  },
  {
    id: "grill-b4",
    name: "Parrilla B4",
    description: "Parrilla grande para eventos",
    capacity: 25,
    location: "Área social - Torre B",
    tower: "B",
  },
  {
    id: "grill-b5",
    name: "Parrilla B5",
    description: "Parrilla mediana, vista al jardín",
    capacity: 14,
    location: "Jardín - Torre B",
    tower: "B",
  },
  {
    id: "grill-b6",
    name: "Parrilla B6",
    description: "Parrilla techada premium",
    capacity: 20,
    location: "Área techada - Torre B",
    tower: "B",
  },
];

// Mock reservations
const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: "res-1",
    grillId: "grill-a1",
    grillName: "Parrilla Piscina A1",
    date: new Date().toISOString(),
    departmentCode: "503A",
    status: "approved",
    requestedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    notes: "Cumpleaños familiar",
  },
  {
    id: "res-2",
    grillId: "grill-b1",
    grillName: "Parrilla B1",
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    departmentCode: "807B",
    status: "pending",
    requestedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: "res-3",
    grillId: "grill-b2",
    grillName: "Parrilla B2",
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    departmentCode: "1205B",
    status: "approved",
    requestedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    notes: "Reunión de amigos",
  },
  {
    id: "res-4",
    grillId: "grill-b3",
    grillName: "Parrilla B3",
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    departmentCode: "304B",
    status: "pending",
    requestedAt: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{
    date: Date;
    grill: Grill;
  } | null>(null);

  const handleLogin = (userData: User) => {
    setCurrentUser(userData);
    toast.success("¡Bienvenido!", {
      description: `Departamento ${userData.departmentCode}`,
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    toast.info("Sesión cerrada");
  };

  const handleRequestReservation = (date: Date, grill: Grill) => {
    setSelectedRequest({ date, grill });
    setDialogOpen(true);
  };

  const handleConfirmRequest = (notes: string) => {
    if (!selectedRequest || !currentUser) return;

    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      grillId: selectedRequest.grill.id,
      grillName: selectedRequest.grill.name,
      date: selectedRequest.date.toISOString(),
      departmentCode: currentUser.departmentCode,
      status: "pending",
      requestedAt: new Date().toISOString(),
      notes: notes || undefined,
    };

    setReservations([...reservations, newReservation]);
    toast.success("¡Solicitud enviada!", {
      description: "Tu solicitud está en proceso de revisión",
    });
  };

  const handleCancelRequest = (reservationId: string) => {
    setReservations(reservations.filter((r) => r.id !== reservationId));
    toast.success("Solicitud cancelada", {
      description: "Tu solicitud ha sido eliminada",
    });
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="font-semibold">Sistema de Reservas de Parrillas</h1>
                <p className="text-sm text-muted-foreground">
                  Departamento: <span className="font-semibold text-indigo-600">{currentUser.departmentCode}</span>
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
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendario</span>
              <span className="sm:hidden">Reservar</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Mis Solicitudes</span>
              <span className="sm:hidden">Mis solicitudes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <GrillsCalendarView
              grills={GRILLS}
              reservations={reservations}
              currentUser={currentUser}
              onRequestReservation={handleRequestReservation}
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
