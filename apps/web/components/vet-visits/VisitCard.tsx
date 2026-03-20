"use client";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import {
  VISIT_TYPE_COLOR,
  VISIT_TYPE_LABEL,
  type VetVisit,
} from "@/lib/api/vet-visits";
import { formatShortDate } from "@/lib/format";

interface VisitCardProps {
  visit: VetVisit;
  onClick?: () => void;
  selected?: boolean;
  onToggleSelect?: (id: number) => void;
  selectable?: boolean;
}

function formatCost(cost: string | null): string | null {
  if (!cost) return null;
  const num = Number.parseFloat(cost);
  if (Number.isNaN(num)) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function VisitCard({
  visit,
  onClick,
  selected = false,
  selectable = false,
  onToggleSelect,
}: VisitCardProps) {
  const { visitType, visitDate, reason, cost, attachmentCount } =
    visit.attributes;
  const formattedCost = formatCost(cost);

  const handleClick = () => {
    if (selectable && onToggleSelect) {
      onToggleSelect(visit.id);
    } else {
      onClick?.();
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        outline: selected ? "2px solid" : "none",
        outlineColor: selected ? "primary.main" : "transparent",
      }}
    >
      <CardActionArea
        onClick={handleClick}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <CardContent sx={{ flexGrow: 1, pb: 1.5 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={1}
          >
            <Chip
              label={VISIT_TYPE_LABEL[visitType]}
              color={VISIT_TYPE_COLOR[visitType]}
              size="small"
              variant="filled"
            />
            <Typography variant="caption" color="text.secondary">
              {formatShortDate(visitDate)}
            </Typography>
          </Box>

          <Typography
            variant="body1"
            fontWeight={600}
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mb: 1,
              lineHeight: 1.4,
            }}
          >
            {reason}
          </Typography>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mt="auto"
          >
            <Box display="flex" alignItems="center" gap={0.5}>
              <LocalHospitalIcon
                sx={{ fontSize: 14, color: "text.disabled" }}
              />
              <Typography variant="caption" color="text.secondary">
                {visit.attributes.vetName ?? "Vet visit"}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              {formattedCost && (
                <Typography variant="caption" color="text.secondary">
                  {formattedCost}
                </Typography>
              )}
              {attachmentCount > 0 && (
                <Box display="flex" alignItems="center" gap={0.25}>
                  <AttachFileIcon
                    sx={{ fontSize: 12, color: "text.disabled" }}
                  />
                  <Typography variant="caption" color="text.disabled">
                    {attachmentCount}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
