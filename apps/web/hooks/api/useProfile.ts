import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractApiError } from "@/lib/api/extractApiError";
import {
  type NotificationPreferences,
  profileEndpoints,
} from "@/lib/api/profile";
import { useAuthStore } from "@/stores/useAuthStore";
import { QUERY_STALE_TIME } from "./queryKeys";

const notificationPreferencesKey = [
  "user",
  "notification-preferences",
] as const;

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (name: string) =>
      profileEndpoints.update(name).then((r) => r.data.data),
    onSuccess: (updatedUser) => {
      if (user) setUser({ ...user, ...updatedUser });
      toast.success("Profile updated successfully.");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to update profile. Please try again."),
      );
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: {
      current_password: string;
      password: string;
      password_confirmation: string;
    }) => profileEndpoints.changePassword(payload).then((r) => r.data),
    onSuccess: () => {
      toast.success("Password changed successfully.");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to change password. Please try again."),
      );
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationPreferencesKey,
    queryFn: () =>
      profileEndpoints.getNotificationPreferences().then((r) => r.data.data),
    staleTime: QUERY_STALE_TIME,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) =>
      profileEndpoints
        .updateNotificationPreferences(prefs)
        .then((r) => r.data.data),
    onSuccess: (updated) => {
      queryClient.setQueryData(notificationPreferencesKey, updated);
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to save preference. Please try again."),
      );
    },
  });
}
