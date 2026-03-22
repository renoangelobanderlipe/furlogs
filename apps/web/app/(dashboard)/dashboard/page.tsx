"use client";

import {
  Bell,
  Package,
  PawPrint,
  Stethoscope,
  Syringe,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { UrgencyChip } from "@/components/dashboard/UrgencyChip";
import { MiniCalendar } from "@/components/calendar/MiniCalendar";
import { PawWatermark } from "@/components/ui/paw-watermark";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardSummary } from "@/hooks/api/useDashboard";
import { useVetVisits } from "@/hooks/api/useVetVisits";
import type { DashboardPetSummary } from "@/lib/api/dashboard";
import { SPECIES_EMOJI } from "@/lib/constants";
import {
  formatCurrency,
  formatRelativeDueDate,
  formatShortDate,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useHouseholdStore } from "@/stores/useHouseholdStore";

function getTimeGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  const base =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return name ? `${base}, ${name}` : base;
}


const QUICK_ACTIONS = [
  { label: "Add Pet", icon: PawPrint, href: "/pets" },
  { label: "Log Visit", icon: Stethoscope, href: "/vet-visits" },
  { label: "Vaccination", icon: Syringe, href: "/vaccinations" },
  { label: "Log Stock", icon: Package, href: "/stock" },
  { label: "Reminder", icon: Bell, href: "/reminders" },
] as const;

// ── Page ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { selectedPetId, isPetFilterActive, selectPet, clearPetFilter } =
    useHouseholdStore();

  const petId = isPetFilterActive && selectedPetId ? selectedPetId : undefined;
  const { data, isLoading } = useDashboardSummary(
    petId ? { petId } : undefined,
  );
  const { data: recentVisitsData, isLoading: isVisitsLoading } = useVetVisits({
    page: 1,
    ...(petId ? { petId } : {}),
  });

  const greeting = getTimeGreeting(user?.name);

  const upcomingCount = data?.upcomingReminders.count ?? 0;
  const stockStatus = data?.stockStatus;
  const vetStats = data?.vetVisitStats;
  const monthlySpend = data?.monthlySpend;
  const recentVisits = recentVisitsData?.data?.slice(0, 3) ?? [];

  // Pet lookup maps for emoji/name resolution
  const petById = new Map((data?.petSummaries ?? []).map((p) => [p.id, p]));
  const petByName = new Map((data?.petSummaries ?? []).map((p) => [p.name, p]));

  const currentMonthLabel = new Date().toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });
  const currentYear = new Date().getFullYear();

  const stockAlertTotal =
    (stockStatus?.criticalCount ?? 0) + (stockStatus?.lowCount ?? 0);
  const changePercent = monthlySpend?.changePercent;
  const changeLabel =
    changePercent !== null && changePercent !== undefined
      ? `${changePercent >= 0 ? "+" : ""}${Math.round(changePercent)}% vs last month`
      : undefined;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── Greeting ── */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight">{greeting} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here's how your pets are doing today
        </p>
      </div>

      {/* ── Pet selector (mobile only) ── */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        <button
          type="button"
          onClick={clearPetFilter}
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors",
            !isPetFilterActive
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground",
          )}
        >
          All Pets
        </button>
        {(data?.petSummaries ?? []).map((pet: DashboardPetSummary) => (
          <button
            key={pet.id}
            type="button"
            onClick={() =>
              isPetFilterActive && selectedPetId === pet.id
                ? clearPetFilter()
                : selectPet(pet.id, pet.name)
            }
            className={cn(
              "shrink-0 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border transition-colors",
              isPetFilterActive && selectedPetId === pet.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground",
            )}
          >
            <span>{SPECIES_EMOJI[pet.species] ?? "🐾"}</span>
            {pet.name}
          </button>
        ))}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoading ? (
          ["s1", "s2", "s3", "s4"].map((k) => (
            <Skeleton key={k} className="h-[76px] rounded-lg" />
          ))
        ) : (
          <>
            <StatCard
              icon={<Bell />}
              label="Upcoming Reminders"
              value={String(upcomingCount)}
              variant={upcomingCount > 0 ? "warning" : "default"}
            />
            <StatCard
              icon={<Package />}
              label="Food Stock Alerts"
              value={String(stockAlertTotal)}
              subtitle={
                stockAlertTotal > 0
                  ? `${stockStatus?.criticalCount ?? 0} critical`
                  : undefined
              }
              variant={stockAlertTotal > 0 ? "warning" : "default"}
            />
            <StatCard
              icon={<Stethoscope />}
              label={`Vet Visits (${currentYear})`}
              value={String(vetStats?.countThisYear ?? 0)}
              subtitle={
                vetStats?.totalSpendThisYear
                  ? formatCurrency(vetStats.totalSpendThisYear)
                  : undefined
              }
            />
            <StatCard
              icon={<TrendingUp />}
              label="Monthly Spend"
              value={
                monthlySpend ? formatCurrency(monthlySpend.currentMonth) : "—"
              }
              subtitle={changeLabel}
              variant="success"
            />
          </>
        )}
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* ── Left column ── */}
        <div className="space-y-4">
          {/* Reminders */}
          <div
            className="relative overflow-hidden rounded-lg border border-border bg-card p-4 animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <PawWatermark
              size={72}
              opacity={0.045}
              rotate={14}
              flip
              className="-bottom-3 -right-3"
            />
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Upcoming Reminders</h2>
              <Link
                href="/reminders"
                className="text-xs text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {["r1", "r2", "r3"].map((k) => (
                  <Skeleton key={k} className="h-10 rounded-md" />
                ))}
              </div>
            ) : (data?.upcomingReminders.items ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No upcoming reminders
              </p>
            ) : (
              <div className="space-y-2">
                {(data?.upcomingReminders.items ?? []).slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-lg shrink-0">
                      {r.petName
                        ? (SPECIES_EMOJI[
                            petByName.get(r.petName)?.species ?? ""
                          ] ?? "🐾")
                        : "🐾"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeDueDate(r.dueDate)}
                      </p>
                    </div>
                    <UrgencyChip urgency={r.urgency} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Food Stock */}
          <div
            className="relative overflow-hidden rounded-lg border border-border bg-card p-4 animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            <PawWatermark
              size={72}
              opacity={0.04}
              rotate={20}
              className="-top-3 -left-3"
            />
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Food Stock Status</h2>
              <Link
                href="/stock"
                className="text-xs text-primary hover:underline"
              >
                Manage Stock
              </Link>
            </div>
            {isLoading ? (
              <Skeleton className="h-16 rounded-md" />
            ) : stockStatus?.worstItem &&
              stockStatus.worstItem.status === "critical" ? (
              <>
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 mb-3">
                  <p className="text-sm font-medium text-destructive">
                    {stockStatus.worstItem.name} —{" "}
                    {stockStatus.worstItem.daysLeft} days left — CRITICAL
                  </p>
                </div>
                <div className="space-y-2">
                  {(stockStatus.lowCount ?? 0) > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {stockStatus.lowCount} other item
                        {stockStatus.lowCount !== 1 ? "s" : ""}
                      </span>
                      <span className="rounded-full bg-warning/15 text-warning px-2 py-0.5 text-xs font-medium">
                        Low
                      </span>
                    </div>
                  )}
                  {stockStatus.totalOpenItems > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Total tracked
                      </span>
                      <span className="text-xs font-medium">
                        {stockStatus.totalOpenItems} items
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : stockStatus?.worstItem ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{stockStatus.worstItem.name}</span>
                  <span className="rounded-full bg-warning/15 text-warning px-2 py-0.5 text-xs font-medium">
                    Low — ~{stockStatus.worstItem.daysLeft} days
                  </span>
                </div>
                {stockStatus.totalOpenItems > 1 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {stockStatus.totalOpenItems - 1} other items
                    </span>
                    <span className="rounded-full bg-success/15 text-success px-2 py-0.5 text-xs font-medium">
                      OK
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {stockStatus?.totalOpenItems === 0
                  ? "No stock items tracked yet."
                  : "All stock levels OK."}
              </p>
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">
          {/* Mini Calendar */}
          <div
            className="relative overflow-hidden rounded-lg border border-border bg-card p-4 animate-fade-in-up"
            style={{ animationDelay: "150ms" }}
          >
            <PawWatermark
              size={72}
              opacity={0.04}
              rotate={18}
              className="-bottom-3 -left-3"
            />
            <h2 className="font-semibold mb-3">{currentMonthLabel}</h2>
            <MiniCalendar />
          </div>

          {/* Recent Vet Visits */}
          <div
            className="relative overflow-hidden rounded-lg border border-border bg-card p-4 animate-fade-in-up"
            style={{ animationDelay: "250ms" }}
          >
            <PawWatermark
              size={72}
              opacity={0.045}
              rotate={-16}
              flip
              className="-top-3 -right-3"
            />
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Recent Vet Visits</h2>
              <Link
                href="/vet-visits"
                className="text-xs text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            {isVisitsLoading ? (
              <div className="space-y-2">
                {["v1", "v2", "v3"].map((k) => (
                  <Skeleton key={k} className="h-10 rounded-md" />
                ))}
              </div>
            ) : recentVisits.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No visits recorded yet.
              </p>
            ) : (
              <div className="space-y-2">
                {recentVisits.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-lg shrink-0">
                      {SPECIES_EMOJI[
                        petById.get(v.attributes.petId)?.species ?? ""
                      ] ?? "🐾"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {petById.get(v.attributes.petId)?.name ?? "—"}
                        {v.attributes.vetName
                          ? ` — ${v.attributes.vetName}`
                          : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatShortDate(v.attributes.visitDate)}
                      </p>
                    </div>
                    {v.attributes.cost != null && (
                      <span className="text-sm font-medium tabular-nums shrink-0">
                        {formatCurrency(Number(v.attributes.cost))}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <h2 className="font-semibold mb-3">Quick Actions</h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:border-primary/30 active:scale-[0.97]"
            >
              <a.icon className="h-4 w-4 text-primary" />
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
