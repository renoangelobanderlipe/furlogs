import { apiClient } from "./client";
import type { PaginatedResponse, SingleResourceResponse } from "./pets";

export interface VetClinicAttributes {
  name: string;
  address: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VetClinic {
  id: string;
  type: "vet-clinics";
  attributes: VetClinicAttributes;
}

export interface VetClinicPayload {
  name: string;
  address?: string;
  phone?: string;
  notes?: string;
}

export const vetClinicEndpoints = {
  list: (page = 1) =>
    apiClient.get<PaginatedResponse<VetClinic>>("/api/vet-clinics", {
      params: { page },
    }),

  get: (id: string) =>
    apiClient.get<SingleResourceResponse<VetClinic>>(`/api/vet-clinics/${id}`),

  create: (data: VetClinicPayload) =>
    apiClient.post<SingleResourceResponse<VetClinic>>("/api/vet-clinics", data),

  update: (id: string, data: Partial<VetClinicPayload>) =>
    apiClient.patch<SingleResourceResponse<VetClinic>>(
      `/api/vet-clinics/${id}`,
      data,
    ),

  delete: (id: string) => apiClient.delete(`/api/vet-clinics/${id}`),
};
