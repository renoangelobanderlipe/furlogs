import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractApiError } from "@/lib/api/extractApiError";
import { type HouseholdData, householdEndpoints } from "@/lib/api/households";
import { householdKeys, QUERY_STALE_TIME } from "./queryKeys";

export function useHousehold() {
  return useQuery({
    queryKey: householdKeys.current(),
    queryFn: () => householdEndpoints.get().then((r) => r.data.data),
    staleTime: QUERY_STALE_TIME,
  });
}

export function useUpdateHousehold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      householdEndpoints.update(id, name).then((r) => r.data.data),
    onSuccess: (household: HouseholdData) => {
      queryClient.invalidateQueries({ queryKey: householdKeys.current() });
      toast.success(`Household renamed to "${household.name}"`);
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to update household. Please try again."),
      );
    },
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      householdId,
      email,
    }: {
      householdId: string;
      email: string;
    }) =>
      householdEndpoints.invite(householdId, email).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: householdKeys.current() });
      toast.success("Member added to household.");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to invite member. Please try again."),
      );
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      householdId,
      userId,
    }: {
      householdId: string;
      userId: string;
    }) =>
      householdEndpoints
        .removeMember(householdId, userId)
        .then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: householdKeys.current() });
      toast.success("Member removed from household.");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to remove member. Please try again."),
      );
    },
  });
}

export function useTransferOwnership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      householdId,
      userId,
    }: {
      householdId: string;
      userId: string;
    }) =>
      householdEndpoints
        .transferOwnership(householdId, userId)
        .then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: householdKeys.current() });
      toast.success("Ownership transferred successfully.");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(
          error,
          "Failed to transfer ownership. Please try again.",
        ),
      );
    },
  });
}

export function useDeleteHousehold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (householdId: string) => householdEndpoints.delete(householdId),
    onSuccess: () => {
      queryClient.clear();
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(error, "Failed to delete household. Please try again."),
      );
    },
  });
}
