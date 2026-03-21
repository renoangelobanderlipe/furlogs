"use client";

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  PlusCircle,
  Search,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { usePets } from "@/hooks/api/usePets";
import { useVetClinics } from "@/hooks/api/useVetClinics";
import {
  useCreateVetVisit,
  useDeleteVetVisit,
  useVetVisitStats,
  useVetVisits,
} from "@/hooks/api/useVetVisits";
import { useDebounce } from "@/hooks/useDebounce";
import type { VetVisitType } from "@/lib/api/vet-visits";
import { SPECIES_EMOJI } from "@/lib/constants";
import { formatCurrency, formatShortDate } from "@/lib/format";

const VISIT_TYPES = ["checkup", "treatment", "vaccine", "emergency"] as const;

const VISIT_TYPE_LABEL: Record<VetVisitType, string> = {
  checkup: "Checkup",
  treatment: "Treatment",
  vaccine: "Vaccine",
  emergency: "Emergency",
};

const VISIT_TYPE_CLASSES: Record<VetVisitType, string> = {
  checkup: "bg-sky-500/15 text-sky-500",
  treatment: "bg-warning/15 text-warning",
  vaccine: "bg-success/15 text-success",
  emergency: "bg-destructive/15 text-destructive",
};

export default function VetVisitsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [petFilter, setPetFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    petId: "",
    type: "",
    date: "",
    cost: "",
    clinic: "",
    diagnosis: "",
  });

  const debouncedSearch = useDebounce(search, 400);
  const hasFilters =
    !!debouncedSearch || petFilter !== "all" || typeFilter !== "all";

  const handlePetFilter = (v: string) => {
    setPetFilter(v);
    setPage(1);
  };
  const handleTypeFilter = (v: string) => {
    setTypeFilter(v);
    setPage(1);
  };

  const { data: visitsData, isLoading } = useVetVisits({
    page,
    per_page: 5,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(petFilter !== "all" && { petId: petFilter }),
    ...(typeFilter !== "all" && { visitType: typeFilter }),
  });
  const { data: stats } = useVetVisitStats();
  const { data: petsData } = usePets();
  const { data: clinicsData } = useVetClinics();
  const createVisit = useCreateVetVisit();
  const deleteVisit = useDeleteVetVisit();

  const visits = visitsData?.data ?? [];
  const meta = visitsData?.meta;
  const pets = petsData?.data ?? [];
  const clinics = clinicsData?.data ?? [];

  const petById = new Map(pets.map((p) => [p.id, p]));

  const ytdVisits = stats?.ytdVisits ?? 0;
  const ytdSpend = stats?.ytdSpend ?? 0;

  const clearFilters = () => {
    setSearch("");
    setPetFilter("all");
    setTypeFilter("all");
  };

  const resetForm = () =>
    setForm({
      petId: "",
      type: "",
      date: "",
      cost: "",
      clinic: "",
      diagnosis: "",
    });

  const handleClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetForm();
  };

  const handleAdd = () => {
    if (!form.petId || !form.date || !form.type) return;
    createVisit.mutate(
      {
        pet_id: form.petId,
        visit_type: form.type,
        visit_date: form.date,
        reason: form.diagnosis || form.type,
        ...(form.clinic && { clinic_id: form.clinic }),
        ...(form.diagnosis && { diagnosis: form.diagnosis }),
        ...(form.cost && { cost: parseFloat(form.cost) }),
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          resetForm();
          setPage(1);
        },
      },
    );
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Stethoscope className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vet Visits</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track your pets' medical visits
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Log Visit
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl border border-primary/20 bg-card p-4 animate-fade-in-up relative overflow-hidden"
          style={{ animationDelay: "50ms" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <p className="text-xs text-muted-foreground font-medium">
            Visits This Year
          </p>
          <p className="text-2xl font-bold tabular-nums mt-1 text-primary">
            {ytdVisits}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">YTD total</p>
        </div>
        <div
          className="rounded-xl border border-border bg-card p-4 animate-fade-in-up relative overflow-hidden"
          style={{ animationDelay: "100ms" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] to-transparent pointer-events-none" />
          <p className="text-xs text-muted-foreground font-medium">
            Total Spend
          </p>
          <p className="text-2xl font-bold tabular-nums mt-1">
            {formatCurrency(ytdSpend)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">YTD total</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div
        className="flex flex-col sm:flex-row gap-2 animate-fade-in-up"
        style={{ animationDelay: "150ms" }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search reason or diagnosis…"
            className="pl-9 bg-background"
          />
        </div>
        <Select value={petFilter} onValueChange={handlePetFilter}>
          <SelectTrigger className="w-full sm:w-[160px] bg-background">
            <SelectValue placeholder="All pets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All pets</SelectItem>
            {pets.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {SPECIES_EMOJI[p.attributes.species] ?? "🐾"}{" "}
                {p.attributes.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={handleTypeFilter}>
          <SelectTrigger className="w-full sm:w-[150px] bg-background">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {VISIT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {VISIT_TYPE_LABEL[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {["v1", "v2", "v3"].map((k) => (
            <Skeleton key={k} className="h-[72px] rounded-xl" />
          ))}
        </div>
      ) : visits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <Stethoscope className="h-8 w-8 text-muted-foreground/40" />
          </div>
          {hasFilters ? (
            <>
              <h2 className="text-lg font-semibold">
                No visits match your filters
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting or clearing your filters
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={clearFilters}
              >
                <X className="mr-2 h-4 w-4" />
                Clear filters
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">No vet visits yet</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Log your pets' vet visits to track their health history
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setDialogOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Log First Visit
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {visits.map((v, i) => {
            const pet = petById.get(v.attributes.petId);
            const species = pet?.attributes.species ?? "";
            const visitType = v.attributes.visitType as VetVisitType;
            const badgeClasses =
              VISIT_TYPE_CLASSES[visitType] ?? "bg-muted text-muted-foreground";
            const typeLabel =
              VISIT_TYPE_LABEL[visitType] ?? v.attributes.visitType;
            return (
              <div
                key={v.id}
                className="group relative flex items-center gap-4 rounded-xl border border-border bg-card p-4 animate-fade-in-up hover:border-primary/30 hover:bg-card/80 transition-all"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Link
                  href={`/vet-visits/${v.id}`}
                  className="absolute inset-0 rounded-xl"
                  aria-label={`View ${pet?.attributes.name ?? "Unknown"} visit`}
                />
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-xl">
                  {SPECIES_EMOJI[species] ?? "🐾"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">
                      {pet?.attributes.name ?? "Unknown"}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${badgeClasses}`}
                    >
                      {typeLabel}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {v.relationships?.clinic?.attributes.name ||
                      v.attributes.vetName ||
                      "No clinic"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold tabular-nums">
                    {formatCurrency(v.attributes.cost)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatShortDate(v.attributes.visitDate)}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => e.preventDefault()}
                      className="relative z-10 h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete vet visit?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this vet visit record.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteVisit.mutate(v.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm text-muted-foreground">
            Page {meta.current_page} of {meta.last_page} · {meta.total} visits
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={meta.current_page <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={meta.current_page >= meta.last_page || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Log Visit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Vet Visit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>
                  Pet <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.petId}
                  onValueChange={(v) => setForm((p) => ({ ...p, petId: v }))}
                >
                  <SelectTrigger className="mt-1.5 bg-background">
                    <SelectValue placeholder="Select pet" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {SPECIES_EMOJI[p.attributes.species] ?? "🐾"}{" "}
                        {p.attributes.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>
                  Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}
                >
                  <SelectTrigger className="mt-1.5 bg-background">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIT_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                  className="mt-1.5 bg-background"
                />
              </div>
              <div>
                <Label>Cost (₱)</Label>
                <Input
                  type="number"
                  value={form.cost}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, cost: e.target.value }))
                  }
                  placeholder="0"
                  className="mt-1.5 bg-background"
                />
              </div>
            </div>
            <div>
              <Label>Clinic</Label>
              <Select
                value={form.clinic}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, clinic: v === "none" ? "" : v }))
                }
              >
                <SelectTrigger className="mt-1.5 bg-background">
                  <SelectValue placeholder="Select clinic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {clinics.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.attributes.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Diagnosis / Notes</Label>
              <Textarea
                value={form.diagnosis}
                onChange={(e) =>
                  setForm((p) => ({ ...p, diagnosis: e.target.value }))
                }
                className="mt-1.5 bg-background"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleAdd}
              disabled={
                !form.petId || !form.date || !form.type || createVisit.isPending
              }
            >
              {createVisit.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Log Visit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
