import { apiClient } from "./client";
import type { AuthUser } from "./endpoints";

export interface NotificationPreferences {
  vaccination: boolean;
  medication: boolean;
  food: boolean;
  followup: boolean;
}

export const profileEndpoints = {
  update: (name: string) =>
    apiClient.patch<{ data: AuthUser }>("/api/user", { name }),

  changePassword: (payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) => apiClient.patch<{ message: string }>("/api/user/password", payload),

  getNotificationPreferences: () =>
    apiClient.get<{ data: NotificationPreferences }>(
      "/api/user/notification-preferences",
    ),

  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) =>
    apiClient.patch<{ data: NotificationPreferences }>(
      "/api/user/notification-preferences",
      prefs,
    ),
};
