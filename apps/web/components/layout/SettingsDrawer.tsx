"use client";

import {
  AlignRight,
  Columns2,
  Contrast,
  Info,
  LayoutDashboard,
  Moon,
  RotateCcw,
  Settings,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useShallow } from "zustand/react/shallow";
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

const TOGGLE_ACTIVE = "border-primary/25 bg-primary/10";
const TOGGLE_INACTIVE = "border-border bg-card hover:border-border/80";

interface ToggleControlProps {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  info?: string;
  variant?: "card" | "row";
}

function ToggleControl({
  icon,
  label,
  checked,
  onCheckedChange,
  info,
  variant = "card",
}: ToggleControlProps) {
  const iconEl = (
    <span
      className={cn(
        "transition-colors",
        checked ? "text-primary" : "text-muted-foreground",
      )}
    >
      {icon}
    </span>
  );
  const switchEl = (
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={label}
    />
  );

  if (variant === "row") {
    return (
      <div
        className={cn(
          "flex items-center justify-between rounded-xl border px-3.5 py-3 transition-colors",
          checked ? TOGGLE_ACTIVE : TOGGLE_INACTIVE,
        )}
      >
        <div className="flex items-center gap-2.5">
          {iconEl}
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              checked ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {label}
          </span>
        </div>
        {switchEl}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-3 transition-colors",
        checked ? TOGGLE_ACTIVE : TOGGLE_INACTIVE,
      )}
    >
      <div className="flex items-center justify-between">
        {iconEl}
        {switchEl}
      </div>
      <div className="flex items-center gap-1">
        <span
          className={cn(
            "text-xs font-medium transition-colors",
            checked ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {label}
        </span>
        {info && (
          <button
            type="button"
            aria-label={info}
            title={info}
            className="cursor-help text-muted-foreground"
          >
            <Info className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
      {children}
    </p>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-muted-foreground/80">{children}</p>
  );
}

// ── Main component ─────────────────────────────────────────────
export function SettingsDrawer() {
  const { theme, setTheme } = useTheme();

  const {
    contrast,
    rtl,
    compact,
    navVisible,
    layout,
    colorScheme,
    preset,
    fontFamily,
    fontSize,
    setContrast,
    setRtl,
    setCompact,
    setNavVisible,
    setLayout,
    setColorScheme,
    setPreset,
    setFontFamily,
    setFontSize,
    reset,
  } = useAppSettingsStore(
    useShallow((s) => ({
      contrast: s.contrast,
      rtl: s.rtl,
      compact: s.compact,
      navVisible: s.navVisible,
      layout: s.layout,
      colorScheme: s.colorScheme,
      preset: s.preset,
      fontFamily: s.fontFamily,
      fontSize: s.fontSize,
      setContrast: s.setContrast,
      setRtl: s.setRtl,
      setCompact: s.setCompact,
      setNavVisible: s.setNavVisible,
      setLayout: s.setLayout,
      setColorScheme: s.setColorScheme,
      setPreset: s.setPreset,
      setFontFamily: s.setFontFamily,
      setFontSize: s.setFontSize,
      reset: s.reset,
    })),
  );

  const safeFontSize = fontSize > 0 ? fontSize : 16;

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
        style={{
          width: `${320 * (safeFontSize / 16)}px`,
          zoom: 16 / safeFontSize,
        }}
        className="p-0 overflow-y-auto flex flex-col gap-0 [&>button]:hidden"
      >
        {/* ── Header ── */}
        <SheetHeader className="flex flex-row items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <div className="flex flex-col gap-0.5">
            <SheetTitle className="text-base font-semibold">
              Settings
            </SheetTitle>
            <p className="text-[11px] text-muted-foreground">
              Customize your experience
            </p>
          </div>
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

        <div className="flex flex-col gap-5 p-5">
          {/* ── Mode & Contrast ── */}
          <div className="grid grid-cols-2 gap-3">
            <ToggleControl
              icon={
                theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )
              }
              label="Mode"
              checked={theme === "dark"}
              onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
            />
            <ToggleControl
              icon={<Contrast className="h-4 w-4" />}
              label="Contrast"
              checked={contrast}
              onCheckedChange={setContrast}
            />
          </div>

          {/* ── RTL & Compact ── */}
          <div className="grid grid-cols-2 gap-3">
            <ToggleControl
              icon={<AlignRight className="h-4 w-4" />}
              label="RTL"
              checked={rtl}
              onCheckedChange={setRtl}
            />
            <ToggleControl
              icon={<Columns2 className="h-4 w-4" />}
              label="Compact"
              checked={compact}
              onCheckedChange={setCompact}
              info="Reduces padding and spacing throughout the UI"
            />
          </div>

          {/* ── Navigation ── */}
          <ToggleControl
            variant="row"
            icon={<LayoutDashboard className="h-4 w-4" />}
            label="Navigation"
            checked={navVisible}
            onCheckedChange={setNavVisible}
          />

          <hr className="border-border/50" />

          {/* ── Layout ── */}
          <div className="flex flex-col gap-3">
            <SectionBadge>Layout</SectionBadge>
            <div className="grid grid-cols-3 gap-2">
              {LAYOUTS.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLayout(value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-2.5 transition-all hover:border-primary/40",
                    layout === value
                      ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                      : "border-border bg-card",
                  )}
                  aria-label={label}
                  aria-pressed={layout === value}
                >
                  <div className="h-8 w-full">{icon}</div>
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-colors",
                      layout === value
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Color Scheme ── */}
          <div className="flex flex-col gap-3">
            <SectionBadge>Color Scheme</SectionBadge>
            <div className="grid grid-cols-2 gap-2">
              {(["integrate", "apparent"] as ColorScheme[]).map((scheme) => (
                <button
                  key={scheme}
                  type="button"
                  onClick={() => setColorScheme(scheme)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 transition-all hover:border-primary/40",
                    colorScheme === scheme
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/20"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={colorScheme === scheme}
                >
                  {scheme === "integrate" ? (
                    <svg
                      viewBox="0 0 16 16"
                      className="h-5 w-5"
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
                      className="h-5 w-5"
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
                  <span className="text-[11px] font-medium capitalize">
                    {scheme}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-border/50" />

          {/* ── Presets ── */}
          <div className="flex flex-col gap-3">
            <SectionBadge>Presets</SectionBadge>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map(({ value, bg, accent, label }) => (
                <div key={value} className="flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreset(value)}
                    className={cn(
                      "relative flex h-14 w-full overflow-hidden rounded-xl border p-1.5 transition-all hover:scale-[1.04]",
                      bg,
                      preset === value
                        ? "border-primary/50 ring-2 ring-primary/40 shadow-lg shadow-primary/10"
                        : "border-transparent hover:border-primary/30",
                    )}
                    aria-label={`${label} preset`}
                    aria-pressed={preset === value}
                  >
                    <div className="absolute inset-0 flex">
                      <div
                        className={cn(
                          "w-2.5 h-full opacity-80 rounded-l-xl",
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
                    {preset === value && (
                      <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/30 backdrop-blur-sm">
                        <svg
                          viewBox="0 0 12 12"
                          className="h-2.5 w-2.5 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          aria-hidden="true"
                        >
                          <polyline points="1.5,6 4.5,9 10.5,3" />
                        </svg>
                      </div>
                    )}
                  </button>
                  <span
                    className={cn(
                      "text-[10px] font-medium leading-none transition-colors",
                      preset === value
                        ? "text-foreground"
                        : "text-muted-foreground/70",
                    )}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-border/50" />

          {/* ── Font ── */}
          <div className="flex flex-col gap-4">
            <SectionBadge>Font</SectionBadge>

            {/* Family */}
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
                        "flex flex-col items-center gap-1 rounded-xl border py-4 px-3 transition-all hover:border-primary/40",
                        active
                          ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                          : "border-border bg-card",
                      )}
                      aria-label={`${label} font`}
                      aria-pressed={active}
                    >
                      <span
                        className={cn(
                          "text-3xl font-bold leading-none transition-colors",
                          active ? "text-primary" : "text-muted-foreground",
                        )}
                        style={{ fontFamily: FONT_STACKS[value] }}
                      >
                        Aa
                      </span>
                      <span
                        className={cn(
                          "text-[11px] font-medium leading-none mt-1 transition-colors",
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

            {/* Size */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <SubLabel>Size</SubLabel>
                <span className="rounded-lg border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
                  {fontSize}px
                </span>
              </div>
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
                  "[&::-webkit-slider-thumb]:appearance-none",
                  "[&::-webkit-slider-thumb]:h-4",
                  "[&::-webkit-slider-thumb]:w-4",
                  "[&::-webkit-slider-thumb]:rounded-full",
                  "[&::-webkit-slider-thumb]:bg-primary",
                  "[&::-webkit-slider-thumb]:shadow-sm",
                  "[&::-webkit-slider-thumb]:border-2",
                  "[&::-webkit-slider-thumb]:border-background",
                  "[&::-webkit-slider-thumb]:cursor-pointer",
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
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10px] text-muted-foreground/60">
                  12px
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  16px
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  20px
                </span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
