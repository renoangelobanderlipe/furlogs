"use client";

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
import { Skeleton } from "@/components/ui/skeleton";
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
  const { data, isLoading, isError } = usePetWeights(petId);

  if (isLoading) {
    return <Skeleton className="h-60 w-full rounded-xl" />;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">Failed to load weight history.</p>
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
    <div>
      <p className="text-sm font-semibold mb-3">Weight History</p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={chartData}
          margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            unit=" kg"
            width={56}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
            formatter={(value) => [`${value} kg`, "Weight"]}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
