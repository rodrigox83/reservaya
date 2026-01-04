import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Users, CalendarCheck, Clock, XCircle, CheckCircle, Flame, Waves, UserPlus, Activity } from "lucide-react";
import type { DashboardStats } from "../../types";
import { adminService } from "../../../services";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

interface AdminDashboardProps {
  useMockData?: boolean;
}

export function AdminDashboard({ useMockData = true }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalOwners: 0,
    totalReservations: 0,
    pendingReservations: 0,
    approvedReservations: 0,
    rejectedReservations: 0,
    totalGrills: 0,
    totalGuests: 0,
    todayPoolAccesses: 0,
    activePoolAccesses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (useMockData) {
        // Mock data
        setStats({
          totalOwners: 2,
          totalReservations: 4,
          pendingReservations: 2,
          approvedReservations: 2,
          rejectedReservations: 0,
          totalGrills: 8,
          totalGuests: 5,
          todayPoolAccesses: 3,
          activePoolAccesses: 1,
        });
        setLoading(false);
        return;
      }

      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [useMockData]);

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
        <h2 className="text-2xl font-bold tracking-tight">Panel de Administración</h2>
        <p className="text-muted-foreground">
          Resumen general del sistema
        </p>
      </div>

      {/* Sección de Personas */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Personas
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Propietarios Registrados"
            value={stats.totalOwners}
            icon={<Users className="h-4 w-4 text-blue-600" />}
            color="bg-blue-100"
            subtitle="Total de propietarios"
          />
          <StatCard
            title="Huéspedes / Invitados"
            value={stats.totalGuests}
            icon={<UserPlus className="h-4 w-4 text-purple-600" />}
            color="bg-purple-100"
            subtitle="Visitantes registrados"
          />
          <StatCard
            title="Personas en Piscina"
            value={stats.activePoolAccesses}
            icon={<Activity className="h-4 w-4 text-cyan-600" />}
            color="bg-cyan-100"
            subtitle="Accesos activos ahora"
          />
        </div>
      </div>

      {/* Sección de Parrillas */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-600" />
          Parrillas
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Parrillas"
            value={stats.totalGrills}
            icon={<Flame className="h-4 w-4 text-orange-600" />}
            color="bg-orange-100"
          />
          <StatCard
            title="Pendientes"
            value={stats.pendingReservations}
            icon={<Clock className="h-4 w-4 text-yellow-600" />}
            color="bg-yellow-100"
            subtitle="Requieren aprobación"
          />
          <StatCard
            title="Aprobadas"
            value={stats.approvedReservations}
            icon={<CheckCircle className="h-4 w-4 text-green-600" />}
            color="bg-green-100"
          />
          <StatCard
            title="Rechazadas"
            value={stats.rejectedReservations}
            icon={<XCircle className="h-4 w-4 text-red-600" />}
            color="bg-red-100"
          />
        </div>
      </div>

      {/* Sección de Piscina */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Waves className="h-5 w-5 text-blue-500" />
          Piscina
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Accesos Hoy"
            value={stats.todayPoolAccesses}
            icon={<Waves className="h-4 w-4 text-blue-500" />}
            color="bg-blue-100"
            subtitle="Ingresos del día"
          />
          <StatCard
            title="En Piscina Ahora"
            value={stats.activePoolAccesses}
            icon={<Activity className="h-4 w-4 text-green-500" />}
            color="bg-green-100"
            subtitle="Personas activas"
          />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Capacidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.activePoolAccesses}/25</div>
                  <p className="text-xs text-muted-foreground">Ocupación actual</p>
                </div>
                <div className="w-16 h-16">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={stats.activePoolAccesses / 25 > 0.9 ? "#ef4444" : stats.activePoolAccesses / 25 > 0.7 ? "#eab308" : "#22c55e"}
                      strokeWidth="3"
                      strokeDasharray={`${(stats.activePoolAccesses / 25) * 100}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resumen General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Resumen de Reservaciones
          </CardTitle>
          <CardDescription>
            Total histórico de todas las reservaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-3xl font-bold">{stats.totalReservations}</p>
              <p className="text-sm text-muted-foreground">Reservaciones totales</p>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Pendientes: {stats.pendingReservations}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Aprobadas: {stats.approvedReservations}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Rechazadas: {stats.rejectedReservations}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
