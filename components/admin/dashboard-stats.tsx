"use client";

import {
  Calendar01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardStatsProps {
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    today: number;
    todayDate: string;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      title: "Pending Triage",
      value: stats.pending,
      description: "Needs doctor/reception review",
      href: "/admin/appointments?status=pending",
      icon: Clock01Icon,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      pill: stats.pending > 0 ? "Requires Action" : "All Clear",
      pillClass:
        stats.pending > 0
          ? "bg-amber-100 text-amber-800"
          : "bg-emerald-100 text-emerald-800",
    },
    {
      title: "Today's Schedule",
      value: stats.today,
      description: `Appointments on ${stats.todayDate}`,
      href: "/admin/appointments?date=today",
      icon: Calendar01Icon,
      color: "text-teal-700",
      bg: "bg-teal-50",
      border: "border-teal-200",
      pill: "Today (IST)",
      pillClass: "bg-teal-100 text-teal-800",
    },
    {
      title: "Confirmed",
      value: stats.confirmed,
      description: "Slots accepted & notified",
      href: "/admin/appointments?status=confirmed",
      icon: CheckmarkCircle01Icon,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      pill: "Active",
      pillClass: "bg-emerald-100 text-emerald-800",
    },
    {
      title: "Completed",
      value: stats.completed,
      description: "Consultations finished",
      href: "/admin/appointments?status=completed",
      icon: UserGroupIcon,
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
      pill: "Finished",
      pillClass: "bg-blue-100 text-blue-800",
    },
    {
      title: "Cancelled / Rejected",
      value: stats.cancelled,
      description: "Declined or withdrawn requests",
      href: "/admin/appointments?status=cancelled",
      icon: Cancel01Icon,
      color: "text-rose-700",
      bg: "bg-rose-50",
      border: "border-rose-200",
      pill: "Closed",
      pillClass: "bg-rose-100 text-rose-800",
    },
    {
      title: "Total Inquiries",
      value: stats.total,
      description: "All-time patient submissions",
      href: "/admin/appointments",
      icon: UserGroupIcon,
      color: "text-slate-700",
      bg: "bg-slate-50",
      border: "border-slate-200",
      pill: "Lifetime",
      pillClass: "bg-slate-100 text-slate-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.title}
          href={card.href}
          className="group block transition-transform hover:-translate-y-0.5"
        >
          <Card
            className={`border ${card.border} transition-shadow hover:shadow-md bg-white`}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div
                  className={`flex size-11 items-center justify-center rounded-xl ${card.bg}`}
                >
                  <HugeiconsIcon
                    icon={card.icon}
                    className={`size-5 ${card.color}`}
                  />
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${card.pillClass}`}
                >
                  {card.pill}
                </span>
              </div>

              <div className="mt-4">
                <div className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                  {card.value}
                </div>
                <div className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.title}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
