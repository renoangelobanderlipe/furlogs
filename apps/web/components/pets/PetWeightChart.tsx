"use client";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePetWeights } from "@/hooks/api/usePetWeights";

interface PetWeightChartProps {
  petId: number;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function PetWeightChart({ petId }: PetWeightChartProps) {
  const theme = useTheme();
  const { data, isLoading, isError } = usePetWeights(petId);

  if (isLoading) {
    return <Skeleton variant="rounded" height={240} />;
  }

  if (isError) {
    return (
      <Typography variant="body2" color="error">
        Failed to load weight history.
      </Typography>
    );
  }

  const weights = data?.data ?? [];

  if (weights.length === 0) {
    return (
      <EmptyState
        title="No weight records yet"
        description="Record your pet's weight to start tracking trends."
      />
    );
  }

  const chartData = [...weights]
    .sort(
      (a, b) =>
        new Date(a.attributes.recordedAt).getTime() -
        new Date(b.attributes.recordedAt).getTime(),
    )
    .map((w) => ({
      date: formatDate(w.attributes.recordedAt),
      weight: w.attributes.weightKg,
    }));

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} mb={2}>
        Weight History
      </Typography>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={chartData}
          margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="date"
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            unit=" kg"
            width={56}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
              color: theme.palette.text.primary,
            }}
            formatter={(value) => [`${value} kg`, "Weight"]}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            dot={{ fill: theme.palette.primary.main, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
