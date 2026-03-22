"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Loader2, Mail, PawPrint } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authEndpoints } from "@/lib/api/endpoints";
import {
  type ForgotPasswordFormValues,
  forgotPasswordSchema,
} from "@/lib/validation/auth.schema";

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setServerError(null);
    try {
      await authEndpoints.csrfCookie();
      await authEndpoints.forgotPassword(values);
      setSent(true);
      toast.success("Password reset link sent!");
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

      {sent ? (
        /* Success state */
        <div className="animate-fade-in-up">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/[0.1] border border-success/20 mb-6">
            <Mail className="h-7 w-7 text-success" />
          </div>
          <h1 className="text-[28px] font-bold tracking-tight mb-2">
            Check your inbox
          </h1>
          <p className="text-[14px] text-muted-foreground mb-6">
            We&apos;ve sent a password reset link to your email address. It may
            take a minute to arrive.
          </p>
          <div className="flex items-center gap-2 text-[13px] text-success/80">
            <CheckCircle className="h-4 w-4" />
            Reset link sent
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-[28px] font-bold tracking-tight mb-1.5">
              Forgot password?
            </h1>
            <p className="text-[14px] text-muted-foreground">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {serverError && (
            <div className="mb-6 rounded-xl bg-destructive/[0.07] border border-destructive/20 px-3.5 py-2.5">
              <p className="text-[13px] text-destructive">{serverError}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="cta-shimmer w-full h-11 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </>
      )}

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
