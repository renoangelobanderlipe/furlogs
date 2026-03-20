"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  VACCINATION_STATUS_COLOR,
  VACCINATION_STATUS_LABEL,
  type Vaccination,
} from "@/lib/api/vaccinations";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface VaccinationCardProps {
  vaccination: Vaccination;
  petName?: string;
  onClick?: () => void;
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  success:
    "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20",
  warning:
    "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  error: "bg-destructive/15 text-destructive border-destructive/20",
};

export function VaccinationCard({
  vaccination,
  petName,
  onClick,
}: VaccinationCardProps) {
  const { vaccineName, administeredDate, nextDueDate, vetName, status } =
    vaccination.attributes;

  const statusColor = status ? VACCINATION_STATUS_COLOR[status] : null;
  const statusLabel = status ? VACCINATION_STATUS_LABEL[status] : null;

  return (
    <Card
      className={cn(
        "flex h-full flex-col",
        onClick && "cursor-pointer transition-colors hover:bg-accent/30",
      )}
      onClick={onClick}
    >
      <CardContent className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="truncate text-sm font-bold">{vaccineName}</p>
          {status && statusColor && statusLabel && (
            <Badge
              className={cn(
                "flex-shrink-0 text-xs",
                STATUS_BADGE_CLASS[statusColor],
              )}
            >
              {statusLabel}
            </Badge>
          )}
        </div>

        {petName && (
          <p className="mb-2 block text-xs text-muted-foreground">{petName}</p>
        )}

        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">Administered</span>
            <span className="text-xs">{formatShortDate(administeredDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">Next due</span>
            <span
              className={cn(
                "text-xs",
                status === "overdue"
                  ? "text-destructive"
                  : status === "due_soon"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-foreground",
              )}
            >
              {formatShortDate(nextDueDate)}
            </span>
          </div>
        </div>

        {vetName && (
          <p className="mt-2 text-xs text-muted-foreground/70">Dr. {vetName}</p>
        )}
      </CardContent>
    </Card>
  );
}
