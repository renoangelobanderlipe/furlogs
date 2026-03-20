"use client";

import AddIcon from "@mui/icons-material/Add";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { VaccinationCard } from "@/components/vaccinations/VaccinationCard";
import { VaccinationCardSkeleton } from "@/components/vaccinations/VaccinationCardSkeleton";
import { VaccinationForm } from "@/components/vaccinations/VaccinationForm";
import { usePets } from "@/hooks/api/usePets";
import {
  useCreateVaccination,
  useVaccinations,
} from "@/hooks/api/useVaccinations";
import {
  VACCINATION_STATUS_COLOR,
  type VaccinationStatus,
} from "@/lib/api/vaccinations";
import type { VaccinationFormValues } from "@/lib/validation/vaccination.schema";

type StatusFilter = VaccinationStatus | "all";

const STATUS_FILTER_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Up to date", value: "up_to_date" },
  { label: "Due soon", value: "due_soon" },
  { label: "Overdue", value: "overdue" },
];

export default function VaccinationsPage() {
  const [petIdFilter, setPetIdFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filters = {
    ...(petIdFilter !== null ? { petId: petIdFilter } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
  };

  const { data, isLoading } = useVaccinations(filters);
  const { data: petsData } = usePets();

  const createVaccination = useCreateVaccination();

  const vaccinations = data?.data ?? [];
  const pets = petsData?.data ?? [];

  const petNameMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const pet of pets) {
      map[pet.id] = pet.attributes.name;
    }
    return map;
  }, [pets]);

  const handleSubmit = (values: VaccinationFormValues) => {
    createVaccination.mutate(values, {
      onSuccess: () => setIsAddDialogOpen(false),
    });
  };

  const hasFilters = petIdFilter !== null || statusFilter !== "all";

  const statusCounts = useMemo(
    () =>
      vaccinations.reduce<Record<string, number>>((acc, v) => {
        const s = v.attributes.status;
        if (s) acc[s] = (acc[s] ?? 0) + 1;
        return acc;
      }, {}),
    [vaccinations],
  );

  return (
    <Box>
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
            Vaccinations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Keep track of vaccines and upcoming boosters
          </Typography>
        </Box>
        <Box flexGrow={1} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
          sx={{ minHeight: 48 }}
        >
          Add vaccination
        </Button>
      </Box>

      {/* Status summary chips */}
      {!isLoading && vaccinations.length > 0 && (
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          {(Object.keys(statusCounts) as VaccinationStatus[]).map((s) => (
            <Chip
              key={s}
              label={`${statusCounts[s]} ${s.replace(/_/g, " ")}`}
              color={VACCINATION_STATUS_COLOR[s]}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      )}

      {/* Filter bar */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        mb={3}
        flexWrap="wrap"
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
          <Typography variant="body2" color="text.secondary">
            Pet:
          </Typography>
          <Chip
            label="All"
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
          <Typography variant="body2" color="text.secondary">
            Status:
          </Typography>
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              onClick={() => setStatusFilter(opt.value)}
              color={statusFilter === opt.value ? "secondary" : "default"}
              variant={statusFilter === opt.value ? "filled" : "outlined"}
              size="small"
              sx={{ minHeight: 32 }}
            />
          ))}
        </Box>
      </Box>

      {/* Grid */}
      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <VaccinationCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : vaccinations.length === 0 ? (
        <EmptyState
          title="No vaccinations found"
          description={
            hasFilters
              ? "Try adjusting your filters."
              : "Add your pet's first vaccination to start tracking."
          }
          action={
            hasFilters
              ? undefined
              : {
                  label: "Add first vaccination",
                  onClick: () => setIsAddDialogOpen(true),
                }
          }
          icon={<VaccinesIcon />}
        />
      ) : (
        <Grid container spacing={2}>
          {vaccinations.map((vaccination) => {
            const petRel = vaccination.relationships?.pet?.data;
            const petName = petRel ? petNameMap[petRel.id] : undefined;
            return (
              <Grid key={vaccination.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <VaccinationCard
                  vaccination={vaccination}
                  petName={petName}
                  onClick={() => {
                    // Future: open detail dialog
                  }}
                />
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add vaccination dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add vaccination record</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <VaccinationForm
            onSubmit={handleSubmit}
            isLoading={createVaccination.isPending}
            submitLabel="Add vaccination"
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
