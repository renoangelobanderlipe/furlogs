import { apiClient } from "./client";

export interface DashboardPetSummary {
  id: number;
  name: string;
  species: string;
  avatarUrl: string | null;
  latestWeight: { weightKg: number; recordedAt: string } | null;
}

export interface DashboardReminderItem {
  id: number;
  title: string;
  type: string;
  dueDate: string;
  urgency: "high" | "medium" | "low";
  petName: string | null;
}

export interface DashboardStockStatus {
  totalOpenItems: number;
  lowCount: number;
  criticalCount: number;
  worstItem: { name: string; daysLeft: number; status: string } | null;
}

export interface DashboardVetVisitStats {
  countThisYear: number;
  totalSpendThisYear: number;
  lastVisitDate: string | null;
  lastVisitPetName: string | null;
}

export interface DashboardMonthlySpend {
  currentMonth: number;
  previousMonth: number;
  changePercent: number | null;
}

export interface DashboardSummary {
  petSummaries: DashboardPetSummary[];
  upcomingReminders: { count: number; items: DashboardReminderItem[] };
  stockStatus: DashboardStockStatus;
  vetVisitStats: DashboardVetVisitStats;
  monthlySpend: DashboardMonthlySpend;
}

export interface DashboardFilters {
  petId?: number;
}

export const dashboardEndpoints = {
  summary: (filters?: DashboardFilters) =>
    apiClient.get<{ data: DashboardSummary }>("/api/dashboard/summary", {
      params: filters?.petId ? { "filter[pet]": filters.petId } : {},
    }),
};
