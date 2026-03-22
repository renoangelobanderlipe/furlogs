"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Eye, EyeOff, Loader2, PawPrint } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authEndpoints } from "@/lib/api/endpoints";
import {
  type LoginFormValues,
  loginSchema,
} from "@/lib/validation/auth.schema";
import { useAuthStore } from "@/stores/useAuthStore";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVerified = searchParams.get("verified") === "1";
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const setTwoFactorPending = useAuthStore((s) => s.setTwoFactorPending);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const remember = watch("remember");

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await authEndpoints.csrfCookie();
      const response = await authEndpoints.login(values);
      if (
        (response.data as { two_factor?: boolean } | null)?.two_factor === true
      ) {
        setTwoFactorPending(true);
        router.replace("/two-factor-challenge");
        return;
      }
      await fetchUser();
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) {
        setServerError("Unable to load your account. Please try again.");
        return;
      }
      if (!currentUser.email_verified_at) {
        router.replace("/verify-email");
        return;
      }
      toast.success("Welcome back!");
      router.replace("/pets");
    } catch (err: unknown) {
      const response = (
        err as {
          response?: {
            data?: { message?: string; errors?: Record<string, string[]> };
          };
        }
      )?.response;
      if (!response) {
        setServerError(
          "Unable to reach the server. Please check your connection and try again.",
        );
        return;
      }
      const message = response.data?.errors
        ? Object.values(response.data.errors).flat()[0]
        : (response.data?.message ?? "Invalid credentials. Please try again.");
      setServerError(message ?? "Invalid credentials. Please try again.");
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
          Welcome back
        </h1>
        <p className="text-[14px] text-muted-foreground">
          Sign in to your FurLog account
        </p>
      </div>

      {isVerified && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-success/[0.07] border border-success/20 px-3.5 py-2.5">
          <CheckCircle className="h-[15px] w-[15px] text-success shrink-0" />
          <p className="text-[13px] text-success">
            Email verified! Sign in to continue.
          </p>
        </div>
      )}

      {serverError && (
        <div className="mb-6 rounded-xl bg-destructive/[0.07] border border-destructive/20 px-3.5 py-2.5">
          <p className="text-[13px] text-destructive">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest"
          >
            Email
          </Label>
          <Input
            {...register("email")}
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-11 bg-white/[0.04] border-white/[0.08] focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 text-[14px] placeholder:text-muted-foreground/35"
          />
          {errors.email && (
            <p className="text-[12px] text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest"
            >
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-[12px] text-primary/70 hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              {...register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
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

        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={remember}
            onCheckedChange={(checked) => setValue("remember", !!checked)}
          />
          <Label
            htmlFor="remember"
            className="text-[13px] font-normal text-muted-foreground cursor-pointer"
          >
            Remember me
          </Label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="cta-shimmer w-full h-11 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/[0.06]">
        <p className="text-[13px] text-muted-foreground">
          No account?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
