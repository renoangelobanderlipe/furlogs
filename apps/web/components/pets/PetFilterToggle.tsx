"use client";

import Chip from "@mui/material/Chip";
import { useHouseholdStore } from "@/stores/useHouseholdStore";

export function PetFilterToggle() {
  const selectedPetId = useHouseholdStore((s) => s.selectedPetId);
  const selectedPetName = useHouseholdStore((s) => s.selectedPetName);
  const isPetFilterActive = useHouseholdStore((s) => s.isPetFilterActive);
  const clearPetFilter = useHouseholdStore((s) => s.clearPetFilter);

  if (!selectedPetId || !isPetFilterActive) return null;

  return (
    <Chip
      label={selectedPetName ?? `Pet #${selectedPetId}`}
      onDelete={clearPetFilter}
      color="primary"
      size="small"
      variant="outlined"
    />
  );
}
