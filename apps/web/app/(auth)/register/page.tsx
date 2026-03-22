"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PawPrint } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authEndpoints } from "@/lib/api/endpoints";
import {
  type RegisterFormValues,
  registerSchema,
} from "@/lib/validation/auth.schema";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await authEndpoints.csrfCookie();
      await authEndpoints.register(values);
      toast.success("Account created! Please verify your email.");
      router.replace("/verify-email");
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
      const firstError = response.data?.errors
        ? Object.values(response.data.errors).flat()[0]
        : (response.data?.message ?? "Registration failed. Please try again.");
      const message =
        firstError?.toLowerCase().includes("already been taken") ||
        firstError?.toLowerCase().includes("already registered")
          ? "An account with this email already exists. Try signing in or check your inbox for a verification email."
          : (firstError ?? "Registration failed. Please try again.");
      setServerError(message);
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
          Create your account
        </h1>
        <p className="text-[14px] text-muted-foreground">
          Start tracking your pets&apos; care with FurLog
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
            htmlFor="name"
            className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest"
          >
            Full name
          </Label>
          <Input
            {...register("name")}
            id="name"
            autoComplete="name"
            placeholder="Jane Smith"
            className="h-11 bg-white/[0.04] border-white/[0.08] focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 text-[14px] placeholder:text-muted-foreground/35"
          />
          {errors.name && (
            <p className="text-[12px] text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

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
          <Label
            htmlFor="password"
            className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest"
          >
            Password
          </Label>
          <Input
            {...register("password")}
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="h-11 bg-white/[0.04] border-white/[0.08] focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 text-[14px] placeholder:text-muted-foreground/35"
          />
          {errors.password ? (
            <p className="text-[12px] text-destructive">
              {errors.password.message}
            </p>
          ) : (
            <p className="text-[12px] text-muted-foreground/50">
              Min 8 chars, 1 uppercase, 1 number
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="password_confirmation"
            className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest"
          >
            Confirm password
          </Label>
          <Input
            {...register("password_confirmation")}
            id="password_confirmation"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="h-11 bg-white/[0.04] border-white/[0.08] focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 text-[14px] placeholder:text-muted-foreground/35"
          />
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
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/[0.06]">
        <p className="text-[13px] text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
