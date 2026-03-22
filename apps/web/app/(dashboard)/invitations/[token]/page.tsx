"use client";

import {
  CheckCircle2,
  Clock,
  Home,
  Loader2,
  Users,
  XCircle,
} from "lucide-react";
import NextLink from "next/link";
import { use, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAcceptInvitation,
  useDeclineInvitation,
  useInvitation,
} from "@/hooks/api/useInvitations";

interface InvitationPageProps {
  params: Promise<{ token: string }>;
}

function InvitationSkeleton() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-36" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}

interface StatusCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

function StatusCard({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: StatusCardProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            {icon}
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {actionLabel && actionHref && (
          <Button asChild className="w-full">
            <NextLink href={actionHref}>{actionLabel}</NextLink>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function InvitationPage({ params }: InvitationPageProps) {
  const { token } = use(params);
  const [declineOpen, setDeclineOpen] = useState(false);

  const { data: invitation, isLoading, isError } = useInvitation(token);
  const acceptMutation = useAcceptInvitation();
  const declineMutation = useDeclineInvitation();

  const isMutating = acceptMutation.isPending || declineMutation.isPending;

  if (isLoading) {
    return <InvitationSkeleton />;
  }

  if (isError || !invitation) {
    return (
      <StatusCard
        icon={<XCircle className="h-8 w-8 text-destructive" />}
        title="Invitation not found"
        description="This invitation link is invalid or no longer exists."
        actionLabel="Go to Dashboard"
        actionHref="/dashboard"
      />
    );
  }

  const isExpired = new Date(invitation.expires_at) < new Date();

  if (isExpired) {
    return (
      <StatusCard
        icon={<Clock className="h-8 w-8 text-muted-foreground" />}
        title="Invitation expired"
        description="This invitation has expired. Ask your household admin to send a new invite."
        actionLabel="Go to Dashboard"
        actionHref="/dashboard"
      />
    );
  }

  if (invitation.status === "accepted") {
    return (
      <StatusCard
        icon={<CheckCircle2 className="h-8 w-8 text-emerald-500" />}
        title="Already accepted"
        description={`You have already joined ${invitation.household_name}.`}
        actionLabel="Go to Dashboard"
        actionHref="/dashboard"
      />
    );
  }

  if (invitation.status === "declined") {
    return (
      <StatusCard
        icon={<XCircle className="h-8 w-8 text-muted-foreground" />}
        title="Invitation declined"
        description="You have already declined this invitation."
        actionLabel="Go to Dashboard"
        actionHref="/dashboard"
      />
    );
  }

  const handleAccept = () => {
    acceptMutation.mutate(token);
  };

  const handleDecline = () => {
    declineMutation.mutate(token, {
      onSuccess: () => setDeclineOpen(false),
    });
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 animate-fade-in-up">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">
              You&apos;re invited!
            </h1>
            <p className="text-sm text-muted-foreground">
              You have been invited to join a household on FurLog.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border/50 bg-muted/20 p-5">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Household
            </p>
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              <p className="font-semibold">{invitation.household_name}</p>
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Invited by
            </p>
            <p className="font-semibold">{invitation.inviter_name}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Expires
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(invitation.expires_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <AlertDialog open={declineOpen} onOpenChange={setDeclineOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1"
                disabled={isMutating}
              >
                Decline
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Decline invitation?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will not be added to{" "}
                  <span className="font-semibold text-foreground">
                    {invitation.household_name}
                  </span>
                  . You can ask to be reinvited later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={declineMutation.isPending}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDecline}
                  disabled={declineMutation.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {declineMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Yes, decline
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            className="flex-1"
            onClick={handleAccept}
            disabled={isMutating}
          >
            {acceptMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              "Accept"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
