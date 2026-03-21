import { apiClient } from "./client";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  two_factor_confirmed_at: string | null;
  current_household_id: number | null;
  timezone: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export const authEndpoints = {
  csrfCookie: () => apiClient.get("/sanctum/csrf-cookie"),

  login: (payload: LoginPayload) =>
    apiClient.post<{ message: string }>("/api/auth/login", payload),

  register: (payload: RegisterPayload) =>
    apiClient.post<{ message: string }>("/api/auth/register", payload),

  logout: () => apiClient.post<{ message: string }>("/api/auth/logout"),

  user: () => apiClient.get<AuthUser>("/api/user"),

  verifyEmail: (url: string) => apiClient.get(url),

  resendVerification: () =>
    apiClient.post<{ message: string }>(
      "/api/auth/email/verification-notification",
    ),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient.post<{ message: string }>("/forgot-password", payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient.post<{ message: string }>("/reset-password", payload),

  // Two-factor authentication — Fortify routes at root (no /api/ prefix)
  enableTwoFactor: () => apiClient.post("/user/two-factor-authentication"),

  disableTwoFactor: () => apiClient.delete("/user/two-factor-authentication"),

  getTwoFactorQrCode: () =>
    apiClient.get<{ svg: string }>("/user/two-factor-qr-code"),

  getTwoFactorSecretKey: () =>
    apiClient.get<{ secretKey: string }>("/user/two-factor-secret-key"),

  getTwoFactorRecoveryCodes: () =>
    apiClient.get<string[]>("/user/two-factor-recovery-codes"),

  regenerateTwoFactorRecoveryCodes: () =>
    apiClient.post("/user/two-factor-recovery-codes"),

  confirmTwoFactor: (data: { code: string }) =>
    apiClient.post("/user/confirmed-two-factor-authentication", data),

  twoFactorChallenge: (data: { code?: string; recovery_code?: string }) =>
    apiClient.post("/two-factor-challenge", data),

  confirmPassword: (data: { password: string }) =>
    apiClient.post("/user/confirm-password", data),
};
