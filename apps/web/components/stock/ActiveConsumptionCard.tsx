"use client";

import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SpeedIcon from "@mui/icons-material/Speed";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type {
  FoodProjectionItem,
  ProjectionStatus,
} from "@/lib/api/food-stock";
import type { Pet } from "@/lib/api/pets";

interface ActiveConsumptionCardProps {
  projectionItem: FoodProjectionItem;
  pets: Pet[];
  onAdjustRates: () => void;
  onMarkFinished: () => void;
  onLogNewBag: () => void;
  isMarkingFinished: boolean;
}

const STATUS_CHIP_COLOR_MAP: Record<
  ProjectionStatus | "unknown",
  "success" | "warning" | "error" | "default"
> = {
  good: "success",
  low: "warning",
  critical: "error",
  unknown: "default",
};

const PROGRESS_COLOR_MAP: Record<
  ProjectionStatus | "unknown",
  "success" | "warning" | "error" | "inherit"
> = {
  good: "success",
  low: "warning",
  critical: "error",
  unknown: "inherit",
};

const STATUS_LABELS: Record<ProjectionStatus | "unknown", string> = {
  good: "Good",
  low: "Low",
  critical: "Critical",
  unknown: "No rates",
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
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}

export function ActiveConsumptionCard({
  projectionItem,
  pets,
  onAdjustRates,
  onMarkFinished,
  onLogNewBag,
  isMarkingFinished,
}: ActiveConsumptionCardProps) {
  const { item, projection } = projectionItem;
  const attr = item.attributes;
  const product = attr.foodProduct;
  const rates = product?.attributes.consumptionRates ?? [];
  const totalDailyRate = projection?.totalDailyRate ?? 0;

  const projStatus: ProjectionStatus | "unknown" = projection?.status ?? "unknown";

  const borderColorMap: Record<ProjectionStatus | "unknown", string> = {
    good: "success.main",
    low: "warning.main",
    critical: "error.main",
    unknown: "divider",
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: "4px solid",
        borderLeftColor: borderColorMap[projStatus],
      }}
    >
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="flex-start" gap={1} mb={1.5}>
          <Box flexGrow={1}>
            <Typography variant="subtitle1" fontWeight={700}>
              {product?.attributes.name ?? `Stock Item #${item.id}`}
            </Typography>
            {product?.attributes.brand && (
              <Typography variant="caption" color="text.secondary">
                {product.attributes.brand}
              </Typography>
            )}
          </Box>
          <Chip
            label={STATUS_LABELS[projStatus]}
            color={STATUS_CHIP_COLOR_MAP[projStatus]}
            size="small"
          />
        </Box>

        {/* Progress bar */}
        {projection && (
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                Stock remaining
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {projection.percentageRemaining.toFixed(0)}%
              </Typography>
            </Box>
            <Box position="relative">
              <LinearProgress
                variant="determinate"
                value={Math.min(projection.percentageRemaining, 100)}
                color={PROGRESS_COLOR_MAP[projStatus]}
                sx={{ height: 10, borderRadius: 5 }}
              />
              {/* Alert threshold marker */}
              {product?.attributes.alertThresholdPct != null && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: `${product.attributes.alertThresholdPct}%`,
                    width: "2px",
                    bgcolor: "warning.main",
                    borderRadius: 1,
                  }}
                />
              )}
            </Box>
            {product?.attributes.alertThresholdPct != null && (
              <Typography variant="caption" color="text.secondary">
                Alert at {product.attributes.alertThresholdPct}%
              </Typography>
            )}
          </Box>
        )}

        {/* Stats grid */}
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatGridItem
              label="Daily Rate"
              value={totalDailyRate > 0 ? `${totalDailyRate}g/day` : "—"}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatGridItem
              label="Days Since Opened"
              value={
                attr.daysSinceOpened != null ? `${attr.daysSinceOpened}d` : "—"
              }
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatGridItem
              label="Days Remaining"
              value={
                projection?.daysRemaining != null
                  ? `${projection.daysRemaining}d`
                  : "—"
              }
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatGridItem
              label="Projected Empty"
              value={
                projection?.runsOutDate
                  ? formatDate(projection.runsOutDate)
                  : "—"
              }
            />
          </Grid>
        </Grid>

        {/* Per-pet breakdown */}
        {rates.length > 0 && (
          <>
            <Divider sx={{ mb: 1.5 }} />
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mb={1}
            >
              Per-pet breakdown
            </Typography>
            <Stack spacing={0.75}>
              {rates.map((rate) => {
                const pet = pets.find((p) => p.id === rate.petId);
                const pct =
                  totalDailyRate > 0
                    ? ((rate.dailyAmountGrams / totalDailyRate) * 100).toFixed(
                        0,
                      )
                    : "—";
                return (
                  <Box
                    key={rate.petId}
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {pet?.attributes.name ?? `Pet #${rate.petId}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {rate.dailyAmountGrams}g
                    </Typography>
                    <Chip
                      label={`${pct}%`}
                      size="small"
                      variant="outlined"
                      sx={{ minWidth: 52 }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </>
        )}

        {/* Actions */}
        <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<SpeedIcon />}
            onClick={onAdjustRates}
            sx={{ minHeight: 36 }}
          >
            Adjust Rates
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={onMarkFinished}
            disabled={isMarkingFinished}
            sx={{ minHeight: 36 }}
          >
            {isMarkingFinished ? "Finishing…" : "Mark Finished"}
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onLogNewBag}
            sx={{ minHeight: 36 }}
          >
            Log New Bag
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
