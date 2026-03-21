"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  PlusCircle,
  Trash2,
  Weight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { petKeys } from "@/hooks/api/queryKeys";
import { usePets } from "@/hooks/api/usePets";
import { useDeletePetWeight, usePetWeights } from "@/hooks/api/usePetWeights";
import type { Pet } from "@/lib/api/pets";
import { petEndpoints } from "@/lib/api/pets";
import { SPECIES_EMOJI } from "@/lib/constants";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const PER_PAGE = 5;

function PetWeightCard({ pet }: { pet: Pet }) {
  const { data: weightsData, isLoading } = usePetWeights(pet.id);
  const deleteWeight = useDeletePetWeight(pet.id);
  const weights = (weightsData?.data ?? [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.attributes.recordedAt).getTime() -
        new Date(a.attributes.recordedAt).getTime(),
    );

  if (!isLoading && weights.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">
          {SPECIES_EMOJI[pet.attributes.species] ?? "🐾"}
        </span>
        <h3 className="font-semibold">{pet.attributes.name}</h3>
      </div>
      {isLoading ? (
        <div className="space-y-1">
          {["w1", "w2"].map((k) => (
            <Skeleton key={k} className="h-7 rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {weights.map((entry, i) => {
            const prev = weights[i + 1];
            const change = prev
              ? entry.attributes.weightKg - prev.attributes.weightKg
              : 0;
            return (
              <div
                key={entry.id}
                className="flex items-center justify-between text-sm py-1 group"
              >
                <span className="text-muted-foreground">
                  {formatShortDate(entry.attributes.recordedAt)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium tabular-nums">
                    {Number(entry.attributes.weightKg).toFixed(2)} kg
                  </span>
                  {change !== 0 && (
                    <span
                      className={cn(
                        "text-xs font-medium",
                        change > 0 ? "text-success" : "text-destructive",
                      )}
                    >
                      {change > 0 ? "+" : ""}
                      {change.toFixed(2)} kg
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteWeight.mutate(entry.id)}
                    disabled={deleteWeight.isPending}
                    aria-label="Delete weight entry"
                    className="invisible group-hover:visible flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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

  // Pagination over pets that have weight records (latestWeightKg is the proxy)
  const petsWithWeights = pets.filter(
    (p) => p.attributes.latestWeightKg !== null,
  );
  const totalPages = Math.ceil(petsWithWeights.length / PER_PAGE);
  const paginatedPets = petsWithWeights.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE,
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight">Weight History</h1>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Record Weight
        </Button>
      </div>

      {/* Content */}
      {petsLoading ? (
        <div className="space-y-3">
          {["p1", "p2", "p3"].map((k) => (
            <Skeleton key={k} className="h-[100px] rounded-lg" />
          ))}
        </div>
      ) : pets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
          <Weight className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">No weight records yet</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Start recording your pets' weights to track their health
          </p>
          <Button
            size="sm"
            className="mt-4"
            onClick={() => setDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Record Weight
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedPets.map((pet) => (
            <PetWeightCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · {petsWithWeights.length} pets
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
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>
                Pet <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.petId}
                onValueChange={(v) => setForm((p) => ({ ...p, petId: v }))}
              >
                <SelectTrigger className="mt-1.5 bg-background">
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
              <Label>
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
                className="mt-1.5 bg-background"
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
