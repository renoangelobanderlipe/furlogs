"use client";

import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { FoodStockItem, StockStatus } from "@/lib/api/food-stock";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PurchaseHistoryFeedProps {
  items: FoodStockItem[];
  isLoading: boolean;
}

const STATUS_BADGE_MAP: Record<
  StockStatus,
  { label: string; className: string }
> = {
  sealed: {
    label: "Sealed",
    className:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  open: {
    label: "Open",
    className:
      "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  },
  finished: {
    label: "Finished",
    className:
      "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface HistoryItemRowProps {
  item: FoodStockItem;
}

function HistoryItemRow({ item }: HistoryItemRowProps) {
  const attr = item.attributes;
  const product = item.relationships?.foodProduct;
  const statusConfig = STATUS_BADGE_MAP[attr.status];

  return (
    <div>
      <div className="flex flex-wrap items-start gap-3 py-3 sm:flex-nowrap">
        {/* Date column */}
        <div className="w-24 flex-shrink-0">
          <p className="text-xs text-muted-foreground">
            {formatDate(attr.purchasedAt)}
          </p>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="mb-0.5 flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">
              {product?.attributes.name ?? `Product #${attr.foodProductId}`}
            </p>
            {product?.attributes.brand && (
              <span className="text-xs text-muted-foreground">
                — {product.attributes.brand}
              </span>
            )}
            {attr.quantity > 1 && (
              <Badge variant="outline" className="text-xs">
                &times;{attr.quantity}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            {attr.purchaseCost != null && (
              <span className="text-xs text-muted-foreground">
                Cost: {formatCurrency(attr.purchaseCost)}
              </span>
            )}
            {attr.purchaseSource && (
              <span className="text-xs text-muted-foreground">
                From: {attr.purchaseSource}
              </span>
            )}
            {attr.finishedAt && attr.openedAt && (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Finished {formatDate(attr.finishedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div className="flex-shrink-0">
          <Badge className={cn("text-xs", statusConfig.className)}>
            {statusConfig.label}
          </Badge>
        </div>
      </div>
      <Separator />
    </div>
  );
}

function SkeletonRows() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton has no stable id
        <div key={i} className="py-3">
          <div className="mb-1 flex gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-48" />
          <Separator className="mt-3" />
        </div>
      ))}
    </div>
  );
}

export const PurchaseHistoryFeed = ({
  items,
  isLoading,
}: PurchaseHistoryFeedProps) => {
  if (isLoading) {
    return <SkeletonRows />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No purchase history"
        description="Log a purchase to start tracking your food stock history."
      />
    );
  }

  const sorted = [...items].sort(
    (a, b) =>
      new Date(b.attributes.purchasedAt).getTime() -
      new Date(a.attributes.purchasedAt).getTime(),
  );

  return (
    <div>
      <Separator />
      {sorted.map((item) => (
        <HistoryItemRow key={item.id} item={item} />
      ))}
    </div>
  );
};
