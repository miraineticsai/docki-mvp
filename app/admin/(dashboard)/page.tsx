import { connection } from "next/server";
import { getDashboardStatsAction } from "@/actions/admin";
import { AdminHeader } from "@/components/admin/admin-header";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { RecentAppointments } from "@/components/admin/recent-appointments";
import { clinicConfig } from "@/config/clinic";

export const instant = false;

export default async function AdminDashboardPage() {
  await connection();
  const statsRes = await getDashboardStatsAction();

  const stats =
    statsRes.success && statsRes.data
      ? statsRes.data
      : {
          total: 0,
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          today: 0,
          todayDate: new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date()),
          recentPending: [],
        };

  return (
    <div>
      <AdminHeader
        title="Dashboard Overview"
        subtitle={`Welcome, ${clinicConfig.doctor.name} (${clinicConfig.doctor.credentials}) — OPD & Patient Triage`}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Metric Cards */}
        <DashboardStats stats={stats} />

        {/* Recent Pending Requests Table */}
        <RecentAppointments pendingAppointments={stats.recentPending || []} />
      </div>
    </div>
  );
}
