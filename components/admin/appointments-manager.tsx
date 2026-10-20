"use client";

import {
  Calendar01Icon,
  Call02Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  EyeIcon,
  RefreshIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import {
  getAppointmentsListAction,
  updateAppointmentStatusAction,
} from "@/actions/admin";
import { AppointmentDetailDialog } from "@/components/admin/appointment-detail-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Appointment } from "@/db/schema";
import { cn } from "@/lib/utils";

interface AppointmentsManagerProps {
  initialAppointments: Appointment[];
}

export function AppointmentsManager({
  initialAppointments,
}: AppointmentsManagerProps) {
  const searchParams = useSearchParams();
  const initialStatusParam = searchParams.get("status") || "all";
  const initialDateParam = searchParams.get("date") || "all";

  const [appointmentsList, setAppointmentsList] =
    useState<Appointment[]>(initialAppointments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<string>(initialStatusParam);
  const [selectedDateFilter, setSelectedDateFilter] =
    useState<string>(initialDateParam);
  const [, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  // Selected appointment for detail modal
  const [activeAppointment, setActiveAppointment] =
    useState<Appointment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Refresh data from server
  const refreshAppointments = useCallback(
    async (customStatus?: string, customDate?: string) => {
      try {
        setIsLoading(true);
        const res = await getAppointmentsListAction({
          search: searchTerm,
          status: customStatus || selectedStatus,
          dateFilter: customDate || selectedDateFilter,
        });

        if (res.success && res.data) {
          setAppointmentsList(res.data as Appointment[]);
        } else {
          toast.error(res.message || "Failed to fetch appointments");
        }
      } catch {
        toast.error("Network error while updating appointments.");
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm, selectedStatus, selectedDateFilter],
  );

  // Debounced search / filter trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      startTransition(() => {
        refreshAppointments();
      });
    }, 250);

    return () => clearTimeout(handler);
  }, [refreshAppointments]);

  // Status counts for tab badges
  const counts = useMemo(() => {
    const map = {
      all: appointmentsList.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const a of appointmentsList) {
      if (a.status === "pending") map.pending++;
      else if (a.status === "confirmed") map.confirmed++;
      else if (a.status === "completed") map.completed++;
      else if (a.status === "cancelled" || a.status === "rejected")
        map.cancelled++;
    }
    return map;
  }, [appointmentsList]);

  // Quick single-click status updates from table row
  async function handleQuickAction(
    apt: Appointment,
    newStatus: "confirmed" | "cancelled",
    e: React.MouseEvent,
  ) {
    e.stopPropagation();
    try {
      const res = await updateAppointmentStatusAction({
        referenceId: apt.referenceId,
        status: newStatus,
        tokenNumber: apt.tokenNumber,
        doctorNotes: apt.doctorNotes,
      });

      if (res.success && res.appointment) {
        toast.success(res.message);
        setAppointmentsList((prev) =>
          prev.map((item) =>
            item.referenceId === apt.referenceId
              ? (res.appointment as Appointment)
              : item,
          ),
        );
      } else {
        toast.error(res.message || "Failed to update appointment");
      }
    } catch {
      toast.error("Failed to update status.");
    }
  }

  const renderStatusBadge = (s: string, metadata?: unknown) => {
    const isCancelledByUser = Boolean(
      (metadata as Record<string, unknown>)?.cancelledByUser,
    );
    if (isCancelledByUser) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-800 border border-rose-300">
          <span className="size-1.5 rounded-full bg-rose-600" />
          Cancelled (Patient)
        </span>
      );
    }

    switch (s) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-600" />
            Confirmed
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800 border border-blue-200">
            <span className="size-1.5 rounded-full bg-blue-600" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-800 border border-rose-200">
            <span className="size-1.5 rounded-full bg-rose-600" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Search patient name, phone, or reference ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs h-9 bg-slate-50 border-slate-200 focus-visible:bg-white"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Date Filter & Refresh */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
                <span className="px-2 font-medium text-slate-500">Date:</span>
                {[
                  { label: "All Dates", value: "all" },
                  { label: "Today", value: "today" },
                  { label: "Upcoming", value: "upcoming" },
                  { label: "Past", value: "past" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSelectedDateFilter(item.value)}
                    className={cn(
                      "rounded px-2.5 py-1 font-medium transition-colors",
                      selectedDateFilter === item.value
                        ? "bg-white text-teal-800 shadow-xs font-semibold"
                        : "text-slate-600 hover:text-slate-900",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshAppointments()}
                disabled={isLoading}
                className="h-8 text-xs border-slate-200 gap-1.5"
              >
                <HugeiconsIcon
                  icon={RefreshIcon}
                  className={cn(
                    "size-3.5",
                    isLoading && "animate-spin text-teal-700",
                  )}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
            {[
              { id: "all", label: "All Requests", count: counts.all },
              { id: "pending", label: "Pending Review", count: counts.pending },
              { id: "confirmed", label: "Confirmed", count: counts.confirmed },
              { id: "completed", label: "Completed", count: counts.completed },
              { id: "cancelled", label: "Cancelled", count: counts.cancelled },
            ].map((tab) => {
              const active = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStatus(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-teal-700 text-white shadow-xs font-semibold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[10px]",
                      active
                        ? "bg-teal-900 text-teal-100"
                        : "bg-slate-200 text-slate-700",
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Appointments Table */}
      <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-slate-200 hover:bg-transparent">
                <TableHead className="w-32 font-bold text-slate-700 text-xs">
                  Reference ID
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs">
                  Patient Details
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs">
                  Preferred Schedule
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs">
                  Visit Reason
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs">
                  Status
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs">
                  Token
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs">
                  Submitted At
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 text-xs">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                // Skeletons
                [
                  "sk-row-1",
                  "sk-row-2",
                  "sk-row-3",
                  "sk-row-4",
                  "sk-row-5",
                ].map((skKey) => (
                  <TableRow key={skKey}>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-3 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-7 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : appointmentsList.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-48 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <HugeiconsIcon
                          icon={Calendar01Icon}
                          className="size-6"
                        />
                      </div>
                      <div className="font-semibold text-slate-800 text-sm">
                        No appointments found
                      </div>
                      <p className="text-xs text-slate-500 max-w-sm">
                        {searchTerm ||
                        selectedStatus !== "all" ||
                        selectedDateFilter !== "all"
                          ? "Try clearing your search query or switching filter tabs."
                          : "New patient appointment requests submitted on the public website will appear here in real-time."}
                      </p>
                      {(searchTerm ||
                        selectedStatus !== "all" ||
                        selectedDateFilter !== "all") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedStatus("all");
                            setSelectedDateFilter("all");
                          }}
                          className="mt-2 text-xs h-8"
                        >
                          Reset Filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                appointmentsList.map((apt) => (
                  <TableRow
                    key={apt.referenceId}
                    onClick={() => {
                      setActiveAppointment(apt);
                      setDialogOpen(true);
                    }}
                    className="cursor-pointer border-slate-100 hover:bg-teal-50/30 transition-colors"
                  >
                    {/* Reference ID */}
                    <TableCell className="font-mono text-xs font-semibold text-teal-800">
                      {apt.referenceId}
                    </TableCell>

                    {/* Patient Name & Phone */}
                    <TableCell>
                      <div className="font-semibold text-slate-900 text-xs">
                        {apt.patientName}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <HugeiconsIcon
                          icon={Call02Icon}
                          className="size-3 text-teal-700"
                        />
                        <a
                          href={`tel:${apt.patientPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline hover:text-teal-700"
                        >
                          {apt.patientPhone}
                        </a>
                      </div>
                    </TableCell>

                    {/* Preferred Date & Slot */}
                    <TableCell>
                      <div className="font-medium text-slate-800 text-xs flex items-center gap-1">
                        <HugeiconsIcon
                          icon={Calendar01Icon}
                          className="size-3 text-slate-400"
                        />
                        <span>{apt.preferredDate}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <HugeiconsIcon
                          icon={Clock01Icon}
                          className="size-3 text-slate-400"
                        />
                        <span>{apt.preferredTimeSlot}</span>
                      </div>
                    </TableCell>

                    {/* Visit Type */}
                    <TableCell className="text-xs text-slate-700 max-w-[180px] truncate">
                      {apt.visitType}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      {renderStatusBadge(apt.status, apt.metadata)}
                    </TableCell>

                    {/* Token */}
                    <TableCell>
                      {apt.tokenNumber ? (
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {apt.tokenNumber}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>

                    {/* Submitted Date */}
                    <TableCell className="text-[11px] text-slate-500">
                      {new Date(apt.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>

                    {/* Action buttons */}
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={(e) =>
                                handleQuickAction(apt, "confirmed", e)
                              }
                              title="Quick Confirm"
                              className="size-7 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                            >
                              <HugeiconsIcon
                                icon={CheckmarkCircle01Icon}
                                className="size-4"
                              />
                            </button>
                            <button
                              type="button"
                              onClick={(e) =>
                                handleQuickAction(apt, "cancelled", e)
                              }
                              title="Quick Reject"
                              className="size-7 rounded-md bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 flex items-center justify-center transition-colors"
                            >
                              <HugeiconsIcon
                                icon={Cancel01Icon}
                                className="size-4"
                              />
                            </button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveAppointment(apt);
                            setDialogOpen(true);
                          }}
                          className="h-7 text-xs border-slate-200 hover:bg-slate-100 gap-1"
                        >
                          <HugeiconsIcon icon={EyeIcon} className="size-3.5" />
                          <span>View</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Detail Dialog */}
      <AppointmentDetailDialog
        appointment={activeAppointment}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onUpdated={(updated) => {
          setAppointmentsList((prev) =>
            prev.map((item) =>
              item.referenceId === updated.referenceId ? updated : item,
            ),
          );
        }}
      />
    </div>
  );
}
