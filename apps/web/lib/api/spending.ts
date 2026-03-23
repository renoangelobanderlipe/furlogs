import { apiClient } from "./client";

interface SpendingMonthlyEntry {
  month: number;
  vet: number;
  food: number;
}

interface SpendingStats {
  year: number;
  vetYtdSpend: number;
  foodYtdSpend: number;
  totalYtdSpend: number;
  monthly: SpendingMonthlyEntry[];
}

interface SpendingStatsResponse {
  data: SpendingStats;
}

export const spendingEndpoints = {
  stats: (year?: number) =>
    apiClient.get<SpendingStatsResponse>("/api/spending/stats", {
      params: year ? { year } : undefined,
    }),
};
