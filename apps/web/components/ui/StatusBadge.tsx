"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      status: {
        active: "border-success/30 bg-success/10 text-success",
        inactive: "border-muted-foreground/30 bg-muted text-muted-foreground",
        upcoming: "border-primary/30 bg-primary/10 text-primary",
        overdue: "border-destructive/30 bg-destructive/10 text-destructive",
        ok: "border-success/30 bg-success/10 text-success",
        low: "border-warning/30 bg-warning/10 text-warning",
        critical: "border-destructive/30 bg-destructive/10 text-destructive",
        completed: "border-success/30 bg-success/10 text-success",
        pending: "border-primary/30 bg-primary/10 text-primary",
        dismissed: "border-muted-foreground/30 bg-muted text-muted-foreground",
        good: "border-success/30 bg-success/10 text-success",
        warning: "border-warning/30 bg-warning/10 text-warning",
      },
    },
    defaultVariants: {
      status: "active",
    },
  },
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  label: string;
  className?: string;
}

export const StatusBadge = ({ status, label, className }: StatusBadgeProps) => {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)}>
      {label}
    </span>
  );
};
