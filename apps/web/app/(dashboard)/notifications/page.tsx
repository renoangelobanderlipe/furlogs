"use client";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicationIcon from "@mui/icons-material/Medication";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
} from "@/hooks/api/useNotifications";
import type {
  AppNotification,
  NotificationType,
} from "@/lib/api/notifications";

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "vaccination_reminder":
      return <VaccinesIcon />;
    case "medication_reminder":
      return <MedicationIcon />;
    case "vet_follow_up":
      return <LocalHospitalIcon />;
    case "low_stock":
    case "critical_stock":
      return <InventoryIcon />;
    default:
      return <NotificationsNoneIcon />;
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
  const theme = useTheme();
  const markRead = useMarkRead();
  const isUnread = notification.readAt === null;

  return (
    <ListItem
      alignItems="flex-start"
      sx={{
        borderLeft: isUnread
          ? `4px solid ${theme.palette.primary.main}`
          : "4px solid transparent",
        bgcolor: isUnread ? "action.hover" : "transparent",
        borderRadius: 1,
        mb: 0.5,
        cursor: isUnread ? "pointer" : "default",
        gap: 1.5,
      }}
      onClick={() => {
        if (isUnread) {
          markRead.mutate(notification.id);
        }
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 44,
          mt: 0.5,
          color: isUnread ? "primary.main" : "text.secondary",
        }}
      >
        {getNotificationIcon(notification.data.type)}
      </ListItemIcon>
      <Box flexGrow={1} minWidth={0}>
        <Typography variant="body1" fontWeight={isUnread ? 600 : 400}>
          {notification.data.title}
        </Typography>
        <Box display="flex" alignItems="center" gap={1} mt={0.25}>
          <Typography variant="caption" color="text.disabled">
            {formatDate(notification.createdAt)}
          </Typography>
          {notification.data.pet_name && (
            <Chip
              label={notification.data.pet_name}
              size="small"
              sx={{ height: 18, fontSize: 10 }}
            />
          )}
        </Box>
      </Box>
      {isUnread && (
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "primary.main",
            mt: 1.5,
            flexShrink: 0,
          }}
        />
      )}
    </ListItem>
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
    <Box>
      {/* Header */}
      <Box
        display="flex"
        alignItems={{ xs: "flex-start", sm: "center" }}
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stay up to date with your pet care reminders
          </Typography>
        </Box>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          startIcon={<CheckCircleOutlineIcon />}
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || markAllRead.isPending}
          sx={{ minHeight: 48 }}
        >
          Mark all read
        </Button>
      </Box>

      {/* Filter tabs */}
      <Box display="flex" gap={1} mb={2}>
        <Chip
          label="All"
          onClick={() => setTab("all")}
          color={tab === "all" ? "primary" : "default"}
          variant={tab === "all" ? "filled" : "outlined"}
        />
        <Chip
          label={`Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
          onClick={() => setTab("unread")}
          color={tab === "unread" ? "primary" : "default"}
          variant={tab === "unread" ? "filled" : "outlined"}
        />
      </Box>

      {/* Content */}
      {isLoading ? (
        <Box>
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
            <Skeleton key={i} variant="rounded" height={72} sx={{ mb: 1 }} />
          ))}
        </Box>
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
          icon={<NotificationsNoneIcon />}
        />
      ) : (
        <List disablePadding>
          {notifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
            />
          ))}
        </List>
      )}
    </Box>
  );
}
