import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Building, Home } from "lucide-react";

interface LoginViewProps {
  onLogin: (userData: { tower: string; floor: number; apartment: number; departmentCode: string }) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [tower, setTower] = useState("");
  const [floor, setFloor] = useState("");
  const [apartment, setApartment] = useState("");

  const getDepartmentCode = () => {
    if (!floor || !apartment || !tower) return "";
    return `${floor}0${apartment}${tower}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tower && floor && apartment) {
      onLogin({
        tower,
        floor: parseInt(floor),
        apartment: parseInt(apartment),
        departmentCode: getDepartmentCode(),
      });
    }
  };

  const isValid = tower && floor && apartment;
  const departmentCode = getDepartmentCode();

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
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button type="submit" className="w-full" disabled={!isValid}>
              <Home className="mr-2 h-4 w-4" />
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}