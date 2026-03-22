"use client";

import {
  Bell,
  CheckCircle2,
  Hospital,
  Package,
  Pill,
  Syringe,
} from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
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
import { useNotificationStore } from "@/stores/useNotificationStore";

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "vaccination_reminder":
      return <Syringe className="h-4 w-4" />;
    case "medication_reminder":
      return <Pill className="h-4 w-4" />;
    case "vet_follow_up":
      return <Hospital className="h-4 w-4" />;
    case "low_stock":
    case "critical_stock":
      return <Package className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
}

function getNotificationHref(notification: AppNotification): string {
  const { type } = notification.data;
  switch (type) {
    case "vaccination_reminder":
      return "/vaccinations";
    case "medication_reminder":
      return "/medications";
    case "vet_follow_up":
      return "/vet-visits";
    case "low_stock":
    case "critical_stock":
      return "/stock";
    default:
      return "/notifications";
  }
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface NotificationItemProps {
  notification: AppNotification;
  onClose: () => void;
}

function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const router = useRouter();
  const markRead = useMarkRead();
  const isUnread = notification.readAt === null;
  const href = getNotificationHref(notification);

  const handleClick = () => {
    if (isUnread) {
      markRead.mutate(notification.id);
    }
    onClose();
    router.push(href);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-accent/50",
        isUnread
          ? "border-l-2 border-l-primary bg-primary/5"
          : "border-l-2 border-l-transparent",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex-shrink-0",
          isUnread ? "text-primary" : "text-muted-foreground",
        )}
      >
        {getNotificationIcon(notification.data.type)}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm leading-snug",
            isUnread ? "font-semibold" : "font-normal",
          )}
        >
          {notification.data.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
    </button>
  );
}

export function NotificationDropdown() {
  const { anchorEl, closeBell } = useNotificationStore();
  const bellOpen = anchorEl !== null;
  const { data, isLoading } = useNotifications(undefined, {
    enabled: bellOpen,
  });
  const markAllRead = useMarkAllRead();

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n) => n.readAt === null).length;

  const handleMarkAllRead = () => {
    const unreadIds = notifications
      .filter((n) => n.readAt === null)
      .map((n) => n.id);
    markAllRead.mutate(unreadIds.length > 0 ? unreadIds : undefined);
  };

  // Position the popover relative to anchorEl using a controlled Popover
  return (
    <Popover
      open={bellOpen}
      onOpenChange={(open) => {
        if (!open) closeBell();
      }}
    >
      {/* Trigger is the NotificationBell component rendered separately; we
          use a hidden span as an anchor so the popover can attach */}
      <span
        style={
          anchorEl
            ? {
                position: "fixed",
                top: anchorEl.getBoundingClientRect().bottom,
                left: anchorEl.getBoundingClientRect().right,
                width: 0,
                height: 0,
              }
            : undefined
        }
      />
      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <h3 className="text-sm font-semibold">Notifications</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markAllRead.isPending}
            className="h-7 gap-1.5 text-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        </div>

        {/* Body */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10">
              <Bell className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onClose={closeBell}
                  />
                  {index < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Footer */}
        <div className="px-3 py-2 text-center">
          <NextLink
            href="/notifications"
            onClick={closeBell}
            className="text-xs text-primary hover:underline"
          >
            View all notifications
          </NextLink>
        </div>
      </PopoverContent>
    </Popover>
  );
}
