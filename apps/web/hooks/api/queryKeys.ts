import type { PetFilters } from "@/lib/api/pets";

export const petKeys = {
  all: ["pets"] as const,
  lists: () => [...petKeys.all, "list"] as const,
  list: (filters?: PetFilters) => [...petKeys.lists(), filters] as const,
  details: () => [...petKeys.all, "detail"] as const,
  detail: (id: number) => [...petKeys.details(), id] as const,
  weights: (petId: number) => [...petKeys.detail(petId), "weights"] as const,
};

export const foodProductKeys = {
  all: ["food-products"] as const,
  lists: () => [...foodProductKeys.all, "list"] as const,
  detail: (id: number) => [...foodProductKeys.all, "detail", id] as const,
};

export const foodStockItemKeys = {
  all: ["food-stock-items"] as const,
  lists: () => [...foodStockItemKeys.all, "list"] as const,
};

export const foodProjectionKeys = {
  all: ["food-projections"] as const,
};
