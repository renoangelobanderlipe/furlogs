import { useQuery } from "@tanstack/react-query";
import type { CalendarFilters } from "@/lib/api/calendar";
import { calendarEndpoints } from "@/lib/api/calendar";
import { calendarKeys, QUERY_STALE_TIME } from "./queryKeys";

export function useCalendarEvents(filters: CalendarFilters) {
  return useQuery({
    queryKey: calendarKeys.events(filters),
    queryFn: () => calendarEndpoints.events(filters).then((r) => r.data.data),
    staleTime: QUERY_STALE_TIME,
    enabled: !!(filters.start && filters.end),
  });
}
