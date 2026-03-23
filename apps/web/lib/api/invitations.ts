import { apiClient } from "./client";

type InvitationStatus = "pending" | "accepted" | "declined";

interface InvitationDetails {
  id: string;
  token: string;
  status: InvitationStatus;
  expires_at: string;
  household_name: string;
  inviter_name: string;
}

export const invitationEndpoints = {
  get: (token: string) =>
    apiClient.get<{ data: InvitationDetails }>(`/api/invitations/${token}`),
  accept: (token: string) => apiClient.post(`/api/invitations/${token}/accept`),
  decline: (token: string) =>
    apiClient.post(`/api/invitations/${token}/decline`),
};
