import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authEndpoints } from "@/lib/api/endpoints";
import { extractApiError } from "@/lib/api/extractApiError";
import { useAuthStore } from "@/stores/useAuthStore";

const twoFactorKeys = {
  qrCode: ["two-factor", "qr-code"] as const,
  secretKey: ["two-factor", "secret-key"] as const,
  recoveryCodes: ["two-factor", "recovery-codes"] as const,
};

export function useTwoFactorQrCode(enabled: boolean) {
  return useQuery({
    queryKey: twoFactorKeys.qrCode,
    queryFn: () => authEndpoints.getTwoFactorQrCode().then((r) => r.data),
    enabled,
    staleTime: 0,
  });
}

export function useTwoFactorSecretKey(enabled: boolean) {
  return useQuery({
    queryKey: twoFactorKeys.secretKey,
    queryFn: () => authEndpoints.getTwoFactorSecretKey().then((r) => r.data),
    enabled,
    staleTime: 0,
  });
}

export function useTwoFactorRecoveryCodes(enabled: boolean) {
  return useQuery({
    queryKey: twoFactorKeys.recoveryCodes,
    queryFn: () =>
      authEndpoints.getTwoFactorRecoveryCodes().then((r) => r.data),
    enabled,
    staleTime: 0,
  });
}

export function useEnableTwoFactor() {
  return useMutation({
    mutationFn: () => authEndpoints.enableTwoFactor(),
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to enable two-factor authentication."),
      );
    },
  });
}

export function useDisableTwoFactor() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: () => authEndpoints.disableTwoFactor(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: twoFactorKeys.qrCode });
      queryClient.removeQueries({ queryKey: twoFactorKeys.secretKey });
      queryClient.removeQueries({ queryKey: twoFactorKeys.recoveryCodes });
      if (user) {
        setUser({ ...user, two_factor_confirmed_at: null });
      }
      toast.success("Two-factor authentication disabled.");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to disable two-factor authentication."),
      );
    },
  });
}

export function useConfirmTwoFactor() {
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (data: { code: string }) =>
      authEndpoints.confirmTwoFactor(data),
    onSuccess: () => {
      if (user) {
        setUser({
          ...user,
          two_factor_confirmed_at: new Date().toISOString(),
        });
      }
    },
    onError: (error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status !== 422) {
        toast.error(
          extractApiError(error, "Failed to confirm two-factor setup."),
        );
      }
    },
  });
}

export function useRegenerateRecoveryCodes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authEndpoints.regenerateTwoFactorRecoveryCodes(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: twoFactorKeys.recoveryCodes,
      });
      toast.success("Recovery codes regenerated.");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to regenerate recovery codes."),
      );
    },
  });
}

export function useConfirmPassword() {
  return useMutation({
    mutationFn: (data: { password: string }) =>
      authEndpoints.confirmPassword(data),
    onError: (error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status !== 422) {
        toast.error(extractApiError(error, "Password confirmation failed."));
      }
    },
  });
}
