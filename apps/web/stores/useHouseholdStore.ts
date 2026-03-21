import { create } from "zustand";

interface HouseholdStore {
  selectedPetId: string | null;
  selectedPetName: string | null;
  isPetFilterActive: boolean;
  selectPet: (id: string, name: string) => void;
  togglePetFilter: () => void;
  clearPetFilter: () => void;
}

export const useHouseholdStore = create<HouseholdStore>((set) => ({
  selectedPetId: null,
  selectedPetName: null,
  isPetFilterActive: false,

  selectPet: (id, name) =>
    set({ selectedPetId: id, selectedPetName: name, isPetFilterActive: true }),

  togglePetFilter: () =>
    set((state) => ({ isPetFilterActive: !state.isPetFilterActive })),

  clearPetFilter: () =>
    set({
      selectedPetId: null,
      selectedPetName: null,
      isPetFilterActive: false,
    }),
}));
