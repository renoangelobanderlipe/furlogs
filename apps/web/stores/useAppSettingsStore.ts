import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ColorPreset =
  | "teal"
  | "blue"
  | "purple"
  | "amber"
  | "orange"
  | "red";
export type FontFamily = "public-sans" | "inter" | "dm-sans" | "nunito-sans";

export const FONT_STACKS: Record<FontFamily, string> = {
  "public-sans": "var(--font-public-sans), system-ui, sans-serif",
  inter: "var(--font-inter), system-ui, sans-serif",
  "dm-sans": "var(--font-dm-sans), system-ui, sans-serif",
  "nunito-sans": "var(--font-nunito-sans), system-ui, sans-serif",
};
export type LayoutMode = "vertical" | "mini" | "horizontal";
export type ColorScheme = "integrate" | "apparent";

interface AppSettings {
  contrast: boolean;
  rtl: boolean;
  compact: boolean;
  navVisible: boolean;
  layout: LayoutMode;
  colorScheme: ColorScheme;
  preset: ColorPreset;
  fontFamily: FontFamily;
  fontSize: number; // px, 12–20
}

interface AppSettingsStore extends AppSettings {
  setContrast: (v: boolean) => void;
  setRtl: (v: boolean) => void;
  setCompact: (v: boolean) => void;
  setNavVisible: (v: boolean) => void;
  setLayout: (v: LayoutMode) => void;
  setColorScheme: (v: ColorScheme) => void;
  setPreset: (v: ColorPreset) => void;
  setFontFamily: (v: FontFamily) => void;
  setFontSize: (v: number) => void;
  reset: () => void;
}

const defaults: AppSettings = {
  contrast: false,
  rtl: false,
  compact: false,
  navVisible: true,
  layout: "vertical",
  colorScheme: "apparent",
  preset: "teal",
  fontFamily: "public-sans",
  fontSize: 16,
};

export const useAppSettingsStore = create<AppSettingsStore>()(
  persist(
    (set) => ({
      ...defaults,
      setContrast: (contrast) => set({ contrast }),
      setRtl: (rtl) => set({ rtl }),
      setCompact: (compact) => set({ compact }),
      setNavVisible: (navVisible) => set({ navVisible }),
      setLayout: (layout) => set({ layout }),
      setColorScheme: (colorScheme) => set({ colorScheme }),
      setPreset: (preset) => set({ preset }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFontSize: (fontSize) =>
        set({ fontSize: Math.min(20, Math.max(12, fontSize)) }),
      reset: () => set(defaults),
    }),
    { name: "furlogs-app-settings" },
  ),
);
