"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, PawPrint } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authEndpoints } from "@/lib/api/endpoints";
import {
  type ResetPasswordFormValues,
  resetPasswordSchema,
} from "@/lib/validation/auth.schema";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  useEffect(() => {
    if (!token || !email) {
      router.replace("/forgot-password");
    }
  }, [token, email, router]);

  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, email, password: "", password_confirmation: "" },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setServerError(null);
    try {
      await authEndpoints.csrfCookie();
      await authEndpoints.resetPassword(values);
      toast.success("Password reset successfully. Please sign in.");
      router.replace("/login");
    } catch (err: unknown) {
      const response = (err as { response?: { data?: { message?: string } } })
        ?.response;
      setServerError(
        response
          ? (response.data?.message ??
              "Something went wrong. Please try again.")
          : "Unable to reach the server. Please check your connection and try again.",
      );
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
          <PawPrint className="h-[18px] w-[18px] text-primary" />
        </div>
        <span className="text-[15px] font-bold tracking-tight">FurLog</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight mb-1.5">
          Reset your password
        </h1>
        <p className="text-[14px] text-muted-foreground">
          Enter a new password for your FurLog account.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 rounded-xl bg-destructive/[0.07] border border-destructive/20 px-3.5 py-2.5">
          <p className="text-[13px] text-destructive">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest"
          >
            New password
          </Label>
          <div className="relative">
            <Input
              {...register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className="h-11 bg-white/[0.04] border-white/[0.08] focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 text-[14px] placeholder:text-muted-foreground/35 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-[12px] text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="password_confirmation"
            className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest"
          >
            Confirm new password
          </Label>
          <div className="relative">
            <Input
              {...register("password_confirmation")}
              id="password_confirmation"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className="h-11 bg-white/[0.04] border-white/[0.08] focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 text-[14px] placeholder:text-muted-foreground/35 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="text-[12px] text-destructive">
              {errors.password_confirmation.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="cta-shimmer w-full h-11 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Resetting..." : "Reset password"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/[0.06]">
        <Link
          href="/login"
          className="text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
