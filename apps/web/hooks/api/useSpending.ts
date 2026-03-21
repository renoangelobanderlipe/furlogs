import { useQuery } from "@tanstack/react-query";
import { spendingEndpoints } from "@/lib/api/spending";
import { QUERY_STALE_TIME, spendingKeys } from "./queryKeys";

export function useSpendingStats(year?: number) {
  return useQuery({
    queryKey: spendingKeys.stats(year),
    queryFn: () => spendingEndpoints.stats(year).then((r) => r.data.data),
    staleTime: QUERY_STALE_TIME,
  });
}
