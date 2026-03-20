import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractApiError } from "@/lib/api/extractApiError";
import {
  type VaccinationFilters,
  vaccinationEndpoints,
} from "@/lib/api/vaccinations";
import type {
  VaccinationFormValues,
  VaccinationUpdateFormValues,
} from "@/lib/validation/vaccination.schema";
import { QUERY_STALE_TIME, vaccinationKeys } from "./queryKeys";

export function useVaccinations(filters?: VaccinationFilters) {
  return useQuery({
    queryKey: vaccinationKeys.list(filters),
    queryFn: () => vaccinationEndpoints.list(filters).then((r) => r.data),
    staleTime: QUERY_STALE_TIME,
  });
}

export function useVaccination(id: number) {
  return useQuery({
    queryKey: vaccinationKeys.detail(id),
    queryFn: () => vaccinationEndpoints.get(id).then((r) => r.data.data),
    staleTime: QUERY_STALE_TIME,
    enabled: id > 0,
  });
}

export function useCreateVaccination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VaccinationFormValues) =>
      vaccinationEndpoints.create(data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaccinationKeys.lists() });
      toast.success("Vaccination recorded!");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to save vaccination. Please try again."),
      );
    },
  });
}

export function useUpdateVaccination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: VaccinationUpdateFormValues;
    }) => vaccinationEndpoints.update(id, data).then((r) => r.data.data),
    onSuccess: (vaccination) => {
      queryClient.invalidateQueries({
        queryKey: vaccinationKeys.detail(vaccination.id),
      });
      queryClient.invalidateQueries({ queryKey: vaccinationKeys.lists() });
      toast.success("Vaccination updated");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(
          error,
          "Failed to update vaccination. Please try again.",
        ),
      );
    },
  });
}

export function useDeleteVaccination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      vaccinationEndpoints.delete(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaccinationKeys.lists() });
      toast.success("Vaccination record deleted");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(
          error,
          "Failed to delete vaccination. Please try again.",
        ),
      );
    },
  });
}
