"use client";

import { cn } from "@/lib/utils";

type StatVariant = "default" | "warning" | "error" | "success" | "info";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: StatVariant;
  /** @deprecated use variant */
  status?: StatVariant;
  className?: string;
}

const variantIconClass: Record<StatVariant, string> = {
  default: "text-primary",
  warning: "text-warning",
  error: "text-destructive",
  success: "text-success",
  info: "text-primary",
};

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  variant,
  status,
  className,
}: StatCardProps) {
  const v = variant ?? status ?? "default";
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 animate-fade-in-up",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg bg-card shrink-0 [&_svg]:h-5 [&_svg]:w-5",
              variantIconClass[v],
            )}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold tabular-nums">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
