"use client";

import { Bell } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useUnreadCount } from "@/hooks/api/useNotifications";
import { useNotificationStore } from "@/stores/useNotificationStore";

export function NotificationBell() {
  const { data: count = 0 } = useUnreadCount();
  const toggleBell = useNotificationStore((s) => s.toggleBell);
  const bellRef = useRef<HTMLButtonElement>(null);
  const prevCountRef = useRef<number>(count);
  const isInitialRef = useRef(true);

  useEffect(() => {
    if (!isInitialRef.current && count > prevCountRef.current) {
      toast.info("You have new notifications");
    }
    isInitialRef.current = false;
    prevCountRef.current = count;
  }, [count]);

  const handleClick = () => {
    if (bellRef.current) {
      toggleBell(bellRef.current);
    }
  };

  const ariaLabel =
    count === 0
      ? "No notifications"
      : count > 99
        ? "More than 99 notifications"
        : `${count} notification${count === 1 ? "" : "s"}`;

  return (
    <button
      ref={bellRef}
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      title="Notifications"
      className="relative flex h-12 w-12 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
