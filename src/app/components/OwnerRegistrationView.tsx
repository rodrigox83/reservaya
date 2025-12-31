import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { UserPlus, ArrowLeft } from "lucide-react";
import type { Owner } from "../types";

interface OwnerRegistrationViewProps {
  departmentCode: string;
  onRegister: (owner: Owner) => void;
  onBack: () => void;
}

export function OwnerRegistrationView({ departmentCode, onRegister, onBack }: OwnerRegistrationViewProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = "El nombre es requerido";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "El apellido es requerido";
    }

    if (!email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "El email no es válido";
    }

    if (!phone.trim()) {
      newErrors.phone = "El celular es requerido";
    } else if (!/^\d{9,}$/.test(phone.replace(/\s/g, ""))) {
      newErrors.phone = "El celular debe tener al menos 9 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onRegister({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        departmentCode,
      });
    }
  };

  const isValid = firstName && lastName && email && phone;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle>Registro de Propietario</CardTitle>
          <CardDescription>
            No encontramos un propietario registrado para el departamento <strong>{departmentCode}</strong>.
            Por favor, complete sus datos para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombres</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Ingrese sus nombres"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellidos</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Ingrese sus apellidos"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Celular</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="987654321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="bg-indigo-50 p-3 rounded-md text-center">
              <p className="text-sm text-indigo-600">Departamento</p>
              <p className="text-xl font-bold text-indigo-900">{departmentCode}</p>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
              <Button type="submit" className="flex-1" disabled={!isValid}>
                <UserPlus className="mr-2 h-4 w-4" />
                Registrar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
