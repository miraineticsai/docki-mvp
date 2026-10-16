import { connection } from "next/server";
import { getScheduleConfigAction } from "@/actions/schedule";
import { AdminHeader } from "@/components/admin/admin-header";
import { ScheduleManager } from "@/components/admin/schedule-manager";

export const instant = false;

export default async function AdminSchedulePage() {
  await connection();
  const { config } = await getScheduleConfigAction();

  return (
    <div>
      <AdminHeader
        title="Schedule & Availability"
        subtitle="Manage clinic consultation hours, slot duration, and unavailable dates"
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <ScheduleManager initialConfig={config} />
      </div>
    </div>
  );
}
