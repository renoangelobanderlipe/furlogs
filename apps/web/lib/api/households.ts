import { apiClient } from "./client";

export interface Household {
  id: number;
  name: string;
  created_at: string;
}

export const householdEndpoints = {
  create: (name: string) =>
    apiClient.post<Household>("/api/households", { name }),
};
