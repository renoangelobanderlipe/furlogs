import { apiClient } from "./client";

export interface Household {
  id: string;
  name: string;
  created_at: string;
}

export interface HouseholdMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "member";
  joinedAt: string;
}

export interface HouseholdData {
  id: string;
  name: string;
  members: HouseholdMember[];
}

export interface HouseholdResponse {
  data: HouseholdData;
}

export interface UserHousehold {
  id: string;
  name: string;
  role: "owner" | "member";
}

export interface UserHouseholdsResponse {
  data: UserHousehold[];
}

export interface SwitchHouseholdResponse {
  data: { id: string; name: string };
}

export const householdEndpoints = {
  create: (name: string) =>
    apiClient.post<Household>("/api/households", { name }),

  get: () => apiClient.get<HouseholdResponse>("/api/households/current"),

  update: (id: string, name: string) =>
    apiClient.patch<HouseholdResponse>(`/api/households/${id}`, { name }),

  invite: (id: string, email: string) =>
    apiClient.post<HouseholdResponse>(`/api/households/${id}/invite`, {
      email,
    }),

  removeMember: (householdId: string, userId: string) =>
    apiClient.delete<HouseholdResponse>(
      `/api/households/${householdId}/members/${userId}`,
    ),

  transferOwnership: (householdId: string, userId: string) =>
    apiClient.post<HouseholdResponse>(
      `/api/households/${householdId}/transfer-ownership/${userId}`,
    ),

  delete: (id: string) => apiClient.delete(`/api/households/${id}`),

  listUserHouseholds: () =>
    apiClient.get<UserHouseholdsResponse>("/api/user/households"),

  switchHousehold: (householdId: string) =>
    apiClient.patch<SwitchHouseholdResponse>("/api/user/switch-household", {
      household_id: householdId,
    }),
};
