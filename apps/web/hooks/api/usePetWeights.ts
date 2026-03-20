import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { petEndpoints } from "@/lib/api/pets";
import type { WeightFormValues } from "@/lib/validation/pet-weight.schema";
import { petKeys } from "./queryKeys";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function usePetWeights(petId: number) {
  return useQuery({
    queryKey: petKeys.weights(petId),
    queryFn: () => petEndpoints.listWeights(petId).then((r) => r.data),
    staleTime: STALE_TIME,
    enabled: petId > 0,
  });
}

export function useRecordWeight(petId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WeightFormValues) =>
      petEndpoints.recordWeight(petId, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: petKeys.weights(petId) });
      queryClient.invalidateQueries({ queryKey: petKeys.detail(petId) });
      toast.success("Weight recorded");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Failed to record weight. Please try again.";
      toast.error(message);
    },
  });
}
