"use client";

import {
  Bell,
  Crown,
  Download,
  LogOut,
  Shield,
  Trash2,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { TwoFactorSettings } from "@/components/settings/TwoFactorSettings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useDeleteHousehold,
  useHousehold,
  useInviteMember,
  useRemoveMember,
  useTransferOwnership,
  useUpdateHousehold,
} from "@/hooks/api/useHousehold";
import {
  useChangePassword,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useUpdateProfile,
} from "@/hooks/api/useProfile";
import { useToast } from "@/hooks/use-toast";
import { profileEndpoints } from "@/lib/api/profile";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";

const settingsTabs = [
  { label: "Household", icon: Users },
  { label: "Notifications", icon: Bell },
  { label: "Profile", icon: User },
  { label: "Security", icon: Shield },
];

const TAB_TO_PARAM: Record<string, string> = {
  Household: "household",
  Notifications: "notifications",
  Profile: "profile",
  Security: "security",
};

const PARAM_TO_TAB: Record<string, string> = Object.fromEntries(
  Object.entries(TAB_TO_PARAM).map(([label, param]) => [param, label]),
);

function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = (tabParam && PARAM_TO_TAB[tabParam]) || "Household";

  const [tab, setTab] = useState(initialTab);

  const handleTabChange = (label: string) => {
    setTab(label);
    router.replace(`/settings?tab=${TAB_TO_PARAM[label] ?? "household"}`, {
      scroll: false,
    });
  };
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);

  const { data: household, isLoading: householdLoading } = useHousehold();
  const updateHousehold = useUpdateHousehold();
  const inviteMember = useInviteMember();
  const removeMember = useRemoveMember();
  const transferOwnership = useTransferOwnership();
  const deleteHousehold = useDeleteHousehold();

  const [transferTargetId, setTransferTargetId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const transferTargetName =
    household?.members.find((m) => m.id === transferTargetId)?.name ?? "";

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [householdName, setHouseholdName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [profileName, setProfileName] = useState(user?.name ?? "");

  useEffect(() => {
    if (user?.name) {
      setProfileName(user.name);
    }
  }, [user?.name]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: notifPrefs, isLoading: notifLoading } =
    useNotificationPreferences();
  const updateNotifPrefs = useUpdateNotificationPreferences();

  const displayHouseholdName =
    householdName !== "" ? householdName : (household?.name ?? "");
  const currentMembership = household?.members.find((m) => m.id === user?.id);
  const isOwner = currentMembership?.role === "owner";

  const initials = getInitials(profileName || user?.name || "?");

  const saveHousehold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!household || !displayHouseholdName.trim()) return;
    updateHousehold.mutate({ id: household.id, name: displayHouseholdName });
  };

  const sendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!household || !inviteEmail.trim()) return;
    inviteMember.mutate(
      { householdId: household.id, email: inviteEmail.trim() },
      { onSuccess: () => setInviteEmail("") },
    );
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    updateProfile.mutate(profileName.trim());
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    changePassword.mutate(
      {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      },
    );
  };

  const [isExporting, setIsExporting] = useState(false);

  const exportData = async () => {
    setIsExporting(true);
    try {
      const response = await profileEndpoints.export();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `furlog-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
      toast({ title: "Data exported", description: "Download started." });
    } catch {
      toast({
        title: "Export failed",
        description: "Could not export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const togglePref = (key: keyof NonNullable<typeof notifPrefs>) => {
    if (!notifPrefs) return;
    updateNotifPrefs.mutate({ [key]: !notifPrefs[key] });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="flex gap-1 border-b border-border pb-px animate-fade-in-up">
        {settingsTabs.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => handleTabChange(t.label)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              tab === t.label
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in-up">
        {tab === "Household" && (
          <div className="space-y-6">
            {/* Household Name */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold mb-3">Household Name</h3>
              {householdLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-9 w-full max-w-sm" />
                  <Skeleton className="h-9 w-16" />
                </div>
              ) : (
                <form onSubmit={saveHousehold} className="flex gap-2">
                  <Input
                    value={displayHouseholdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    className="bg-background max-w-sm"
                    disabled={!isOwner}
                  />
                  {isOwner && (
                    <Button
                      size="sm"
                      type="submit"
                      disabled={
                        updateHousehold.isPending ||
                        !displayHouseholdName.trim()
                      }
                    >
                      {updateHousehold.isPending ? "Saving…" : "Save"}
                    </Button>
                  )}
                </form>
              )}
            </div>

            {/* Members */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold mb-3">Members</h3>
              {householdLoading ? (
                <div className="space-y-3">
                  {[0, 1].map((i) => (
                    <div key={i} className="flex items-center gap-3 py-1">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-44" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {household?.members.map((member) => {
                    const isSelf = member.id === user?.id;
                    const canRemove = isOwner
                      ? member.role !== "owner"
                      : isSelf;
                    return (
                      <li
                        key={member.id}
                        className="flex items-center gap-3 py-2.5"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-sm font-medium">
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
                          <p className="text-xs text-muted-foreground truncate">
                            {member.email}
                          </p>
                        </div>
                        <Badge
                          variant={
                            member.role === "owner" ? "default" : "outline"
                          }
                          className="capitalize shrink-0"
                        >
                          {member.role}
                        </Badge>
                        {isOwner && !isSelf && member.role !== "owner" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-amber-600 hover:text-amber-600 shrink-0"
                            disabled={transferOwnership.isPending}
                            onClick={() => setTransferTargetId(member.id)}
                            title="Transfer ownership"
                          >
                            <Crown className="mr-1 h-3.5 w-3.5" />
                            Make Owner
                          </Button>
                        )}
                        {canRemove && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive shrink-0"
                            disabled={removeMember.isPending}
                            onClick={() =>
                              household &&
                              removeMember.mutate({
                                householdId: household.id,
                                userId: member.id,
                              })
                            }
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
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Invite Member — owner only */}
            {(isOwner || householdLoading) && (
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-semibold mb-3">Invite Member</h3>
                {householdLoading ? (
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1 max-w-sm" />
                    <Skeleton className="h-9 w-28" />
                  </div>
                ) : (
                  <form onSubmit={sendInvite} className="flex gap-2">
                    <Input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="bg-background max-w-sm"
                    />
                    <Button
                      size="sm"
                      type="submit"
                      disabled={inviteMember.isPending || !inviteEmail.trim()}
                    >
                      <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                      {inviteMember.isPending ? "Sending…" : "Send Invite"}
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* Danger Zone — owner only */}
            {isOwner && !householdLoading && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-5">
                <h3 className="font-semibold text-destructive mb-1">
                  Danger Zone
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Deleting the household is permanent. All pets, records, and
                  data will be erased and cannot be recovered.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => household && setDeleteTargetId(household.id)}
                  disabled={deleteHousehold.isPending}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete Household
                </Button>
              </div>
            )}
          </div>
        )}

        {tab === "Notifications" && (
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {(
              [
                {
                  key: "vaccination" as const,
                  label: "Vaccination reminders",
                  desc: "Get notified when vaccinations are due",
                },
                {
                  key: "medication" as const,
                  label: "Medication reminders",
                  desc: "Get notified about medication schedules",
                },
                {
                  key: "food" as const,
                  label: "Food stock alerts",
                  desc: "Get notified when food stock is running low",
                },
                {
                  key: "followup" as const,
                  label: "Follow-up reminders",
                  desc: "Get notified about scheduled follow-ups",
                },
              ] as const
            ).map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                {notifLoading ? (
                  <Skeleton className="h-5 w-9 rounded-full" />
                ) : (
                  <Switch
                    checked={notifPrefs?.[item.key] ?? true}
                    onCheckedChange={() => togglePref(item.key)}
                    disabled={updateNotifPrefs.isPending}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "Profile" && (
          <div className="space-y-6">
            {/* Profile info */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold mb-4">Profile</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary text-xl font-bold shrink-0">
                    {initials}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="profile-name"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Full Name
                  </label>
                  <Input
                    id="profile-name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="bg-background max-w-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-email"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Email
                  </label>
                  <Input
                    id="profile-email"
                    defaultValue={user?.email ?? ""}
                    disabled
                    className="bg-background max-w-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed.
                  </p>
                </div>
                <Button
                  size="sm"
                  type="submit"
                  disabled={updateProfile.isPending || !profileName.trim()}
                >
                  {updateProfile.isPending ? "Saving…" : "Save Changes"}
                </Button>
              </form>
            </div>

            {/* Change password */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold mb-4">Change Password</h3>
              <form
                onSubmit={handleChangePassword}
                className="space-y-3 max-w-sm"
              >
                <div>
                  <label
                    htmlFor="current-password"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Current Password
                  </label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-background"
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    New Password
                  </label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-background"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Confirm New Password
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-background"
                    autoComplete="new-password"
                  />
                </div>
                <Button
                  size="sm"
                  type="submit"
                  disabled={
                    changePassword.isPending ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                >
                  {changePassword.isPending ? "Updating…" : "Update Password"}
                </Button>
              </form>
            </div>

            {/* Export data */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold mb-2">Export My Data</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Download all your household data as JSON
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
                disabled={isExporting}
              >
                {isExporting ? (
                  "Exporting…"
                ) : (
                  <>
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Export Data
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {tab === "Security" && (
          <div className="space-y-6">
            <TwoFactorSettings />
          </div>
        )}
      </div>

      {/* Transfer Ownership Confirm */}
      <ConfirmDialog
        open={transferTargetId !== null}
        title="Transfer ownership?"
        description={`${transferTargetName} will become the household owner. You will become a regular member and lose owner privileges.`}
        confirmLabel="Transfer Ownership"
        onConfirm={() => {
          if (!household || transferTargetId === null) return;
          transferOwnership.mutate(
            { householdId: household.id, userId: transferTargetId },
            { onSuccess: () => setTransferTargetId(null) },
          );
        }}
        onCancel={() => setTransferTargetId(null)}
        isLoading={transferOwnership.isPending}
      />

      {/* Delete Household Confirm */}
      <ConfirmDialog
        open={deleteTargetId !== null}
        title="Delete household?"
        description={`This will permanently delete "${household?.name}" and all associated pets, records, and data. This action cannot be undone.`}
        confirmLabel="Delete Household"
        onConfirm={() => {
          if (deleteTargetId === null) return;
          deleteHousehold.mutate(deleteTargetId, {
            onSuccess: () => router.replace("/onboarding"),
          });
        }}
        onCancel={() => setDeleteTargetId(null)}
        isLoading={deleteHousehold.isPending}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPageContent />
    </Suspense>
  );
}
