import { apiClient } from "./client";
import type { PaginatedResponse } from "./pets";

export type NotificationUrgency = "high" | "medium" | "low";
export type NotificationType =
  | "vaccination_reminder"
  | "medication_reminder"
  | "vet_follow_up"
  | "low_stock"
  | "critical_stock";

export interface NotificationData {
  type: NotificationType;
  title: string;
  pet_id?: string;
  pet_name?: string;
  due_date?: string;
  urgency?: NotificationUrgency;
  food_stock_item_id?: string;
  product_name?: string;
  days_remaining?: number;
  runs_out_date?: string | null;
}

export interface AppNotification {
  id: string;
  type: string;
  data: NotificationData;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationFilters {
  "filter[read]"?: boolean;
  page?: number;
}

export const notificationEndpoints = {
  list: (filters?: NotificationFilters) =>
    apiClient.get<PaginatedResponse<AppNotification>>("/api/notifications", {
      params: filters,
    }),

  markRead: (id: string) =>
    apiClient.patch<{ data: AppNotification }>(`/api/notifications/${id}`),

  markAllRead: (ids?: string[]) =>
    apiClient.post("/api/notifications/mark-read", { ids }),

  unreadCount: () =>
    apiClient.get<{ data: { count: number } }>(
      "/api/notifications/unread-count",
    ),
};
