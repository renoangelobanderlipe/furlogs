import type { Components, Theme } from "@mui/material/styles";

export const components: Components<Theme> = {
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 12,
        border: `1px solid ${theme.palette.divider}`,
        backgroundImage: "none",
      }),
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        "&:last-child": {
          paddingBottom: 16,
        },
      },
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: "none",
        fontWeight: 500,
      },
      sizeLarge: {
        padding: "10px 24px",
        fontSize: "1rem",
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: "outlined",
    },
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: 8,
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  MuiTable: {
    styleOverrides: {
      root: {
        borderCollapse: "collapse",
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderBottom: `1px solid ${theme.palette.divider}`,
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
      }),
      head: ({ theme }) => ({
        fontWeight: 600,
        color: theme.palette.text.secondary,
        fontSize: "0.75rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }),
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 4,
      },
    },
  },
  MuiSkeleton: {
    defaultProps: {
      animation: "wave",
    },
  },
};
