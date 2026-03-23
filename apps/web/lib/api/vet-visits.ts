import { apiClient } from "./client";
import type { PaginatedResponse, Pet, SingleResourceResponse } from "./pets";
import type { VetClinic } from "./vet-clinics";

interface VetVisitStats {
  ytdVisits: number;
  ytdSpend: number;
  lastVisitDate: string | null;
  topClinic: string | null;
}

export type VetVisitType = "checkup" | "treatment" | "vaccine" | "emergency";

export const VISIT_TYPE_LABEL: Record<VetVisitType, string> = {
  checkup: "Checkup",
  treatment: "Treatment",
  vaccine: "Vaccine",
  emergency: "Emergency",
};

export const VISIT_TYPE_COLOR: Record<
  VetVisitType,
  "info" | "warning" | "success" | "error"
> = {
  checkup: "info",
  treatment: "warning",
  vaccine: "success",
  emergency: "error",
};

export interface VetVisitAttributes {
  petId: string;
  clinicId: string | null;
  vetName: string | null;
  visitDate: string;
  visitType: VetVisitType;
  reason: string;
  diagnosis: string | null;
  treatment: string | null;
  cost: string | null;
  weightAtVisit: string | null;
  followUpDate: string | null;
  notes: string | null;
  attachmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VetVisitAttachment {
  id: number;
  name: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface VetVisit {
  id: string;
  type: "vet-visits";
  attributes: VetVisitAttributes;
  relationships?: {
    pet?: Pet;
    clinic?: VetClinic;
    medications?: Medication[];
    attachments?: VetVisitAttachment[];
  };
}

export interface MedicationAttributes {
  name: string;
  dosage: string | null;
  frequency: string | null;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  isActive: boolean;
  streak?: number;
  administrationCount?: number;
}

export interface Medication {
  id: string;
  type: "medications";
  attributes: MedicationAttributes;
  relationships?: {
    pet?: Pet;
  };
}

export interface VetVisitPayload {
  pet_id: string;
  clinic_id?: string;
  vet_name?: string;
  visit_type: string;
  visit_date: string;
  reason: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  cost?: number;
  weight_at_visit?: number;
  follow_up_date?: string;
}

export interface VetVisitUpdatePayload {
  pet_id?: string;
  clinic_id?: string;
  vet_name?: string;
  visit_type?: string;
  visit_date?: string;
  reason?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  cost?: number;
  weight_at_visit?: number;
  follow_up_date?: string;
}

export interface VetVisitFilters {
  petId?: string;
  visitType?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export const vetVisitEndpoints = {
  list: (filters?: VetVisitFilters) =>
    apiClient.get<PaginatedResponse<VetVisit>>("/api/vet-visits", {
      params: filters,
    }),

  get: (id: string, include?: string) =>
    apiClient.get<SingleResourceResponse<VetVisit>>(`/api/vet-visits/${id}`, {
      params: include ? { include } : {},
    }),

  create: (data: VetVisitPayload) =>
    apiClient.post<SingleResourceResponse<VetVisit>>("/api/vet-visits", data),

  update: (id: string, data: VetVisitUpdatePayload) =>
    apiClient.patch<SingleResourceResponse<VetVisit>>(
      `/api/vet-visits/${id}`,
      data,
    ),

  delete: (id: string) => apiClient.delete(`/api/vet-visits/${id}`),

  bulkDelete: (ids: string[]) =>
    apiClient.delete("/api/vet-visits/bulk", { data: { ids } }),

  addAttachment: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("attachment", file);
    return apiClient.post<{ data: VetVisitAttachment }>(
      `/api/vet-visits/${id}/attachments`,
      fd,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  removeAttachment: (visitId: string, mediaId: number) =>
    apiClient.delete(`/api/vet-visits/${visitId}/attachments/${mediaId}`),

  stats: () => apiClient.get<{ data: VetVisitStats }>("/api/vet-visits/stats"),
};
