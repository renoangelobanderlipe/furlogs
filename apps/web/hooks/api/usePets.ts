import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type PetFilters, petEndpoints } from "@/lib/api/pets";
import type {
  PetFormValues,
  PetUpdateFormValues,
} from "@/lib/validation/pet.schema";
import { petKeys } from "./queryKeys";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function usePets(filters?: PetFilters) {
  return useQuery({
    queryKey: petKeys.list(filters),
    queryFn: () => petEndpoints.list(filters).then((r) => r.data),
    staleTime: STALE_TIME,
  });
}

export function usePet(id: number) {
  return useQuery({
    queryKey: petKeys.detail(id),
    queryFn: () => petEndpoints.get(id).then((r) => r.data.data),
    staleTime: STALE_TIME,
    enabled: id > 0,
  });
}

export function useCreatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PetFormValues) =>
      petEndpoints.create(data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: petKeys.lists() });
      toast.success("Pet added!");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Failed to add pet. Please try again.";
      toast.error(message);
    },
  });
}

export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PetUpdateFormValues }) =>
      petEndpoints.update(id, data).then((r) => r.data.data),
    onSuccess: (pet) => {
      queryClient.invalidateQueries({ queryKey: petKeys.detail(pet.id) });
      queryClient.invalidateQueries({ queryKey: petKeys.lists() });
      toast.success("Pet updated");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Failed to update pet. Please try again.";
      toast.error(message);
    },
  });
}

export function useDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => petEndpoints.delete(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: petKeys.lists() });
      toast.success("Pet removed");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Failed to remove pet. Please try again.";
      toast.error(message);
    },
  });
}

export function useUploadPetAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      petEndpoints.uploadAvatar(id, file).then((r) => r.data.data),
    onSuccess: (pet) => {
      queryClient.invalidateQueries({ queryKey: petKeys.detail(pet.id) });
      queryClient.invalidateQueries({ queryKey: petKeys.lists() });
      toast.success("Avatar updated");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Failed to upload avatar. Please try again.";
      toast.error(message);
    },
  });
}
