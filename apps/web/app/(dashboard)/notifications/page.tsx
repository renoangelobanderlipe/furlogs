"use client";

import { Bell, CheckCheck } from "lucide-react";
import { useState } from "react";
import { NotificationRow } from "@/components/notifications/NotificationRow";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarkAllRead, useNotifications } from "@/hooks/api/useNotifications";
import { cn } from "@/lib/utils";

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
