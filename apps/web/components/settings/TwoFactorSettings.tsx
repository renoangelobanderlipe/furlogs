"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Copy,
  Key,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useConfirmPassword,
  useConfirmTwoFactor,
  useDisableTwoFactor,
  useEnableTwoFactor,
  useRegenerateRecoveryCodes,
  useTwoFactorQrCode,
  useTwoFactorRecoveryCodes,
  useTwoFactorSecretKey,
} from "@/hooks/api/useTwoFactor";
import {
  type ConfirmPasswordFormValues,
  confirmPasswordSchema,
  type TwoFactorConfirmFormValues,
  twoFactorConfirmSchema,
} from "@/lib/validation/auth.schema";
import { useAuthStore } from "@/stores/useAuthStore";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function is423(err: unknown): boolean {
  return (err as { response?: { status?: number } })?.response?.status === 423;
}

function extractErrorMessage(err: unknown): string | null {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? null
  );
}

// ─── Password Confirmation Dialog ────────────────────────────────────────────

interface ConfirmPasswordDialogProps {
  open: boolean;
  isPending: boolean;
  error: string | null;
  onSubmit: (password: string) => void;
  onClose: () => void;
}

function ConfirmPasswordDialog({
  open,
  isPending,
  error,
  onSubmit,
  onClose,
}: ConfirmPasswordDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConfirmPasswordFormValues>({
    resolver: zodResolver(confirmPasswordSchema),
    defaultValues: { password: "" },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (values: ConfirmPasswordFormValues) => {
    onSubmit(values.password);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm your password</DialogTitle>
          <DialogDescription>
            For your security, please confirm your password to continue.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password-field">Password</Label>
            <Input
              {...register("password")}
              id="confirm-password-field"
              type="password"
              autoComplete="current-password"
              autoFocus
              className="bg-background"
              disabled={isPending}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Confirming..." : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

type EnableStep = "idle" | "setup" | "confirm-code" | "recovery-codes";

interface StepIndicatorProps {
  currentStep: EnableStep;
}

const STEPS: { key: EnableStep; label: string }[] = [
  { key: "setup", label: "Scan QR code" },
  { key: "confirm-code", label: "Verify code" },
  { key: "recovery-codes", label: "Save recovery codes" },
];

const STEP_ORDER: EnableStep[] = ["setup", "confirm-code", "recovery-codes"];

function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, index) => {
        const stepIndex = STEP_ORDER.indexOf(step.key);
        const isActive = stepIndex === currentIndex;
        const isComplete = stepIndex < currentIndex;
        const isUpcoming = stepIndex > currentIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isComplete
                      ? "bg-primary/20 text-primary"
                      : "border border-border bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {isComplete ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={[
                  "text-xs whitespace-nowrap",
                  isActive
                    ? "text-foreground font-medium"
                    : isUpcoming
                      ? "text-muted-foreground"
                      : "text-muted-foreground",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={[
                  "h-px w-8 mx-1 mb-4 transition-colors",
                  stepIndex < currentIndex ? "bg-primary/40" : "bg-border",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Recovery Codes Display ───────────────────────────────────────────────────

interface RecoveryCodesDisplayProps {
  codes: string[];
  onDismiss?: () => void;
  dismissLabel?: string;
}

function RecoveryCodesDisplay({
  codes,
  onDismiss,
  dismissLabel = "I have saved these codes",
}: RecoveryCodesDisplayProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(codes.join("\n")).then(() => {
      toast.success("Recovery codes copied to clipboard.");
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Store these recovery codes in a safe place. Each code can only be used
          once.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="shrink-0"
        >
          <Copy className="h-3.5 w-3.5 mr-1.5" />
          Copy
        </Button>
      </div>
      <div className="rounded-md border border-border bg-muted/40 p-4">
        <ul className="grid grid-cols-2 gap-1.5">
          {codes.map((code) => (
            <li
              key={code}
              className="font-mono text-sm text-foreground tracking-wider"
            >
              {code}
            </li>
          ))}
        </ul>
      </div>
      {onDismiss && (
        <Button type="button" size="sm" onClick={onDismiss}>
          <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
          {dismissLabel}
        </Button>
      )}
    </div>
  );
}

// ─── QR Code display ─────────────────────────────────────────────────────────

interface QrCodeImageProps {
  svg: string;
}

/**
 * Renders the Fortify-generated QR code SVG. Content comes from our own API
 * server (not user input) so it is safe to render as HTML. The white
 * background ensures visibility against dark themes.
 */
function QrCodeImage({ svg }: QrCodeImageProps) {
  return (
    <div
      className="w-40 h-40 bg-white rounded-md p-2 flex items-center justify-center"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG is generated by our own Fortify backend, not user input
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// ─── Enable 2FA Flow ──────────────────────────────────────────────────────────

function EnableTwoFactorSection() {
  const [step, setStep] = useState<EnableStep>("idle");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const confirmPassword = useConfirmPassword();
  const enableTwoFactor = useEnableTwoFactor();
  const confirmTwoFactor = useConfirmTwoFactor();

  const isSetupActive = step === "setup" || step === "confirm-code";
  const qrCodeQuery = useTwoFactorQrCode(isSetupActive);
  const secretKeyQuery = useTwoFactorSecretKey(isSetupActive);
  const recoveryCodesQuery = useTwoFactorRecoveryCodes(
    step === "recovery-codes",
  );

  const {
    register,
    handleSubmit,
    reset: resetCodeForm,
    formState: { errors: codeErrors, isSubmitting: isCodeSubmitting },
  } = useForm<TwoFactorConfirmFormValues>({
    resolver: zodResolver(twoFactorConfirmSchema),
    defaultValues: { code: "" },
  });

  // Attempt enable directly — show password dialog only if session is stale (423).
  const handleEnable = async () => {
    try {
      await enableTwoFactor.mutateAsync();
      setStep("setup");
    } catch (err: unknown) {
      if (is423(err)) {
        setShowPasswordDialog(true);
      }
    }
  };

  // Called after the user enters their password in the dialog.
  const handlePasswordConfirm = async (password: string) => {
    setPasswordError(null);
    try {
      await confirmPassword.mutateAsync({ password });
      await enableTwoFactor.mutateAsync();
      setShowPasswordDialog(false);
      setStep("setup");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 422 || status === 423) {
        setPasswordError(
          extractErrorMessage(err) ?? "Incorrect password. Please try again.",
        );
      }
    }
  };

  const handleConfirmCode = async (values: TwoFactorConfirmFormValues) => {
    setCodeError(null);
    try {
      await confirmTwoFactor.mutateAsync({ code: values.code });
      setStep("recovery-codes");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 422) {
        setCodeError(
          extractErrorMessage(err) ?? "The provided code was invalid.",
        );
      }
    }
  };

  const handleSetupComplete = () => {
    setStep("idle");
    resetCodeForm();
    toast.success("Two-factor authentication enabled.");
  };

  const handleCancel = () => {
    setStep("idle");
    resetCodeForm();
    setCodeError(null);
  };

  if (
    step === "setup" ||
    step === "confirm-code" ||
    step === "recovery-codes"
  ) {
    return (
      <div className="space-y-5">
        {/* Step indicator */}
        <div className="flex justify-center pt-1">
          <StepIndicator currentStep={step} />
        </div>

        {/* Step 1: Scan QR code */}
        {step === "setup" && (
          <div className="rounded-lg border border-border bg-muted/20 p-5 space-y-4">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Step 1 of 3
              </p>
              <h4 className="font-medium text-sm">Scan QR code</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app (e.g. Google
              Authenticator, Authy).
            </p>

            {qrCodeQuery.isLoading ? (
              <Skeleton className="h-40 w-40" />
            ) : qrCodeQuery.data?.svg ? (
              <QrCodeImage svg={qrCodeQuery.data.svg} />
            ) : null}

            {secretKeyQuery.data?.secretKey && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Or enter this key manually:
                </p>
                <code className="block rounded bg-muted px-3 py-2 text-sm font-mono tracking-widest break-all">
                  {secretKeyQuery.data.secretKey}
                </code>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                onClick={() => setStep("confirm-code")}
                disabled={qrCodeQuery.isLoading}
              >
                Next
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Verify code */}
        {step === "confirm-code" && (
          <div className="rounded-lg border border-border bg-muted/20 p-5 space-y-4">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Step 2 of 3
              </p>
              <h4 className="font-medium text-sm">Verify code</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Open your authenticator app and enter the 6-digit code to confirm
              setup.
            </p>
            <form
              onSubmit={handleSubmit(handleConfirmCode)}
              noValidate
              className="space-y-3"
            >
              <div className="space-y-1.5">
                <Label htmlFor="2fa-confirm-code">Authentication code</Label>
                <Input
                  {...register("code")}
                  id="2fa-confirm-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={6}
                  className="bg-background max-w-[160px] tracking-widest text-center font-mono text-lg"
                  autoFocus
                />
                {codeErrors.code && (
                  <p className="text-xs text-destructive">
                    {codeErrors.code.message}
                  </p>
                )}
                {codeError && (
                  <p className="text-xs text-destructive">{codeError}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isCodeSubmitting || confirmTwoFactor.isPending}
                >
                  {(isCodeSubmitting || confirmTwoFactor.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirm
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("setup");
                    resetCodeForm();
                    setCodeError(null);
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Save recovery codes */}
        {step === "recovery-codes" && (
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h4 className="font-medium">
                Two-factor authentication enabled!
              </h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Save your recovery codes below. You can use these to access your
              account if you lose your authenticator device.
            </p>
            {recoveryCodesQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
                  <Skeleton key={i} className="h-5 w-40" />
                ))}
              </div>
            ) : recoveryCodesQuery.data ? (
              <RecoveryCodesDisplay
                codes={recoveryCodesQuery.data}
                onDismiss={handleSetupComplete}
              />
            ) : null}
          </div>
        )}

        {/* Password confirmation dialog — shown lazily when session is stale */}
        <ConfirmPasswordDialog
          open={showPasswordDialog}
          isPending={confirmPassword.isPending || enableTwoFactor.isPending}
          error={passwordError}
          onSubmit={handlePasswordConfirm}
          onClose={() => {
            setShowPasswordDialog(false);
            setPasswordError(null);
          }}
        />
      </div>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleEnable}
        disabled={enableTwoFactor.isPending}
      >
        {enableTwoFactor.isPending ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
        ) : (
          <ShieldCheck className="mr-1.5 h-4 w-4" />
        )}
        Enable two-factor authentication
      </Button>

      {/* Password confirmation dialog — shown when idle step gets 423 */}
      <ConfirmPasswordDialog
        open={showPasswordDialog}
        isPending={confirmPassword.isPending || enableTwoFactor.isPending}
        error={passwordError}
        onSubmit={handlePasswordConfirm}
        onClose={() => {
          setShowPasswordDialog(false);
          setPasswordError(null);
        }}
      />
    </>
  );
}

// ─── Disable 2FA Flow ─────────────────────────────────────────────────────────

function DisableTwoFactorSection() {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const confirmPassword = useConfirmPassword();
  const disableTwoFactor = useDisableTwoFactor();

  // Attempt disable directly — show password dialog only if session is stale (423).
  const handleDisable = async () => {
    try {
      await disableTwoFactor.mutateAsync();
    } catch (err: unknown) {
      if (is423(err)) {
        setShowPasswordDialog(true);
      }
    }
  };

  const handlePasswordConfirm = async (password: string) => {
    setPasswordError(null);
    try {
      await confirmPassword.mutateAsync({ password });
      await disableTwoFactor.mutateAsync();
      setShowPasswordDialog(false);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 422 || status === 423) {
        setPasswordError(
          extractErrorMessage(err) ?? "Incorrect password. Please try again.",
        );
      }
    }
  };

  return (
    <>
      <div className="space-y-3">
        {/* Warning callout */}
        <div className="flex items-start gap-2.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-500">
            Disabling 2FA will remove the extra protection from your account.
          </p>
        </div>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleDisable}
          disabled={disableTwoFactor.isPending}
        >
          {disableTwoFactor.isPending ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <ShieldOff className="mr-1.5 h-4 w-4" />
          )}
          Disable two-factor authentication
        </Button>
      </div>

      <ConfirmPasswordDialog
        open={showPasswordDialog}
        isPending={confirmPassword.isPending || disableTwoFactor.isPending}
        error={passwordError}
        onSubmit={handlePasswordConfirm}
        onClose={() => {
          setShowPasswordDialog(false);
          setPasswordError(null);
        }}
      />
    </>
  );
}

// ─── Recovery Codes Management ────────────────────────────────────────────────

function RecoveryCodesSection() {
  const [showCodes, setShowCodes] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showRegenerateWarning, setShowRegenerateWarning] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const confirmPassword = useConfirmPassword();
  const regenerateCodes = useRegenerateRecoveryCodes();
  const recoveryCodesQuery = useTwoFactorRecoveryCodes(showCodes);

  // When the query fires and gets 423, fall back to the password dialog.
  useEffect(() => {
    if (recoveryCodesQuery.error && is423(recoveryCodesQuery.error)) {
      setShowCodes(false);
      setShowPasswordDialog(true);
    }
  }, [recoveryCodesQuery.error]);

  const handleView = () => {
    setShowCodes(true); // triggers the query; 423 is caught in the useEffect above
  };

  const handlePasswordConfirm = async (password: string) => {
    setPasswordError(null);
    try {
      await confirmPassword.mutateAsync({ password });
      setShowPasswordDialog(false);
      setShowCodes(true); // re-enable the query now that session is confirmed
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 422 || status === 423) {
        setPasswordError(
          extractErrorMessage(err) ?? "Incorrect password. Please try again.",
        );
      }
    }
  };

  // Attempt regenerate directly — show password dialog if session is stale.
  const handleRegenerate = async () => {
    try {
      await regenerateCodes.mutateAsync();
      setShowRegenerateWarning(false);
    } catch (err: unknown) {
      if (is423(err)) {
        setShowRegenerateWarning(false);
        setShowPasswordDialog(true);
      }
    }
  };

  const handlePasswordConfirmForRegenerate = async (password: string) => {
    setPasswordError(null);
    try {
      await confirmPassword.mutateAsync({ password });
      await regenerateCodes.mutateAsync();
      setShowPasswordDialog(false);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 422 || status === 423) {
        setPasswordError(
          extractErrorMessage(err) ?? "Incorrect password. Please try again.",
        );
      }
    }
  };

  if (showCodes) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Recovery codes</h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowCodes(false);
              setShowRegenerateWarning(false);
            }}
          >
            Hide
          </Button>
        </div>

        {recoveryCodesQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              <Skeleton key={i} className="h-5 w-40" />
            ))}
          </div>
        ) : recoveryCodesQuery.data ? (
          <RecoveryCodesDisplay codes={recoveryCodesQuery.data} />
        ) : null}

        {/* Regenerate section */}
        {showRegenerateWarning ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-500">
                This will invalidate all 8 existing recovery codes immediately.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRegenerate}
                disabled={regenerateCodes.isPending}
              >
                {regenerateCodes.isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                )}
                {regenerateCodes.isPending ? "Regenerating..." : "Regenerate"}
              </Button>
              <button
                type="button"
                onClick={() => setShowRegenerateWarning(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowRegenerateWarning(true)}
          >
            <Key className="mr-1.5 h-3.5 w-3.5" />
            Regenerate codes
          </Button>
        )}

        {/* Password dialog — shown when regenerate hits a stale session */}
        <ConfirmPasswordDialog
          open={showPasswordDialog}
          isPending={confirmPassword.isPending || regenerateCodes.isPending}
          error={passwordError}
          onSubmit={handlePasswordConfirmForRegenerate}
          onClose={() => {
            setShowPasswordDialog(false);
            setPasswordError(null);
          }}
        />
      </div>
    );
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={handleView}>
        <Key className="mr-1.5 h-3.5 w-3.5" />
        Manage recovery codes
      </Button>

      {/* Password dialog — shown when the recovery codes query hits a stale session */}
      <ConfirmPasswordDialog
        open={showPasswordDialog}
        isPending={confirmPassword.isPending}
        error={passwordError}
        onSubmit={handlePasswordConfirm}
        onClose={() => {
          setShowPasswordDialog(false);
          setPasswordError(null);
        }}
      />
    </>
  );
}

// ─── Main 2FA Settings Section ────────────────────────────────────────────────

export function TwoFactorSettings() {
  const user = useAuthStore((s) => s.user);
  const isEnabled =
    user?.two_factor_confirmed_at !== null &&
    user?.two_factor_confirmed_at !== undefined;

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {isEnabled ? (
            <ShieldCheck className="h-5 w-5 text-green-500 shrink-0" />
          ) : (
            <ShieldOff className="h-5 w-5 text-muted-foreground shrink-0" />
          )}
          <h3 className="font-semibold">Two-factor authentication</h3>
          {isEnabled ? (
            <Badge className="border-transparent bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-green-500/15 ml-1">
              Active
            </Badge>
          ) : (
            <span className="ml-1 inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              Not enabled
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {isEnabled
            ? "Your account is protected with two-factor authentication."
            : "Add an extra layer of security by requiring a verification code at sign in."}
        </p>
      </div>

      {isEnabled ? (
        <div className="space-y-3">
          <RecoveryCodesSection />
          <DisableTwoFactorSection />
        </div>
      ) : (
        <EnableTwoFactorSection />
      )}
    </div>
  );
}
