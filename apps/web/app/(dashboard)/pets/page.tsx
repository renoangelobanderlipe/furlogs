"use client";

import AddIcon from "@mui/icons-material/Add";
import PetsIcon from "@mui/icons-material/Pets";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PetCard } from "@/components/pets/PetCard";
import { PetCardSkeleton } from "@/components/pets/PetCardSkeleton";
import { PetForm } from "@/components/pets/PetForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCreatePet, usePets } from "@/hooks/api/usePets";
import type { PetFormValues } from "@/lib/validation/pet.schema";

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

type SpeciesFilter = "all" | "dog" | "cat";

export default function PetsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const debouncedSearch = useDebounced(search);

  const filters = {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(speciesFilter !== "all" ? { species: speciesFilter } : {}),
  };

  const { data, isLoading } = usePets(filters);
  const createPet = useCreatePet();

  const pets = data?.data ?? [];

  const handleSubmit = (values: PetFormValues) => {
    createPet.mutate(values, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
      },
    });
  };

  const speciesChips: { label: string; value: SpeciesFilter }[] = [
    { label: "All", value: "all" },
    { label: "Dogs", value: "dog" },
    { label: "Cats", value: "cat" },
  ];

  return (
    <Box>
      {/* Page header */}
      <Box
        display="flex"
        alignItems={{ xs: "flex-start", sm: "center" }}
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            My Pets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your pet profiles
          </Typography>
        </Box>
        <Box flexGrow={1} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
          sx={{ minHeight: 48 }}
        >
          Add pet
        </Button>
      </Box>

      {/* Filters */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        mb={3}
      >
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pets…"
          size="small"
          sx={{ maxWidth: 320 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          inputProps={{ "aria-label": "Search pets" }}
        />
        <Box display="flex" gap={1} alignItems="center">
          {speciesChips.map((chip) => (
            <Chip
              key={chip.value}
              label={chip.label}
              onClick={() => setSpeciesFilter(chip.value)}
              color={speciesFilter === chip.value ? "primary" : "default"}
              variant={speciesFilter === chip.value ? "filled" : "outlined"}
              sx={{ minHeight: 36 }}
            />
          ))}
        </Box>
      </Box>

      {/* Grid */}
      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list has no stable id
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <PetCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : pets.length === 0 ? (
        <EmptyState
          title="No pets found"
          description={
            search || speciesFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Add your first pet to get started."
          }
          action={
            search || speciesFilter !== "all"
              ? undefined
              : {
                  label: "Add your first pet",
                  onClick: () => setIsAddDialogOpen(true),
                }
          }
          icon={<PetsIcon />}
        />
      ) : (
        <Grid container spacing={2}>
          {pets.map((pet) => (
            <Grid key={pet.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <PetCard
                pet={pet}
                onClick={() => router.push(`/pets/${pet.id}`)}
              />
            </Grid>
          ))}
          {/* Add pet card */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                minHeight: 120,
                display: "flex",
                border: "2px dashed",
                borderColor: "divider",
              }}
            >
              <CardActionArea
                onClick={() => setIsAddDialogOpen(true)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  p: 3,
                }}
              >
                <CardContent sx={{ textAlign: "center", p: 0 }}>
                  <AddIcon
                    sx={{ fontSize: 32, color: "text.disabled", mb: 0.5 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Add another pet
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Add pet dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add a new pet</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <PetForm
            onSubmit={handleSubmit}
            isLoading={createPet.isPending}
            submitLabel="Add pet"
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
