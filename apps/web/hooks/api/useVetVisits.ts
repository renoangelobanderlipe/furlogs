import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractApiError } from "@/lib/api/extractApiError";
import {
  type VetVisitFilters,
  type VetVisitPayload,
  type VetVisitUpdatePayload,
  vetVisitEndpoints,
} from "@/lib/api/vet-visits";
import { dashboardKeys, QUERY_STALE_TIME, vetVisitKeys } from "./queryKeys";

export function useVetVisits(filters?: VetVisitFilters) {
  return useQuery({
    queryKey: vetVisitKeys.list(filters),
    queryFn: () => vetVisitEndpoints.list(filters).then((r) => r.data),
    staleTime: QUERY_STALE_TIME,
  });
}

export function useVetVisit(id: string) {
  return useQuery({
    queryKey: vetVisitKeys.detail(id),
    queryFn: () =>
      vetVisitEndpoints
        .get(id, "medications,attachments")
        .then((r) => r.data.data),
    staleTime: QUERY_STALE_TIME,
    enabled: id.length > 0,
  });
}

export function useVetVisitStats() {
  return useQuery({
    queryKey: [...vetVisitKeys.all, "stats"] as const,
    queryFn: () => vetVisitEndpoints.stats().then((r) => r.data.data),
    staleTime: QUERY_STALE_TIME,
  });
}

export function useCreateVetVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VetVisitPayload) =>
      vetVisitEndpoints.create(data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vetVisitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success("Vet visit recorded!");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to create vet visit. Please try again."),
      );
    },
  });
}

export function useUpdateVetVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VetVisitUpdatePayload }) =>
      vetVisitEndpoints.update(id, data).then((r) => r.data.data),
    onSuccess: (visit) => {
      queryClient.invalidateQueries({
        queryKey: vetVisitKeys.detail(visit.id),
      });
      queryClient.invalidateQueries({ queryKey: vetVisitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success("Vet visit updated");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to update vet visit. Please try again."),
      );
    },
  });
}

export function useDeleteVetVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      vetVisitEndpoints.delete(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vetVisitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success("Vet visit deleted");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to delete vet visit. Please try again."),
      );
    },
  });
}

export function useAddVetVisitAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      vetVisitEndpoints.addAttachment(id, file).then((r) => r.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: vetVisitKeys.detail(variables.id),
      });
      toast.success("Attachment added");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to add attachment. Please try again."),
      );
    },
  });
}

export function useRemoveVetVisitAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ visitId, mediaId }: { visitId: string; mediaId: number }) =>
      vetVisitEndpoints.removeAttachment(visitId, mediaId).then((r) => r.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: vetVisitKeys.detail(variables.visitId),
      });
      toast.success("Attachment removed");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(
          error,
          "Failed to remove attachment. Please try again.",
        ),
      );
    },
  });
}
