"use client";

import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import NextLink from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalendarEvents } from "@/hooks/api/useCalendar";
import type { CalendarEvent, CalendarEventType } from "@/lib/api/calendar";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_EVENTS = 2;

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type DisplayType = "vet" | "vaccine" | "medication" | "stock";

const TYPE_MAP: Record<CalendarEventType, DisplayType> = {
  vet_visit: "vet",
  vaccination: "vaccine",
  medication: "medication",
  stock_alert: "stock",
  reminder: "medication",
  follow_up: "vet",
};

const TYPE_CONFIG: Record<
  DisplayType,
  { label: string; color: string; displayName: string }
> = {
  vet: { label: "Vet Visit", color: "bg-primary", displayName: "Vet Visit" },
  vaccine: {
    label: "Vaccination",
    color: "bg-destructive",
    displayName: "Vaccination",
  },
  medication: {
    label: "Medication",
    color: "bg-warning",
    displayName: "Medication",
  },
  stock: {
    label: "Stock Alert",
    color: "bg-orange-500",
    displayName: "Stock Alert",
  },
};

function getRange(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  return {
    start: first.toISOString().slice(0, 10),
    end: last.toISOString().slice(0, 10),
  };
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [selectedDay, setSelectedDay] = useState<{
    label: string;
    events: CalendarEvent[];
  } | null>(null);

  const range = getRange(year, month);
  const { data: events = [], isLoading } = useCalendarEvents(range);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const todayDay =
    now.getFullYear() === year && now.getMonth() === month ? now.getDate() : -1;

  // Group events by day number (parse date string directly to avoid TZ issues)
  const eventsByDay = new Map<number, CalendarEvent[]>();
  for (const event of events) {
    const dayNum = parseInt(event.start.split("-")[2], 10);
    const existing = eventsByDay.get(dayNum);
    if (existing) {
      existing.push(event);
    } else {
      eventsByDay.set(dayNum, [event]);
    }
  }

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  };

  // Build calendar cells
  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<div key={`e${i}`} className="h-24 md:h-28" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayEvents = eventsByDay.get(d) ?? [];
    const isToday = d === todayDay;
    const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
    const hiddenCount = dayEvents.length - MAX_VISIBLE_EVENTS;

    cells.push(
      <div
        key={d}
        className={cn(
          "h-24 md:h-28 rounded-lg border border-border p-1.5 text-xs transition-colors hover:border-primary/30",
          isToday && "border-primary/50 bg-primary/5",
        )}
      >
        <span
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
            isToday && "bg-primary text-primary-foreground",
          )}
        >
          {d}
        </span>
        <div className="mt-0.5 space-y-0.5">
          {visibleEvents.map((ev) => {
            const displayType = TYPE_MAP[ev.type] ?? "vet";
            return (
              <button
                key={ev.id}
                type="button"
                onClick={() => setSelectedEvent(ev)}
                className={cn(
                  "w-full truncate rounded px-1 py-0.5 text-[10px] font-medium text-primary-foreground",
                  TYPE_CONFIG[displayType].color,
                )}
              >
                {ev.title}
              </button>
            );
          })}
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() =>
                setSelectedDay({
                  label: `${MONTH_NAMES[month]} ${d}, ${year}`,
                  events: dayEvents,
                })
              }
              className="w-full truncate rounded px-1 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              +{hiddenCount} more
            </button>
          )}
        </div>
      </div>,
    );
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={prevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[130px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday}>
            Today
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground animate-fade-in-up">
        {(
          Object.entries(TYPE_CONFIG) as [
            DisplayType,
            (typeof TYPE_CONFIG)[DisplayType],
          ][]
        ).map(([, cfg]) => (
          <span key={cfg.label} className="flex items-center gap-1.5">
            <span
              className={cn("inline-block h-2.5 w-2.5 rounded-sm", cfg.color)}
            />
            {cfg.label}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div
        className="animate-fade-in-up relative"
        style={{ animationDelay: "100ms" }}
      >
        <div className="grid grid-cols-7 gap-px mb-px">
          {DAYS.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {isLoading
            ? [
                ...Array.from({ length: firstDayOfWeek }, (_, i) => (
                  <div
                    key={`empty-${i}-${month}-${year}`}
                    className="h-24 md:h-28"
                  />
                )),
                ...Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  return (
                    <div
                      key={`skel-${day}-${month}-${year}`}
                      className="h-24 md:h-28 rounded-lg border border-border p-1.5"
                    >
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <div className="mt-1.5 space-y-1">
                        <Skeleton className="h-3 w-full rounded" />
                      </div>
                    </div>
                  );
                }),
              ]
            : cells}
        </div>
      </div>

      {/* Event detail dialog */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={(o) => !o && setSelectedEvent(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-2 text-sm">
              {selectedEvent.petName && (
                <p>
                  <span className="text-muted-foreground">Pet:</span>{" "}
                  {selectedEvent.petName}
                </p>
              )}
              <p>
                <span className="text-muted-foreground">Type:</span>{" "}
                {TYPE_CONFIG[TYPE_MAP[selectedEvent.type] ?? "vet"].displayName}
              </p>
              <p>
                <span className="text-muted-foreground">Date:</span>{" "}
                {new Date(`${selectedEvent.start}T00:00:00`).toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  },
                )}
              </p>
              {selectedEvent.url && (
                <NextLink
                  href={selectedEvent.url}
                  onClick={() => setSelectedEvent(null)}
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  View record
                </NextLink>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Day overflow dialog */}
      <Dialog
        open={!!selectedDay}
        onOpenChange={(o) => !o && setSelectedDay(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{selectedDay?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            {selectedDay?.events.map((ev) => {
              const displayType = TYPE_MAP[ev.type] ?? "vet";
              const cfg = TYPE_CONFIG[displayType];
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => {
                    setSelectedDay(null);
                    setSelectedEvent(ev);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                >
                  <span
                    className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", cfg.color)}
                  />
                  <span className="flex-1 truncate font-medium">
                    {ev.title}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {cfg.label}
                  </span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
