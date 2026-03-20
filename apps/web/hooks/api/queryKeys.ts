import type { PetFilters } from "@/lib/api/pets";

export const petKeys = {
  all: ["pets"] as const,
  lists: () => [...petKeys.all, "list"] as const,
  list: (filters?: PetFilters) => [...petKeys.lists(), filters] as const,
  details: () => [...petKeys.all, "detail"] as const,
  detail: (id: number) => [...petKeys.details(), id] as const,
  weights: (petId: number) => [...petKeys.detail(petId), "weights"] as const,
};
