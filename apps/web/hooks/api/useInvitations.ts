import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { extractApiError } from "@/lib/api/extractApiError";
import { invitationEndpoints } from "@/lib/api/invitations";
import { householdKeys, invitationKeys, notificationKeys } from "./queryKeys";

export function useInvitation(token: string) {
  return useQuery({
    queryKey: invitationKeys.detail(token),
    queryFn: () => invitationEndpoints.get(token).then((r) => r.data.data),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (token: string) => invitationEndpoints.accept(token),
    onSuccess: () => {
      toast.success("You have joined the household!");
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: householdKeys.current() });
      queryClient.invalidateQueries({
        queryKey: householdKeys.userHouseholds(),
      });
      router.push("/dashboard");
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(
          error,
          "Failed to accept invitation. Please try again.",
        ),
      );
    },
  });
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => invitationEndpoints.decline(token),
    onSuccess: () => {
      toast.info("Invitation declined.");
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(
        extractApiError(
          error,
          "Failed to decline invitation. Please try again.",
        ),
      );
    },
  });
}
