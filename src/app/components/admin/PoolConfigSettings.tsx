import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Settings, Waves, Clock, Users, Save, Loader2 } from "lucide-react";
import { api } from "../../services/api";

interface PoolConfig {
  id: string;
  maxCapacity: number;
  maxHoursPerVisit: number;
  openingTime: string;
  closingTime: string;
  isActive: boolean;
}

interface PoolConfigSettingsProps {
  useMockData?: boolean;
}

export function PoolConfigSettings({ useMockData = false }: PoolConfigSettingsProps) {
  const [config, setConfig] = useState<PoolConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [maxCapacity, setMaxCapacity] = useState(10);
  const [maxHoursPerVisit, setMaxHoursPerVisit] = useState(2);
  const [openingTime, setOpeningTime] = useState("08:00");
  const [closingTime, setClosingTime] = useState("22:00");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      if (useMockData) {
        const mockConfig: PoolConfig = {
          id: "mock-1",
          maxCapacity: 10,
          maxHoursPerVisit: 2,
          openingTime: "08:00",
          closingTime: "22:00",
          isActive: true,
        };
        setConfig(mockConfig);
        setMaxCapacity(mockConfig.maxCapacity);
        setMaxHoursPerVisit(mockConfig.maxHoursPerVisit);
        setOpeningTime(mockConfig.openingTime);
        setClosingTime(mockConfig.closingTime);
        setIsActive(mockConfig.isActive);
        setLoading(false);
        return;
      }

      try {
        const result = await api.getPoolConfig();
        if (result.data) {
          setConfig(result.data);
          setMaxCapacity(result.data.maxCapacity);
          setMaxHoursPerVisit(result.data.maxHoursPerVisit);
          setOpeningTime(result.data.openingTime);
          setClosingTime(result.data.closingTime);
          setIsActive(result.data.isActive);
        } else if (result.error) {
          setError(result.error);
        }
      } catch (err) {
        console.error("Error fetching pool config:", err);
        setError("Error al cargar la configuración");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [useMockData]);

  const handleSave = async () => {
    if (useMockData) {
      setSuccess("Configuración guardada correctamente (mock)");
      setTimeout(() => setSuccess(null), 3000);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await api.updatePoolConfig({
        maxCapacity,
        maxHoursPerVisit,
        openingTime,
        closingTime,
        isActive,
      });

      if (result.data) {
        setConfig(result.data);
        setSuccess("Configuración guardada correctamente");
        setTimeout(() => setSuccess(null), 3000);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error("Error saving pool config:", err);
      setError("Error al guardar la configuración");
    } finally {
      setSaving(false);
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
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Configuración
        </h2>
        <p className="text-muted-foreground">
          Configura los parámetros del sistema
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Waves className="h-5 w-5 text-blue-500" />
            Configuración de Piscina
          </CardTitle>
          <CardDescription>
            Configura el aforo máximo, horarios y límites de uso de la piscina
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estado de la piscina */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="isActive" className="text-base font-medium">
                Piscina Activa
              </Label>
              <p className="text-sm text-muted-foreground">
                Habilita o deshabilita el acceso a la piscina
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Aforo máximo */}
            <div className="space-y-2">
              <Label htmlFor="maxCapacity" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                Aforo Máximo
              </Label>
              <Input
                id="maxCapacity"
                type="number"
                min={1}
                max={100}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">
                Número máximo de personas permitidas en la piscina
              </p>
            </div>

            {/* Horas máximas por visita */}
            <div className="space-y-2">
              <Label htmlFor="maxHoursPerVisit" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                Horas Máximas por Visita
              </Label>
              <Input
                id="maxHoursPerVisit"
                type="number"
                min={1}
                max={12}
                value={maxHoursPerVisit}
                onChange={(e) => setMaxHoursPerVisit(parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">
                Tiempo máximo que una persona puede permanecer en la piscina
              </p>
            </div>

            {/* Hora de apertura */}
            <div className="space-y-2">
              <Label htmlFor="openingTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                Hora de Apertura
              </Label>
              <Input
                id="openingTime"
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Hora en que abre la piscina
              </p>
            </div>

            {/* Hora de cierre */}
            <div className="space-y-2">
              <Label htmlFor="closingTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-500" />
                Hora de Cierre
              </Label>
              <Input
                id="closingTime"
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Hora en que cierra la piscina
              </p>
            </div>
          </div>

          {/* Botón guardar */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Configuración
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
