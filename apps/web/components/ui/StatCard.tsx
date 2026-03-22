"use client";

import { PawWatermark } from "@/components/ui/paw-watermark";
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

export const StatCard = ({
  label,
  value,
  subtitle,
  icon,
  variant,
  status,
  className,
}: StatCardProps) => {
  const v = variant ?? status ?? "default";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-card p-4 animate-fade-in-up",
        className,
      )}
    >
      <PawWatermark
        size={60}
        opacity={0.055}
        rotate={15}
        flip
        className="-bottom-3 -right-3"
      />
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
};
