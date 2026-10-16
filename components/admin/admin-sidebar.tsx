"use client";

import {
  ArrowLeft01Icon,
  Calendar01Icon,
  Cancel01Icon,
  Clock01Icon,
  DashboardSquare01Icon,
  Logout01Icon,
  Menu01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { logoutAdminAction } from "@/actions/admin";
import { clinicConfig } from "@/config/clinic";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  pendingCount?: number;
}

export function AdminSidebar({ pendingCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logoutAdminAction();
      toast.success("Logged out successfully");
      router.push("/admin/login");
      router.refresh();
    } catch (_err) {
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  const navLinks = [
    {
      label: "Overview",
      href: "/admin",
      icon: DashboardSquare01Icon,
      exact: true,
    },
    {
      label: "Appointments",
      href: "/admin/appointments",
      icon: Calendar01Icon,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      label: "Schedule & Slots",
      href: "/admin/schedule",
      icon: Clock01Icon,
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-slate-900 text-slate-100">
      {/* Top Section */}
      <div>
        {/* Brand / Logo */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/30">
              <span className="text-base font-bold">A</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-white tracking-tight">
                {clinicConfig.name}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-teal-400">
                <span className="size-1.5 rounded-full bg-teal-400 animate-pulse" />
                Doctor Portal
              </div>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
          </button>
        </div>

        {/* Doctor Quick Badge */}
        <div className="mx-4 my-4 rounded-xl border border-slate-800 bg-slate-800/50 p-3">
          <div className="text-xs font-medium text-slate-200">
            {clinicConfig.doctor.name}
          </div>
          <div className="text-[11px] text-slate-400">
            {clinicConfig.doctor.credentials}
          </div>
          <div className="mt-1 text-[10px] text-teal-400/90 truncate">
            {clinicConfig.doctor.hospitalAffiliation.designation}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 px-3">
          <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Clinic Management
          </div>
          {navLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                )}
              >
                <div className="flex items-center gap-3">
                  <HugeiconsIcon
                    icon={link.icon}
                    className={cn(
                      "size-4.5",
                      isActive ? "text-white" : "text-slate-400",
                    )}
                  />
                  <span>{link.label}</span>
                </div>
                {link.badge !== null && link.badge !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      isActive
                        ? "bg-white text-teal-800"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                    )}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-slate-800 p-4 space-y-3">
        {/* Link back to public site */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          <span>View Public Website</span>
        </Link>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-800/40 px-3 py-2 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-950/30 hover:border-rose-900/50 disabled:opacity-50"
        >
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Logout01Icon}
              className="size-4 text-rose-400"
            />
            <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
          </div>
          <span className="text-[10px] text-slate-500">Secure</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header with Hamburger */}
      <div className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-xs">
            A
          </div>
          <span className="font-semibold text-sm text-slate-900">
            {clinicConfig.name} Admin
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <HugeiconsIcon icon={Menu01Icon} className="size-5" />
        </button>
      </div>

      {/* Mobile Drawer Backdrop & Panel */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity border-0 p-0 cursor-default"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="relative z-10 w-72 max-w-[80vw]">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col z-20">
        {sidebarContent}
      </aside>
    </>
  );
}
