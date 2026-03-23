import { useQuery } from "@tanstack/react-query";
import { activityEndpoints } from "@/lib/api/activity";

const activityKeys = {
  all: ["activity"] as const,
  list: (page: number) => [...activityKeys.all, page] as const,
};

export function useActivity(page = 1) {
  return useQuery({
    queryKey: activityKeys.list(page),
    queryFn: () => activityEndpoints.list(page).then((r) => r.data),
    staleTime: 30_000,
  });
}
