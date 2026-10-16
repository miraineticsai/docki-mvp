"use client";

import {
  ArrowLeft01Icon,
  EyeIcon,
  LockIcon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { toast } from "sonner";
import { loginAdminAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clinicConfig } from "@/config/clinic";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFillDemo = () => {
    setEmail("doctor@auraclinic.com");
    setPassword("AuraDoc@2026!");
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const res = await loginAdminAction({ email, password });
        if (res.success) {
          toast.success("Welcome back! Redirecting to dashboard...");
          router.push(redirectUrl);
          router.refresh();
        } else {
          setErrorMessage(res.message);
          toast.error(res.message);
        }
      } catch {
        setErrorMessage("An unexpected error occurred. Please try again.");
        toast.error("Sign in failed. Check your network connection.");
      }
    });
  };

  return (
    <Card className="w-full max-w-md border-slate-200 bg-white shadow-xl">
      <CardHeader className="space-y-2 text-center pb-6 border-b border-slate-100">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-teal-600 text-white font-bold text-lg shadow-md shadow-teal-600/20">
          A
        </div>
        <div>
          <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
            Doctor & Staff Portal
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-1">
            {clinicConfig.name} &bull; Dhankawadi, Pune
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {errorMessage && (
          <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <span className="font-semibold">Access Denied:</span> {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <Label
              htmlFor="admin-email"
              className="text-xs font-semibold text-slate-700"
            >
              Doctor / Staff Email
            </Label>
            <div className="relative">
              <HugeiconsIcon
                icon={Mail01Icon}
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                placeholder="doctor@auraclinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 text-xs h-10 border-slate-300 focus-visible:border-teal-600"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="admin-password"
                className="text-xs font-semibold text-slate-700"
              >
                Password
              </Label>
            </div>
            <div className="relative">
              <HugeiconsIcon
                icon={LockIcon}
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-9 text-xs h-10 border-slate-300 focus-visible:border-teal-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                <HugeiconsIcon icon={EyeIcon} className="size-4" />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs h-10 mt-2 shadow-sm"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Verifying credentials...</span>
              </div>
            ) : (
              "Sign In to Dashboard"
            )}
          </Button>
        </form>

        {/* Demo Helper Box */}
        <div className="mt-6 rounded-xl border border-teal-100 bg-teal-50/60 p-3.5 text-xs text-teal-900">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-teal-800">
              Demo Credentials
            </span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] font-bold text-teal-700 hover:text-teal-900 underline"
            >
              Auto-fill
            </button>
          </div>
          <div className="mt-1 font-mono text-[11px] text-teal-800/90 space-y-0.5">
            <div>Email: doctor@auraclinic.com</div>
            <div>Password: AuraDoc@2026!</div>
          </div>
          <div className="mt-2 text-[10px] text-teal-700/80">
            Configured via{" "}
            <code className="font-mono bg-teal-100/80 px-1 py-0.5 rounded">
              ADMIN_EMAIL
            </code>{" "}
            and{" "}
            <code className="font-mono bg-teal-100/80 px-1 py-0.5 rounded">
              ADMIN_PASSWORD
            </code>
            .
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-teal-50/50 via-white to-slate-50 px-4 py-12">
      {/* Back to clinic website link */}
      <div className="mb-6 w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-teal-700 transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
          <span>Back to Clinic Website</span>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="w-full max-w-md h-96 rounded-2xl bg-white shadow-xl animate-pulse" />
        }
      >
        <AdminLoginForm />
      </Suspense>

      {/* Security notice */}
      <div className="mt-8 text-center text-xs text-slate-400">
        Protected by encrypted session cookies &amp; server-side authorization.
      </div>
    </div>
  );
}
