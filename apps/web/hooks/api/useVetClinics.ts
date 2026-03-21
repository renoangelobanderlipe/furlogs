import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractApiError } from "@/lib/api/extractApiError";
import {
  type VetClinicPayload,
  vetClinicEndpoints,
} from "@/lib/api/vet-clinics";
import { QUERY_STALE_TIME, vetClinicKeys } from "./queryKeys";

export function useVetClinics(page = 1) {
  return useQuery({
    queryKey: vetClinicKeys.list(page),
    queryFn: () => vetClinicEndpoints.list(page).then((r) => r.data),
    staleTime: QUERY_STALE_TIME,
  });
}

export function useCreateVetClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VetClinicPayload) =>
      vetClinicEndpoints.create(data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vetClinicKeys.lists() });
      toast.success("Vet clinic added");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to add vet clinic. Please try again."),
      );
    },
  });
}

export function useUpdateVetClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<VetClinicPayload>;
    }) => vetClinicEndpoints.update(id, data).then((r) => r.data.data),
    onSuccess: (clinic) => {
      queryClient.invalidateQueries({
        queryKey: vetClinicKeys.detail(clinic.id),
      });
      queryClient.invalidateQueries({ queryKey: vetClinicKeys.lists() });
      toast.success("Vet clinic updated");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(
          error,
          "Failed to update vet clinic. Please try again.",
        ),
      );
    },
  });
}

export function useDeleteVetClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => vetClinicEndpoints.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vetClinicKeys.lists() });
      toast.success("Vet clinic deleted");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(
          error,
          "Failed to delete vet clinic. Please try again.",
        ),
      );
    },
  });
}
