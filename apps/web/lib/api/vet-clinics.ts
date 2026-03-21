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

export interface VetClinicFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export const vetClinicEndpoints = {
  list: (filters?: VetClinicFilters) => {
    const params: Record<string, unknown> = {};
    if (filters?.page) params.page = filters.page;
    if (filters?.per_page) params.per_page = filters.per_page;
    if (filters?.search) params.search = filters.search;
    return apiClient.get<PaginatedResponse<VetClinic>>("/api/vet-clinics", {
      params,
    });
  },

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
