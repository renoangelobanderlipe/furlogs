import { useQuery } from "@tanstack/react-query";
import type { DashboardFilters } from "@/lib/api/dashboard";
import { dashboardEndpoints } from "@/lib/api/dashboard";
import { dashboardKeys, QUERY_STALE_TIME } from "./queryKeys";

export function useDashboardSummary(filters?: DashboardFilters) {
  return useQuery({
    queryKey: dashboardKeys.summary(filters),
    queryFn: () => dashboardEndpoints.summary(filters).then((r) => r.data.data),
    staleTime: QUERY_STALE_TIME,
  });
}
