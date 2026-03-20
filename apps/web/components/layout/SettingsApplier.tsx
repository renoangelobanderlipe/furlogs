"use client";

import { useEffect } from "react";
import { FONT_STACKS, useAppSettingsStore } from "@/stores/useAppSettingsStore";

export function SettingsApplier() {
  const contrast = useAppSettingsStore((s) => s.contrast);
  const rtl = useAppSettingsStore((s) => s.rtl);
  const compact = useAppSettingsStore((s) => s.compact);
  const layout = useAppSettingsStore((s) => s.layout);
  const preset = useAppSettingsStore((s) => s.preset);
  const fontFamily = useAppSettingsStore((s) => s.fontFamily);
  const fontSize = useAppSettingsStore((s) => s.fontSize);
  const colorScheme = useAppSettingsStore((s) => s.colorScheme);

  useEffect(() => {
    const html = document.documentElement;

    // Direction
    html.dir = rtl ? "rtl" : "ltr";

    // Color preset
    html.setAttribute("data-preset", preset);

    // Color scheme (integrate vs apparent sidebar)
    html.setAttribute("data-color-scheme", colorScheme);

    // Layout mode
    html.setAttribute("data-layout", layout);

    // High contrast
    if (contrast) {
      html.setAttribute("data-contrast", "high");
    } else {
      html.removeAttribute("data-contrast");
    }

    // Compact density
    if (compact) {
      html.setAttribute("data-compact", "true");
    } else {
      html.removeAttribute("data-compact");
    }

    // Font family
    document.body.style.fontFamily =
      FONT_STACKS[fontFamily] ?? FONT_STACKS["public-sans"];

    // Font size — sets the root rem base, scales entire UI
    html.style.fontSize = `${fontSize}px`;
  }, [
    contrast,
    rtl,
    compact,
    layout,
    preset,
    fontFamily,
    fontSize,
    colorScheme,
  ]);

  return null;
}
