import type { DashboardReminderItem } from "@/lib/api/dashboard";
import { cn } from "@/lib/utils";

export const UrgencyChip = ({
  urgency,
}: {
  urgency: DashboardReminderItem["urgency"];
}) => {
  const cls: Record<string, string> = {
    high: "bg-destructive/15 text-destructive",
    medium: "bg-warning/15 text-warning",
    low: "bg-success/15 text-success",
  };
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase shrink-0",
        cls[urgency] ?? "bg-muted text-muted-foreground",
      )}
    >
      {urgency}
    </span>
  );
};
