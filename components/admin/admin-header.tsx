"use client";

import {
  ArrowLeft01Icon,
  Calendar01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
}

export function AdminHeader({ title, subtitle, onRefresh }: AdminHeaderProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Current date formatted in IST
  const todayFormatted = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) {
      onRefresh();
    } else {
      router.refresh();
    }
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Current Date Pill */}
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
            <HugeiconsIcon
              icon={Calendar01Icon}
              className="size-3.5 text-teal-700"
            />
            <span>{todayFormatted} (IST)</span>
          </div>

          {/* Refresh Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 gap-1.5 text-xs font-medium border-slate-200 hover:bg-slate-100"
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              className={`size-3.5 ${isRefreshing ? "animate-spin text-teal-700" : "text-slate-600"}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Public site link */}
          <Link
            href="/"
            target="_blank"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className:
                "h-8 gap-1 text-xs text-teal-700 hover:text-teal-800 hover:bg-teal-50",
            })}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
            <span>Public Site</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
