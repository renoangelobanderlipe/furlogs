"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  PlusCircle,
  Syringe,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { usePets } from "@/hooks/api/usePets";
import {
  useCreateVaccination,
  useVaccinations,
} from "@/hooks/api/useVaccinations";
import { SPECIES_EMOJI } from "@/lib/constants";
import { formatShortDate } from "@/lib/format";
import {
  type VaccinationFormInput,
  type VaccinationFormValues,
  vaccinationSchema,
} from "@/lib/validation/vaccination.schema";

export default function VaccinationsPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: vaccinationsData, isLoading } = useVaccinations({
    page,
    per_page: 5,
  });
  const { data: petsData } = usePets();
  const createVaccination = useCreateVaccination();

  const vaccinations = vaccinationsData?.data ?? [];
  const meta = vaccinationsData?.meta;
  const pets = petsData?.data ?? [];
  const petById = new Map(pets.map((p) => [p.id, p]));

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<VaccinationFormInput, unknown, VaccinationFormValues>({
    resolver: zodResolver(vaccinationSchema),
    defaultValues: {
      petId: undefined,
      vaccineName: "",
      administeredDate: "",
      nextDueDate: "",
      vetName: "",
      batchNumber: "",
    },
  });

  const handleClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) reset();
  };

  const onSubmit = (values: VaccinationFormValues) => {
    createVaccination.mutate(values, {
      onSuccess: () => {
        setDialogOpen(false);
        reset();
        setPage(1);
      },
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight">Vaccinations</h1>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Vaccination
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {["v1", "v2", "v3"].map((k) => (
            <Skeleton key={k} className="h-[68px] rounded-lg" />
          ))}
        </div>
      ) : vaccinations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
          <Syringe className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">No vaccinations recorded</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Start tracking your pets' vaccinations
          </p>
          <Button
            size="sm"
            className="mt-4"
            onClick={() => setDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Vaccination
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {vaccinations.map((v, i) => {
            const pet = petById.get(v.attributes.petId);
            const species = pet?.attributes.species ?? "";
            return (
              <div
                key={v.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="text-xl shrink-0">
                  {SPECIES_EMOJI[species] ?? "🐾"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{v.attributes.vaccineName}</p>
                  <p className="text-sm text-muted-foreground">
                    {pet?.attributes.name ?? "Unknown"} ·{" "}
                    {formatShortDate(v.attributes.administeredDate)}
                  </p>
                </div>
                {v.attributes.nextDueDate && (
                  <span className="text-xs rounded-full bg-warning/15 text-warning px-2 py-0.5 font-medium shrink-0">
                    Due {formatShortDate(v.attributes.nextDueDate)}
                  </span>
                )}
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
            vaccinations
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

      {/* Add Vaccination Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Vaccination</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4 py-2">
              {/* Pet */}
              <div>
                <Label>
                  Pet <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="petId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(v) => field.onChange(v)}
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
                  )}
                />
                {errors.petId && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.petId.message}
                  </p>
                )}
              </div>

              {/* Vaccine Name */}
              <div>
                <Label>
                  Vaccine Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register("vaccineName")}
                  placeholder="e.g., DHPP, FVRCP"
                  className="mt-1.5 bg-background"
                />
                {errors.vaccineName && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.vaccineName.message}
                  </p>
                )}
              </div>

              {/* Date + Next Due */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    {...register("administeredDate")}
                    className="mt-1.5 bg-background"
                  />
                  {errors.administeredDate && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.administeredDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Next Due</Label>
                  <Input
                    type="date"
                    {...register("nextDueDate")}
                    className="mt-1.5 bg-background"
                  />
                </div>
              </div>

              {/* Vet / Clinic + Batch # */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Vet / Clinic</Label>
                  <Input
                    {...register("vetName")}
                    className="mt-1.5 bg-background"
                  />
                </div>
                <div>
                  <Label>Batch #</Label>
                  <Input
                    {...register("batchNumber")}
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
              <Button type="submit" disabled={createVaccination.isPending}>
                {createVaccination.isPending && (
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
