import { create } from "zustand";

interface HouseholdStore {
  selectedPetId: number | null;
  isPetFilterActive: boolean;
  selectPet: (id: number) => void;
  togglePetFilter: () => void;
  clearPetFilter: () => void;
}

export const useHouseholdStore = create<HouseholdStore>((set) => ({
  selectedPetId: null,
  isPetFilterActive: false,

  selectPet: (id) => set({ selectedPetId: id, isPetFilterActive: true }),

  togglePetFilter: () =>
    set((state) => ({ isPetFilterActive: !state.isPetFilterActive })),

  clearPetFilter: () => set({ selectedPetId: null, isPetFilterActive: false }),
}));
