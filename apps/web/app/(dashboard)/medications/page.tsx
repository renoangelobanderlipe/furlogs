"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Pill,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useCreateMedication,
  useDeleteMedication,
  useLogDose,
  useMedications,
  useTodayAdministrations,
  useUpdateMedication,
} from "@/hooks/api/useMedications";
import { usePets } from "@/hooks/api/usePets";
import { FREQUENCY_OPTIONS, type FrequencyValue } from "@/lib/api/medications";
import type { Medication } from "@/lib/api/vet-visits";
import { SPECIES_EMOJI } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  type MedicationFormValues,
  medicationSchema,
} from "@/lib/validation/medication.schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDosesPerDay(
  frequency: FrequencyValue | string | null | undefined,
): number {
  if (frequency === "twice_daily") return 2;
  if (frequency === "as_needed" || frequency == null) return 0;
  return 1;
}

function getFrequencyLabel(value: string | null | undefined): string {
  if (!value) return "";
  const found = FREQUENCY_OPTIONS.find((o) => o.value === value);
  return found ? found.label : value;
}

// ---------------------------------------------------------------------------
// MedicationItem — sub-component so it can call useTodayAdministrations
// ---------------------------------------------------------------------------

interface MedicationItemProps {
  med: Medication;
  index: number;
  onEdit: (m: Medication) => void;
  onDelete: (id: number) => void;
}

function MedicationItem({ med, index, onEdit, onDelete }: MedicationItemProps) {
  // Each card owns its own mutation so pending state is isolated per medication
  const logDose = useLogDose();
  const { data: todayData } = useTodayAdministrations(
    med.attributes.isActive ? med.id : 0,
  );

  const dosesPerDay = getDosesPerDay(med.attributes.frequency);
  const todayCount = todayData?.data?.length ?? 0;
  const pet = med.relationships?.pet;

  return (
    <div
      className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span className="text-xl">
        {SPECIES_EMOJI[pet?.attributes.species ?? ""] ?? "🐾"}
      </span>

      <div className="flex-1 min-w-0">
        <p className="font-medium">{med.attributes.name}</p>
        <p className="text-sm text-muted-foreground">
          {pet?.attributes.name ?? ""}
          {med.attributes.dosage ? ` · ${med.attributes.dosage}` : ""}
          {med.attributes.frequency
            ? ` · ${getFrequencyLabel(med.attributes.frequency)}`
            : ""}
        </p>
        {med.attributes.isActive && dosesPerDay > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {todayCount}/{dosesPerDay} doses today
          </p>
        )}
      </div>

      {/* Streak badge */}
      {med.attributes.streak != null && med.attributes.streak > 0 && (
        <Badge
          className="shrink-0 bg-warning/15 text-warning-foreground border-warning/20"
          variant="outline"
        >
          🔥 {med.attributes.streak} day streak
        </Badge>
      )}

      {/* Status chip */}
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
          med.attributes.isActive
            ? "bg-success/15 text-success"
            : "bg-muted text-muted-foreground",
        )}
      >
        {med.attributes.isActive ? "Active" : "Completed"}
      </span>

      <div className="flex items-center gap-1 shrink-0">
        {/* Log dose button */}
        {med.attributes.isActive && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() =>
                    logDose.mutate({ medicationId: med.id, data: {} })
                  }
                  disabled={logDose.isPending}
                  aria-label="Log dose taken"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-success transition-colors hover:bg-success/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {logDose.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>Log dose taken</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <button
          type="button"
          onClick={() => onEdit(med)}
          aria-label="Edit medication"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(med.id)}
          aria-label="Delete medication"
          className="flex h-8 w-8 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MedicationsPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [deleteMedId, setDeleteMedId] = useState<number | null>(null);

  const { data: medsData, isLoading } = useMedications({ page, per_page: 5 });
  const { data: petsData } = usePets();
  const createMedication = useCreateMedication();
  const updateMedication = useUpdateMedication();
  const deleteMedication = useDeleteMedication();

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
  const frequencyValue = watch("frequency");

  const handleOpenAdd = () => {
    setEditingMed(null);
    reset();
    setDialogOpen(true);
  };

  const handleOpenEdit = (m: Medication) => {
    setEditingMed(m);
    reset({
      petId: m.relationships?.pet?.id ?? 0,
      name: m.attributes.name,
      dosage: m.attributes.dosage ?? "",
      frequency: (m.attributes.frequency as FrequencyValue) ?? undefined,
      startDate: m.attributes.startDate ?? "",
      endDate: m.attributes.endDate ?? "",
      notes: m.attributes.notes ?? "",
    });
    setDialogOpen(true);
  };

  const handleClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      reset();
      setEditingMed(null);
    }
  };

  const onSubmit = (values: MedicationFormValues) => {
    const payload = {
      pet_id: values.petId,
      name: values.name,
      dosage: values.dosage,
      frequency: values.frequency ?? undefined,
      start_date: values.startDate,
      end_date: values.endDate || undefined,
      notes: values.notes || undefined,
    };

    if (editingMed) {
      updateMedication.mutate(
        { id: editingMed.id, data: payload },
        {
          onSuccess: () => {
            setDialogOpen(false);
            reset();
            setEditingMed(null);
          },
        },
      );
    } else {
      createMedication.mutate(payload, {
        onSuccess: () => {
          setDialogOpen(false);
          reset();
          setPage(1);
        },
      });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteMedId === null) return;
    deleteMedication.mutate(deleteMedId, {
      onSuccess: () => setDeleteMedId(null),
    });
  };

  const isPending = editingMed
    ? updateMedication.isPending
    : createMedication.isPending;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight">Medications</h1>
        <Button size="sm" onClick={handleOpenAdd}>
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
          <Button size="sm" className="mt-4" onClick={handleOpenAdd}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Medication
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {medications.map((m, i) => (
            <MedicationItem
              key={m.id}
              med={m}
              index={i}
              onEdit={handleOpenEdit}
              onDelete={(id) => setDeleteMedId(id)}
            />
          ))}
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

      {/* Add / Edit Medication Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMed ? "Edit Medication" : "Add Medication"}
            </DialogTitle>
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
                  <Label>Frequency</Label>
                  <Select
                    value={frequencyValue ?? ""}
                    onValueChange={(v) =>
                      setValue("frequency", v as FrequencyValue, {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="mt-1.5 bg-background">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingMed ? "Save Changes" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteMedId !== null}
        title="Delete medication?"
        description="This will permanently remove this medication record and any associated reminders."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteMedId(null)}
        isLoading={deleteMedication.isPending}
      />
    </div>
  );
}
