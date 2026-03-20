"use client";

import { X } from "lucide-react";
import { useHouseholdStore } from "@/stores/useHouseholdStore";

export function PetFilterToggle() {
  const selectedPetId = useHouseholdStore((s) => s.selectedPetId);
  const selectedPetName = useHouseholdStore((s) => s.selectedPetName);
  const isPetFilterActive = useHouseholdStore((s) => s.isPetFilterActive);
  const clearPetFilter = useHouseholdStore((s) => s.clearPetFilter);

  if (!selectedPetId || !isPetFilterActive) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 pl-2.5 pr-1 py-0.5 text-xs font-medium text-primary">
      {selectedPetName ?? `Pet #${selectedPetId}`}
      <button
        type="button"
        onClick={clearPetFilter}
        aria-label="Clear pet filter"
        className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary/20 transition-colors"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}
