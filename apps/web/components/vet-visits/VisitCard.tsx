"use client";

import { Paperclip, Stethoscope } from "lucide-react";
import { PawWatermark } from "@/components/ui/paw-watermark";
import { type VetVisit, VISIT_TYPE_LABEL } from "@/lib/api/vet-visits";
import { formatCurrency, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface VisitCardProps {
  visit: VetVisit;
  onClick?: () => void;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  selectable?: boolean;
}

const VISIT_TYPE_CLASS: Record<string, string> = {
  checkup: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  treatment: "border-warning/30 bg-warning/10 text-warning",
  vaccine: "border-success/30 bg-success/10 text-success",
  emergency: "border-destructive/30 bg-destructive/10 text-destructive",
};

export const VisitCard = ({
  visit,
  onClick,
  selected = false,
  selectable = false,
  onToggleSelect,
}: VisitCardProps) => {
  const { visitType, visitDate, reason, cost, attachmentCount } =
    visit.attributes;
  const formattedCost = cost ? formatCurrency(cost) : null;

  const handleClick = () => {
    if (selectable && onToggleSelect) {
      onToggleSelect(visit.id);
    } else {
      onClick?.();
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card h-full flex flex-col",
        selected ? "border-primary ring-2 ring-primary/20" : "border-border",
      )}
    >
      <PawWatermark
        size={64}
        opacity={0.05}
        rotate={12}
        flip
        className="-bottom-3 -right-3"
      />
      <button
        type="button"
        onClick={handleClick}
        className="flex-1 text-left p-4 rounded-xl transition-colors hover:bg-accent"
      >
        <div className="flex items-start justify-between mb-2">
          <span
            className={cn(
              "inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold",
              VISIT_TYPE_CLASS[visitType] ??
                "border-border bg-muted text-muted-foreground",
            )}
          >
            {VISIT_TYPE_LABEL[visitType]}
          </span>
          <span className="text-xs text-muted-foreground shrink-0 ml-2">
            {formatShortDate(visitDate)}
          </span>
        </div>

        <p className="text-sm font-semibold leading-snug mb-2 line-clamp-2">
          {reason}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Stethoscope className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">
              {visit.attributes.vetName ?? "Vet visit"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {formattedCost && (
              <span className="text-xs text-muted-foreground">
                {formattedCost}
              </span>
            )}
            {attachmentCount > 0 && (
              <div className="flex items-center gap-0.5">
                <Paperclip className="h-3 w-3 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground/50">
                  {attachmentCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  );
};
