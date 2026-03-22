"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  Search,
  Syringe,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  useDeleteVaccination,
  useUpdateVaccination,
  useVaccinations,
} from "@/hooks/api/useVaccinations";
import { useVetClinics } from "@/hooks/api/useVetClinics";
import { useDebounce } from "@/hooks/useDebounce";
import type { VaccinationStatus } from "@/lib/api/vaccinations";
import { SPECIES_EMOJI } from "@/lib/constants";
import { formatShortDate } from "@/lib/format";
import {
  type VaccinationFormInput,
  type VaccinationFormValues,
  type VaccinationUpdateFormValues,
  vaccinationSchema,
  vaccinationUpdateSchema,
} from "@/lib/validation/vaccination.schema";
import { useHouseholdStore } from "@/stores/useHouseholdStore";

const STATUS_CONFIG: Record<
  VaccinationStatus,
  { label: string; classes: string; icon: React.ReactNode }
> = {
  up_to_date: {
    label: "Up to date",
    classes: "bg-success/15 text-success",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  due_soon: {
    label: "Due soon",
    classes: "bg-warning/15 text-warning",
    icon: <Clock className="h-3 w-3" />,
  },
  overdue: {
    label: "Overdue",
    classes: "bg-destructive/15 text-destructive",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
};

const STATUS_FILTER_OPTIONS: {
  value: VaccinationStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "All statuses" },
  { value: "overdue", label: "Overdue" },
  { value: "due_soon", label: "Due soon" },
  { value: "up_to_date", label: "Up to date" },
];

export default function VaccinationsPage() {
  const initialVaccPetId = useHouseholdStore((s) =>
    s.isPetFilterActive && s.selectedPetId ? s.selectedPetId : "all",
  );
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [petFilter, setPetFilter] = useState(initialVaccPetId);
  const [statusFilter, setStatusFilter] = useState<VaccinationStatus | "all">(
    "all",
  );

  const debouncedSearch = useDebounce(search, 400);
  const hasFilters =
    !!debouncedSearch || petFilter !== "all" || statusFilter !== "all";

  const handlePetFilter = (v: string) => {
    setPetFilter(v);
    setPage(1);
  };
  const handleStatusFilter = (v: string) => {
    setStatusFilter(v as VaccinationStatus | "all");
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setPetFilter("all");
    setStatusFilter("all");
  };

  const { data: vaccinationsData, isLoading } = useVaccinations({
    page,
    per_page: 5,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(petFilter !== "all" && { petId: petFilter }),
    ...(statusFilter !== "all" && { status: statusFilter }),
  });
  const { data: petsData } = usePets();
  const { data: clinicsData } = useVetClinics();
  const createVaccination = useCreateVaccination();
  const updateVaccination = useUpdateVaccination();
  const deleteVaccination = useDeleteVaccination();

  const vaccinations = vaccinationsData?.data ?? [];
  const meta = vaccinationsData?.meta;
  const pets = petsData?.data ?? [];
  const clinics = clinicsData?.data ?? [];
  const petById = new Map(pets.map((p) => [p.id, p]));

  const overdueCount = vaccinations.filter(
    (v) => v.attributes.status === "overdue",
  ).length;
  const totalCount = meta?.total ?? vaccinations.length;

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
      clinicId: undefined,
      vaccineName: "",
      administeredDate: "",
      nextDueDate: "",
      vetName: "",
      batchNumber: "",
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    control: editControl,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<
    Partial<VaccinationFormInput>,
    unknown,
    VaccinationUpdateFormValues
  >({
    resolver: zodResolver(vaccinationUpdateSchema),
  });

  const handleClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) reset();
  };

  const openEdit = (v: (typeof vaccinations)[number]) => {
    resetEdit({
      petId: v.attributes.petId,
      clinicId: v.relationships?.clinic?.id ?? undefined,
      vaccineName: v.attributes.vaccineName,
      administeredDate: v.attributes.administeredDate,
      nextDueDate: v.attributes.nextDueDate ?? "",
      vetName: v.attributes.vetName ?? "",
      batchNumber: v.attributes.batchNumber ?? "",
    });
    setEditingId(v.id);
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

  const onEditSubmit = (values: VaccinationUpdateFormValues) => {
    if (!editingId) return;
    updateVaccination.mutate(
      { id: editingId, data: values },
      {
        onSuccess: () => {
          setEditingId(null);
          resetEdit();
        },
      },
    );
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 shrink-0">
            <Syringe className="h-5 w-5 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vaccinations</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalCount > 0
                ? `${totalCount} record${totalCount !== 1 ? "s" : ""}${overdueCount > 0 ? ` · ${overdueCount} overdue` : ""}`
                : "Track your pets' vaccination history"}
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Vaccination
        </Button>
      </div>

      {/* Overdue alert banner */}
      {overdueCount > 0 && statusFilter === "all" && !debouncedSearch && (
        <div
          className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 animate-fade-in-up"
          style={{ animationDelay: "50ms" }}
        >
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive font-medium">
            {overdueCount} vaccination{overdueCount !== 1 ? "s are" : " is"}{" "}
            overdue — schedule a vet visit soon.
          </p>
          <button
            type="button"
            onClick={() => handleStatusFilter("overdue")}
            className="ml-auto text-xs text-destructive underline underline-offset-2 shrink-0 hover:no-underline"
          >
            View overdue
          </button>
        </div>
      )}

      {/* Search + Filters */}
      <div
        className="flex flex-col sm:flex-row gap-2 animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search pet or vaccine name…"
            className="pl-9 bg-background"
          />
        </div>
        <Select value={petFilter} onValueChange={handlePetFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background">
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
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
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
      ) : vaccinations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <Syringe className="h-8 w-8 text-muted-foreground/40" />
          </div>
          {hasFilters ? (
            <>
              <h2 className="text-lg font-semibold">
                No vaccinations match your search
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filters
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
              <h2 className="text-lg font-semibold">
                No vaccinations recorded
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Start tracking your pets' vaccinations to stay on top of their
                health
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setDialogOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Vaccination
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {vaccinations.map((v, i) => {
            const pet = petById.get(v.attributes.petId);
            const species = pet?.attributes.species ?? "";
            const status = v.attributes.status;
            const statusConfig = status ? STATUS_CONFIG[status] : null;
            return (
              <div
                key={v.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 animate-fade-in-up hover:border-primary/20 transition-colors"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-xl">
                  {SPECIES_EMOJI[species] ?? "🐾"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">
                      {v.attributes.vaccineName}
                    </p>
                    {statusConfig && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${statusConfig.classes}`}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {pet?.attributes.name ?? "Unknown"} ·{" "}
                    {formatShortDate(v.attributes.administeredDate)}
                    {(v.relationships?.clinic?.attributes.name ||
                      v.attributes.vetName) && (
                      <>
                        {" "}
                        ·{" "}
                        {v.relationships?.clinic?.attributes.name ||
                          v.attributes.vetName}
                      </>
                    )}
                  </p>
                </div>
                {v.attributes.nextDueDate && (
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">Next due</p>
                    <p
                      className={`text-sm font-medium tabular-nums ${
                        status === "overdue"
                          ? "text-destructive"
                          : status === "due_soon"
                            ? "text-warning"
                            : "text-foreground"
                      }`}
                    >
                      {formatShortDate(v.attributes.nextDueDate)}
                    </p>
                  </div>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(v)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeletingId(v.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between pt-1">
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
            <DialogDescription>
              Track your pet's immunization history.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
                      <SelectTrigger className="mt-1.5 bg-muted/50">
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
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Vaccine Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register("vaccineName")}
                  placeholder="e.g., DHPP, FVRCP"
                  className="mt-1.5 bg-muted/50"
                />
                {errors.vaccineName && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.vaccineName.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    {...register("administeredDate")}
                    className="mt-1.5 bg-muted/50"
                  />
                  {errors.administeredDate && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.administeredDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Next Due
                  </Label>
                  <Input
                    type="date"
                    {...register("nextDueDate")}
                    className="mt-1.5 bg-muted/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Clinic
                  </Label>
                  <Controller
                    name="clinicId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? "none"}
                        onValueChange={(v) =>
                          field.onChange(v === "none" ? undefined : v)
                        }
                      >
                        <SelectTrigger className="mt-1.5 bg-muted/50">
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
                    )}
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Batch #
                  </Label>
                  <Input
                    {...register("batchNumber")}
                    className="mt-1.5 bg-muted/50"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost" size="sm">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                size="sm"
                disabled={createVaccination.isPending}
              >
                {createVaccination.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Vaccination Dialog */}
      <Dialog
        open={editingId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingId(null);
            resetEdit();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Vaccination</DialogTitle>
            <DialogDescription>
              Update this vaccination record.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit(onEditSubmit)} noValidate>
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Vaccine Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...registerEdit("vaccineName")}
                  placeholder="e.g., DHPP, FVRCP"
                  className="mt-1.5 bg-muted/50"
                />
                {editErrors.vaccineName && (
                  <p className="text-xs text-destructive mt-1">
                    {editErrors.vaccineName.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    {...registerEdit("administeredDate")}
                    className="mt-1.5 bg-muted/50"
                  />
                  {editErrors.administeredDate && (
                    <p className="text-xs text-destructive mt-1">
                      {editErrors.administeredDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Next Due
                  </Label>
                  <Input
                    type="date"
                    {...registerEdit("nextDueDate")}
                    className="mt-1.5 bg-muted/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Clinic
                  </Label>
                  <Controller
                    name="clinicId"
                    control={editControl}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? "none"}
                        onValueChange={(v) =>
                          field.onChange(v === "none" ? undefined : v)
                        }
                      >
                        <SelectTrigger className="mt-1.5 bg-muted/50">
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
                    )}
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Batch #
                  </Label>
                  <Input
                    {...registerEdit("batchNumber")}
                    className="mt-1.5 bg-muted/50"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingId(null);
                  resetEdit();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateVaccination.isPending}
              >
                {updateVaccination.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deletingId !== null}
        title="Delete vaccination?"
        description="This will permanently remove this vaccination record. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deletingId) deleteVaccination.mutate(deletingId);
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
