"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Loader2,
  PawPrint,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authEndpoints } from "@/lib/api/endpoints";
import {
  type TwoFactorChallengeFormValues,
  twoFactorChallengeSchema,
} from "@/lib/validation/auth.schema";
import { useAuthStore } from "@/stores/useAuthStore";

export default function TwoFactorChallengePage() {
  const router = useRouter();
  const twoFactorPending = useAuthStore((s) => s.twoFactorPending);
  const setTwoFactorPending = useAuthStore((s) => s.setTwoFactorPending);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const user = useAuthStore((s) => s.user);

  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TwoFactorChallengeFormValues>({
    resolver: zodResolver(twoFactorChallengeSchema),
    defaultValues: { code: "", recovery_code: "" },
  });

  useEffect(() => {
    if (user?.email_verified_at) {
      router.replace("/pets");
    }
  }, [user, router]);

  useEffect(() => {
    if (!twoFactorPending && user === null) {
      router.replace("/login");
    }
  }, [twoFactorPending, user, router]);

  const handleModeToggle = (mode: "totp" | "recovery") => {
    setUseRecoveryCode(mode === "recovery");
    setServerError(null);
    reset({ code: "", recovery_code: "" });
  };

  const handleBackToLogin = () => {
    setTwoFactorPending(false);
    router.replace("/login");
  };

  const onSubmit = async (values: TwoFactorChallengeFormValues) => {
    setServerError(null);
    try {
      const payload = useRecoveryCode
        ? { recovery_code: values.recovery_code }
        : { code: values.code };

      await authEndpoints.twoFactorChallenge(payload);
      setTwoFactorPending(false);
      await fetchUser();
      const currentUser = useAuthStore.getState().user;
      if (!currentUser?.email_verified_at) {
        router.replace("/verify-email");
        return;
      }
      toast.success("Signed in successfully!");
      router.replace("/pets");
    } catch (err: unknown) {
      const response = (
        err as {
          response?: {
            status?: number;
            data?: { message?: string; errors?: Record<string, string[]> };
          };
        }
      )?.response;

      if (!response) {
        toast.error(
          "Unable to reach the server. Please check your connection.",
        );
        return;
      }
      if (response.status === 422) {
        const message = response.data?.errors
          ? Object.values(response.data.errors).flat()[0]
          : (response.data?.message ?? "The provided code was invalid.");
        setServerError(message ?? "The provided code was invalid.");
      } else {
        toast.error(
          response.data?.message ?? "Something went wrong. Please try again.",
        );
      }
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

      {/* Back */}
      <button
        type="button"
        onClick={handleBackToLogin}
        className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to login
      </button>

      {/* Icon + header */}
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/[0.08] border border-primary/20 mb-6">
        {useRecoveryCode ? (
          <KeyRound className="h-7 w-7 text-primary" />
        ) : (
          <ShieldCheck className="h-7 w-7 text-primary" />
        )}
      </div>

      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight mb-1.5">
          Two-factor auth
        </h1>
        <p className="text-[14px] text-muted-foreground">
          {useRecoveryCode
            ? "Enter one of your saved recovery codes."
            : "Enter the 6-digit code from your authenticator app."}
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1 mb-6">
        <button
          type="button"
          onClick={() => handleModeToggle("totp")}
          className={[
            "flex-1 rounded-lg px-3 py-2 text-[12px] font-semibold transition-all",
            !useRecoveryCode
              ? "bg-primary/15 text-primary border border-primary/20"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          Authenticator app
        </button>
        <button
          type="button"
          onClick={() => handleModeToggle("recovery")}
          className={[
            "flex-1 rounded-lg px-3 py-2 text-[12px] font-semibold transition-all",
            useRecoveryCode
              ? "bg-primary/15 text-primary border border-primary/20"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          Recovery code
        </button>
      </div>

      {serverError && (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-destructive/[0.07] border border-destructive/20 px-3.5 py-3">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-[13px] text-destructive">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {!useRecoveryCode ? (
          <div className="space-y-1.5">
            <Label
              htmlFor="code"
              className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest"
            >
              Authentication code
            </Label>
            <Input
              {...register("code")}
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000 000"
              maxLength={6}
              className="h-14 bg-white/[0.04] border-white/[0.08] focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 text-center text-2xl tracking-[0.5em] font-mono placeholder:tracking-normal placeholder:text-muted-foreground/35"
              autoFocus
            />
            {errors.code && (
              <p className="text-[12px] text-destructive">
                {errors.code.message}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label
              htmlFor="recovery_code"
              className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest"
            >
              Recovery code
            </Label>
            <Input
              {...register("recovery_code")}
              id="recovery_code"
              type="text"
              autoComplete="off"
              placeholder="xxxxxxxx-xxxxxxxx"
              className="h-11 bg-white/[0.04] border-white/[0.08] focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 text-[14px] font-mono placeholder:text-muted-foreground/35"
              autoFocus
            />
            {errors.recovery_code && (
              <p className="text-[12px] text-destructive">
                {errors.recovery_code.message}
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="cta-shimmer w-full h-11 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Verifying..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
