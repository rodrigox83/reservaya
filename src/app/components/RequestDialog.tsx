import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Grill, User } from "../types";
import { Flame, Calendar, MapPin, Home } from "lucide-react";

interface RequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  grill: Grill;
  currentUser: User;
  onConfirm: (notes: string) => void;
}

export function RequestDialog({
  open,
  onOpenChange,
  date,
  grill,
  currentUser,
  onConfirm,
}: RequestDialogProps) {
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(notes);
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Solicitar Reserva
          </DialogTitle>
          <DialogDescription>
            Envía una solicitud de reserva para esta parrilla. El administrador la revisará.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                <Calendar className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">
                    {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                <Flame className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Parrilla</p>
                  <p className="font-medium">{grill.name}</p>
                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {grill.location}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-md">
                <Home className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-indigo-600">Tu departamento</p>
                  <p className="text-lg font-bold text-indigo-900">
                    {currentUser.departmentCode}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Evento familiar, cumpleaños, etc."
                rows={3}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md text-sm">
              <p className="text-yellow-800">
                <strong>Nota:</strong> Tu solicitud quedará en estado "En proceso" hasta que sea aprobada por el administrador.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setNotes("");
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Enviar Solicitud
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
