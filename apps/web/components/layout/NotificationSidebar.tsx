"use client";

import {
  Bell,
  CheckCheck,
  Loader2,
  Package,
  PawPrint,
  Pill,
  Stethoscope,
  Syringe,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useActivity } from "@/hooks/api/useActivity";
import {
  useAcceptInvitation,
  useDeclineInvitation,
} from "@/hooks/api/useInvitations";
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadCount,
} from "@/hooks/api/useNotifications";
import type { ActivityEntry } from "@/lib/api/activity";
import type {
  AppNotification,
  NotificationType,
} from "@/lib/api/notifications";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  vaccination_reminder: {
    icon: Syringe,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    label: "Vaccination",
  },
  medication_reminder: {
    icon: Pill,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: "Medication",
  },
  vet_follow_up: {
    icon: Stethoscope,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    label: "Vet Visit",
  },
  low_stock: {
    icon: Package,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    label: "Stock Alert",
  },
  critical_stock: {
    icon: Package,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: "Critical Stock",
  },
  household_invite: {
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
    label: "Household",
  },
};

const SUBJECT_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  pet: {
    icon: PawPrint,
    color: "text-primary",
    bg: "bg-primary/10",
    label: "Pet",
  },
  vet_visit: {
    icon: Stethoscope,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    label: "Vet Visit",
  },
  medication: {
    icon: Pill,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: "Medication",
  },
  vaccination: {
    icon: Syringe,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    label: "Vaccination",
  },
  reminder: {
    icon: Bell,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    label: "Reminder",
  },
  food_stock: {
    icon: Package,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    label: "Stock",
  },
  invitation: {
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
    label: "Invite",
  },
};

const ActivityItem = ({ entry }: { entry: ActivityEntry }) => {
  const config = SUBJECT_CONFIG[entry.subject_type] ?? SUBJECT_CONFIG.pet;
  const Icon = config.icon;
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          config.bg,
        )}
      >
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug text-foreground">
          {entry.description}
        </p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(entry.created_at)}
          </span>
          <span className="text-xs text-muted-foreground/40">·</span>
          <span className="text-xs text-muted-foreground">{config.label}</span>
          <span className="text-xs text-muted-foreground/40">·</span>
          <span className="text-xs text-muted-foreground">
            {entry.causer_name}
          </span>
        </div>
      </div>
    </div>
  );
};

interface NotificationItemProps {
  notification: AppNotification;
  config: (typeof TYPE_CONFIG)[keyof typeof TYPE_CONFIG];
  Icon: React.ElementType;
  isUnread: boolean;
  isInvite: boolean;
  onMarkRead: () => void;
}

const NotificationItem = ({
  notification: n,
  config,
  Icon,
  isUnread,
  isInvite,
  onMarkRead,
}: NotificationItemProps) => {
  const acceptMutation = useAcceptInvitation();
  const declineMutation = useDeclineInvitation();
  const token = n.data?.invitation_token;
  const isMutating = acceptMutation.isPending || declineMutation.isPending;

  if (isInvite) {
    return (
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            config.bg,
          )}
        >
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-snug font-medium text-foreground">
            {n.data?.title ?? n.type}
          </p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(n.createdAt)}
            </span>
            <span className="text-xs text-muted-foreground/40">·</span>
            <span className="text-xs text-muted-foreground">
              {config.label}
            </span>
          </div>
          {token && (
            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={() => declineMutation.mutate(token)}
                disabled={isMutating}
                className="flex-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
              >
                {declineMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                ) : (
                  "Decline"
                )}
              </button>
              <button
                type="button"
                onClick={() => acceptMutation.mutate(token)}
                disabled={isMutating}
                className="flex-1 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
              >
                {acceptMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                ) : (
                  "Accept"
                )}
              </button>
            </div>
          )}
        </div>
        {isUnread && (
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      className="w-full flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-accent/50 text-left"
      onClick={isUnread ? onMarkRead : undefined}
    >
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          config.bg,
        )}
      >
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm leading-snug",
            isUnread ? "font-medium text-foreground" : "text-muted-foreground",
          )}
        >
          {n.data?.title ?? n.type}
        </p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(n.createdAt)}
          </span>
          <span className="text-xs text-muted-foreground/40">·</span>
          <span className="text-xs text-muted-foreground">{config.label}</span>
          {n.data?.pet_name && (
            <>
              <span className="text-xs text-muted-foreground/40">·</span>
              <span className="inline-flex items-center rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {n.data.pet_name}
              </span>
            </>
          )}
        </div>
      </div>
      {isUnread && (
        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
      )}
    </button>
  );
};

interface NotificationSidebarProps {
  children: React.ReactNode;
}

export const NotificationSidebar = ({ children }: NotificationSidebarProps) => {
  const [tab, setTab] = useState<"all" | "unread" | "archived" | "activity">(
    "all",
  );

  const { data: notificationsData } = useNotifications({ page: 1 });
  const { data: activityData } = useActivity();
  const { data: unreadCount } = useUnreadCount();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const allNotifications = notificationsData?.data ?? [];
  const unread = unreadCount ?? 0;
  const archivedNotifications = allNotifications.filter((n) => n.readAt);

  const filtered =
    tab === "unread"
      ? allNotifications.filter((n) => !n.readAt)
      : tab === "archived"
        ? archivedNotifications
        : allNotifications;

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        aria-describedby={undefined}
        className="w-[380px] p-0 flex flex-col bg-card border-l border-border overflow-hidden"
      >
        <SheetTitle className="sr-only">Notifications</SheetTitle>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pr-12 py-3 border-b border-border shrink-0">
          <h3 className="font-semibold text-base">Notifications</h3>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => markAllRead.mutate(undefined)}
              disabled={unread === 0 || markAllRead.isPending}
              className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-500 hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-3 py-2.5 border-b border-border shrink-0">
          {(
            [
              { key: "all", label: "All", count: allNotifications.length },
              { key: "unread", label: "Unread", count: unread },
              {
                key: "archived",
                label: "Archived",
                count: archivedNotifications.length,
              },
              {
                key: "activity",
                label: "Activity",
                count: activityData?.data?.length ?? 0,
              },
            ] as const
          ).map(({ key, label, count }) => (
            <button
              type="button"
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                tab === key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <span>{label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "rounded-full min-w-[18px] px-1 py-0 text-[10px] font-bold leading-[18px] text-center",
                    tab === key
                      ? "bg-background/20 text-background"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {tab === "activity" ? (
            (activityData?.data ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">
                  No recent activity
                </p>
              </div>
            ) : (
              (activityData?.data ?? []).map((entry) => (
                <ActivityItem key={entry.id} entry={entry} />
              ))
            )
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">
                {tab === "unread"
                  ? "All caught up!"
                  : tab === "archived"
                    ? "No archived notifications"
                    : "No notifications"}
              </p>
            </div>
          ) : (
            filtered.map((n) => {
              const config =
                TYPE_CONFIG[n.data?.type] ?? TYPE_CONFIG.vet_follow_up;
              const Icon = config.icon;
              return (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  config={config}
                  Icon={Icon}
                  isUnread={!n.readAt}
                  isInvite={n.data?.type === "household_invite"}
                  onMarkRead={() => markRead.mutate(n.id)}
                />
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border shrink-0">
          <Link
            href="/notifications"
            className="flex items-center justify-center py-3 text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"
          >
            View all
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
};
