"use client";

import {
  AlignLeft,
  Columns2,
  Contrast,
  Info,
  LayoutDashboard,
  Moon,
  RotateCcw,
  Settings,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  type ColorPreset,
  type ColorScheme,
  FONT_STACKS,
  type FontFamily,
  type LayoutMode,
  useAppSettingsStore,
} from "@/stores/useAppSettingsStore";

// ── Presets ────────────────────────────────────────────────────
const PRESETS: {
  value: ColorPreset;
  bg: string;
  accent: string;
  label: string;
}[] = [
  {
    value: "teal",
    bg: "bg-emerald-900/60",
    accent: "bg-emerald-500",
    label: "Teal",
  },
  { value: "blue", bg: "bg-blue-900/60", accent: "bg-blue-500", label: "Blue" },
  {
    value: "purple",
    bg: "bg-violet-900/60",
    accent: "bg-violet-500",
    label: "Purple",
  },
  {
    value: "amber",
    bg: "bg-amber-900/60",
    accent: "bg-amber-400",
    label: "Amber",
  },
  {
    value: "orange",
    bg: "bg-orange-900/60",
    accent: "bg-orange-500",
    label: "Orange",
  },
  { value: "red", bg: "bg-rose-900/60", accent: "bg-rose-500", label: "Red" },
];

// ── Fonts ──────────────────────────────────────────────────────
const FONTS: { value: FontFamily; label: string }[] = [
  { value: "public-sans", label: "Public Sans" },
  { value: "inter", label: "Inter" },
  { value: "dm-sans", label: "DM Sans" },
  { value: "nunito-sans", label: "Nunito Sans" },
];

// ── Layouts ────────────────────────────────────────────────────
const LAYOUTS: { value: LayoutMode; label: string; icon: React.ReactNode }[] = [
  {
    value: "vertical",
    label: "Vertical",
    icon: (
      <svg viewBox="0 0 40 30" className="w-full h-full" aria-hidden="true">
        <rect
          x="0"
          y="0"
          width="10"
          height="30"
          rx="2"
          className="fill-primary/60"
        />
        <rect
          x="12"
          y="0"
          width="28"
          height="7"
          rx="2"
          className="fill-muted-foreground/30"
        />
        <rect
          x="12"
          y="9"
          width="28"
          height="21"
          rx="2"
          className="fill-muted-foreground/15"
        />
      </svg>
    ),
  },
  {
    value: "mini",
    label: "Mini",
    icon: (
      <svg viewBox="0 0 40 30" className="w-full h-full" aria-hidden="true">
        <rect
          x="0"
          y="0"
          width="6"
          height="30"
          rx="2"
          className="fill-primary/60"
        />
        <rect
          x="8"
          y="0"
          width="32"
          height="7"
          rx="2"
          className="fill-muted-foreground/30"
        />
        <rect
          x="8"
          y="9"
          width="32"
          height="21"
          rx="2"
          className="fill-muted-foreground/15"
        />
      </svg>
    ),
  },
  {
    value: "horizontal",
    label: "Horizontal",
    icon: (
      <svg viewBox="0 0 40 30" className="w-full h-full" aria-hidden="true">
        <rect
          x="0"
          y="0"
          width="40"
          height="7"
          rx="2"
          className="fill-primary/60"
        />
        <rect
          x="0"
          y="9"
          width="40"
          height="21"
          rx="2"
          className="fill-muted-foreground/15"
        />
      </svg>
    ),
  },
];

// ── Sub-components ─────────────────────────────────────────────
interface ToggleCardProps {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  info?: string;
}

function ToggleCard({
  icon,
  label,
  checked,
  onCheckedChange,
  info,
}: ToggleCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{icon}</span>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-label={label}
        />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium">{label}</span>
        {info && (
          <span title={info} className="cursor-help">
            <Info className="h-3 w-3 text-muted-foreground" />
          </span>
        )}
      </div>
    </div>
  );
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5">
      <span className="text-[11px] font-medium text-foreground">
        {children}
      </span>
    </div>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-muted-foreground">{children}</p>
  );
}

// ── Main component ─────────────────────────────────────────────
export function SettingsDrawer() {
  const { theme, setTheme } = useTheme();

  const contrast = useAppSettingsStore((s) => s.contrast);
  const rtl = useAppSettingsStore((s) => s.rtl);
  const compact = useAppSettingsStore((s) => s.compact);
  const navVisible = useAppSettingsStore((s) => s.navVisible);
  const layout = useAppSettingsStore((s) => s.layout);
  const colorScheme = useAppSettingsStore((s) => s.colorScheme);
  const preset = useAppSettingsStore((s) => s.preset);
  const fontFamily = useAppSettingsStore((s) => s.fontFamily);
  const fontSize = useAppSettingsStore((s) => s.fontSize);

  const setContrast = useAppSettingsStore((s) => s.setContrast);
  const setRtl = useAppSettingsStore((s) => s.setRtl);
  const setCompact = useAppSettingsStore((s) => s.setCompact);
  const setNavVisible = useAppSettingsStore((s) => s.setNavVisible);
  const setLayout = useAppSettingsStore((s) => s.setLayout);
  const setColorScheme = useAppSettingsStore((s) => s.setColorScheme);
  const setPreset = useAppSettingsStore((s) => s.setPreset);
  const setFontFamily = useAppSettingsStore((s) => s.setFontFamily);
  const setFontSize = useAppSettingsStore((s) => s.setFontSize);
  const reset = useAppSettingsStore((s) => s.reset);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="App settings"
          aria-label="Open settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </SheetTrigger>

      <SheetContent
        side={rtl ? "left" : "right"}
        className="w-80 p-0 overflow-y-auto flex flex-col gap-0 [&>button]:hidden"
      >
        {/* ── Header ── */}
        <SheetHeader className="flex flex-row items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-background z-10">
          <SheetTitle className="text-base font-semibold">Settings</SheetTitle>
          <button
            type="button"
            onClick={() => {
              reset();
              setTheme("dark");
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Reset to defaults"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </SheetHeader>

        <div className="flex flex-col gap-6 p-5">
          {/* ── Mode & Contrast ── */}
          <div className="grid grid-cols-2 gap-3">
            <ToggleCard
              icon={<Moon className="h-4 w-4" />}
              label="Mode"
              checked={theme === "dark"}
              onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
            />
            <ToggleCard
              icon={<Contrast className="h-4 w-4" />}
              label="Contrast"
              checked={contrast}
              onCheckedChange={setContrast}
            />
          </div>

          {/* ── RTL & Compact ── */}
          <div className="grid grid-cols-2 gap-3">
            <ToggleCard
              icon={<AlignLeft className="h-4 w-4" />}
              label="Right to left"
              checked={rtl}
              onCheckedChange={setRtl}
            />
            <ToggleCard
              icon={<Columns2 className="h-4 w-4" />}
              label="Compact"
              checked={compact}
              onCheckedChange={setCompact}
              info="Reduces padding and spacing throughout the UI"
            />
          </div>

          {/* ── Nav ── */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Nav</span>
            </div>
            <Switch
              checked={navVisible}
              onCheckedChange={setNavVisible}
              aria-label="Toggle navigation sidebar"
            />
          </div>

          {/* ── Layout ── */}
          <div className="flex flex-col gap-3">
            <SubLabel>Layout</SubLabel>
            <div className="grid grid-cols-3 gap-2">
              {LAYOUTS.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLayout(value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border p-2.5 transition-all hover:border-primary/50",
                    layout === value
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border bg-card",
                  )}
                  title={label}
                  aria-label={label}
                  aria-pressed={layout === value}
                >
                  <div className="h-8 w-full">{icon}</div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Color scheme ── */}
          <div className="flex flex-col gap-3">
            <SubLabel>Color</SubLabel>
            <div className="grid grid-cols-2 gap-2">
              {(["integrate", "apparent"] as ColorScheme[]).map((scheme) => (
                <button
                  key={scheme}
                  type="button"
                  onClick={() => setColorScheme(scheme)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all capitalize hover:border-primary/50",
                    colorScheme === scheme
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={colorScheme === scheme}
                >
                  {scheme === "integrate" ? (
                    <svg
                      viewBox="0 0 16 16"
                      className="h-4 w-4"
                      fill="none"
                      aria-hidden="true"
                    >
                      <rect
                        x="1"
                        y="1"
                        width="4"
                        height="14"
                        rx="1"
                        className="fill-current opacity-30"
                      />
                      <rect
                        x="7"
                        y="1"
                        width="8"
                        height="14"
                        rx="1"
                        className="fill-current opacity-30"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 16 16"
                      className="h-4 w-4"
                      fill="none"
                      aria-hidden="true"
                    >
                      <rect
                        x="1"
                        y="1"
                        width="4"
                        height="14"
                        rx="1"
                        className="fill-current opacity-60"
                      />
                      <rect
                        x="7"
                        y="1"
                        width="8"
                        height="14"
                        rx="1"
                        className="fill-current opacity-20"
                      />
                    </svg>
                  )}
                  {scheme}
                </button>
              ))}
            </div>
          </div>

          {/* ── Presets ── */}
          <div className="flex flex-col gap-3">
            <SectionBadge>Presets</SectionBadge>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map(({ value, bg, accent, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPreset(value)}
                  className={cn(
                    "relative flex h-14 w-full items-end justify-start overflow-hidden rounded-lg border p-1.5 transition-all",
                    bg,
                    preset === value
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border/50 hover:border-primary/40",
                  )}
                  title={label}
                  aria-label={`${label} preset`}
                  aria-pressed={preset === value}
                >
                  {/* mini sidebar preview inside each swatch */}
                  <div className="absolute inset-0 flex">
                    <div
                      className={cn(
                        "w-2.5 h-full opacity-80 rounded-l-lg",
                        accent,
                      )}
                    />
                    <div className="flex-1 flex flex-col gap-0.5 p-1">
                      <div
                        className={cn(
                          "h-1 w-4/5 rounded-full opacity-60",
                          accent,
                        )}
                      />
                      <div className="h-1 w-3/5 rounded-full bg-white/20" />
                      <div className="h-1 w-2/5 rounded-full bg-white/20" />
                    </div>
                  </div>
                  {/* selected checkmark */}
                  {preset === value && (
                    <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/20">
                      <svg
                        viewBox="0 0 12 12"
                        className="h-2.5 w-2.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <polyline points="1.5,6 4.5,9 10.5,3" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Font ── */}
          <div className="flex flex-col gap-4">
            <SectionBadge>Font</SectionBadge>

            {/* Family — 2×2 grid matching screenshot */}
            <div className="flex flex-col gap-2">
              <SubLabel>Family</SubLabel>
              <div className="grid grid-cols-2 gap-2">
                {FONTS.map(({ value, label }) => {
                  const active = fontFamily === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFontFamily(value)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-lg border py-4 px-3 transition-all hover:border-primary/50",
                        active
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border bg-card",
                      )}
                      aria-label={`${label} font`}
                      aria-pressed={active}
                    >
                      <span
                        className={cn(
                          "text-2xl font-semibold leading-none",
                          active ? "text-foreground" : "text-muted-foreground",
                        )}
                        style={{ fontFamily: FONT_STACKS[value] }}
                      >
                        Aa
                      </span>
                      <span
                        className={cn(
                          "text-[11px] font-medium leading-none mt-1",
                          active ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size — slider with live px badge */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <SubLabel>Size</SubLabel>
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">
                  {fontSize}px
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={12}
                  max={20}
                  step={1}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  aria-label="Font size"
                  className={cn(
                    "w-full h-1.5 rounded-full appearance-none cursor-pointer",
                    "bg-muted",
                    // thumb styles
                    "[&::-webkit-slider-thumb]:appearance-none",
                    "[&::-webkit-slider-thumb]:h-4",
                    "[&::-webkit-slider-thumb]:w-4",
                    "[&::-webkit-slider-thumb]:rounded-full",
                    "[&::-webkit-slider-thumb]:bg-primary",
                    "[&::-webkit-slider-thumb]:shadow-sm",
                    "[&::-webkit-slider-thumb]:border-2",
                    "[&::-webkit-slider-thumb]:border-background",
                    "[&::-webkit-slider-thumb]:cursor-pointer",
                    // Firefox
                    "[&::-moz-range-thumb]:h-4",
                    "[&::-moz-range-thumb]:w-4",
                    "[&::-moz-range-thumb]:rounded-full",
                    "[&::-moz-range-thumb]:bg-primary",
                    "[&::-moz-range-thumb]:border-2",
                    "[&::-moz-range-thumb]:border-background",
                    "[&::-moz-range-thumb]:cursor-pointer",
                  )}
                  style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((fontSize - 12) / (20 - 12)) * 100}%, hsl(var(--muted)) ${((fontSize - 12) / (20 - 12)) * 100}%, hsl(var(--muted)) 100%)`,
                  }}
                />
              </div>
              {/* Size labels */}
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10px] text-muted-foreground">12px</span>
                <span className="text-[10px] text-muted-foreground">16px</span>
                <span className="text-[10px] text-muted-foreground">20px</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
