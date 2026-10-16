"use client";

import {
  ArrowRight01Icon,
  Calendar01Icon,
  Call02Icon,
  EyeIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useState } from "react";
import { AppointmentDetailDialog } from "@/components/admin/appointment-detail-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Appointment } from "@/db/schema";

interface RecentAppointmentsProps {
  pendingAppointments: Appointment[];
}

export function RecentAppointments({
  pendingAppointments,
}: RecentAppointmentsProps) {
  const [activeAppointment, setActiveAppointment] =
    useState<Appointment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [list, setList] = useState<Appointment[]>(pendingAppointments);

  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <CardTitle className="text-base font-bold text-slate-900">
            Pending Appointment Requests
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Incoming patient submissions requiring confirmation or callback
          </p>
        </div>
        <Link
          href="/admin/appointments?status=pending"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className:
              "text-xs border-slate-200 hover:bg-slate-50 h-8 gap-1 text-teal-800",
          })}
        >
          <span>View All</span>
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {list.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3">
              <HugeiconsIcon icon={Calendar01Icon} className="size-6" />
            </div>
            <div className="text-sm font-semibold text-slate-800">
              Zero pending inquiries!
            </div>
            <p className="text-xs text-slate-400 mt-1">
              All incoming requests have been reviewed and processed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableHead className="text-xs font-bold text-slate-700">
                    Ref ID
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-700">
                    Patient
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-700">
                    Requested Date & Slot
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-700">
                    Visit Type
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-700">
                    Received
                  </TableHead>
                  <TableHead className="text-right text-xs font-bold text-slate-700">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((apt) => (
                  <TableRow
                    key={apt.referenceId}
                    className="cursor-pointer border-slate-100 hover:bg-slate-50/80 transition-colors"
                    onClick={() => {
                      setActiveAppointment(apt);
                      setDialogOpen(true);
                    }}
                  >
                    <TableCell className="font-mono text-xs font-semibold text-teal-700">
                      {apt.referenceId}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900 text-xs">
                        {apt.patientName}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <HugeiconsIcon
                          icon={Call02Icon}
                          className="size-3 text-teal-700"
                        />
                        <span>{apt.patientPhone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-slate-800">
                        {apt.preferredDate}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {apt.preferredTimeSlot}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 max-w-[150px] truncate">
                      {apt.visitType}
                    </TableCell>
                    <TableCell className="text-[11px] text-slate-500">
                      {new Date(apt.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveAppointment(apt);
                          setDialogOpen(true);
                        }}
                        className="h-7 text-xs border-slate-200 hover:bg-slate-100 text-teal-800"
                      >
                        <HugeiconsIcon
                          icon={EyeIcon}
                          className="size-3.5 mr-1"
                        />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <AppointmentDetailDialog
        appointment={activeAppointment}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onUpdated={(updated) => {
          setList((prev) =>
            prev.filter((item) => item.referenceId !== updated.referenceId),
          );
        }}
      />
    </Card>
  );
}
