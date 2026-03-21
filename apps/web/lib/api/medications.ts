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

export interface MedicationAdministration {
  id: number;
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

  listAdministrations: (medicationId: number, date?: string) =>
    apiClient.get<PaginatedResponse<MedicationAdministration>>(
      `/api/medications/${medicationId}/administrations`,
      { params: date ? { date } : {} },
    ),

  logDose: (medicationId: number, data: AdministrationPayload) =>
    apiClient.post<{ data: MedicationAdministration }>(
      `/api/medications/${medicationId}/administrations`,
      data,
    ),

  deleteAdministration: (administrationId: number) =>
    apiClient.delete(`/api/administrations/${administrationId}`),
};
