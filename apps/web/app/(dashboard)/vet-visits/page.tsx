"use client";

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  PlusCircle,
  Stethoscope,
  Trash2,
} from "lucide-react";
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
import {
  useCreateVetVisit,
  useDeleteVetVisit,
  useVetVisits,
} from "@/hooks/api/useVetVisits";
import { SPECIES_EMOJI } from "@/lib/constants";
import { formatCurrency, formatShortDate } from "@/lib/format";

const VISIT_TYPES = ["checkup", "treatment", "vaccine", "emergency"] as const;

export default function VetVisitsPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    petId: "",
    type: "",
    date: "",
    cost: "",
    clinic: "",
    diagnosis: "",
  });

  const { data: visitsData, isLoading } = useVetVisits({ page, per_page: 5 });
  const { data: petsData } = usePets();
  const createVisit = useCreateVetVisit();
  const deleteVisit = useDeleteVetVisit();

  const visits = visitsData?.data ?? [];
  const meta = visitsData?.meta;
  const pets = petsData?.data ?? [];

  const petById = new Map(pets.map((p) => [p.id, p]));

  const totalSpend = visits.reduce((sum, v) => {
    const c = parseFloat(v.attributes.cost ?? "0");
    return sum + (Number.isNaN(c) ? 0 : c);
  }, 0);

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
        pet_id: Number(form.petId),
        visit_type: form.type,
        visit_date: form.date,
        reason: form.diagnosis || form.type,
        ...(form.clinic && { vet_name: form.clinic }),
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

  const _currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vet Visits</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {visits.length} visits this year · {formatCurrency(totalSpend)}{" "}
            total
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Log Visit
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {["v1", "v2", "v3"].map((k) => (
            <Skeleton key={k} className="h-[68px] rounded-lg" />
          ))}
        </div>
      ) : visits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
          <Stethoscope className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">No vet visits yet</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Log your pets' vet visits to track their health
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((v, i) => {
            const pet = petById.get(v.attributes.petId);
            const species = pet?.attributes.species ?? "";
            return (
              <div
                key={v.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 animate-fade-in-up hover:border-primary/20 transition-colors"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="text-xl shrink-0">
                  {SPECIES_EMOJI[species] ?? "🐾"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">
                    {pet?.attributes.name ?? "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {v.attributes.vetName || "—"} ·{" "}
                    <span className="capitalize">{v.attributes.visitType}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium tabular-nums">
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
                      className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
        <div className="flex items-center justify-between pt-2">
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
            {/* Pet + Type */}
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

            {/* Date + Cost */}
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

            {/* Clinic / Vet Name */}
            <div>
              <Label>Clinic / Vet Name</Label>
              <Input
                value={form.clinic}
                onChange={(e) =>
                  setForm((p) => ({ ...p, clinic: e.target.value }))
                }
                placeholder="e.g., Happy Paws Clinic"
                className="mt-1.5 bg-background"
              />
            </div>

            {/* Diagnosis / Notes */}
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
