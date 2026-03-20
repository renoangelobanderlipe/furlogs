import { createTheme } from "@mui/material/styles";
import { components } from "./components";
import { darkPalette, lightPalette } from "./palette";
import { typography } from "./typography";

export const darkTheme = createTheme({
  cssVariables: true,
  palette: darkPalette,
  typography,
  components,
  shape: {
    borderRadius: 8,
  },
});

export const lightTheme = createTheme({
  cssVariables: true,
  palette: lightPalette,
  typography,
  components,
  shape: {
    borderRadius: 8,
  },
});
