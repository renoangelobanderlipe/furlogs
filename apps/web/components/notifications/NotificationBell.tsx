"use client";

import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useUnreadCount } from "@/hooks/api/useNotifications";
import { useNotificationStore } from "@/stores/useNotificationStore";

export function NotificationBell() {
  const { data: count = 0 } = useUnreadCount();
  const toggleBell = useNotificationStore((s) => s.toggleBell);
  const bellRef = useRef<HTMLButtonElement>(null);
  const prevCountRef = useRef<number>(count);

  useEffect(() => {
    if (count > prevCountRef.current && prevCountRef.current >= 0) {
      toast.info("You have new notifications");
    }
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
    <Tooltip title="Notifications">
      <IconButton
        ref={bellRef}
        onClick={handleClick}
        aria-label={ariaLabel}
        size="medium"
        sx={{ minWidth: 48, minHeight: 48 }}
      >
        <Badge
          badgeContent={count}
          color="error"
          max={99}
          invisible={count === 0}
          overlap="circular"
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}
