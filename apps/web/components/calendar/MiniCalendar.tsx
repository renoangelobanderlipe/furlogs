"use client";

import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCalendarEvents } from "@/hooks/api/useCalendar";
import type { CalendarEvent } from "@/lib/api/calendar";

type DateRange = { start: string; end: string };

function getInitialRange(): DateRange {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: firstDay.toISOString().slice(0, 10),
    end: lastDay.toISOString().slice(0, 10),
  };
}

const EVENT_TYPE_COLORS: Record<CalendarEvent["type"], string> = {
  vet_visit: "#2196f3",
  vaccination: "#f44336",
  medication: "#ff9800",
  stock_alert: "#ff5722",
};

const LEGEND_ITEMS: { type: CalendarEvent["type"]; label: string }[] = [
  { type: "vet_visit", label: "Vet Visit" },
  { type: "vaccination", label: "Vaccination" },
  { type: "medication", label: "Medication" },
  { type: "stock_alert", label: "Stock Alert" },
];

export function MiniCalendar() {
  const theme = useTheme();
  const router = useRouter();
  const [range, setRange] = useState<DateRange>(getInitialRange);

  const { data: events = [], isLoading } = useCalendarEvents(range);

  const fcEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    backgroundColor: e.color,
    borderColor: e.color,
    extendedProps: { url: e.url, type: e.type },
  }));

  return (
    <Box>
      <Box
        sx={{
          position: "relative",
          "& .fc": {
            color: theme.palette.text.primary,
            fontFamily: theme.typography.fontFamily,
            fontSize: "0.8rem",
          },
          "& .fc-theme-standard td": {
            borderColor: theme.palette.divider,
          },
          "& .fc-theme-standard th": {
            borderColor: theme.palette.divider,
          },
          "& .fc-theme-standard .fc-scrollgrid": {
            borderColor: theme.palette.divider,
          },
          "& .fc-col-header-cell": {
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.secondary,
          },
          "& .fc-col-header-cell-cushion": {
            color: theme.palette.text.secondary,
            textDecoration: "none",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          },
          "& .fc-daygrid-day": {
            bgcolor: theme.palette.background.paper,
          },
          "& .fc-day-today": {
            bgcolor: `${theme.palette.primary.main}18 !important`,
          },
          "& .fc-daygrid-day-number": {
            color: theme.palette.text.primary,
            textDecoration: "none",
            fontSize: "0.75rem",
            padding: "2px 4px",
          },
          "& .fc-toolbar-title": {
            color: theme.palette.text.primary,
            fontSize: "0.875rem !important",
            fontWeight: 600,
          },
          "& .fc-button-primary": {
            bgcolor: `${theme.palette.primary.main} !important`,
            borderColor: `${theme.palette.primary.main} !important`,
            color: `${theme.palette.primary.contrastText} !important`,
            fontSize: "0.7rem",
            padding: "2px 6px",
            "&:hover": {
              bgcolor: `${theme.palette.primary.dark} !important`,
            },
          },
          "& .fc-event": {
            cursor: "pointer",
            borderRadius: "3px",
            fontSize: "0.65rem",
          },
          "& .fc-toolbar": {
            mb: "4px !important",
          },
          "& .fc-daygrid-dot-event": {
            padding: "1px 2px",
          },
          "& .fc-daygrid-event-dot": {
            borderWidth: "4px",
          },
        }}
      >
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 10,
            }}
          >
            <CircularProgress size={14} />
          </Box>
        )}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: "prev", center: "title", right: "next" }}
          height={300}
          events={fcEvents}
          eventDisplay="list-item"
          datesSet={(info) => {
            setRange({
              start: info.startStr.slice(0, 10),
              end: info.endStr.slice(0, 10),
            });
          }}
          eventClick={(info) => {
            info.jsEvent.preventDefault();
            const url = info.event.extendedProps.url as string | undefined;
            if (url) {
              router.push(url);
            }
          }}
          dateClick={(info) => {
            router.push(`/calendar?date=${info.dateStr}`);
          }}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          mt: 1.5,
        }}
      >
        {LEGEND_ITEMS.map((item) => (
          <Box
            key={item.type}
            sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: EVENT_TYPE_COLORS[item.type],
                flexShrink: 0,
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={500}
              lineHeight={1}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
