"use client";

import { AlertTriangle, CheckCircle, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authEndpoints } from "@/lib/api/endpoints";
import { useAuthStore } from "@/stores/useAuthStore";

function VerifyEmailContent() {
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

  // Allows a user to abandon this account/session and register with a
  // different email — resolves the "signup loop" edge case where the proxy
  // keeps redirecting them away from /register because they still have an
  // active session for an unverified account.
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
    <Card className="w-full max-w-md animate-fade-in-up">
      <CardContent className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Verify your email</h1>
        <p className="text-sm text-muted-foreground mb-6">
          We&apos;ve sent a verification link to your email address. Click the
          link to activate your account before continuing.
        </p>

        {isInvalidLink && (
          <div className="mb-4 flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2.5 text-left">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">
              This verification link is invalid or has expired. Please request a
              new one.
            </p>
          </div>
        )}

        {resent && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-success/10 border border-success/30 px-3 py-2 text-left">
            <CheckCircle className="h-4 w-4 text-success shrink-0" />
            <p className="text-sm text-success">
              A new verification link has been sent to your email.
            </p>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={handleResend}
          disabled={isSending || resent}
        >
          {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSending ? "Sending..." : "Resend verification email"}
        </Button>

        <p className="mt-4 text-sm text-muted-foreground">
          Wrong account?{" "}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="font-medium text-primary hover:underline disabled:opacity-50"
          >
            {isLoggingOut
              ? "Signing out…"
              : "Sign out and use a different email"}
          </button>
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
