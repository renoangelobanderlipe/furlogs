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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  // If user is already fully authenticated AND verified, go to pets.
  // The email_verified_at check is required so this effect doesn't race
  // against the onSubmit handler when fetchUser() resolves with an unverified
  // user — without it, both would fire and the result would be non-deterministic.
  useEffect(() => {
    if (user?.email_verified_at) {
      router.replace("/pets");
    }
  }, [user, router]);

  // If 2FA is not pending and no user is authenticated, go to login
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
      // Apply the same verification gate as the login page.
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
    <Card className="w-full max-w-sm animate-fade-in-up">
      <CardContent className="p-6">
        {/* Back to login */}
        <button
          type="button"
          onClick={handleBackToLogin}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </button>

        {/* Header */}
        <div className="mb-5 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            {useRecoveryCode ? (
              <KeyRound className="h-6 w-6 text-primary" />
            ) : (
              <ShieldCheck className="h-6 w-6 text-primary" />
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Two-factor authentication
          </h1>
        </div>

        {/* Mode toggle tabs */}
        <div className="mb-5 flex rounded-lg border border-border bg-muted/30 p-1 gap-1">
          <button
            type="button"
            onClick={() => handleModeToggle("totp")}
            className={[
              "flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors",
              !useRecoveryCode
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            Authenticator app
          </button>
          <button
            type="button"
            onClick={() => handleModeToggle("recovery")}
            className={[
              "flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors",
              useRecoveryCode
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            Recovery code
          </button>
        </div>

        {/* Error banner */}
        {serverError && (
          <div className="mb-4 flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">{serverError}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          {!useRecoveryCode ? (
            <div className="space-y-1.5">
              <Label htmlFor="code">Authentication code</Label>
              <Input
                {...register("code")}
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000 000"
                maxLength={6}
                className="bg-card h-12 text-center text-2xl tracking-[0.5em] font-mono"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code from your authenticator app.
              </p>
              {errors.code && (
                <p className="text-xs text-destructive">
                  {errors.code.message}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="recovery_code">Recovery code</Label>
              <Input
                {...register("recovery_code")}
                id="recovery_code"
                type="text"
                autoComplete="off"
                placeholder="xxxxxxxx-xxxxxxxx"
                className="bg-card font-mono"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter one of your saved recovery codes.
              </p>
              {errors.recovery_code && (
                <p className="text-xs text-destructive">
                  {errors.recovery_code.message}
                </p>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Verifying..." : "Continue"}
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <PawPrint className="h-3.5 w-3.5" />
          <span>FurLog</span>
        </div>
      </CardContent>
    </Card>
  );
}
