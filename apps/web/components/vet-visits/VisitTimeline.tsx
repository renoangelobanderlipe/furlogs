"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  type VetVisit,
  type VetVisitType,
  VISIT_TYPE_LABEL,
} from "@/lib/api/vet-visits";
import { cn } from "@/lib/utils";

interface VisitTimelineProps {
  visits: VetVisit[];
  onSelectVisit: (visit: VetVisit) => void;
}

// Tailwind bg classes for the timeline dots
const VISIT_TYPE_DOT_CLASS: Record<VetVisitType, string> = {
  checkup: "bg-blue-500",
  treatment: "bg-yellow-500",
  vaccine: "bg-green-500",
  emergency: "bg-destructive",
};

// Badge classes for inline chip
const VISIT_TYPE_BADGE_CLASS: Record<VetVisitType, string> = {
  checkup: "border-blue-500/30 text-blue-600 dark:text-blue-400",
  treatment: "border-yellow-500/30 text-yellow-600 dark:text-yellow-400",
  vaccine: "border-green-500/30 text-green-600 dark:text-green-400",
  emergency: "border-destructive/30 text-destructive",
};

function getMonthYear(dateStr: string): string {
  const [year, month] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatDayMonth(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupByMonth(visits: VetVisit[]): Map<string, VetVisit[]> {
  const sorted = [...visits].sort(
    (a, b) =>
      new Date(b.attributes.visitDate).getTime() -
      new Date(a.attributes.visitDate).getTime(),
  );
  const groups = new Map<string, VetVisit[]>();
  for (const visit of sorted) {
    const key = getMonthYear(visit.attributes.visitDate);
    const existing = groups.get(key);
    if (existing) {
      existing.push(visit);
    } else {
      groups.set(key, [visit]);
    }
  }
  return groups;
}

export const VisitTimeline = ({ visits, onSelectVisit }: VisitTimelineProps) => {
  const groups = useMemo(() => groupByMonth(visits), [visits]);

  return (
    <div>
      {Array.from(groups.entries()).map(([monthYear, monthVisits]) => (
        <div key={monthYear} className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {monthYear}
          </p>
          <Separator className="mb-4 mt-1" />

          <div className="flex flex-col">
            {monthVisits.map((visit, index) => (
              <div key={visit.id} className="flex items-stretch">
                {/* Timeline column */}
                <div className="mr-4 flex w-5 flex-shrink-0 flex-col items-center">
                  <div
                    className={cn(
                      "mt-3 h-3 w-3 flex-shrink-0 rounded-full ring-2 ring-background",
                      VISIT_TYPE_DOT_CLASS[visit.attributes.visitType],
                    )}
                  />
                  {index < monthVisits.length - 1 && (
                    <div className="my-1 min-h-[16px] w-0.5 flex-1 bg-border" />
                  )}
                </div>

                {/* Content */}
                <button
                  type="button"
                  onClick={() => onSelectVisit(visit)}
                  className={cn(
                    "mb-3 flex-1 rounded-md border border-border px-3 py-2.5 text-left transition-colors hover:bg-accent/50",
                    index < monthVisits.length - 1 ? "mb-3" : "mb-0",
                  )}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <p className="truncate text-sm font-semibold">
                      {visit.attributes.reason}
                    </p>
                    <span className="ml-2 flex-shrink-0 text-xs text-muted-foreground">
                      {formatDayMonth(visit.attributes.visitDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-[18px] text-[10px]",
                        VISIT_TYPE_BADGE_CLASS[visit.attributes.visitType],
                      )}
                    >
                      {VISIT_TYPE_LABEL[visit.attributes.visitType]}
                    </Badge>
                    {visit.attributes.vetName && (
                      <span className="truncate text-xs text-muted-foreground">
                        {visit.attributes.vetName}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
