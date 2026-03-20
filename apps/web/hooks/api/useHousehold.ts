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
    mutationFn: ({ id, name }: { id: number; name: string }) =>
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
      householdId: number;
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
      householdId: number;
      userId: number;
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
