"use client";

import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import SearchIcon from "@mui/icons-material/Search";
import TimelineIcon from "@mui/icons-material/Timeline";
import ViewListIcon from "@mui/icons-material/ViewList";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Drawer from "@mui/material/Drawer";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { VisitCard } from "@/components/vet-visits/VisitCard";
import { VisitCardSkeleton } from "@/components/vet-visits/VisitCardSkeleton";
import { VisitDetailPanel } from "@/components/vet-visits/VisitDetailPanel";
import { VisitForm } from "@/components/vet-visits/VisitForm";
import { VisitTimeline } from "@/components/vet-visits/VisitTimeline";
import { usePets } from "@/hooks/api/usePets";
import {
  useAddVetVisitAttachment,
  useBulkDeleteVetVisits,
  useCreateVetVisit,
  useDeleteVetVisit,
  useRemoveVetVisitAttachment,
  useUpdateVetVisit,
  useVetVisit,
  useVetVisitStats,
  useVetVisits,
} from "@/hooks/api/useVetVisits";
import type {
  VetVisit,
  VetVisitPayload,
  VetVisitType,
  VetVisitUpdatePayload,
} from "@/lib/api/vet-visits";
import { formatShortDate } from "@/lib/format";
import type { VetVisitFormValues } from "@/lib/validation/vet-visit.schema";

type ViewMode = "list" | "timeline";

const VISIT_TYPE_FILTER_OPTIONS: {
  label: string;
  value: VetVisitType | "all";
}[] = [
  { label: "All", value: "all" },
  { label: "Checkup", value: "checkup" },
  { label: "Treatment", value: "treatment" },
  { label: "Vaccine", value: "vaccine" },
  { label: "Emergency", value: "emergency" },
];

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function VetVisitsPage() {
  const [search, setSearch] = useState("");
  const [petIdFilter, setPetIdFilter] = useState<number | null>(null);
  const [visitTypeFilter, setVisitTypeFilter] = useState<VetVisitType | "all">(
    "all",
  );
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<VetVisit | null>(null);
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectable, setSelectable] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounced(search);

  const filters = {
    ...(petIdFilter !== null ? { petId: petIdFilter } : {}),
    ...(visitTypeFilter !== "all" ? { visitType: visitTypeFilter } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };

  const { data, isLoading } = useVetVisits(filters);
  const { data: detailData } = useVetVisit(selectedVisitId ?? 0);
  const { data: petsData } = usePets();
  const { data: stats, isLoading: isStatsLoading } = useVetVisitStats();

  const createVisit = useCreateVetVisit();
  const updateVisit = useUpdateVetVisit();
  const deleteVisit = useDeleteVetVisit();
  const bulkDelete = useBulkDeleteVetVisits();
  const addAttachment = useAddVetVisitAttachment();
  const removeAttachment = useRemoveVetVisitAttachment();

  const visits = data?.data ?? [];
  const pets = petsData?.data ?? [];

  const handleCreateSubmit = (values: VetVisitFormValues, files: File[]) => {
    const payload: VetVisitPayload = {
      pet_id: values.petId,
      visit_type: values.visitType,
      visit_date: values.visitDate,
      reason: values.reason,
      ...(values.clinicId && { clinic_id: values.clinicId }),
      ...(values.vetName && { vet_name: values.vetName }),
      ...(values.diagnosis && { diagnosis: values.diagnosis }),
      ...(values.treatment && { treatment: values.treatment }),
      ...(values.notes && { notes: values.notes }),
      ...(values.cost !== undefined && { cost: values.cost }),
      ...(values.weightAtVisit !== undefined && {
        weight_at_visit: values.weightAtVisit,
      }),
      ...(values.followUpDate && { follow_up_date: values.followUpDate }),
    };

    createVisit.mutate(payload, {
      onSuccess: (visit) => {
        // Upload all attachments in parallel after the visit is created
        for (const file of files) {
          addAttachment.mutate({ id: visit.id, file });
        }
        setIsAddDialogOpen(false);
      },
    });
  };

  const handleEditSubmit = (values: VetVisitFormValues, _files: File[]) => {
    if (!editingVisit) return;

    const payload: VetVisitUpdatePayload = {
      pet_id: values.petId,
      visit_type: values.visitType,
      visit_date: values.visitDate,
      reason: values.reason,
      vet_name: values.vetName || undefined,
      clinic_id: values.clinicId,
      diagnosis: values.diagnosis || undefined,
      treatment: values.treatment || undefined,
      notes: values.notes || undefined,
      cost: values.cost,
      weight_at_visit: values.weightAtVisit,
      follow_up_date: values.followUpDate || undefined,
    };

    updateVisit.mutate(
      { id: editingVisit.id, data: payload },
      {
        onSuccess: () => {
          setEditingVisit(null);
          setIsAddDialogOpen(false);
        },
      },
    );
  };

  const handleDeleteVisit = (id: number) => {
    deleteVisit.mutate(id, {
      onSuccess: () => {
        if (selectedVisitId === id) setSelectedVisitId(null);
      },
    });
  };

  const handleBulkDelete = () => {
    bulkDelete.mutate(Array.from(selectedIds), {
      onSuccess: () => {
        setSelectedIds(new Set());
        setSelectable(false);
      },
    });
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const hasFilters =
    !!debouncedSearch || petIdFilter !== null || visitTypeFilter !== "all";

  return (
    <Box>
      {/* Hidden file input for attachment upload from detail panel */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && selectedVisitId !== null) {
            addAttachment.mutate({ id: selectedVisitId, file });
          }
          // Reset so the same file can be re-selected
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
      />

      {/* Header */}
      <Box
        display="flex"
        alignItems={{ xs: "flex-start", sm: "center" }}
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Vet Visits
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track all medical appointments and treatments
          </Typography>
        </Box>
        <Box flexGrow={1} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
          sx={{ minHeight: 48 }}
        >
          Add visit
        </Button>
      </Box>

      {/* Stats row */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 6, sm: 3 }}>
          {isStatsLoading ? (
            <Skeleton variant="rounded" height={80} />
          ) : (
            <StatCard
              label="Visits YTD"
              value={stats?.ytdVisits ?? 0}
              icon={<LocalHospitalIcon />}
            />
          )}
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          {isStatsLoading ? (
            <Skeleton variant="rounded" height={80} />
          ) : (
            <StatCard
              label="Spend YTD"
              value={`$${(stats?.ytdSpend ?? 0).toFixed(2)}`}
              icon={<MonetizationOnIcon />}
            />
          )}
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          {isStatsLoading ? (
            <Skeleton variant="rounded" height={80} />
          ) : (
            <StatCard
              label="Last visit"
              value={formatShortDate(stats?.lastVisitDate)}
              icon={<CalendarTodayIcon />}
            />
          )}
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          {isStatsLoading ? (
            <Skeleton variant="rounded" height={80} />
          ) : (
            <StatCard
              label="Top vet"
              value={stats?.topClinic ?? "—"}
              icon={<LocalHospitalIcon />}
            />
          )}
        </Grid>
      </Grid>

      {/* Filter bar */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        mb={2}
        flexWrap="wrap"
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search visits…"
          size="small"
          sx={{ maxWidth: 280 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          inputProps={{ "aria-label": "Search vet visits" }}
        />

        <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
          <Chip
            label="All pets"
            onClick={() => setPetIdFilter(null)}
            color={petIdFilter === null ? "primary" : "default"}
            variant={petIdFilter === null ? "filled" : "outlined"}
            size="small"
            sx={{ minHeight: 32 }}
          />
          {pets.map((pet) => (
            <Chip
              key={pet.id}
              label={pet.attributes.name}
              onClick={() =>
                setPetIdFilter(petIdFilter === pet.id ? null : pet.id)
              }
              color={petIdFilter === pet.id ? "primary" : "default"}
              variant={petIdFilter === pet.id ? "filled" : "outlined"}
              size="small"
              sx={{ minHeight: 32 }}
            />
          ))}
        </Box>

        <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
          {VISIT_TYPE_FILTER_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              onClick={() => setVisitTypeFilter(opt.value)}
              color={visitTypeFilter === opt.value ? "secondary" : "default"}
              variant={visitTypeFilter === opt.value ? "filled" : "outlined"}
              size="small"
              sx={{ minHeight: 32 }}
            />
          ))}
        </Box>
      </Box>

      {/* Toolbar: view toggle + bulk actions */}
      <Box display="flex" alignItems="center" gap={2} mb={2} flexWrap="wrap">
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_e, val) => {
            if (val) setViewMode(val);
          }}
          size="small"
          aria-label="View mode"
        >
          <ToggleButton
            value="list"
            aria-label="List view"
            sx={{ minWidth: 48, minHeight: 40 }}
          >
            <ViewListIcon />
          </ToggleButton>
          <ToggleButton
            value="timeline"
            aria-label="Timeline view"
            sx={{ minWidth: 48, minHeight: 40 }}
          >
            <TimelineIcon />
          </ToggleButton>
        </ToggleButtonGroup>

        <Button
          size="small"
          variant={selectable ? "contained" : "outlined"}
          onClick={() => {
            setSelectable((s) => !s);
            setSelectedIds(new Set());
          }}
          sx={{ minHeight: 40 }}
        >
          {selectable ? "Cancel select" : "Select"}
        </Button>

        {selectable && selectedIds.size > 0 && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteSweepIcon />}
            onClick={handleBulkDelete}
            disabled={bulkDelete.isPending}
            sx={{ minHeight: 40 }}
          >
            Delete {selectedIds.size} selected
          </Button>
        )}
      </Box>

      {/* Content */}
      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <VisitCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : visits.length === 0 ? (
        <EmptyState
          title="No vet visits found"
          description={
            hasFilters
              ? "Try adjusting your search or filters."
              : "Add your first vet visit to start tracking."
          }
          action={
            hasFilters
              ? undefined
              : {
                  label: "Add first visit",
                  onClick: () => setIsAddDialogOpen(true),
                }
          }
          icon={<LocalHospitalIcon />}
        />
      ) : viewMode === "list" ? (
        <Grid container spacing={2}>
          {visits.map((visit) => (
            <Grid key={visit.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <VisitCard
                visit={visit}
                onClick={() => setSelectedVisitId(visit.id)}
                selectable={selectable}
                selected={selectedIds.has(visit.id)}
                onToggleSelect={handleToggleSelect}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <VisitTimeline
          visits={visits}
          onSelectVisit={(visit) => setSelectedVisitId(visit.id)}
        />
      )}

      {/* Visit detail drawer */}
      <Drawer
        anchor="right"
        open={selectedVisitId !== null}
        onClose={() => setSelectedVisitId(null)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 480 } } }}
      >
        {detailData && (
          <VisitDetailPanel
            visit={detailData}
            onClose={() => setSelectedVisitId(null)}
            onEdit={() => {
              setEditingVisit(detailData);
              setSelectedVisitId(null);
              setIsAddDialogOpen(true);
            }}
            onDelete={() => handleDeleteVisit(detailData.id)}
            onAddAttachment={() => {
              fileInputRef.current?.click();
            }}
            onRemoveAttachment={(mediaId) => {
              if (selectedVisitId !== null) {
                removeAttachment.mutate({
                  visitId: selectedVisitId,
                  mediaId,
                });
              }
            }}
            isDeleting={deleteVisit.isPending}
          />
        )}
      </Drawer>

      {/* Add / Edit visit dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setEditingVisit(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingVisit ? "Edit vet visit" : "Record a vet visit"}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <VisitForm
            key={editingVisit?.id ?? "new"}
            onSuccess={editingVisit ? handleEditSubmit : handleCreateSubmit}
            onCancel={() => {
              setIsAddDialogOpen(false);
              setEditingVisit(null);
            }}
            isLoading={
              editingVisit ? updateVisit.isPending : createVisit.isPending
            }
            isEditMode={!!editingVisit}
            initialValues={
              editingVisit
                ? {
                    petId: editingVisit.attributes.petId,
                    visitType: editingVisit.attributes.visitType,
                    visitDate: editingVisit.attributes.visitDate,
                    reason: editingVisit.attributes.reason,
                    vetName: editingVisit.attributes.vetName ?? "",
                    diagnosis: editingVisit.attributes.diagnosis ?? "",
                    treatment: editingVisit.attributes.treatment ?? "",
                    notes: editingVisit.attributes.notes ?? "",
                    cost: editingVisit.attributes.cost
                      ? Number.parseFloat(editingVisit.attributes.cost)
                      : undefined,
                    followUpDate: editingVisit.attributes.followUpDate ?? "",
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
