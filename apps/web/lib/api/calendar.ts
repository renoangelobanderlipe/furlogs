import { apiClient } from "./client";

export type CalendarEventType =
  | "vet_visit"
  | "vaccination"
  | "medication"
  | "stock_alert"
  | "reminder"
  | "follow_up";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  type: CalendarEventType;
  /** @deprecated Backend will stop sending this — use CALENDAR_EVENT_COLORS[type] instead */
  color?: string;
  url: string;
  petName?: string;
}

/**
 * Maps calendar event types to their display colors.
 * Used as the canonical color source; backward-compatible with the old `event.color` field:
 * prefer `event.color` if present, fall back to this map.
 */
export const CALENDAR_EVENT_COLORS: Record<string, string> = {
  vet_visit: "#2196f3",
  vaccination: "#f44336",
  medication: "#ff9800",
  reminder: "#ff5722",
  follow_up: "#9c27b0",
  stock_alert: "#757575",
};

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
