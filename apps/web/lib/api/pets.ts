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
  id: string;
  type: "pets";
  attributes: PetAttributes;
}

export interface PetWeightAttributes {
  weightKg: number;
  recordedAt: string;
  createdAt: string;
}

export interface PetWeight {
  id: string;
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

  get: (id: string) =>
    apiClient.get<SingleResourceResponse<Pet>>(`/api/pets/${id}`),

  getWithWeights: (id: string) =>
    apiClient.get<SingleResourceResponse<Pet>>(
      `/api/pets/${id}?include=weights`,
    ),

  create: ({ isNeutered, ...rest }: PetFormValues) =>
    apiClient.post<SingleResourceResponse<Pet>>("/api/pets", {
      ...rest,
      is_neutered: isNeutered,
    }),

  update: (id: string, { isNeutered, ...rest }: PetUpdateFormValues) =>
    apiClient.patch<SingleResourceResponse<Pet>>(`/api/pets/${id}`, {
      ...rest,
      ...(isNeutered !== undefined ? { is_neutered: isNeutered } : {}),
    }),

  delete: (id: string) => apiClient.delete(`/api/pets/${id}`),

  listWeights: (petId: string) =>
    apiClient.get<WeightListResponse>(`/api/pets/${petId}/weights`),

  recordWeight: (petId: string, { weightKg, recordedAt }: WeightFormValues) =>
    apiClient.post<SingleResourceResponse<PetWeight>>(
      `/api/pets/${petId}/weights`,
      { weight_kg: weightKg, recorded_at: recordedAt },
    ),

  deleteWeight: (petId: string, weightId: string) =>
    apiClient.delete(`/api/pets/${petId}/weights/${weightId}`),

  uploadAvatar: (petId: string, file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiClient.post<SingleResourceResponse<Pet>>(
      `/api/pets/${petId}/avatar`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },
};
