"use client";

import {
  ArrowLeft,
  Cake,
  Pencil,
  Pill,
  Scale,
  Sparkles,
  Stethoscope,
  Syringe,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PetForm } from "@/components/pets/PetForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useMedications } from "@/hooks/api/useMedications";
import { useDeletePet, usePet, useUpdatePet } from "@/hooks/api/usePets";
import { usePetWeights } from "@/hooks/api/usePetWeights";
import { useVaccinations } from "@/hooks/api/useVaccinations";
import { useVetVisits } from "@/hooks/api/useVetVisits";
import { VISIT_TYPE_LABEL } from "@/lib/api/vet-visits";
import { SPECIES_EMOJI } from "@/lib/constants";
import { formatAge, formatCurrency, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PetFormValues } from "@/lib/validation/pet.schema";
import { useHouseholdStore } from "@/stores/useHouseholdStore";

// Icon + color per visit type
const VISIT_ICON: Record<string, React.ElementType> = {
  checkup: Stethoscope,
  treatment: Scale,
  vaccine: Syringe,
  emergency: Stethoscope,
};
const VISIT_ICON_CLASS: Record<string, string> = {
  checkup: "bg-primary/15 text-primary",
  treatment: "bg-amber-500/15 text-amber-400",
  vaccine: "bg-emerald-500/15 text-emerald-400",
  emergency: "bg-red-500/15 text-red-400",
};

// Period filter helper
function filterByPeriod(
  data: { date: string; weight: number }[],
  period: "3M" | "6M" | "12M",
) {
  const now = new Date();
  const months = period === "3M" ? 3 : period === "6M" ? 6 : 12;
  const cutoff = new Date(
    now.getFullYear(),
    now.getMonth() - months,
    now.getDate(),
  );
  return data.filter((d) => new Date(d.date) >= cutoff);
}

interface PetDetailPageProps {
  params: Promise<{ petId: string }>;
}

export default function PetDetailPage({ params }: PetDetailPageProps) {
  const { petId } = use(params);
  const id = petId;
  const router = useRouter();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [weightPeriod, setWeightPeriod] = useState<"3M" | "6M" | "12M">("6M");

  const selectPet = useHouseholdStore((s) => s.selectPet);

  const { data: pet, isLoading, isError } = usePet(id);
  const updatePet = useUpdatePet();
  const deletePet = useDeletePet();

  const { data: vetVisitsData, isLoading: visitsLoading } = useVetVisits({
    petId: id,
    per_page: 20,
  });
  const { data: weightsData, isLoading: weightsLoading } = usePetWeights(id);
  const { data: vaccinationsData } = useVaccinations({
    petId: id,
    per_page: 5,
  });
  const { data: medicationsData } = useMedications({ petId: id, per_page: 5 });

  const handleUpdate = (values: PetFormValues) => {
    updatePet.mutate(
      { id, data: values },
      { onSuccess: () => setIsEditDialogOpen(false) },
    );
  };

  const handleDelete = () => {
    deletePet.mutate(id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        router.push("/pets");
      },
    });
  };

  const navigateWithPetFilter = (path: string) => {
    if (pet) selectPet(id, pet.attributes.name);
    router.push(path);
  };

  // ── Loading state ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          <Skeleton className="h-72 rounded-2xl lg:col-span-3" />
          <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (isError || !pet) {
    return (
      <div className="py-16 text-center">
        <h2 className="mb-3 text-lg font-semibold text-destructive">
          Pet not found
        </h2>
        <Button asChild variant="outline" className="gap-2">
          <NextLink href="/pets">
            <ArrowLeft className="h-4 w-4" />
            Back to pets
          </NextLink>
        </Button>
      </div>
    );
  }

  const {
    name,
    species,
    breed,
    sex,
    birthday,
    age,
    isNeutered,
    size,
    notes,
    avatarUrl,
    latestWeightKg,
  } = pet.attributes;

  // ── Derived stats ──────────────────────────────────────────────
  const visits = vetVisitsData?.data ?? [];
  const totalVisits = vetVisitsData?.meta?.total ?? visits.length;
  const totalSpend = visits.reduce((sum, v) => {
    const c = v.attributes.cost ? parseFloat(v.attributes.cost) : 0;
    return sum + c;
  }, 0);
  const avgSpend = totalVisits > 0 ? totalSpend / totalVisits : 0;

  // Weight chart data
  const allWeights = [...(weightsData?.data ?? [])]
    .sort(
      (a, b) =>
        new Date(a.attributes.recordedAt).getTime() -
        new Date(b.attributes.recordedAt).getTime(),
    )
    .map((w) => ({
      date: w.attributes.recordedAt,
      label: new Date(w.attributes.recordedAt).toLocaleDateString("en-US", {
        month: "short",
      }),
      weight: w.attributes.weightKg,
    }));

  const chartData = filterByPeriod(allWeights, weightPeriod);

  // Weight change vs previous entry
  const prevWeight =
    allWeights.length >= 2 ? allWeights[allWeights.length - 2].weight : null;
  const weightDelta =
    latestWeightKg != null && prevWeight != null
      ? latestWeightKg - prevWeight
      : null;

  // Vaccination status
  const hasDueVaccine = (vaccinationsData?.data ?? []).some(
    (v) => v.attributes.status !== "up_to_date",
  );
  const activeMeds = (medicationsData?.data ?? []).filter(
    (m) => m.attributes.isActive,
  ).length;

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav
        aria-label="breadcrumb"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <NextLink href="/" className="hover:text-foreground transition-colors">
          Dashboard
        </NextLink>
        <span>/</span>
        <NextLink
          href="/pets"
          className="hover:text-foreground transition-colors"
        >
          Pets
        </NextLink>
        <span>/</span>
        <span className="text-foreground font-medium">{name}</span>
      </nav>

      {/* ── Hero card ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
        {/* Decorative background circles */}
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/5" />
        <div className="pointer-events-none absolute right-16 top-16 h-40 w-40 rounded-full bg-primary/5" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl text-5xl ring-2 ring-border">
              {avatarUrl && (
                <AvatarImage
                  src={avatarUrl}
                  alt={name}
                  className="rounded-2xl"
                />
              )}
              <AvatarFallback className="rounded-2xl text-4xl bg-muted">
                {SPECIES_EMOJI[species] ?? "🐾"}
              </AvatarFallback>
            </Avatar>
            {/* Status dot */}
            <span
              className={cn(
                "absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card text-xs",
                hasDueVaccine
                  ? "bg-red-500 text-white"
                  : "bg-primary text-primary-foreground",
              )}
            >
              {hasDueVaccine ? "!" : "✓"}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {name}
              </h1>
              <Badge
                className={cn(
                  "rounded-full border text-[10px] font-bold uppercase tracking-wider",
                  hasDueVaccine
                    ? "bg-red-500/15 text-red-400 border-red-500/30"
                    : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                )}
                variant="outline"
              >
                {hasDueVaccine ? "Vaccine Due" : "Healthy"}
              </Badge>
              {isNeutered && (
                <Badge
                  className="rounded-full text-[10px] font-bold uppercase tracking-wider border-blue-500/30 bg-blue-500/15 text-blue-400"
                  variant="outline"
                >
                  Neutered
                </Badge>
              )}
              {activeMeds > 0 && (
                <Badge
                  className="rounded-full text-[10px] font-bold uppercase tracking-wider border-amber-500/30 bg-amber-500/15 text-amber-400"
                  variant="outline"
                >
                  On Medication
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-1">
              {[
                species.charAt(0).toUpperCase() + species.slice(1),
                breed,
                size ? size.charAt(0).toUpperCase() + size.slice(1) : null,
                sex === "male" ? "♂ Male" : "♀ Female",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>

            {notes && (
              <p className="text-sm text-muted-foreground mt-2 max-w-xl line-clamp-2">
                {notes}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                onClick={() => setIsEditDialogOpen(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Age */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Cake className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Age
            </span>
          </div>
          <p className="text-2xl font-bold tabular-nums">
            {formatAge(birthday, age)}
          </p>
          {birthday && (
            <p className="text-xs text-muted-foreground mt-1">
              Born{" "}
              {new Date(birthday).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
          <div className="mt-3 h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: "60%" }}
            />
          </div>
        </div>

        {/* Weight */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Scale className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Weight
            </span>
          </div>
          <p className="text-2xl font-bold tabular-nums">
            {latestWeightKg != null ? (
              <>
                {latestWeightKg}{" "}
                <span className="text-base font-medium text-muted-foreground">
                  kg
                </span>
              </>
            ) : (
              "—"
            )}
          </p>
          {weightDelta != null ? (
            <p
              className={cn(
                "text-xs mt-1 flex items-center gap-1",
                weightDelta > 0 ? "text-amber-400" : "text-emerald-400",
              )}
            >
              <TrendingUp className="h-3 w-3" />
              {weightDelta > 0 ? "+" : ""}
              {weightDelta.toFixed(1)} kg from last
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              No previous record
            </p>
          )}
          <div className="mt-3 h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-400"
              style={{ width: "70%" }}
            />
          </div>
        </div>

        {/* Vet Visits */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Stethoscope className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Vet Visits
            </span>
          </div>
          <p className="text-2xl font-bold tabular-nums">
            {visitsLoading ? "—" : totalVisits}{" "}
            <span className="text-base font-medium text-muted-foreground">
              total
            </span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {visitsLoading
              ? "Loading…"
              : totalVisits === 0
                ? "No visits yet"
                : `${formatShortDate(visits[0]?.attributes.visitDate)} (latest)`}
          </p>
          <div className="mt-3 h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-400"
              style={{ width: `${Math.min((totalVisits / 10) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Avg Spend */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Avg Spend
            </span>
          </div>
          <p className="text-2xl font-bold tabular-nums">
            {visitsLoading ? "—" : formatCurrency(avgSpend)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Per vet visit</p>
          <div className="mt-3 h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400"
              style={{ width: "45%" }}
            />
          </div>
        </div>
      </div>

      {/* ── Weight chart + Care Logs ─────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Weight Progression */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold">Weight Progression</h2>
            <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
              {(["3M", "6M", "12M"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setWeightPeriod(p)}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-semibold transition-all",
                    weightPeriod === p
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {weightsLoading ? (
            <Skeleton className="h-52 w-full rounded-xl" />
          ) : chartData.length === 0 ? (
            <div className="flex h-52 flex-col items-center justify-center gap-2 text-center">
              <Scale className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                No weight records
              </p>
              <p className="text-xs text-muted-foreground/60">
                Start tracking to see trends
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 4, bottom: 4, left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  unit="kg"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [
                    `${Number(value).toFixed(2)} kg`,
                    "Weight",
                  ]}
                />
                <Bar
                  dataKey="weight"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Care Logs */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold">Care Logs</h2>
            <button
              type="button"
              onClick={() => navigateWithPetFilter("/vet-visits")}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              View All
            </button>
          </div>

          {visitsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : visits.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
              <Stethoscope className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No records yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {visits.slice(0, 5).map((visit) => {
                const Icon =
                  VISIT_ICON[visit.attributes.visitType] ?? Stethoscope;
                const iconClass =
                  VISIT_ICON_CLASS[visit.attributes.visitType] ??
                  "bg-primary/15 text-primary";
                const hasCost =
                  visit.attributes.cost &&
                  parseFloat(visit.attributes.cost) > 0;

                return (
                  <NextLink
                    key={visit.id}
                    href={`/vet-visits/${visit.id}`}
                    className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        iconClass,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {VISIT_TYPE_LABEL[visit.attributes.visitType]}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {visit.attributes.vetName
                          ? `${visit.attributes.vetName} · `
                          : ""}
                        {formatShortDate(visit.attributes.visitDate)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {hasCost && (
                        <span className="text-xs font-semibold tabular-nums">
                          {formatCurrency(
                            parseFloat(visit.attributes.cost as string),
                          )}
                        </span>
                      )}
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                          hasCost
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {hasCost ? "Paid" : "Free"}
                      </span>
                    </div>
                  </NextLink>
                );
              })}
            </div>
          )}

          {/* Add new record button */}
          <button
            type="button"
            onClick={() => navigateWithPetFilter("/vet-visits")}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">
              +
            </span>
            Add New Record
          </button>
        </div>
      </div>

      {/* ── Notes / Insight banner ───────────────────────────────── */}
      {notes && (
        <div className="flex items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
              Pet Notes
            </p>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">
              {notes}
            </p>
          </div>
        </div>
      )}

      {/* ── Quick links row ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Vaccinations",
            icon: Syringe,
            path: "/vaccinations",
            count: vaccinationsData?.data?.length ?? 0,
            color: "text-emerald-400 bg-emerald-500/10",
          },
          {
            label: "Medications",
            icon: Pill,
            path: "/medications",
            count: medicationsData?.data?.length ?? 0,
            color: "text-amber-400 bg-amber-500/10",
          },
          {
            label: "Vet Visits",
            icon: Stethoscope,
            path: "/vet-visits",
            count: totalVisits,
            color: "text-blue-400 bg-blue-500/10",
          },
          {
            label: "Weight Log",
            icon: Scale,
            path: "/weight-history",
            count: allWeights.length,
            color: "text-primary bg-primary/10",
          },
        ].map(({ label, icon: Icon, path, count, color }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigateWithPetFilter(path)}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:border-primary/40 transition-all text-left"
          >
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                color,
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{label}</p>
              <p className="text-xs text-muted-foreground">
                {count} record{count !== 1 ? "s" : ""}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Edit dialog ─────────────────────────────────────────── */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {name}</DialogTitle>
            <DialogDescription>
              Update your pet's profile and health details.
            </DialogDescription>
          </DialogHeader>
          <PetForm
            defaultValues={{
              name,
              species,
              breed: breed ?? "",
              sex,
              birthday: birthday ?? "",
              isNeutered,
              size: size ?? undefined,
              notes: notes ?? "",
            }}
            onSubmit={handleUpdate}
            isLoading={updatePet.isPending}
            submitLabel="Save changes"
          />
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ───────────────────────────────────────── */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        title={`Remove ${name}?`}
        description={`Are you sure you want to remove ${name}? This action cannot be undone.`}
        confirmLabel="Remove pet"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isLoading={deletePet.isPending}
      />
    </div>
  );
}
