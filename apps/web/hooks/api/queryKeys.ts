import type { MedicationFilters } from "@/lib/api/medications";
import type { PetFilters } from "@/lib/api/pets";
import type { VaccinationFilters } from "@/lib/api/vaccinations";
import type { VetVisitFilters } from "@/lib/api/vet-visits";

export const QUERY_STALE_TIME = 5 * 60 * 1000; // 5 minutes

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

export const vetVisitKeys = {
  all: ["vet-visits"] as const,
  lists: () => [...vetVisitKeys.all, "list"] as const,
  list: (filters?: VetVisitFilters) =>
    [...vetVisitKeys.lists(), filters] as const,
  details: () => [...vetVisitKeys.all, "detail"] as const,
  detail: (id: number) => [...vetVisitKeys.details(), id] as const,
};

export const vaccinationKeys = {
  all: ["vaccinations"] as const,
  lists: () => [...vaccinationKeys.all, "list"] as const,
  list: (filters?: VaccinationFilters) =>
    [...vaccinationKeys.lists(), filters] as const,
  details: () => [...vaccinationKeys.all, "detail"] as const,
  detail: (id: number) => [...vaccinationKeys.details(), id] as const,
};

export const medicationKeys = {
  all: ["medications"] as const,
  lists: () => [...medicationKeys.all, "list"] as const,
  list: (filters?: MedicationFilters) =>
    [...medicationKeys.lists(), filters] as const,
  details: () => [...medicationKeys.all, "detail"] as const,
  detail: (id: number) => [...medicationKeys.details(), id] as const,
};
