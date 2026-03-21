"use client";

import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  PlusCircle,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateVetClinic,
  useDeleteVetClinic,
  useUpdateVetClinic,
  useVetClinics,
} from "@/hooks/api/useVetClinics";
import { useDebounce } from "@/hooks/useDebounce";
import type { VetClinic, VetClinicPayload } from "@/lib/api/vet-clinics";

const emptyForm: VetClinicPayload = {
  name: "",
  address: "",
  phone: "",
  notes: "",
};

export default function VetClinicsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<VetClinic | null>(null);
  const [deleteClinicId, setDeleteClinicId] = useState<string | null>(null);
  const [form, setForm] = useState<VetClinicPayload>(emptyForm);

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useVetClinics({
    page,
    per_page: 10,
    ...(debouncedSearch && { search: debouncedSearch }),
  });
  const clinics = data?.data ?? [];
  const meta = data?.meta;

  const createClinic = useCreateVetClinic();
  const updateClinic = useUpdateVetClinic();
  const deleteClinic = useDeleteVetClinic();

  const totalClinics = meta?.total ?? clinics.length;

  const handleOpenAdd = () => {
    setEditingClinic(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleOpenEdit = (clinic: VetClinic) => {
    setEditingClinic(clinic);
    setForm({
      name: clinic.attributes.name,
      address: clinic.attributes.address ?? "",
      phone: clinic.attributes.phone ?? "",
      notes: clinic.attributes.notes ?? "",
    });
    setDialogOpen(true);
  };

  const handleClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingClinic(null);
      setForm(emptyForm);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const payload: VetClinicPayload = {
      name: form.name.trim(),
      address: form.address?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
    };

    if (editingClinic) {
      updateClinic.mutate(
        { id: editingClinic.id, data: payload },
        { onSuccess: () => handleClose(false) },
      );
    } else {
      createClinic.mutate(payload, {
        onSuccess: () => {
          handleClose(false);
          setPage(1);
        },
      });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteClinicId === null) return;
    deleteClinic.mutate(deleteClinicId, {
      onSuccess: () => setDeleteClinicId(null),
    });
  };

  const isPending = editingClinic
    ? updateClinic.isPending
    : createClinic.isPending;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vet Clinics</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalClinics > 0
                ? `${totalClinics} clinic${totalClinics !== 1 ? "s" : ""} on file`
                : "Manage your trusted veterinary clinics"}
            </p>
          </div>
        </div>
        <Button size="sm" onClick={handleOpenAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Clinic
        </Button>
      </div>

      {/* Search */}
      <div
        className="relative animate-fade-in-up"
        style={{ animationDelay: "50ms" }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name, address or phone…"
          className="pl-9 bg-background"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {["c1", "c2", "c3"].map((k) => (
            <Skeleton key={k} className="h-[80px] rounded-xl" />
          ))}
        </div>
      ) : clinics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground/40" />
          </div>
          {debouncedSearch ? (
            <>
              <h2 className="text-lg font-semibold">
                No clinics match "{debouncedSearch}"
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Try a different name, address, or phone number
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setSearch("")}
              >
                <X className="mr-2 h-4 w-4" />
                Clear search
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">No vet clinics yet</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Add your trusted veterinary clinics to link them with vet visits
              </p>
              <Button size="sm" className="mt-4" onClick={handleOpenAdd}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Clinic
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {clinics.map((clinic, i) => (
            <div
              key={clinic.id}
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 animate-fade-in-up hover:border-primary/20 transition-colors"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{clinic.attributes.name}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                  {clinic.attributes.address && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {clinic.attributes.address}
                      </span>
                    </span>
                  )}
                  {clinic.attributes.phone && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3 shrink-0" />
                      {clinic.attributes.phone}
                    </span>
                  )}
                </div>
                {clinic.attributes.notes && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                    {clinic.attributes.notes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(clinic)}
                  aria-label="Edit clinic"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteClinicId(clinic.id)}
                  aria-label="Delete clinic"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm text-muted-foreground">
            Page {meta.current_page} of {meta.last_page} · {meta.total} clinics
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

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingClinic ? "Edit Vet Clinic" : "Add Vet Clinic"}
            </DialogTitle>
            <DialogDescription>
              {editingClinic
                ? "Update clinic details."
                : "Add a clinic to your trusted vet network."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div>
                <Label
                  htmlFor="clinic-name"
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Clinic Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="clinic-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g., City Animal Hospital"
                  className="mt-1.5 bg-muted/50"
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="clinic-address"
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Address
                </Label>
                <Input
                  id="clinic-address"
                  value={form.address}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder="e.g., 123 Main St, Manila"
                  className="mt-1.5 bg-muted/50"
                />
              </div>
              <div>
                <Label
                  htmlFor="clinic-phone"
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Phone
                </Label>
                <Input
                  id="clinic-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="e.g., +63 2 1234 5678"
                  className="mt-1.5 bg-muted/50"
                />
              </div>
              <div>
                <Label
                  htmlFor="clinic-notes"
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Notes
                </Label>
                <Textarea
                  id="clinic-notes"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder="Opening hours, preferred vet, etc."
                  className="mt-1.5 bg-muted/50 resize-none"
                  rows={3}
                />
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
                disabled={isPending || !form.name.trim()}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingClinic ? "Save Changes" : "Add Clinic"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteClinicId !== null}
        title="Delete vet clinic?"
        description="This will permanently remove this clinic. Vet visits linked to this clinic will not be deleted."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteClinicId(null)}
        isLoading={deleteClinic.isPending}
      />
    </div>
  );
}
