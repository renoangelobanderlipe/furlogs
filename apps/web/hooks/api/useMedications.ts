import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractApiError } from "@/lib/api/extractApiError";
import {
  type AdministrationPayload,
  type MedicationFilters,
  type MedicationPayload,
  medicationEndpoints,
} from "@/lib/api/medications";
import {
  administrationKeys,
  dashboardKeys,
  medicationKeys,
  QUERY_STALE_TIME,
} from "./queryKeys";

export function useMedications(filters?: MedicationFilters) {
  return useQuery({
    queryKey: medicationKeys.list(filters),
    queryFn: () => medicationEndpoints.list(filters).then((r) => r.data),
    staleTime: QUERY_STALE_TIME,
  });
}

export function useTodayAdministrations(medicationId: string) {
  const today = new Date().toISOString().split("T")[0];
  return useQuery({
    queryKey: administrationKeys.forMedication(medicationId, today),
    queryFn: () =>
      medicationEndpoints
        .listAdministrations(medicationId, today)
        .then((r) => r.data),
    staleTime: 60_000,
    enabled: medicationId.length > 0,
  });
}

export function useLogDose() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      medicationId,
      data,
    }: {
      medicationId: string;
      data: AdministrationPayload;
    }) =>
      medicationEndpoints.logDose(medicationId, data).then((r) => r.data.data),
    onSuccess: (_, { medicationId }) => {
      queryClient.invalidateQueries({
        queryKey: administrationKeys.forMedication(medicationId),
      });
      queryClient.invalidateQueries({ queryKey: medicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success("Dose logged!");
    },
    onError: (error: unknown) => {
      toast.error(extractApiError(error, "Failed to log dose."));
    },
  });
}

export function useDeleteAdministration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => medicationEndpoints.deleteAdministration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: administrationKeys.all });
      queryClient.invalidateQueries({ queryKey: medicationKeys.lists() });
      toast.success("Dose removed");
    },
    onError: (error: unknown) => {
      toast.error(extractApiError(error, "Failed to remove dose."));
    },
  });
}

export function useMedication(id: string) {
  return useQuery({
    queryKey: medicationKeys.detail(id),
    queryFn: () => medicationEndpoints.get(id).then((r) => r.data.data),
    staleTime: QUERY_STALE_TIME,
    enabled: id.length > 0,
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MedicationPayload) =>
      medicationEndpoints.create(data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
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
      id: string;
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
    mutationFn: (id: string) =>
      medicationEndpoints.delete(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
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
