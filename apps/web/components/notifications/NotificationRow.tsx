"use client";

import { Bell, Hospital, Package, Pill, Syringe, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMarkRead } from "@/hooks/api/useNotifications";
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

export const NotificationRow = ({
  notification,
}: {
  notification: AppNotification;
}) => {
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
};
