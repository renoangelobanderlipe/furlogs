import type { ThemeOptions } from "@mui/material/styles";

type TypographyOptions = NonNullable<ThemeOptions["typography"]>;

export const typography: TypographyOptions = {
  fontFamily: "var(--font-roboto), system-ui, sans-serif",
  h1: {
    fontSize: "2.25rem",
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
  },
  h2: {
    fontSize: "1.875rem",
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: "-0.015em",
  },
  h3: {
    fontSize: "1.5rem",
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: "-0.01em",
  },
  h4: {
    fontSize: "1.25rem",
    fontWeight: 600,
    lineHeight: 1.35,
  },
  h5: {
    fontSize: "1.125rem",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: "1rem",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body1: {
    fontSize: "0.9375rem",
    lineHeight: 1.6,
  },
  body2: {
    fontSize: "0.875rem",
    lineHeight: 1.57,
  },
  caption: {
    fontSize: "0.75rem",
    lineHeight: 1.5,
    letterSpacing: "0.01em",
  },
  button: {
    fontSize: "0.9375rem",
    fontWeight: 500,
    letterSpacing: "0.01em",
  },
};
