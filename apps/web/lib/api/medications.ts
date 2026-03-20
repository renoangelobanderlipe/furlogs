import { apiClient } from "./client";
import type { PaginatedResponse, SingleResourceResponse } from "./pets";
import type { Medication } from "./vet-visits";

export interface MedicationPayload {
  pet_id: number;
  vet_visit_id?: number;
  name: string;
  dosage?: string;
  frequency?: string;
  start_date: string;
  end_date?: string;
  notes?: string;
}

export interface MedicationFilters {
  petId?: number;
  vetVisitId?: number;
  page?: number;
  per_page?: number;
}

export const medicationEndpoints = {
  list: (filters?: MedicationFilters) =>
    apiClient.get<PaginatedResponse<Medication>>("/api/medications", {
      params: { ...filters, include: "pet" },
    }),

  get: (id: number) =>
    apiClient.get<SingleResourceResponse<Medication>>(`/api/medications/${id}`),

  create: (data: MedicationPayload) =>
    apiClient.post<SingleResourceResponse<Medication>>(
      "/api/medications",
      data,
    ),

  update: (id: number, data: Partial<MedicationPayload>) =>
    apiClient.patch<SingleResourceResponse<Medication>>(
      `/api/medications/${id}`,
      data,
    ),

  delete: (id: number) => apiClient.delete(`/api/medications/${id}`),
};
