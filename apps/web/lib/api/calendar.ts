import { apiClient } from "./client";

export type CalendarEventType =
  | "vet_visit"
  | "vaccination"
  | "medication"
  | "stock_alert";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  type: CalendarEventType;
  color: string;
  url: string;
  petName?: string;
}

export interface CalendarFilters {
  start: string;
  end: string;
}

export const calendarEndpoints = {
  events: (filters: CalendarFilters) =>
    apiClient.get<{ data: CalendarEvent[] }>("/api/calendar/events", {
      params: filters,
    }),
};
