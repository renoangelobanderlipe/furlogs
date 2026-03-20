import type {
  ReminderFormValues,
  ReminderUpdateFormValues,
} from "@/lib/validation/reminder.schema";
import { apiClient } from "./client";
import type { PaginatedResponse, SingleResourceResponse } from "./pets";

export type ReminderStatus = "pending" | "snoozed" | "completed" | "dismissed";
export type ReminderType =
  | "vaccination"
  | "medication"
  | "vet_appointment"
  | "food_stock"
  | "custom";
export type ReminderUrgency = "high" | "medium" | "low";

export interface ReminderAttributes {
  householdId: number;
  petId: number | null;
  petName: string | null;
  type: ReminderType;
  title: string;
  description: string | null;
  dueDate: string;
  isRecurring: boolean;
  recurrenceDays: number | null;
  status: ReminderStatus;
  urgency: ReminderUrgency;
}

export interface Reminder {
  id: number;
  type: "reminders";
  attributes: ReminderAttributes;
}

export interface ReminderFilters {
  status?: ReminderStatus;
  petId?: number;
  type?: ReminderType;
  page?: number;
}

export const reminderEndpoints = {
  list: (filters?: ReminderFilters) =>
    apiClient.get<PaginatedResponse<Reminder>>("/api/reminders", {
      params: filters,
    }),

  get: (id: number) =>
    apiClient.get<SingleResourceResponse<Reminder>>(`/api/reminders/${id}`),

  create: (data: ReminderFormValues) =>
    apiClient.post<SingleResourceResponse<Reminder>>("/api/reminders", data),

  update: (id: number, data: ReminderUpdateFormValues) =>
    apiClient.patch<SingleResourceResponse<Reminder>>(
      `/api/reminders/${id}`,
      data,
    ),

  delete: (id: number) => apiClient.delete(`/api/reminders/${id}`),

  complete: (id: number) =>
    apiClient.post<SingleResourceResponse<Reminder>>(
      `/api/reminders/${id}/complete`,
    ),

  snooze: (id: number, snoozeDays: number) =>
    apiClient.post<SingleResourceResponse<Reminder>>(
      `/api/reminders/${id}/snooze`,
      { snooze_days: snoozeDays },
    ),

  dismiss: (id: number) =>
    apiClient.post<SingleResourceResponse<Reminder>>(
      `/api/reminders/${id}/dismiss`,
    ),
};
