import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractApiError } from "@/lib/api/extractApiError";
import { petEndpoints } from "@/lib/api/pets";
import type { WeightFormValues } from "@/lib/validation/pet-weight.schema";
import { petKeys } from "./queryKeys";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function usePetWeights(petId: string) {
  return useQuery({
    queryKey: petKeys.weights(petId),
    queryFn: () => petEndpoints.listWeights(petId).then((r) => r.data),
    staleTime: STALE_TIME,
    enabled: petId.length > 0,
  });
}

export function useRecordWeight(petId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WeightFormValues) =>
      petEndpoints.recordWeight(petId, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: petKeys.weights(petId) });
      queryClient.invalidateQueries({ queryKey: petKeys.detail(petId) });
      toast.success("Weight recorded");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to record weight. Please try again."),
      );
    },
  });
}

export function useDeletePetWeight(petId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (weightId: string) =>
      petEndpoints.deleteWeight(petId, weightId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: petKeys.weights(petId) });
      queryClient.invalidateQueries({ queryKey: petKeys.detail(petId) });
      toast.success("Weight entry deleted");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(
          error,
          "Failed to delete weight entry. Please try again.",
        ),
      );
    },
  });
}
