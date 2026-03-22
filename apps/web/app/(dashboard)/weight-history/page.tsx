"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  PlusCircle,
  Weight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PetWeightCard } from "@/components/pets/PetWeightCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import { petKeys } from "@/hooks/api/queryKeys";
import { usePets } from "@/hooks/api/usePets";
import { petEndpoints } from "@/lib/api/pets";
import { SPECIES_EMOJI } from "@/lib/constants";

const PER_PAGE = 5;

export default function WeightHistoryPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ petId: "", date: "", weight: "" });
  const queryClient = useQueryClient();

  const { data: petsData, isLoading: petsLoading } = usePets();
  const pets = petsData?.data ?? [];

  const resetForm = () => setForm({ petId: "", date: "", weight: "" });

  const handleClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetForm();
  };

  const recordWeight = useMutation({
    mutationFn: ({
      petId,
      date,
      weight,
    }: {
      petId: string;
      date: string;
      weight: number;
    }) =>
      petEndpoints
        .recordWeight(petId, { weightKg: weight, recordedAt: date })
        .then((r) => r.data.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: petKeys.weights(variables.petId),
      });
      queryClient.invalidateQueries({ queryKey: petKeys.lists() });
      toast.success("Weight recorded");
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to record weight. Please try again.");
    },
  });

  const handleAdd = () => {
    if (!form.petId || !form.date || !form.weight) return;
    recordWeight.mutate({
      petId: form.petId,
      date: form.date,
      weight: parseFloat(form.weight),
    });
  };

  const openRecordDialogForPet = (petId: string) => {
    setForm((prev) => ({ ...prev, petId }));
    setDialogOpen(true);
  };

  const petsWithWeights = pets.filter(
    (p) => p.attributes.latestWeightKg !== null,
  );
  // Paginate over all pets so those without weights also show an empty state card
  const totalPages = Math.ceil(pets.length / PER_PAGE);
  const paginatedPets = pets.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Weight className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Weight History
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track your pets' weight over time
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Record Weight
        </Button>
      </div>

      {/* Stat cards — shown only when pets exist */}
      {!petsLoading && pets.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-xl border border-primary/20 bg-card p-4 animate-fade-in-up relative overflow-hidden"
            style={{ animationDelay: "50ms" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <p className="text-xs font-medium text-muted-foreground">
              Pets Tracked
            </p>
            <p className="text-2xl font-bold text-primary tabular-nums mt-1">
              {petsWithWeights.length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              of {pets.length} total
            </p>
          </div>
          <div
            className="rounded-xl border border-border bg-card p-4 animate-fade-in-up relative overflow-hidden"
            style={{ animationDelay: "100ms" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] to-transparent pointer-events-none" />
            <p className="text-xs font-medium text-muted-foreground">
              Untracked Pets
            </p>
            <p className="text-2xl font-bold tabular-nums mt-1">
              {pets.length - petsWithWeights.length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              without records yet
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {petsLoading ? (
        <div className="space-y-3">
          {["p1", "p2", "p3"].map((k) => (
            <Skeleton key={k} className="h-[100px] rounded-xl" />
          ))}
        </div>
      ) : pets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Weight className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h2 className="text-lg font-semibold">No pets found</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add pets first before recording weights
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedPets.map((pet, i) => (
            <PetWeightCard
              key={pet.id}
              pet={pet}
              index={i}
              onRecordWeight={openRecordDialogForPet}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · {pets.length} pets
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1 || petsLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages || petsLoading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Record Weight Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Record Weight</DialogTitle>
            <DialogDescription>
              Log your pet's current weight.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Pet <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.petId}
                onValueChange={(v) => setForm((p) => ({ ...p, petId: v }))}
              >
                <SelectTrigger className="mt-1.5 bg-muted/50">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={String(pet.id)}>
                      {SPECIES_EMOJI[pet.attributes.species] ?? "🐾"}{" "}
                      {pet.attributes.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                  className="mt-1.5 bg-muted/50"
                />
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Weight (kg) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.weight}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, weight: e.target.value }))
                  }
                  placeholder="0.0"
                  className="mt-1.5 bg-muted/50"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={
                !form.petId ||
                !form.date ||
                !form.weight ||
                recordWeight.isPending
              }
            >
              {recordWeight.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
