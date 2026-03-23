import { apiClient } from "./client";

export interface DashboardPetSummary {
  id: string;
  name: string;
  species: string;
  avatarUrl: string | null;
  latestWeight: { weightKg: number; recordedAt: string } | null;
}

export interface DashboardReminderItem {
  id: string;
  title: string;
  type: string;
  dueDate: string;
  urgency: "high" | "medium" | "low";
  petName: string | null;
}

interface DashboardStockStatus {
  totalOpenItems: number;
  lowCount: number;
  criticalCount: number;
  worstItem: { name: string; daysLeft: number; status: string } | null;
}

interface DashboardVetVisitStats {
  countThisYear: number;
  totalSpendThisYear: number;
  lastVisitDate: string | null;
  lastVisitPetName: string | null;
}

interface DashboardMonthlySpend {
  currentMonth: number;
  previousMonth: number;
  changePercent: number | null;
}

interface DashboardSummary {
  petSummaries: DashboardPetSummary[];
  upcomingReminders: { count: number; items: DashboardReminderItem[] };
  stockStatus: DashboardStockStatus;
  vetVisitStats: DashboardVetVisitStats;
  monthlySpend: DashboardMonthlySpend;
}

export interface DashboardFilters {
  petId?: string;
}

export const dashboardEndpoints = {
  summary: (filters?: DashboardFilters) =>
    apiClient.get<{ data: DashboardSummary }>("/api/dashboard/summary", {
      params: filters?.petId ? { "filter[pet]": filters.petId } : {},
    }),
};
