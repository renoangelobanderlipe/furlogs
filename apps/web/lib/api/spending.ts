import { apiClient } from "./client";

export interface SpendingMonthlyEntry {
  month: number;
  vet: number;
  food: number;
}

export interface SpendingStats {
  year: number;
  vetYtdSpend: number;
  foodYtdSpend: number;
  totalYtdSpend: number;
  monthly: SpendingMonthlyEntry[];
}

export interface SpendingStatsResponse {
  data: SpendingStats;
}

export const spendingEndpoints = {
  stats: (year?: number) =>
    apiClient.get<SpendingStatsResponse>("/api/spending/stats", {
      params: year ? { year } : undefined,
    }),
};
