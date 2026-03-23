import { apiClient } from "./client";
import type { PaginatedResponse, SingleResourceResponse } from "./pets";
import type { Medication } from "./vet-visits";

export const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "twice_daily", label: "Twice Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "as_needed", label: "As Needed" },
] as const;

export type FrequencyValue = (typeof FREQUENCY_OPTIONS)[number]["value"];

interface MedicationAdministration {
  id: string;
  type: "medication_administrations";
  attributes: {
    administeredAt: string; // ISO datetime
    notes: string | null;
    createdAt: string;
  };
}

export interface AdministrationPayload {
  administered_at?: string;
  notes?: string;
}

export interface MedicationPayload {
  pet_id: string;
  vet_visit_id?: string;
  name: string;
  dosage?: string;
  frequency?: string;
  start_date: string;
  end_date?: string;
  notes?: string;
}

export interface MedicationFilters {
  petId?: string;
  vetVisitId?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  per_page?: number;
}

export const medicationEndpoints = {
  list: (filters?: MedicationFilters) =>
    apiClient.get<PaginatedResponse<Medication>>("/api/medications", {
      params: { ...filters, include: "pet" },
    }),

  get: (id: string) =>
    apiClient.get<SingleResourceResponse<Medication>>(`/api/medications/${id}`),

  create: (data: MedicationPayload) =>
    apiClient.post<SingleResourceResponse<Medication>>(
      "/api/medications",
      data,
    ),

  update: (id: string, data: Partial<MedicationPayload>) =>
    apiClient.patch<SingleResourceResponse<Medication>>(
      `/api/medications/${id}`,
      data,
    ),

  delete: (id: string) => apiClient.delete(`/api/medications/${id}`),

  listAdministrations: (medicationId: string, date?: string) =>
    apiClient.get<PaginatedResponse<MedicationAdministration>>(
      `/api/medications/${medicationId}/administrations`,
      { params: date ? { date } : {} },
    ),

  logDose: (medicationId: string, data: AdministrationPayload) =>
    apiClient.post<{ data: MedicationAdministration }>(
      `/api/medications/${medicationId}/administrations`,
      data,
    ),

  updateAdministration: (
    administrationId: string,
    data: AdministrationPayload,
  ) =>
    apiClient.patch<{ data: MedicationAdministration }>(
      `/api/administrations/${administrationId}`,
      data,
    ),

  deleteAdministration: (administrationId: string) =>
    apiClient.delete(`/api/administrations/${administrationId}`),
};
