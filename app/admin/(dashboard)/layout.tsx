import { count, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { getAdminSession } from "@/lib/auth/session";

export const instant = false;

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  // Server-side session guard (Defense-in-depth along with middleware)
  const session = await getAdminSession();
  if (!session.authenticated) {
    redirect("/admin/login");
  }

  // Fetch pending count for sidebar notification badge
  let pendingCount = 0;
  try {
    if (process.env.DATABASE_URL) {
      const res = await db
        .select({ count: count() })
        .from(appointments)
        .where(eq(appointments.status, "pending"));
      pendingCount = res[0]?.count ?? 0;
    }
  } catch (error) {
    console.warn("[AdminLayout DB Warning]:", error);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar pendingCount={pendingCount} />
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
