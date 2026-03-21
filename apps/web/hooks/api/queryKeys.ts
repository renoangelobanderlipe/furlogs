import type { CalendarFilters } from "@/lib/api/calendar";
import type { DashboardFilters } from "@/lib/api/dashboard";
import type { MedicationFilters } from "@/lib/api/medications";
import type { NotificationFilters } from "@/lib/api/notifications";
import type { PetFilters } from "@/lib/api/pets";
import type { ReminderFilters } from "@/lib/api/reminders";
import type { VaccinationFilters } from "@/lib/api/vaccinations";
import type { VetVisitFilters } from "@/lib/api/vet-visits";

export const QUERY_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const petKeys = {
  all: ["pets"] as const,
  lists: () => [...petKeys.all, "list"] as const,
  list: (filters?: PetFilters) => [...petKeys.lists(), filters] as const,
  details: () => [...petKeys.all, "detail"] as const,
  detail: (id: number) => [...petKeys.details(), id] as const,
  weights: (petId: number) => [...petKeys.detail(petId), "weights"] as const,
};

export const foodProductKeys = {
  all: ["food-products"] as const,
  lists: () => [...foodProductKeys.all, "list"] as const,
  detail: (id: number) => [...foodProductKeys.all, "detail", id] as const,
};

export const foodStockItemKeys = {
  all: ["food-stock-items"] as const,
  lists: () => [...foodStockItemKeys.all, "list"] as const,
};

export const foodProjectionKeys = {
  all: ["food-projections"] as const,
};

export const vetVisitKeys = {
  all: ["vet-visits"] as const,
  lists: () => [...vetVisitKeys.all, "list"] as const,
  list: (filters?: VetVisitFilters) =>
    [...vetVisitKeys.lists(), filters] as const,
  details: () => [...vetVisitKeys.all, "detail"] as const,
  detail: (id: number) => [...vetVisitKeys.details(), id] as const,
};

export const vaccinationKeys = {
  all: ["vaccinations"] as const,
  lists: () => [...vaccinationKeys.all, "list"] as const,
  list: (filters?: VaccinationFilters) =>
    [...vaccinationKeys.lists(), filters] as const,
  details: () => [...vaccinationKeys.all, "detail"] as const,
  detail: (id: number) => [...vaccinationKeys.details(), id] as const,
};

export const medicationKeys = {
  all: ["medications"] as const,
  lists: () => [...medicationKeys.all, "list"] as const,
  list: (filters?: MedicationFilters) =>
    [...medicationKeys.lists(), filters] as const,
  details: () => [...medicationKeys.all, "detail"] as const,
  detail: (id: number) => [...medicationKeys.details(), id] as const,
};

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (filters?: NotificationFilters) =>
    [...notificationKeys.lists(), { filters }] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

export const reminderKeys = {
  all: ["reminders"] as const,
  lists: () => [...reminderKeys.all, "list"] as const,
  list: (filters?: ReminderFilters) =>
    [...reminderKeys.lists(), { filters }] as const,
  detail: (id: number) => [...reminderKeys.all, "detail", id] as const,
};

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: (filters?: DashboardFilters) =>
    [...dashboardKeys.all, "summary", filters] as const,
};

export const calendarKeys = {
  all: ["calendar"] as const,
  events: (filters?: CalendarFilters) =>
    [...calendarKeys.all, "events", filters] as const,
};

export const vetClinicKeys = {
  all: ["vet-clinics"] as const,
  lists: () => [...vetClinicKeys.all, "list"] as const,
  list: (page?: number) => [...vetClinicKeys.lists(), { page }] as const,
  detail: (id: number) => [...vetClinicKeys.all, "detail", id] as const,
};

export const householdKeys = {
  current: () => ["household", "current"] as const,
};

export const administrationKeys = {
  all: ["administrations"] as const,
  forMedication: (medicationId: number, date?: string) =>
    date
      ? ([...administrationKeys.all, "medication", medicationId, date] as const)
      : ([...administrationKeys.all, "medication", medicationId] as const),
};
