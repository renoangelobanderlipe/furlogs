"use client";

import {
  BarChart3,
  CalendarDays,
  Receipt,
  ShoppingBag,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CustomTooltip } from "@/components/spending/CustomTooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpendingStats } from "@/hooks/api/useSpending";
import { formatCurrency, formatCurrencyChart } from "@/lib/format";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const currentYear = new Date().getFullYear();

export default function SpendingPage() {
  const { data: stats, isLoading } = useSpendingStats();

  const vetTotal = stats?.vetYtdSpend ?? 0;
  const foodTotal = stats?.foodYtdSpend ?? 0;
  const total = stats?.totalYtdSpend ?? 0;
  const hasData = total > 0;

  const vetPct = hasData ? Math.round((vetTotal / total) * 100) : 0;
  const foodPct = hasData ? 100 - vetPct : 0;

  const monthlyData = (stats?.monthly ?? []).map((entry) => ({
    month: MONTHS[entry.month - 1],
    vet: entry.vet,
    food: entry.food,
  }));

  const activeMonths = monthlyData.filter((m) => m.vet + m.food > 0);
  const peakMonth = activeMonths.reduce<{
    month: string;
    total: number;
  } | null>((acc, m) => {
    const t = m.vet + m.food;
    return t > (acc?.total ?? 0) ? { month: m.month, total: t } : acc;
  }, null);
  const avgMonthlySpend =
    activeMonths.length > 0
      ? activeMonths.reduce((sum, m) => sum + m.vet + m.food, 0) /
        activeMonths.length
      : 0;
  const topCategory = vetTotal >= foodTotal ? "Vet" : "Food";
  const topCategoryPct = hasData
    ? Math.round((Math.max(vetTotal, foodTotal) / total) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {["s1", "s2", "s3"].map((k) => (
            <Skeleton key={k} className="h-[88px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in-up">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
          <Receipt className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Spending</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {currentYear} year-to-date
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total */}
        <div
          className="rounded-xl border border-border bg-card p-4 animate-fade-in-up relative overflow-hidden"
          style={{ animationDelay: "50ms" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] to-transparent pointer-events-none" />
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">
                Total Spend
              </p>
              <p className="text-2xl font-bold tabular-nums mt-1 truncate">
                {formatCurrency(total)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {currentYear} YTD
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shrink-0">
              <Receipt className="h-5 w-5 text-foreground/50" />
            </div>
          </div>
        </div>

        {/* Vet */}
        <div
          className="rounded-xl border border-primary/20 bg-card p-4 animate-fade-in-up relative overflow-hidden"
          style={{ animationDelay: "100ms" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">
                Vet Spend
              </p>
              <p className="text-2xl font-bold tabular-nums mt-1 text-primary truncate">
                {formatCurrency(vetTotal)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {hasData ? `${vetPct}% of total` : "No visits logged"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Food */}
        <div
          className="rounded-xl border border-success/20 bg-card p-4 animate-fade-in-up relative overflow-hidden"
          style={{ animationDelay: "150ms" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent pointer-events-none" />
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">
                Food Spend
              </p>
              <p className="text-2xl font-bold tabular-nums mt-1 text-success truncate">
                {formatCurrency(foodTotal)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {hasData ? `${foodPct}% of total` : "No purchases logged"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 shrink-0">
              <ShoppingBag className="h-5 w-5 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Spending split */}
      {hasData && (
        <div
          className="rounded-xl border border-border bg-card p-4 animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <p className="text-xs font-medium text-muted-foreground mb-3">
            Spending Split
          </p>
          <div className="relative h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${vetPct}%` }}
            />
            <div
              className="absolute top-0 h-full bg-success transition-all duration-700 ease-out"
              style={{ left: `${vetPct}%`, right: 0 }}
            />
          </div>
          <div className="flex justify-between mt-2.5">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary inline-block" />
              <span className="text-xs text-muted-foreground">
                Vet{" "}
                <span className="font-semibold text-foreground">{vetPct}%</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">
                Food{" "}
                <span className="font-semibold text-foreground">
                  {foodPct}%
                </span>
              </span>
              <span className="h-2 w-2 rounded-full bg-success inline-block" />
            </div>
          </div>
        </div>
      )}

      {/* Monthly breakdown chart */}
      <div
        className="rounded-xl border border-border bg-card p-5 animate-fade-in-up"
        style={{ animationDelay: "250ms" }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-semibold">Monthly Breakdown</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vet and food spend per month
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary inline-block" />
              Vet
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-success inline-block" />
              Food
            </div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              barGap={3}
              barCategoryGap="30%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
                strokeOpacity={0.8}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
                tickFormatter={formatCurrencyChart}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
              />
              <Bar
                dataKey="vet"
                name="Vet"
                fill="hsl(174 80% 40%)"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="food"
                name="Food"
                fill="hsl(142 71% 45%)"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      {hasData && (
        <div
          className="grid grid-cols-3 gap-3 animate-fade-in-up"
          style={{ animationDelay: "300ms" }}
        >
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning/10">
                <TrendingUp className="h-3.5 w-3.5 text-warning" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Peak Month
              </p>
            </div>
            <p className="text-base font-bold">{peakMonth?.month ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
              {peakMonth ? formatCurrency(peakMonth.total) : "—"}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Monthly Avg
              </p>
            </div>
            <p className="text-base font-bold tabular-nums">
              {formatCurrency(avgMonthlySpend)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              across {activeMonths.length}{" "}
              {activeMonths.length === 1 ? "month" : "months"}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/10">
                <BarChart3 className="h-3.5 w-3.5 text-success" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Top Category
              </p>
            </div>
            <p className="text-base font-bold">{topCategory}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {topCategoryPct}% of total spend
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
