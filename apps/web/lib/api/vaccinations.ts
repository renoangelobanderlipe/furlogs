import type {
  VaccinationFormValues,
  VaccinationUpdateFormValues,
} from "@/lib/validation/vaccination.schema";
import { apiClient } from "./client";
import type { PaginatedResponse, SingleResourceResponse } from "./pets";

export type VaccinationStatus = "up_to_date" | "due_soon" | "overdue";

export const VACCINATION_STATUS_COLOR: Record<
  VaccinationStatus,
  "success" | "warning" | "error"
> = {
  up_to_date: "success",
  due_soon: "warning",
  overdue: "error",
};

export const VACCINATION_STATUS_LABEL: Record<VaccinationStatus, string> = {
  up_to_date: "Up to date",
  due_soon: "Due soon",
  overdue: "Overdue",
};

export interface VaccinationAttributes {
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

export interface Vaccination {
  id: string;
  type: "vaccinations";
  attributes: VaccinationAttributes;
  relationships?: {
    pet?: { data: { id: string; type: "pets" } };
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
