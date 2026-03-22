"use client";

import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Mail,
  PawPrint,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authEndpoints } from "@/lib/api/endpoints";
import { useAuthStore } from "@/stores/useAuthStore";

export const VerifyEmailContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isInvalidLink = searchParams.get("error") === "invalid_link";
  const logout = useAuthStore((s) => s.logout);

  const [resent, setResent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleResend = async () => {
    setIsSending(true);
    try {
      await authEndpoints.resendVerification();
      setResent(true);
      toast.success("Verification email sent!");
    } catch {
      toast.error("Failed to resend. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      router.replace("/register");
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

      {/* Icon */}
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/[0.08] border border-primary/20 mb-6">
        <Mail className="h-7 w-7 text-primary" />
        <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
          <span className="text-[9px] font-bold text-white">1</span>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight mb-1.5">
          Verify your email
        </h1>
        <p className="text-[14px] text-muted-foreground">
          We&apos;ve sent a verification link to your email address. Click the
          link to activate your account.
        </p>
      </div>

      {isInvalidLink && (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-destructive/[0.07] border border-destructive/20 px-3.5 py-3">
          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-[13px] text-destructive">
            This verification link is invalid or has expired. Please request a
            new one.
          </p>
        </div>
      )}

      {resent && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-success/[0.07] border border-success/20 px-3.5 py-3">
          <CheckCircle className="h-4 w-4 text-success shrink-0" />
          <p className="text-[13px] text-success">
            A new verification link has been sent.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleResend}
          disabled={isSending || resent}
          className="w-full h-11 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07] text-[14px] font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSending ? "Sending..." : "Resend verification email"}
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-white/[0.06] space-y-2">
        <p className="text-[13px] text-muted-foreground">
          Wrong account?{" "}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
          >
            {isLoggingOut
              ? "Signing out\u2026"
              : "Sign out and use a different email"}
          </button>
        </p>
        <p className="text-[13px] text-muted-foreground">
          <Link
            href="/login"
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
