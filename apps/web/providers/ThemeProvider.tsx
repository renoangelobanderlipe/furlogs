"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
  systemTheme?: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  resolvedTheme: "dark",
  systemTheme: undefined,
});

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  /** Accepted for API compat with next-themes; only "class" is applied. */
  attribute?: string;
  enableSystem?: boolean;
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  enableSystem = false,
}: ThemeProviderProps) {
  const [theme, setThemeRaw] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    try {
      return (localStorage.getItem("theme") as Theme) ?? defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? getSystemTheme() : theme;

  // Sync resolved theme to <html> class without a script tag
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = (next: Theme) => {
    setThemeRaw(next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme,
        systemTheme: enableSystem ? getSystemTheme() : undefined,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
