import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "light" | "dark";

interface ThemeStore {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: "dark",
      toggleMode: () =>
        set((s) => ({ mode: s.mode === "dark" ? "light" : "dark" })),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "furlogs-theme",
    },
  ),
);
