"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import {
  VACCINATION_STATUS_COLOR,
  VACCINATION_STATUS_LABEL,
  type Vaccination,
} from "@/lib/api/vaccinations";
import { formatShortDate } from "@/lib/format";

interface VaccinationCardProps {
  vaccination: Vaccination;
  petName?: string;
  onClick?: () => void;
}

export function VaccinationCard({
  vaccination,
  petName,
  onClick,
}: VaccinationCardProps) {
  const { vaccineName, administeredDate, nextDueDate, vetName, status } =
    vaccination.attributes;

  return (
    <Card
      variant="outlined"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={1}
          >
            <Typography variant="body1" fontWeight={700} noWrap sx={{ mr: 1 }}>
              {vaccineName}
            </Typography>
            {status && (
              <Chip
                label={VACCINATION_STATUS_LABEL[status]}
                color={VACCINATION_STATUS_COLOR[status]}
                size="small"
                variant="filled"
                sx={{ flexShrink: 0 }}
              />
            )}
          </Box>

          {petName && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mb={1}
            >
              {petName}
            </Typography>
          )}

          <Box display="flex" flexDirection="column" gap={0.5}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Administered
              </Typography>
              <Typography variant="caption">
                {formatShortDate(administeredDate)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Next due
              </Typography>
              <Typography
                variant="caption"
                color={
                  status === "overdue"
                    ? "error.main"
                    : status === "due_soon"
                      ? "warning.main"
                      : "text.primary"
                }
              >
                {formatShortDate(nextDueDate)}
              </Typography>
            </Box>
          </Box>

          {vetName && (
            <Typography
              variant="caption"
              color="text.disabled"
              display="block"
              mt={1}
            >
              Dr. {vetName}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
