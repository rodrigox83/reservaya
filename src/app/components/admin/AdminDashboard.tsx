import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users, CalendarCheck, Clock, XCircle, CheckCircle, Flame } from "lucide-react";
import type { DashboardStats } from "../../types";
import { adminService } from "../../../services";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
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
          Resumen general del sistema de reservas
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Propietarios Registrados"
          value={stats.totalOwners}
          icon={<Users className="h-4 w-4 text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          title="Total Parrillas"
          value={stats.totalGrills}
          icon={<Flame className="h-4 w-4 text-orange-600" />}
          color="bg-orange-100"
        />
        <StatCard
          title="Total Reservaciones"
          value={stats.totalReservations}
          icon={<CalendarCheck className="h-4 w-4 text-indigo-600" />}
          color="bg-indigo-100"
        />
        <StatCard
          title="Pendientes"
          value={stats.pendingReservations}
          icon={<Clock className="h-4 w-4 text-yellow-600" />}
          color="bg-yellow-100"
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
  );
}
