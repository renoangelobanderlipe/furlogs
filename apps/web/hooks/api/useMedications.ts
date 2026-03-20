import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractApiError } from "@/lib/api/extractApiError";
import {
  type MedicationFilters,
  type MedicationPayload,
  medicationEndpoints,
} from "@/lib/api/medications";
import { medicationKeys, QUERY_STALE_TIME } from "./queryKeys";

export function useMedications(filters?: MedicationFilters) {
  return useQuery({
    queryKey: medicationKeys.list(filters),
    queryFn: () => medicationEndpoints.list(filters).then((r) => r.data),
    staleTime: QUERY_STALE_TIME,
  });
}

export function useMedication(id: number) {
  return useQuery({
    queryKey: medicationKeys.detail(id),
    queryFn: () => medicationEndpoints.get(id).then((r) => r.data.data),
    staleTime: QUERY_STALE_TIME,
    enabled: id > 0,
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MedicationPayload) =>
      medicationEndpoints.create(data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicationKeys.lists() });
      toast.success("Medication recorded!");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to save medication. Please try again."),
      );
    },
  });
}

export function useUpdateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<MedicationPayload>;
    }) => medicationEndpoints.update(id, data).then((r) => r.data.data),
    onSuccess: (medication) => {
      queryClient.invalidateQueries({
        queryKey: medicationKeys.detail(medication.id),
      });
      queryClient.invalidateQueries({ queryKey: medicationKeys.lists() });
      toast.success("Medication updated");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(
          error,
          "Failed to update medication. Please try again.",
        ),
      );
    },
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      medicationEndpoints.delete(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicationKeys.lists() });
      toast.success("Medication deleted");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(
          error,
          "Failed to delete medication. Please try again.",
        ),
      );
    },
  });
}
