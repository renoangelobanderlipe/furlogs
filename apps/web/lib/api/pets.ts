import type {
  PetFormValues,
  PetUpdateFormValues,
} from "@/lib/validation/pet.schema";
import type { WeightFormValues } from "@/lib/validation/pet-weight.schema";
import { apiClient } from "./client";

export interface PetAttributes {
  name: string;
  species: "dog" | "cat";
  breed: string | null;
  sex: "male" | "female";
  birthday: string | null;
  age: number | null;
  isNeutered: boolean;
  size: "small" | "medium" | "large" | null;
  notes: string | null;
  avatarUrl: string | null;
  thumbUrl: string | null;
  latestWeightKg: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pet {
  id: number;
  type: "pets";
  attributes: PetAttributes;
}

export interface PetWeightAttributes {
  weightKg: number;
  recordedAt: string;
  createdAt: string;
}

export interface PetWeight {
  id: number;
  type: "pet-weights";
  attributes: PetWeightAttributes;
}

export interface WeightListResponse {
  data: PetWeight[];
}

export interface SingleResourceResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PetFilters {
  species?: string;
  search?: string;
  page?: number;
}

export const petEndpoints = {
  list: (filters?: PetFilters) =>
    apiClient.get<PaginatedResponse<Pet>>("/api/pets", { params: filters }),

  get: (id: number) =>
    apiClient.get<SingleResourceResponse<Pet>>(`/api/pets/${id}`),

  getWithWeights: (id: number) =>
    apiClient.get<SingleResourceResponse<Pet>>(
      `/api/pets/${id}?include=weights`,
    ),

  create: (data: PetFormValues) =>
    apiClient.post<SingleResourceResponse<Pet>>("/api/pets", data),

  update: (id: number, data: PetUpdateFormValues) =>
    apiClient.patch<SingleResourceResponse<Pet>>(`/api/pets/${id}`, data),

  delete: (id: number) => apiClient.delete(`/api/pets/${id}`),

  listWeights: (petId: number) =>
    apiClient.get<WeightListResponse>(`/api/pets/${petId}/weights`),

  recordWeight: (petId: number, data: WeightFormValues) =>
    apiClient.post<SingleResourceResponse<PetWeight>>(
      `/api/pets/${petId}/weights`,
      data,
    ),

  uploadAvatar: (petId: number, file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiClient.post<SingleResourceResponse<Pet>>(
      `/api/pets/${petId}/avatar`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },
};
