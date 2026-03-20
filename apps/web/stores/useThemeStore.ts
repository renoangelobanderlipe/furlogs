// Theme is now managed by next-themes via ThemeProvider.
// This store is kept as a thin compatibility shim for any
// legacy imports. Prefer using next-themes' useTheme() hook directly.
import { create } from "zustand";

type ThemeMode = "light" | "dark";

interface ThemeStore {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: "dark",
  toggleMode: () =>
    set((s) => ({ mode: s.mode === "dark" ? "light" : "dark" })),
  setMode: (mode) => set({ mode }),
}));
