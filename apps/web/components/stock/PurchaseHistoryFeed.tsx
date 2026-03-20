"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { EmptyState } from "@/components/ui/EmptyState";
import type { FoodStockItem, StockStatus } from "@/lib/api/food-stock";

interface PurchaseHistoryFeedProps {
  items: FoodStockItem[];
  isLoading: boolean;
}

const STATUS_CHIP_MAP: Record<
  StockStatus,
  { label: string; color: "default" | "success" | "warning" | "info" }
> = {
  sealed: { label: "Sealed", color: "info" },
  open: { label: "Open", color: "warning" },
  finished: { label: "Finished", color: "success" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

interface HistoryItemRowProps {
  item: FoodStockItem;
}

function HistoryItemRow({ item }: HistoryItemRowProps) {
  const attr = item.attributes;
  const product = attr.foodProduct;
  const statusConfig = STATUS_CHIP_MAP[attr.status];

  return (
    <Box>
      <Box
        display="flex"
        alignItems="flex-start"
        gap={2}
        py={1.5}
        flexWrap={{ xs: "wrap", sm: "nowrap" }}
      >
        {/* Date column */}
        <Box sx={{ minWidth: 90, flexShrink: 0 }}>
          <Typography variant="caption" color="text.secondary">
            {formatDate(attr.purchasedAt)}
          </Typography>
        </Box>

        {/* Main content */}
        <Box flexGrow={1}>
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            flexWrap="wrap"
            mb={0.25}
          >
            <Typography variant="body2" fontWeight={600}>
              {product?.attributes.name ?? `Product #${attr.foodProductId}`}
            </Typography>
            {product?.attributes.brand && (
              <Typography variant="caption" color="text.secondary">
                — {product.attributes.brand}
              </Typography>
            )}
            {attr.quantity > 1 && (
              <Chip
                label={`×${attr.quantity}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            {attr.purchaseCost != null && (
              <Typography variant="caption" color="text.secondary">
                Cost: {formatCurrency(attr.purchaseCost)}
              </Typography>
            )}
            {attr.purchaseSource && (
              <Typography variant="caption" color="text.secondary">
                From: {attr.purchaseSource}
              </Typography>
            )}
            {attr.finishedAt && attr.openedAt && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <CheckCircleIcon sx={{ fontSize: 14, color: "success.main" }} />
                <Typography variant="caption" color="success.main">
                  Finished {formatDate(attr.finishedAt)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Status badge */}
        <Box sx={{ flexShrink: 0 }}>
          <Chip
            label={statusConfig.label}
            color={statusConfig.color}
            size="small"
            variant="outlined"
          />
        </Box>
      </Box>
      <Divider />
    </Box>
  );
}

function SkeletonRows() {
  return (
    <Stack>
      {Array.from({ length: 5 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton has no stable id
        <Box key={i} py={1.5}>
          <Box display="flex" gap={2} mb={0.5}>
            <Skeleton variant="text" width={80} />
            <Skeleton variant="text" width={160} />
            <Skeleton variant="rounded" width={60} height={20} />
          </Box>
          <Skeleton variant="text" width={200} />
          <Divider sx={{ mt: 1.5 }} />
        </Box>
      ))}
    </Stack>
  );
}

export function PurchaseHistoryFeed({
  items,
  isLoading,
}: PurchaseHistoryFeedProps) {
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

  // Sort chronologically descending
  const sorted = [...items].sort(
    (a, b) =>
      new Date(b.attributes.purchasedAt).getTime() -
      new Date(a.attributes.purchasedAt).getTime(),
  );

  return (
    <Box>
      <Divider />
      {sorted.map((item) => (
        <HistoryItemRow key={item.id} item={item} />
      ))}
    </Box>
  );
}
