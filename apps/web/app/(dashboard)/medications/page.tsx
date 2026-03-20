"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pill,
  PlusCircle,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import {
  useCreateMedication,
  useMedications,
} from "@/hooks/api/useMedications";
import { usePets } from "@/hooks/api/usePets";
import { SPECIES_EMOJI } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  type MedicationFormValues,
  medicationSchema,
} from "@/lib/validation/medication.schema";

export default function MedicationsPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: medsData, isLoading } = useMedications({ page, per_page: 5 });
  const { data: petsData } = usePets();
  const createMedication = useCreateMedication();

  const medications = medsData?.data ?? [];
  const meta = medsData?.meta;
  const pets = petsData?.data ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
  });

  const petIdValue = watch("petId");

  const handleClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) reset();
  };

  const onSubmit = (values: MedicationFormValues) => {
    createMedication.mutate(
      {
        pet_id: values.petId,
        name: values.name,
        dosage: values.dosage,
        frequency: values.frequency,
        start_date: values.startDate,
        end_date: values.endDate || undefined,
        notes: values.notes || undefined,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          reset();
          setPage(1);
        },
      },
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight">Medications</h1>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Medication
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {["m1", "m2", "m3"].map((k) => (
            <Skeleton key={k} className="h-[68px] rounded-lg" />
          ))}
        </div>
      ) : medications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
          <Pill className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">No medications tracked</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Log medications prescribed during vet visits
          </p>
          <Button
            size="sm"
            className="mt-4"
            onClick={() => setDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Medication
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {medications.map((m, i) => {
            const pet = m.relationships?.pet;
            return (
              <div
                key={m.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="text-xl">
                  {SPECIES_EMOJI[pet?.attributes.species ?? ""] ?? "🐾"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{m.attributes.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {pet?.attributes.name ?? ""}
                    {m.attributes.dosage ? ` · ${m.attributes.dosage}` : ""}
                    {m.attributes.frequency
                      ? ` · ${m.attributes.frequency}`
                      : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
                    m.attributes.isActive
                      ? "bg-success/15 text-success"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {m.attributes.isActive ? "Active" : "Completed"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Page {meta.current_page} of {meta.last_page} · {meta.total}{" "}
            medications
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

      {/* Add Medication Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Medication</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4 py-2">
              {/* Pet */}
              <div>
                <Label>
                  Pet <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={petIdValue ? String(petIdValue) : ""}
                  onValueChange={(v) =>
                    setValue("petId", Number(v), { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="mt-1.5 bg-background">
                    <SelectValue placeholder="Select" />
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
                {errors.petId && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.petId.message}
                  </p>
                )}
              </div>

              {/* Medication Name */}
              <div>
                <Label>
                  Medication Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register("name")}
                  placeholder="e.g., Heartgard"
                  className="mt-1.5 bg-background"
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Dosage + Frequency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>
                    Dosage <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    {...register("dosage")}
                    placeholder="e.g., 1 tablet"
                    className="mt-1.5 bg-background"
                  />
                  {errors.dosage && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.dosage.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>
                    Frequency <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    {...register("frequency")}
                    placeholder="e.g., Daily"
                    className="mt-1.5 bg-background"
                  />
                  {errors.frequency && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.frequency.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Start Date + End Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    {...register("startDate")}
                    className="mt-1.5 bg-background"
                  />
                  {errors.startDate && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    {...register("endDate")}
                    className="mt-1.5 bg-background"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={createMedication.isPending}>
                {createMedication.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
