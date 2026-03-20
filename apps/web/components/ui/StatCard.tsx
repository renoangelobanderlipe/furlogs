"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { alpha, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

type StatStatus = "default" | "warning" | "error" | "success" | "info";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  status?: StatStatus;
}

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  status = "default",
}: StatCardProps) {
  const theme = useTheme();

  const paletteColorMap: Record<StatStatus, string> = {
    default: theme.palette.primary.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    success: theme.palette.success.main,
    info: theme.palette.info.main,
  };

  const iconColor = paletteColorMap[status];

  return (
    <Card
      variant="outlined"
      sx={{
        ...(status === "error" && {
          borderColor: alpha(theme.palette.error.main, 0.5),
        }),
        ...(status === "warning" && {
          borderColor: alpha(theme.palette.warning.main, 0.4),
        }),
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box
          display="flex"
          alignItems="flex-start"
          justifyContent="space-between"
          gap={1}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              textTransform="uppercase"
              letterSpacing={0.8}
              fontWeight={500}
              mb={0.5}
            >
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={700} lineHeight={1.1}>
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={0.5}
                noWrap
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(iconColor, 0.12),
                color: iconColor,
                flexShrink: 0,
                "& svg": { fontSize: 20 },
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
