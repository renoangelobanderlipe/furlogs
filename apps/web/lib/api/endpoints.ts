import { apiClient } from "./client";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
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
    apiClient.post<{ message: string }>("/api/auth/forgot-password", payload),
};
