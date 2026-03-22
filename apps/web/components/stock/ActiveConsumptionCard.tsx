"use client";

import { CheckCircle2, Gauge, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type {
  FoodProjectionItem,
  ProjectionStatus,
} from "@/lib/api/food-stock";
import type { Pet } from "@/lib/api/pets";
import { cn } from "@/lib/utils";

interface ActiveConsumptionCardProps {
  projectionItem: FoodProjectionItem;
  pets: Pet[];
  onAdjustRates: () => void;
  onMarkFinished: () => void;
  onLogNewBag: () => void;
  isMarkingFinished: boolean;
}

const STATUS_BADGE_CLASS: Record<ProjectionStatus | "unknown", string> = {
  good: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20",
  low: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  critical: "bg-destructive/15 text-destructive border-destructive/20",
  unknown: "bg-muted text-muted-foreground border-border",
};

const STATUS_LABELS: Record<ProjectionStatus | "unknown", string> = {
  good: "Good",
  low: "Low",
  critical: "Critical",
  unknown: "No rates",
};

const BORDER_COLOR_CLASS: Record<ProjectionStatus | "unknown", string> = {
  good: "border-l-green-500",
  low: "border-l-yellow-500",
  critical: "border-l-destructive",
  unknown: "border-l-border",
};

const PROGRESS_CLASS: Record<ProjectionStatus | "unknown", string> = {
  good: "[&>div]:bg-green-500",
  low: "[&>div]:bg-yellow-500",
  critical: "[&>div]:bg-destructive",
  unknown: "",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface StatGridItemProps {
  label: string;
  value: string;
}

function StatGridItem({ label, value }: StatGridItemProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

export const ActiveConsumptionCard = ({
  projectionItem,
  pets,
  onAdjustRates,
  onMarkFinished,
  onLogNewBag,
  isMarkingFinished,
}: ActiveConsumptionCardProps) => {
  const { item, projection } = projectionItem;
  const attr = item.attributes;
  const product = item.relationships?.foodProduct;
  const rates = product?.attributes.consumptionRates ?? [];
  const totalDailyRate = projection?.totalDailyRate ?? 0;

  const projStatus: ProjectionStatus | "unknown" =
    projection?.status ?? "unknown";

  return (
    <Card className={cn("border-l-4", BORDER_COLOR_CLASS[projStatus])}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-start gap-2">
          <div className="flex-1">
            <h3 className="font-bold">
              {product?.attributes.name ?? `Stock Item #${item.id}`}
            </h3>
            {product?.attributes.brand && (
              <p className="text-xs text-muted-foreground">
                {product.attributes.brand}
              </p>
            )}
          </div>
          <Badge className={cn("text-xs", STATUS_BADGE_CLASS[projStatus])}>
            {STATUS_LABELS[projStatus]}
          </Badge>
        </div>

        {/* Progress bar */}
        {projection && (
          <div className="mb-4">
            <div className="mb-1 flex justify-between">
              <span className="text-xs text-muted-foreground">
                Stock remaining
              </span>
              <span className="text-xs font-semibold">
                {projection.percentageRemaining.toFixed(0)}%
              </span>
            </div>
            <div className="relative">
              <Progress
                value={Math.min(projection.percentageRemaining, 100)}
                className={cn("h-2.5", PROGRESS_CLASS[projStatus])}
              />
              {product?.attributes.alertThresholdPct != null && (
                <div
                  className="absolute bottom-0 top-0 w-0.5 rounded bg-yellow-500"
                  style={{ left: `${product.attributes.alertThresholdPct}%` }}
                />
              )}
            </div>
            {product?.attributes.alertThresholdPct != null && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Alert at {product.attributes.alertThresholdPct}%
              </p>
            )}
          </div>
        )}

        {/* Stats grid */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatGridItem
            label="Daily Rate"
            value={totalDailyRate > 0 ? `${totalDailyRate}g/day` : "—"}
          />
          <StatGridItem
            label="Days Since Opened"
            value={
              attr.daysSinceOpened != null ? `${attr.daysSinceOpened}d` : "—"
            }
          />
          <StatGridItem
            label="Days Remaining"
            value={
              projection?.daysRemaining != null
                ? `${projection.daysRemaining}d`
                : "—"
            }
          />
          <StatGridItem
            label="Projected Empty"
            value={
              projection?.runsOutDate ? formatDate(projection.runsOutDate) : "—"
            }
          />
        </div>

        {/* Per-pet breakdown */}
        {rates.length > 0 && (
          <>
            <Separator className="mb-3" />
            <p className="mb-2 text-xs text-muted-foreground">
              Per-pet breakdown
            </p>
            <div className="flex flex-col gap-2">
              {rates.map((rate) => {
                const pet = pets.find((p) => p.id === rate.petId);
                const pct =
                  totalDailyRate > 0
                    ? ((rate.dailyAmountGrams / totalDailyRate) * 100).toFixed(
                        0,
                      )
                    : "—";
                return (
                  <div key={rate.petId} className="flex items-center gap-2">
                    <p className="flex-1 text-sm">
                      {pet?.attributes.name ?? `Pet #${rate.petId}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {rate.dailyAmountGrams}g
                    </p>
                    <Badge
                      variant="outline"
                      className="min-w-[52px] text-center text-xs"
                    >
                      {pct}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onAdjustRates}
            className="min-h-[36px] gap-1.5"
          >
            <Gauge className="h-3.5 w-3.5" />
            Adjust Rates
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onMarkFinished}
            disabled={isMarkingFinished}
            className="min-h-[36px] gap-1.5 border-green-500/30 text-green-600 hover:bg-green-500/10 hover:text-green-700 dark:text-green-400"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {isMarkingFinished ? "Finishing\u2026" : "Mark Finished"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onLogNewBag}
            className="min-h-[36px] gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Log New Bag
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
