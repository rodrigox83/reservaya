import { useState } from "react";
import { format, isSameDay, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "./ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Flame, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { Grill, Reservation, User } from "../types";

interface GrillsCalendarViewProps {
  grills: Grill[];
  reservations: Reservation[];
  currentUser: User;
  onRequestReservation: (date: Date, grill: Grill) => void;
}

export function GrillsCalendarView({
  grills,
  reservations,
  currentUser,
  onRequestReservation,
}: GrillsCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getDateStatus = (date: Date) => {
    const dateStart = startOfDay(date);
    const dateReservations = reservations.filter(
      (r) => isSameDay(new Date(r.date), dateStart) && r.status !== "rejected"
    );

    const reservedGrills = new Set(dateReservations.map((r) => r.grillId));
    // Verificar disponibilidad de TODAS las parrillas, no solo de la torre del usuario
    const availableCount = grills.filter(
      (g) => !reservedGrills.has(g.id)
    ).length;

    if (availableCount === 0) return "full"; // Todas reservadas
    if (availableCount === grills.length) return "available"; // Todas disponibles
    return "partial"; // Algunas disponibles
  };

  // Create modifiers for calendar styling
  const fullDates: Date[] = [];
  const availableDates: Date[] = [];
  
  // Check dates for the next 60 days
  for (let i = 0; i < 60; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const status = getDateStatus(date);
    if (status === "full") {
      fullDates.push(date);
    } else if (status === "available") {
      availableDates.push(date);
    }
  }

  const getGrillStatusForDate = (grill: Grill, date: Date) => {
    const reservation = reservations.find(
      (r) =>
        r.grillId === grill.id &&
        isSameDay(new Date(r.date), date) &&
        r.status !== "rejected"
    );

    if (!reservation) return { status: "available", reservation: null };
    return { status: reservation.status, reservation };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 border-green-300 text-green-800";
      case "pending":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "approved":
        return "bg-blue-100 border-blue-300 text-blue-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "Disponible";
      case "pending":
        return "En proceso";
      case "approved":
        return "Aprobada";
      default:
        return "No disponible";
    }
  };

  const selectedDateReservations = reservations.filter(
    (r) => isSameDay(new Date(r.date), selectedDate) && r.status !== "rejected"
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendario de Parrillas
              </CardTitle>
              <CardDescription>
                8 parrillas disponibles (2 en Torre A, 6 en Torre B)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-[auto_1fr] gap-6">
            {/* Calendar */}
            <div className="flex flex-col items-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={es}
                className="rounded-md border"
                modifiers={{
                  full: fullDates,
                  available: availableDates,
                }}
                modifiersClassNames={{
                  full: "bg-gray-200 text-gray-500",
                  available: "bg-green-100 text-green-800",
                }}
              />
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 border border-green-300 rounded" />
                  <span>Todas disponibles</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-200 border border-gray-300 rounded" />
                  <span>Todas reservadas</span>
                </div>
              </div>
            </div>

            {/* Grills for selected date */}
            <div>
              <h3 className="font-semibold mb-4">
                {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}
              </h3>

              {/* Torre A Grills */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px bg-gray-300 flex-1"></div>
                  <h4 className="text-sm font-semibold text-gray-600">Torre A - Parrillas cerca de la piscina</h4>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {grills
                    .filter((g) => g.tower === "A")
                    .map((grill) => {
                      const { status, reservation } = getGrillStatusForDate(
                        grill,
                        selectedDate
                      );

                      return (
                        <Card
                          key={grill.id}
                          className={`overflow-hidden border-2 ${getStatusColor(status)}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col gap-3">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Flame className="h-5 w-5 text-orange-600" />
                                  <h4 className="font-semibold">{grill.name}</h4>
                                  <Badge
                                    variant="outline"
                                    className={getStatusColor(status)}
                                  >
                                    {getStatusLabel(status)}
                                  </Badge>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                  {grill.description}
                                </p>

                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>{grill.location}</span>
                                </div>

                                {reservation && (
                                  <div className="bg-white/70 p-2 rounded text-sm mt-2">
                                    <span className="font-medium">
                                      Reservado por: {reservation.departmentCode}
                                    </span>
                                    {reservation.notes && (
                                      <p className="text-muted-foreground mt-1">
                                        {reservation.notes}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>

                              <Button
                                onClick={() =>
                                  onRequestReservation(selectedDate, grill)
                                }
                                disabled={status !== "available"}
                                size="sm"
                                className="w-full"
                                variant={status === "available" ? "default" : "outline"}
                              >
                                {status === "available" ? "Solicitar" : "No disponible"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>

              {/* Torre B Grills */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px bg-gray-300 flex-1"></div>
                  <h4 className="text-sm font-semibold text-gray-600">Torre B - Área de parrillas</h4>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {grills
                    .filter((g) => g.tower === "B")
                    .map((grill) => {
                      const { status, reservation } = getGrillStatusForDate(
                        grill,
                        selectedDate
                      );

                      return (
                        <Card
                          key={grill.id}
                          className={`overflow-hidden border-2 ${getStatusColor(status)}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col gap-3">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Flame className="h-5 w-5 text-orange-600" />
                                  <h4 className="font-semibold">{grill.name}</h4>
                                  <Badge
                                    variant="outline"
                                    className={getStatusColor(status)}
                                  >
                                    {getStatusLabel(status)}
                                  </Badge>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                  {grill.description}
                                </p>

                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>{grill.location}</span>
                                </div>

                                {reservation && (
                                  <div className="bg-white/70 p-2 rounded text-sm mt-2">
                                    <span className="font-medium">
                                      Reservado por: {reservation.departmentCode}
                                    </span>
                                    {reservation.notes && (
                                      <p className="text-muted-foreground mt-1">
                                        {reservation.notes}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>

                              <Button
                                onClick={() =>
                                  onRequestReservation(selectedDate, grill)
                                }
                                disabled={status !== "available"}
                                size="sm"
                                className="w-full"
                                variant={status === "available" ? "default" : "outline"}
                              >
                                {status === "available" ? "Solicitar" : "No disponible"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>

              {/* Show all reservations for this date */}
              {selectedDateReservations.length > 0 && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Solicitudes del día (en orden)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedDateReservations
                        .sort(
                          (a, b) =>
                            new Date(a.requestedAt).getTime() -
                            new Date(b.requestedAt).getTime()
                        )
                        .map((res, index) => (
                          <div
                            key={res.id}
                            className="flex items-center gap-3 text-sm p-2 bg-gray-50 rounded"
                          >
                            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <span className="font-medium">
                                {res.departmentCode}
                              </span>
                              <span className="text-muted-foreground ml-2">
                                • {res.grillName}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className={getStatusColor(res.status)}
                            >
                              {getStatusLabel(res.status)}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}