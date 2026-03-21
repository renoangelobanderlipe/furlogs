"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { authEndpoints } from "@/lib/api/endpoints";
import {
  type ConfirmPasswordFormValues,
  confirmPasswordSchema,
} from "@/lib/validation/auth.schema";

interface PasswordConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirmed: () => void;
}

export function PasswordConfirmDialog({
  open,
  onClose,
  onConfirmed,
}: PasswordConfirmDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

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
    setServerError(null);
    onClose();
  };

  const onSubmit = async (values: ConfirmPasswordFormValues) => {
    setServerError(null);
    setIsPending(true);
    try {
      await authEndpoints.confirmPassword({ password: values.password });
      reset();
      setServerError(null);
      onConfirmed();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 422 || status === 423) {
        setServerError(
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Incorrect password. Please try again.",
        );
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setIsPending(false);
    }
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
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="global-confirm-password">Password</Label>
            <Input
              {...register("password")}
              id="global-confirm-password"
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
            {serverError && (
              <p className="text-xs text-destructive">{serverError}</p>
            )}
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
