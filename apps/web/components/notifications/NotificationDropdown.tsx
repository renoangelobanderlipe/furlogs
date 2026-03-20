"use client";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicationIcon from "@mui/icons-material/Medication";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Popover from "@mui/material/Popover";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
} from "@/hooks/api/useNotifications";
import type {
  AppNotification,
  NotificationType,
} from "@/lib/api/notifications";
import { useNotificationStore } from "@/stores/useNotificationStore";

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "vaccination_reminder":
      return <VaccinesIcon fontSize="small" />;
    case "medication_reminder":
      return <MedicationIcon fontSize="small" />;
    case "vet_follow_up":
      return <LocalHospitalIcon fontSize="small" />;
    case "low_stock":
    case "critical_stock":
      return <InventoryIcon fontSize="small" />;
    default:
      return <NotificationsNoneIcon fontSize="small" />;
  }
}

function getNotificationHref(notification: AppNotification): string {
  const { type } = notification.data;
  switch (type) {
    case "vaccination_reminder":
      return "/vaccinations";
    case "medication_reminder":
      return "/vet-visits";
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
  const theme = useTheme();
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
    <ListItemButton
      onClick={handleClick}
      sx={{
        px: 2,
        py: 1.25,
        alignItems: "flex-start",
        borderLeft: isUnread
          ? `3px solid ${theme.palette.primary.main}`
          : "3px solid transparent",
        bgcolor: isUnread ? "action.hover" : "transparent",
        "&:hover": { bgcolor: "action.selected" },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 36,
          mt: 0.25,
          color: isUnread ? "primary.main" : "text.secondary",
        }}
      >
        {getNotificationIcon(notification.data.type)}
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography
            variant="body2"
            fontWeight={isUnread ? 600 : 400}
            sx={{ lineHeight: 1.4 }}
          >
            {notification.data.title}
          </Typography>
        }
        secondary={
          <Typography variant="caption" color="text.disabled">
            {formatRelativeTime(notification.createdAt)}
          </Typography>
        }
        disableTypography
      />
    </ListItemButton>
  );
}

export function NotificationDropdown() {
  const theme = useTheme();
  const { bellOpen, anchorEl, closeBell } = useNotificationStore();
  const { data, isLoading } = useNotifications(
    bellOpen ? undefined : { "filter[read]": false },
  );
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
    <Popover
      open={bellOpen}
      anchorEl={anchorEl}
      onClose={closeBell}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: {
          sx: {
            width: 360,
            maxWidth: "100vw",
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          Notifications
        </Typography>
        <Button
          size="small"
          startIcon={<CheckCircleOutlineIcon />}
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || markAllRead.isPending}
          sx={{ minHeight: 32, textTransform: "none" }}
        >
          Mark all read
        </Button>
      </Box>

      <Divider />

      {/* Body */}
      <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={4}
          >
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            py={5}
            gap={1}
          >
            <NotificationsNoneIcon
              sx={{ fontSize: 40, color: "text.disabled" }}
            />
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((notification, index) => (
              <Box key={notification.id}>
                <NotificationItem
                  notification={notification}
                  onClose={closeBell}
                />
                {index < notifications.length - 1 && <Divider component="li" />}
              </Box>
            ))}
          </List>
        )}
      </Box>

      <Divider />

      {/* Footer */}
      <Box sx={{ px: 2, py: 1, textAlign: "center" }}>
        <Button
          component={NextLink}
          href="/notifications"
          size="small"
          onClick={closeBell}
          sx={{ textTransform: "none" }}
        >
          View all notifications
        </Button>
      </Box>
    </Popover>
  );
}
