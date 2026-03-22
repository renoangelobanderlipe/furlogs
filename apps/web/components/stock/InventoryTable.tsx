"use client";

import { Gauge, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  FoodProduct,
  FoodProjectionItem,
  ProjectionStatus,
} from "@/lib/api/food-stock";
import { cn } from "@/lib/utils";

interface InventoryTableProps {
  products: FoodProduct[];
  projections: FoodProjectionItem[];
  isLoading: boolean;
  onEdit: (product: FoodProduct) => void;
  onDelete: (product: FoodProduct) => void;
  onEditRates: (product: FoodProduct) => void;
  onAddProduct: () => void;
}

const FOOD_TYPE_LABELS: Record<string, string> = {
  dry: "Dry",
  wet: "Wet",
  treat: "Treat",
  supplement: "Supplement",
};

const STATUS_BADGE_CLASS: Record<ProjectionStatus, string> = {
  good: "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400",
  low: "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  critical: "border-destructive/20 bg-destructive/10 text-destructive",
};

const PROGRESS_CLASS: Record<ProjectionStatus, string> = {
  good: "[&>div]:bg-green-500",
  low: "[&>div]:bg-yellow-500",
  critical: "[&>div]:bg-destructive",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface InventoryRowProps {
  product: FoodProduct;
  projection: FoodProjectionItem | undefined;
  onEdit: () => void;
  onDelete: () => void;
  onEditRates: () => void;
}

function InventoryRow({
  product,
  projection,
  onEdit,
  onDelete,
  onEditRates,
}: InventoryRowProps) {
  const attr = product.attributes;
  const proj = projection?.projection ?? null;
  const rateCount = attr.consumptionRates?.length ?? 0;

  return (
    <TableRow>
      <TableCell>
        <p className="text-sm font-semibold">{attr.name}</p>
        {attr.brand && (
          <Badge variant="outline" className="mt-1 text-xs">
            {attr.brand}
          </Badge>
        )}
      </TableCell>

      <TableCell>
        <Badge variant="outline" className="text-xs">
          {FOOD_TYPE_LABELS[attr.type] ?? attr.type}
        </Badge>
      </TableCell>

      <TableCell>
        {proj ? (
          <Badge className={cn("text-xs", STATUS_BADGE_CLASS[proj.status])}>
            {proj.status}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      <TableCell className="min-w-[140px]">
        {proj ? (
          <div>
            <Progress
              value={Math.min(proj.percentageRemaining, 100)}
              className={cn("mb-1 h-1.5", PROGRESS_CLASS[proj.status])}
            />
            <span className="text-xs text-muted-foreground">
              {proj.percentageRemaining.toFixed(0)}% remaining
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      <TableCell>
        {proj?.runsOutDate ? (
          <span className="text-sm">{formatDate(proj.runsOutDate)}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      <TableCell>
        {rateCount > 0 ? (
          <Badge variant="secondary" className="text-xs">
            {rateCount} pet{rateCount === 1 ? "" : "s"}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">None</span>
        )}
      </TableCell>

      <TableCell className="text-right">
        <TooltipProvider>
          <div className="flex items-center justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onEditRates}
                  aria-label="Edit consumption rates"
                  className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Gauge className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Edit consumption rates</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onEdit}
                  aria-label="Edit product"
                  className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Edit product</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onDelete}
                  aria-label="Delete product"
                  className="flex h-9 w-9 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Delete product</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton has no stable id
        <TableRow key={i}>
          {Array.from({ length: 7 }).map((__, j) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton has no stable id
            <TableCell key={j}>
              <Skeleton className="h-4 w-4/5" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export const InventoryTable = ({
  products,
  projections,
  isLoading,
  onEdit,
  onDelete,
  onEditRates,
  onAddProduct,
}: InventoryTableProps) => {
  const projectionByProductId = new Map(
    projections.map((p) => [p.item.attributes.foodProductId, p]),
  );

  if (!isLoading && products.length === 0) {
    return (
      <EmptyState
        title="No products yet"
        description="Add your first food product to start tracking stock."
        action={{ label: "Add Product", onClick: onAddProduct }}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Remaining</TableHead>
            <TableHead>Runs Out</TableHead>
            <TableHead>Assigned Pets</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <SkeletonRows />
          ) : (
            products.map((product) => (
              <InventoryRow
                key={product.id}
                product={product}
                projection={projectionByProductId.get(product.id)}
                onEdit={() => onEdit(product)}
                onDelete={() => onDelete(product)}
                onEditRates={() => onEditRates(product)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
