import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractApiError } from "@/lib/api/extractApiError";
import { type ReminderFilters, reminderEndpoints } from "@/lib/api/reminders";
import type {
  ReminderFormValues,
  ReminderUpdateFormValues,
} from "@/lib/validation/reminder.schema";
import { QUERY_STALE_TIME, reminderKeys } from "./queryKeys";

export function useReminders(filters?: ReminderFilters) {
  return useQuery({
    queryKey: reminderKeys.list(filters),
    queryFn: () => reminderEndpoints.list(filters).then((r) => r.data),
    staleTime: QUERY_STALE_TIME,
  });
}

export function useReminder(id: number) {
  return useQuery({
    queryKey: reminderKeys.detail(id),
    queryFn: () => reminderEndpoints.get(id).then((r) => r.data.data),
    staleTime: QUERY_STALE_TIME,
    enabled: id > 0,
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReminderFormValues) =>
      reminderEndpoints.create(data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      toast.success("Reminder created");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to create reminder. Please try again."),
      );
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: ReminderUpdateFormValues;
    }) => reminderEndpoints.update(id, data).then((r) => r.data.data),
    onSuccess: (reminder) => {
      queryClient.invalidateQueries({
        queryKey: reminderKeys.detail(reminder.id),
      });
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      toast.success("Reminder updated");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to update reminder. Please try again."),
      );
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      reminderEndpoints.delete(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      toast.success("Reminder deleted");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to delete reminder. Please try again."),
      );
    },
  });
}

export function useCompleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      reminderEndpoints.complete(id).then((r) => r.data.data),
    onSuccess: (reminder) => {
      queryClient.invalidateQueries({
        queryKey: reminderKeys.detail(reminder.id),
      });
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      toast.success("Reminder marked complete");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(
          error,
          "Failed to complete reminder. Please try again.",
        ),
      );
    },
  });
}

export function useSnoozeReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, snoozeDays }: { id: number; snoozeDays: number }) =>
      reminderEndpoints.snooze(id, snoozeDays).then((r) => r.data.data),
    onSuccess: (reminder) => {
      queryClient.invalidateQueries({
        queryKey: reminderKeys.detail(reminder.id),
      });
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      toast.success("Reminder snoozed");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to snooze reminder. Please try again."),
      );
    },
  });
}

export function useDismissReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      reminderEndpoints.dismiss(id).then((r) => r.data.data),
    onSuccess: (reminder) => {
      queryClient.invalidateQueries({
        queryKey: reminderKeys.detail(reminder.id),
      });
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      toast.success("Reminder dismissed");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to dismiss reminder. Please try again."),
      );
    },
  });
}
