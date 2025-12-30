import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Flame, Clock, Calendar, Trash2, AlertCircle } from "lucide-react";
import { Reservation, User } from "../types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface MyRequestsProps {
  reservations: Reservation[];
  currentUser: User;
  onCancelRequest: (reservationId: string) => void;
}

export function MyRequests({
  reservations,
  currentUser,
  onCancelRequest,
}: MyRequestsProps) {
  const userRequests = reservations
    .filter((r) => r.departmentCode === currentUser.departmentCode)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            En proceso
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            Aprobada
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            Rechazada
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
            Desconocido
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "approved":
        return <Flame className="h-5 w-5 text-blue-600" />;
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-600" />;
    }
  };

  const pendingRequests = userRequests.filter((r) => r.status === "pending");
  const approvedRequests = userRequests.filter((r) => r.status === "approved");
  const otherRequests = userRequests.filter(
    (r) => r.status !== "pending" && r.status !== "approved"
  );

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Solicitudes en Proceso
            </CardTitle>
            <CardDescription>
              Estas solicitudes están esperando aprobación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onCancel={onCancelRequest}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Approved Requests */}
      {approvedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-blue-600" />
              Reservas Aprobadas
            </CardTitle>
            <CardDescription>
              Tus reservas confirmadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {approvedRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onCancel={onCancelRequest}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Other Requests (rejected, etc.) */}
      {otherRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historial
            </CardTitle>
            <CardDescription>
              Solicitudes anteriores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {otherRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onCancel={null}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {userRequests.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Mis Solicitudes
            </CardTitle>
            <CardDescription>
              Gestiona tus solicitudes de reserva
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Flame className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No tienes solicitudes</p>
              <p className="text-sm text-muted-foreground mt-1">
                Usa el calendario para solicitar una reserva
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RequestCard({
  request,
  onCancel,
}: {
  request: Reservation;
  onCancel: ((id: string) => void) | null;
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            En proceso
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            Aprobada
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            Rechazada
          </Badge>
        );
      default:
        return null;
    }
  };

  const canCancel = onCancel && (request.status === "pending" || request.status === "approved");

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Flame className="h-5 w-5 text-orange-500" />
              <h4 className="font-semibold">{request.grillName}</h4>
              {getStatusBadge(request.status)}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(request.date), "EEEE, d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  Solicitado el{" "}
                  {format(new Date(request.requestedAt), "d 'de' MMM 'a las' HH:mm", {
                    locale: es,
                  })}
                </span>
              </div>

              {request.notes && (
                <div className="bg-gray-50 p-2 rounded text-sm mt-2">
                  <span className="text-muted-foreground">Notas:</span> {request.notes}
                </div>
              )}
            </div>
          </div>

          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Cancelar solicitud?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción cancelará tu solicitud de {request.grillName} para el{" "}
                    {format(new Date(request.date), "d 'de' MMMM", { locale: es })}.
                    Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, mantener</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onCancel(request.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Sí, cancelar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
