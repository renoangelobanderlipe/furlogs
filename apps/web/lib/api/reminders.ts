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
  householdId: string;
  petId: string | null;
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
  id: string;
  type: "reminders";
  attributes: ReminderAttributes;
}

export interface ReminderFilters {
  status?: ReminderStatus;
  petId?: string;
  type?: ReminderType;
  page?: number;
  per_page?: number;
}

export const reminderEndpoints = {
  list: (filters?: ReminderFilters) =>
    apiClient.get<PaginatedResponse<Reminder>>("/api/reminders", {
      params: filters,
    }),

  get: (id: string) =>
    apiClient.get<SingleResourceResponse<Reminder>>(`/api/reminders/${id}`),

  create: (data: ReminderFormValues) =>
    apiClient.post<SingleResourceResponse<Reminder>>("/api/reminders", {
      pet_id: data.petId ?? null,
      type: data.type,
      title: data.title,
      description: data.description,
      due_date: data.dueDate,
      is_recurring: data.isRecurring,
      recurrence_days: data.recurrenceDays ?? null,
    }),

  update: (id: string, data: ReminderUpdateFormValues) =>
    apiClient.patch<SingleResourceResponse<Reminder>>(`/api/reminders/${id}`, {
      ...(data.petId !== undefined && { pet_id: data.petId ?? null }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.dueDate !== undefined && { due_date: data.dueDate }),
      ...(data.isRecurring !== undefined && { is_recurring: data.isRecurring }),
      ...(data.recurrenceDays !== undefined && {
        recurrence_days: data.recurrenceDays ?? null,
      }),
    }),

  delete: (id: string) => apiClient.delete(`/api/reminders/${id}`),

  complete: (id: string) =>
    apiClient.patch<SingleResourceResponse<Reminder>>(
      `/api/reminders/${id}/complete`,
    ),

  snooze: (id: string, snoozeDays: number) =>
    apiClient.patch<SingleResourceResponse<Reminder>>(
      `/api/reminders/${id}/snooze`,
      { days: snoozeDays },
    ),

  dismiss: (id: string) =>
    apiClient.patch<SingleResourceResponse<Reminder>>(
      `/api/reminders/${id}/dismiss`,
    ),
};
