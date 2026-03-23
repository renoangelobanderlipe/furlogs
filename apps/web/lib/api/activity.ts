import { apiClient } from "./client";
import type { PaginatedResponse } from "./pets";

export interface ActivityEntry {
  id: number;
  description: string;
  event: string | null;
  subject_type: string;
  causer_name: string;
  causer_id: string | null;
  created_at: string;
}

export type ActivitySubjectType =
  | "pet"
  | "vet_visit"
  | "medication"
  | "vaccination"
  | "reminder"
  | "food_stock"
  | "invitation";

export const activityEndpoints = {
  list: (page = 1) =>
    apiClient.get<PaginatedResponse<ActivityEntry>>("/api/activity", {
      params: { page },
    }),
};
