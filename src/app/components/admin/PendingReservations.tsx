import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Check, X, Clock, User, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Reservation } from "../../types";
import { adminService } from "../../../services";

interface PendingReservationsProps {
  useMockData?: boolean;
  mockReservations?: Reservation[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function PendingReservations({
  useMockData = true,
  mockReservations = [],
  onApprove,
  onReject,
}: PendingReservationsProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      if (useMockData) {
        const pending = mockReservations.filter(r => r.status === "pending");
        setReservations(pending);
        setLoading(false);
        return;
      }

      try {
        const data = await adminService.getPendingReservations();
        setReservations(data);
      } catch (error) {
        console.error("Error fetching reservations:", error);
        toast.error("Error al cargar las solicitudes");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [useMockData, mockReservations]);

  const handleApprove = async (id: string) => {
    setProcessingId(id);

    if (useMockData && onApprove) {
      onApprove(id);
      setReservations(prev => prev.filter(r => r.id !== id));
      toast.success("Solicitud aprobada");
      setProcessingId(null);
      return;
    }

    try {
      await adminService.approveReservation(id);
      setReservations(prev => prev.filter(r => r.id !== id));
      toast.success("Solicitud aprobada exitosamente");
    } catch (error) {
      console.error("Error approving:", error);
      toast.error("Error al aprobar la solicitud");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);

    if (useMockData && onReject) {
      onReject(id);
      setReservations(prev => prev.filter(r => r.id !== id));
      toast.success("Solicitud rechazada");
      setProcessingId(null);
      return;
    }

    try {
      await adminService.rejectReservation(id);
      setReservations(prev => prev.filter(r => r.id !== id));
      toast.success("Solicitud rechazada");
    } catch (error) {
      console.error("Error rejecting:", error);
      toast.error("Error al rechazar la solicitud");
    } finally {
      setProcessingId(null);
    }
  };

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
        <h2 className="text-2xl font-bold tracking-tight">Solicitudes Pendientes</h2>
        <p className="text-muted-foreground">
          Revisa y gestiona las solicitudes de reserva pendientes
        </p>
      </div>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No hay solicitudes pendientes</h3>
            <p className="text-muted-foreground text-center mt-2">
              Todas las solicitudes han sido procesadas
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{reservation.grill?.name || reservation.grillName}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(reservation.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Clock className="h-3 w-3 mr-1" />
                    Pendiente
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Depto: <strong className="text-foreground">{reservation.user?.owner?.departmentCode || reservation.departmentCode}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Torre {reservation.grill?.tower || reservation.user?.tower}</span>
                  </div>
                </div>

                {reservation.user?.owner && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">
                      <strong>Propietario:</strong> {reservation.user.owner.firstName} {reservation.user.owner.lastName}
                    </p>
                  </div>
                )}

                {reservation.notes && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">
                      <strong>Notas:</strong> {reservation.notes}
                    </p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Solicitado: {format(new Date(reservation.createdAt || reservation.requestedAt || reservation.date), "d MMM yyyy, HH:mm", { locale: es })}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="default"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(reservation.id)}
                    disabled={processingId === reservation.id}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Aprobar
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(reservation.id)}
                    disabled={processingId === reservation.id}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
