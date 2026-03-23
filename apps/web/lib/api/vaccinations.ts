import type {
  VaccinationFormValues,
  VaccinationUpdateFormValues,
} from "@/lib/validation/vaccination.schema";
import { apiClient } from "./client";
import type { PaginatedResponse, SingleResourceResponse } from "./pets";
import type { VetClinic } from "./vet-clinics";

export type VaccinationStatus = "up_to_date" | "due_soon" | "overdue";

interface VaccinationAttributes {
  petId: string;
  clinicId: string | null;
  vaccineName: string;
  administeredDate: string;
  nextDueDate: string | null;
  vetName: string | null;
  batchNumber: string | null;
  notes: string | null;
  daysUntilDue: number | null;
  status: VaccinationStatus | null;
}

interface Vaccination {
  id: string;
  type: "vaccinations";
  attributes: VaccinationAttributes;
  relationships?: {
    pet?: { data: { id: string; type: "pets" } };
    clinic?: VetClinic;
  };
}

export interface VaccinationFilters {
  petId?: string;
  status?: VaccinationStatus;
  page?: number;
  per_page?: number;
}

export const vaccinationEndpoints = {
  list: (filters?: VaccinationFilters) =>
    apiClient.get<PaginatedResponse<Vaccination>>("/api/vaccinations", {
      params: filters,
    }),

  get: (id: string) =>
    apiClient.get<SingleResourceResponse<Vaccination>>(
      `/api/vaccinations/${id}`,
    ),

  create: (data: VaccinationFormValues) =>
    apiClient.post<SingleResourceResponse<Vaccination>>(
      "/api/vaccinations",
      data,
    ),

  update: (id: string, data: VaccinationUpdateFormValues) =>
    apiClient.patch<SingleResourceResponse<Vaccination>>(
      `/api/vaccinations/${id}`,
      data,
    ),

  delete: (id: string) => apiClient.delete(`/api/vaccinations/${id}`),
};
