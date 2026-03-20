"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import { VISIT_TYPE_LABEL, type VetVisit, type VetVisitType } from "@/lib/api/vet-visits";

interface VisitTimelineProps {
  visits: VetVisit[];
  onSelectVisit: (visit: VetVisit) => void;
}

// Palette-path colors for inline sx usage (different from MUI Chip color prop)
const VISIT_TYPE_PALETTE_COLOR: Record<VetVisitType, string> = {
  checkup: "info.main",
  treatment: "warning.main",
  vaccine: "success.main",
  emergency: "error.main",
};

function getMonthYear(dateStr: string): string {
  const [year, month] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatDayMonth(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupByMonth(visits: VetVisit[]): Map<string, VetVisit[]> {
  const sorted = [...visits].sort(
    (a, b) =>
      new Date(b.attributes.visitDate).getTime() -
      new Date(a.attributes.visitDate).getTime(),
  );
  const groups = new Map<string, VetVisit[]>();
  for (const visit of sorted) {
    const key = getMonthYear(visit.attributes.visitDate);
    const existing = groups.get(key);
    if (existing) {
      existing.push(visit);
    } else {
      groups.set(key, [visit]);
    }
  }
  return groups;
}

export function VisitTimeline({ visits, onSelectVisit }: VisitTimelineProps) {
  const groups = useMemo(() => groupByMonth(visits), [visits]);

  return (
    <Box>
      {Array.from(groups.entries()).map(([monthYear, monthVisits]) => (
        <Box key={monthYear} mb={3}>
          <Typography
            variant="overline"
            color="text.secondary"
            fontWeight={700}
            letterSpacing={1}
          >
            {monthYear}
          </Typography>
          <Divider sx={{ mb: 2, mt: 0.5 }} />

          <Box display="flex" flexDirection="column" gap={0}>
            {monthVisits.map((visit, index) => (
              <Box key={visit.id} display="flex" alignItems="stretch">
                {/* Timeline column */}
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  mr={2}
                  sx={{ width: 20, flexShrink: 0 }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: VISIT_TYPE_PALETTE_COLOR[visit.attributes.visitType],
                      flexShrink: 0,
                      mt: 0.75,
                      border: "2px solid",
                      borderColor: "background.paper",
                      boxShadow: "0 0 0 2px",
                      boxShadowColor:
                        VISIT_TYPE_PALETTE_COLOR[visit.attributes.visitType],
                    }}
                  />
                  {index < monthVisits.length - 1 && (
                    <Box
                      sx={{
                        width: 2,
                        flexGrow: 1,
                        bgcolor: "divider",
                        my: 0.5,
                        minHeight: 16,
                      }}
                    />
                  )}
                </Box>

                {/* Content */}
                <Box
                  component="button"
                  type="button"
                  onClick={() => onSelectVisit(visit)}
                  sx={{
                    flexGrow: 1,
                    mb: index < monthVisits.length - 1 ? 1.5 : 0,
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    cursor: "pointer",
                    background: "none",
                    bgcolor: "transparent",
                    textAlign: "left",
                    width: "100%",
                    transition: "background-color 0.15s",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={0.5}
                  >
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {visit.attributes.reason}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ flexShrink: 0, ml: 1 }}
                    >
                      {formatDayMonth(visit.attributes.visitDate)}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={VISIT_TYPE_LABEL[visit.attributes.visitType]}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 18,
                        fontSize: 10,
                        color: VISIT_TYPE_PALETTE_COLOR[visit.attributes.visitType],
                        borderColor:
                          VISIT_TYPE_PALETTE_COLOR[visit.attributes.visitType],
                      }}
                    />
                    {visit.attributes.vetName && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        {visit.attributes.vetName}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
