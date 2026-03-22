"use client";

import {
  Bell,
  CheckCheck,
  Hospital,
  Package,
  Pill,
  Syringe,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
} from "@/hooks/api/useNotifications";
import type {
  AppNotification,
  NotificationType,
} from "@/lib/api/notifications";
import { cn } from "@/lib/utils";

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "vaccination_reminder":
      return <Syringe className="h-5 w-5" />;
    case "medication_reminder":
      return <Pill className="h-5 w-5" />;
    case "vet_follow_up":
      return <Hospital className="h-5 w-5" />;
    case "low_stock":
    case "critical_stock":
      return <Package className="h-5 w-5" />;
    case "household_invite":
      return <Users className="h-5 w-5" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function NotificationRow({ notification }: { notification: AppNotification }) {
  const markRead = useMarkRead();
  const isUnread = notification.readAt === null;

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border-l-4 px-4 py-3 text-left transition-colors",
        isUnread
          ? "cursor-pointer border-primary bg-accent/50 hover:bg-accent"
          : "cursor-default border-transparent",
      )}
      onClick={() => {
        if (isUnread) {
          markRead.mutate(notification.id);
        }
      }}
    >
      <span
        className={cn(
          "mt-0.5 shrink-0",
          isUnread ? "text-primary" : "text-muted-foreground",
        )}
      >
        {getNotificationIcon(notification.data.type)}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn("text-sm", isUnread ? "font-semibold" : "font-normal")}
        >
          {notification.data.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatDate(notification.createdAt)}
          </span>
          {notification.data.pet_name && (
            <Badge variant="outline" className="h-[18px] px-1.5 text-[10px]">
              {notification.data.pet_name}
            </Badge>
          )}
        </div>
      </div>
      {isUnread && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  );
}

type TabValue = "all" | "unread";

export default function NotificationsPage() {
  const [tab, setTab] = useState<TabValue>("all");
  const filters =
    tab === "unread" ? { "filter[read]": false as const } : undefined;
  const { data, isLoading } = useNotifications(filters);
  const markAllRead = useMarkAllRead();

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n) => n.readAt === null).length;

  const handleMarkAllRead = () => {
    const unreadIds = notifications
      .filter((n) => n.readAt === null)
      .map((n) => n.id);
    markAllRead.mutate(unreadIds.length > 0 ? unreadIds : undefined);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Stay up to date with your pet care reminders
          </p>
        </div>
        <div className="flex-1" />
        <Button
          variant="outline"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || markAllRead.isPending}
          className="min-h-[48px] gap-2"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("all")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            tab === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
          )}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setTab("unread")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            tab === "unread"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
          )}
        >
          {`Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
            <Skeleton key={i} className="h-[72px] rounded-lg" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title={
            tab === "unread" ? "No unread notifications" : "No notifications"
          }
          description={
            tab === "unread"
              ? "All caught up!"
              : "Notifications about your pets will appear here."
          }
          icon={<Bell />}
        />
      ) : (
        <div className="flex flex-col gap-1">
          {notifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      )}
    </div>
  );
}
