import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractApiError } from "@/lib/api/extractApiError";
import {
  type NotificationFilters,
  notificationEndpoints,
} from "@/lib/api/notifications";
import { notificationKeys, QUERY_STALE_TIME } from "./queryKeys";

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () =>
      notificationEndpoints.unreadCount().then((r) => r.data.data.count),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useNotifications(
  filters?: NotificationFilters,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => notificationEndpoints.list(filters).then((r) => r.data),
    staleTime: QUERY_STALE_TIME,
    enabled: options?.enabled,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      notificationEndpoints.markRead(id).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(
          error,
          "Failed to mark notification as read. Please try again.",
        ),
      );
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids?: string[]) => notificationEndpoints.markAllRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("All notifications marked as read");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(
          error,
          "Failed to mark all notifications as read. Please try again.",
        ),
      );
    },
  });
}
