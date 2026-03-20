import type { PaletteOptions } from "@mui/material/styles";

export const darkPalette: PaletteOptions = {
  mode: "dark",
  primary: {
    main: "#7C8AFF",
    light: "#A5AFFF",
    dark: "#5362E0",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#FFB74D",
    light: "#FFD080",
    dark: "#F57C00",
    contrastText: "#000000",
  },
  background: {
    default: "#0F1117",
    paper: "#1A1D27",
  },
  text: {
    primary: "#EAEAF0",
    secondary: "#9B9BB4",
    disabled: "#5A5A72",
  },
  error: {
    main: "#FF5C7A",
    light: "#FF8FA3",
    dark: "#C62F4D",
  },
  warning: {
    main: "#FFB74D",
    light: "#FFD080",
    dark: "#F57C00",
  },
  success: {
    main: "#66BB6A",
    light: "#98EE99",
    dark: "#338A3E",
  },
  info: {
    main: "#42A5F5",
    light: "#80D6FF",
    dark: "#0077C2",
  },
  divider: "rgba(255,255,255,0.08)",
};

export const lightPalette: PaletteOptions = {
  mode: "light",
  primary: {
    main: "#7C8AFF",
    light: "#A5AFFF",
    dark: "#5362E0",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#FFB74D",
    light: "#FFD080",
    dark: "#F57C00",
    contrastText: "#000000",
  },
  background: {
    default: "#F4F5FB",
    paper: "#FFFFFF",
  },
  text: {
    primary: "#1A1D27",
    secondary: "#555672",
    disabled: "#9B9BB4",
  },
  error: {
    main: "#E03158",
    light: "#FF5C7A",
    dark: "#A0002E",
  },
  warning: {
    main: "#F57C00",
    light: "#FFB74D",
    dark: "#BB4D00",
  },
  success: {
    main: "#338A3E",
    light: "#66BB6A",
    dark: "#1B5E20",
  },
  info: {
    main: "#0077C2",
    light: "#42A5F5",
    dark: "#004B8D",
  },
  divider: "rgba(0,0,0,0.08)",
};
