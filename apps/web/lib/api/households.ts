import { apiClient } from "./client";

export interface Household {
  id: number;
  name: string;
  created_at: string;
}

export interface HouseholdMember {
  id: number;
  name: string;
  email: string;
  role: "owner" | "member";
  joinedAt: string;
}

export interface HouseholdData {
  id: number;
  name: string;
  members: HouseholdMember[];
}

export interface HouseholdResponse {
  data: HouseholdData;
}

export const householdEndpoints = {
  create: (name: string) =>
    apiClient.post<Household>("/api/households", { name }),

  get: () => apiClient.get<HouseholdResponse>("/api/households/current"),

  update: (id: number, name: string) =>
    apiClient.patch<HouseholdResponse>(`/api/households/${id}`, { name }),

  invite: (id: number, email: string) =>
    apiClient.post<HouseholdResponse>(`/api/households/${id}/invite`, {
      email,
    }),

  removeMember: (householdId: number, userId: number) =>
    apiClient.delete<HouseholdResponse>(
      `/api/households/${householdId}/members/${userId}`,
    ),

  transferOwnership: (householdId: number, userId: number) =>
    apiClient.post<HouseholdResponse>(
      `/api/households/${householdId}/transfer-ownership/${userId}`,
    ),

  delete: (id: number) => apiClient.delete(`/api/households/${id}`),
};
