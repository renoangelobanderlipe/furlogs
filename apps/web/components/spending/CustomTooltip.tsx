"use client";

import type { TooltipProps } from "recharts";
import { PawWatermark } from "@/components/ui/paw-watermark";
import { formatCurrency } from "@/lib/format";

export const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;

  const vet = (payload.find((p) => p.dataKey === "vet")?.value as number) ?? 0;
  const food =
    (payload.find((p) => p.dataKey === "food")?.value as number) ?? 0;
  const total = vet + food;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-3 shadow-xl min-w-[156px]">
      <PawWatermark
        size={52}
        opacity={0.055}
        rotate={10}
        flip
        className="-bottom-2 -right-2"
      />
      <p className="text-xs font-semibold text-foreground mb-2.5">{label}</p>
      {total === 0 ? (
        <p className="text-xs text-muted-foreground">No spending</p>
      ) : (
        <div className="space-y-1.5">
          {vet > 0 && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary inline-block" />
                <span className="text-xs text-muted-foreground">Vet</span>
              </div>
              <span className="text-xs font-medium tabular-nums">
                {formatCurrency(vet)}
              </span>
            </div>
          )}
          {food > 0 && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success inline-block" />
                <span className="text-xs text-muted-foreground">Food</span>
              </div>
              <span className="text-xs font-medium tabular-nums">
                {formatCurrency(food)}
              </span>
            </div>
          )}
          <div className="border-t border-border pt-1.5 flex justify-between">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-xs font-semibold tabular-nums">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
