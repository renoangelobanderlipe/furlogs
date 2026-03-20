"use client";

import Chip from "@mui/material/Chip";

interface StatusBadgeProps {
  status: "good" | "warning" | "critical";
  label: string;
}

const STATUS_COLOR_MAP = {
  good: "success",
  warning: "warning",
  critical: "error",
} as const;

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <Chip
      label={label}
      color={STATUS_COLOR_MAP[status]}
      size="small"
      variant="outlined"
    />
  );
}
