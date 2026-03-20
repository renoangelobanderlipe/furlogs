"use client";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoneIcon from "@mui/icons-material/Done";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SnoozeIcon from "@mui/icons-material/Snooze";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useCompleteReminder,
  useDismissReminder,
  useSnoozeReminder,
} from "@/hooks/api/useReminders";
import type { Reminder, ReminderUrgency } from "@/lib/api/reminders";

function getUrgencyColor(urgency: ReminderUrgency): string {
  switch (urgency) {
    case "high":
      return "error.main";
    case "medium":
      return "warning.main";
    case "low":
      return "success.main";
  }
}

function formatDueDate(dueDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = dueDate.split("-");
  const due = new Date(Number(year), Number(month) - 1, Number(day));
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / 86_400_000);

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ReminderItemMenuProps {
  reminderId: number;
}

function ReminderItemMenu({ reminderId }: ReminderItemMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const complete = useCompleteReminder();
  const snooze = useSnoozeReminder();
  const dismiss = useDismissReminder();

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        aria-label="More actions"
        sx={{ minWidth: 36, minHeight: 36 }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          onClick={() => {
            complete.mutate(reminderId);
            handleClose();
          }}
          disabled={complete.isPending}
        >
          <DoneIcon fontSize="small" sx={{ mr: 1.5 }} />
          Mark complete
        </MenuItem>
        <MenuItem
          onClick={() => {
            snooze.mutate({ id: reminderId, snoozeDays: 1 });
            handleClose();
          }}
          disabled={snooze.isPending}
        >
          <SnoozeIcon fontSize="small" sx={{ mr: 1.5 }} />
          Snooze 1 day
        </MenuItem>
        <MenuItem
          onClick={() => {
            dismiss.mutate(reminderId);
            handleClose();
          }}
          disabled={dismiss.isPending}
        >
          <AccessTimeIcon fontSize="small" sx={{ mr: 1.5 }} />
          Dismiss
        </MenuItem>
      </Menu>
    </>
  );
}

interface ReminderItemProps {
  reminder: Reminder;
}

function ReminderItem({ reminder }: ReminderItemProps) {
  const theme = useTheme();
  const { attributes } = reminder;
  const dueDateLabel = formatDueDate(attributes.dueDate);
  const isOverdue = dueDateLabel === "Overdue";
  const urgencyColor = getUrgencyColor(attributes.urgency);

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: "8px !important",
        mb: 1,
        "&:before": { display: "none" },
        "&.Mui-expanded": { mb: 1 },
      }}
    >
      <AccordionSummary
        sx={{
          px: 2,
          minHeight: 56,
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            gap: 1.5,
            my: 1,
          },
        }}
      >
        {/* Urgency dot */}
        <Tooltip title={`${attributes.urgency} urgency`}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: urgencyColor,
              flexShrink: 0,
            }}
          />
        </Tooltip>

        {/* Title & pet */}
        <Box flexGrow={1} minWidth={0}>
          <Typography
            variant="body2"
            fontWeight={600}
            noWrap
            sx={{
              textDecoration:
                attributes.status === "completed" ? "line-through" : "none",
              color:
                attributes.status === "completed"
                  ? "text.disabled"
                  : "text.primary",
            }}
          >
            {attributes.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {attributes.petName ?? "Household"}
          </Typography>
        </Box>

        {/* Due date */}
        <Chip
          label={dueDateLabel}
          size="small"
          color={isOverdue ? "error" : "default"}
          variant={isOverdue ? "filled" : "outlined"}
          sx={{ minHeight: 24, flexShrink: 0 }}
        />

        {attributes.status === "completed" && (
          <CheckCircleIcon
            fontSize="small"
            sx={{ color: "success.main", flexShrink: 0 }}
          />
        )}

        <ReminderItemMenu reminderId={reminder.id} />
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2, pb: 2 }}>
        <Box display="flex" flexDirection="column" gap={0.5}>
          {attributes.description && (
            <Typography variant="body2" color="text.secondary">
              {attributes.description}
            </Typography>
          )}
          <Box display="flex" gap={2} flexWrap="wrap">
            <Typography variant="caption" color="text.disabled">
              Type: {attributes.type?.replaceAll("_", " ")}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Due:{" "}
              {new Date(attributes.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Typography>
            {attributes.isRecurring && attributes.recurrenceDays && (
              <Typography variant="caption" color="text.disabled">
                Repeats every {attributes.recurrenceDays} day
                {attributes.recurrenceDays === 1 ? "" : "s"}
              </Typography>
            )}
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

export function ReminderListSkeleton() {
  return (
    <Box>
      {Array.from({ length: 4 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
        <Skeleton key={i} variant="rounded" height={56} sx={{ mb: 1 }} />
      ))}
    </Box>
  );
}

interface ReminderListProps {
  reminders: Reminder[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onAddClick?: () => void;
}

export function ReminderList({
  reminders,
  isLoading = false,
  emptyTitle = "No reminders",
  emptyDescription = "Add a reminder to keep track of important pet care tasks.",
  onAddClick,
}: ReminderListProps) {
  if (isLoading) {
    return <ReminderListSkeleton />;
  }

  if (reminders.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={<AccessTimeIcon />}
        action={
          onAddClick
            ? { label: "Add reminder", onClick: onAddClick }
            : undefined
        }
      />
    );
  }

  return (
    <Box>
      {reminders.map((reminder) => (
        <ReminderItem key={reminder.id} reminder={reminder} />
      ))}
    </Box>
  );
}
