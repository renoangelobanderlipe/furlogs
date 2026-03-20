"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFoodStockItems } from "@/hooks/api/useFoodStock";
import { useVetVisitStats, useVetVisits } from "@/hooks/api/useVetVisits";
import { formatCurrency } from "@/lib/format";

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
  const { data: stats } = useVetVisitStats();
  const { data: allVisits } = useVetVisits({ per_page: 200 });
  const { data: stockItems = [] } = useFoodStockItems();

  const vetTotal = stats?.ytdSpend ?? 0;

  const foodTotal = stockItems
    .filter((item) => {
      const year = new Date(item.attributes.purchasedAt).getFullYear();
      return year === currentYear;
    })
    .reduce((sum, item) => sum + (item.attributes.purchaseCost ?? 0), 0);

  const total = vetTotal + foodTotal;

  // Build monthly data
  const visits = allVisits?.data ?? [];
  const monthlyData = MONTHS.map((month, idx) => {
    const vet = visits
      .filter((v) => {
        const d = new Date(v.attributes.visitDate);
        return d.getFullYear() === currentYear && d.getMonth() === idx;
      })
      .reduce((sum, v) => {
        const c = parseFloat(v.attributes.cost ?? "0");
        return sum + (Number.isNaN(c) ? 0 : c);
      }, 0);

    const food = stockItems
      .filter((item) => {
        const d = new Date(item.attributes.purchasedAt);
        return d.getFullYear() === currentYear && d.getMonth() === idx;
      })
      .reduce((sum, item) => sum + (item.attributes.purchaseCost ?? 0), 0);

    return { month, vet, food };
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight">Spending</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {currentYear} overview
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 animate-fade-in-up">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Spend</p>
          <p className="text-xl font-bold tabular-nums mt-1">
            {formatCurrency(total)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Vet Spend</p>
          <p className="text-xl font-bold tabular-nums mt-1 text-primary">
            {formatCurrency(vetTotal)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Food Spend</p>
          <p className="text-xl font-bold tabular-nums mt-1 text-success">
            {formatCurrency(foodTotal)}
          </p>
        </div>
      </div>

      {/* Monthly breakdown chart */}
      <div
        className="rounded-lg border border-border bg-card p-4 animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <h2 className="font-semibold mb-4">Monthly Breakdown</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(v: number) => `₱${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 13,
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number) => [formatCurrency(value), ""]}
              />
              <Legend />
              <Bar
                dataKey="vet"
                name="Vet"
                fill="hsl(174 80% 40%)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="food"
                name="Food"
                fill="hsl(142 71% 45%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
