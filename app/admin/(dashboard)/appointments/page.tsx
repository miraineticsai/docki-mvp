import { connection } from "next/server";
import { Suspense } from "react";
import { getAppointmentsListAction } from "@/actions/admin";
import { AdminHeader } from "@/components/admin/admin-header";
import { AppointmentsManager } from "@/components/admin/appointments-manager";
import { Skeleton } from "@/components/ui/skeleton";

export const instant = false;

export default async function AppointmentsPage() {
  await connection();
  const result = await getAppointmentsListAction();
  const initialAppointments = result.success && result.data ? result.data : [];

  return (
    <div>
      <AdminHeader
        title="Appointments Management"
        subtitle="Search, triage, confirm slots, and record clinical consultation notes"
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
          }
        >
          <AppointmentsManager initialAppointments={initialAppointments} />
        </Suspense>
      </div>
    </div>
  );
}
