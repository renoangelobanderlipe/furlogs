"use client";

import { Crown, LogOut, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useHousehold,
  useInviteMember,
  useRemoveMember,
  useUpdateHousehold,
} from "@/hooks/api/useHousehold";
import type { HouseholdMember } from "@/lib/api/households";
import { useAuthStore } from "@/stores/useAuthStore";

function MemberRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

export default function HouseholdPage() {
  const { user } = useAuthStore();
  const { data: household, isLoading } = useHousehold();

  const [householdName, setHouseholdName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<HouseholdMember | null>(
    null,
  );

  const updateHousehold = useUpdateHousehold();
  const inviteMember = useInviteMember();
  const removeMember = useRemoveMember();

  // Sync input when data loads
  const displayName =
    householdName !== "" ? householdName : (household?.name ?? "");

  const currentUserMembership = household?.members.find(
    (m) => m.id === user?.id,
  );
  const isOwner = currentUserMembership?.role === "owner";

  function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!household) return;
    updateHousehold.mutate({ id: household.id, name: displayName });
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!household || !inviteEmail.trim()) return;
    inviteMember.mutate(
      { householdId: household.id, email: inviteEmail.trim() },
      { onSuccess: () => setInviteEmail("") },
    );
  }

  function handleRemove(member: HouseholdMember) {
    setMemberToRemove(member);
  }

  function handleConfirmRemove() {
    if (!household || !memberToRemove) return;
    removeMember.mutate(
      { householdId: household.id, userId: memberToRemove.id },
      { onSuccess: () => setMemberToRemove(null) },
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-1 text-2xl font-bold tracking-tight">Household</h1>
        <p className="text-sm text-muted-foreground">
          Manage your household name and members.
        </p>
      </div>

      {/* Household name */}
      <section className="space-y-4 rounded-lg border p-6">
        <h2 className="text-base font-semibold">Household Name</h2>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full max-w-sm" />
            <Skeleton className="h-9 w-24" />
          </div>
        ) : (
          <form onSubmit={handleRename} className="flex items-end gap-3">
            <div className="flex-1 max-w-sm space-y-1.5">
              <Label htmlFor="household-name">Name</Label>
              <Input
                id="household-name"
                value={displayName}
                onChange={(e) => setHouseholdName(e.target.value)}
                disabled={!isOwner}
                placeholder="My Household"
              />
            </div>
            {isOwner && (
              <Button
                type="submit"
                disabled={updateHousehold.isPending || !displayName.trim()}
              >
                {updateHousehold.isPending ? "Saving…" : "Save"}
              </Button>
            )}
          </form>
        )}
      </section>

      {/* Members list */}
      <section className="space-y-4 rounded-lg border p-6">
        <h2 className="text-base font-semibold">Members</h2>

        {isLoading ? (
          <div className="divide-y">
            <MemberRowSkeleton />
            <MemberRowSkeleton />
          </div>
        ) : (
          <ul className="divide-y">
            {household?.members.map((member) => {
              const isSelf = member.id === user?.id;
              const canRemove = isOwner ? member.role !== "owner" : isSelf;

              return (
                <li
                  key={member.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold uppercase">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {member.name}
                        {member.role === "owner" && (
                          <Crown className="h-3.5 w-3.5 text-amber-500" />
                        )}
                        {isSelf && (
                          <Badge variant="secondary" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={member.role === "owner" ? "default" : "outline"}
                      className="capitalize"
                    >
                      {member.role}
                    </Badge>
                    {canRemove && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        disabled={removeMember.isPending}
                        onClick={() => handleRemove(member)}
                      >
                        {isSelf ? (
                          <>
                            <LogOut className="mr-1 h-3.5 w-3.5" />
                            Leave
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Remove
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={memberToRemove !== null}
        title={
          memberToRemove?.id === user?.id
            ? "Leave household?"
            : `Remove ${memberToRemove?.name ?? ""} from your household?`
        }
        description={
          memberToRemove?.id === user?.id
            ? "You will lose access to this household. You can be re-invited later."
            : "This will immediately remove their access. They can be re-invited later."
        }
        confirmLabel={
          memberToRemove?.id === user?.id ? "Leave Household" : "Remove Member"
        }
        onConfirm={handleConfirmRemove}
        onCancel={() => setMemberToRemove(null)}
        isLoading={removeMember.isPending}
      />

      {/* Invite member — owner only */}
      {(isOwner || isLoading) && (
        <section className="space-y-4 rounded-lg border p-6">
          <h2 className="text-base font-semibold">Invite a Member</h2>
          <p className="text-sm text-muted-foreground">
            Add someone to your household by their FurLog account email.
          </p>
          {isLoading ? (
            <div className="flex gap-3">
              <Skeleton className="h-9 flex-1 max-w-sm" />
              <Skeleton className="h-9 w-28" />
            </div>
          ) : (
            <form onSubmit={handleInvite} className="flex items-center gap-3">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="member@example.com"
                className="max-w-sm"
              />
              <Button
                type="submit"
                disabled={inviteMember.isPending || !inviteEmail.trim()}
              >
                <UserPlus className="mr-1.5 h-4 w-4" />
                {inviteMember.isPending ? "Adding…" : "Send Invite"}
              </Button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
