"use client";

import { useCalendarEvents } from "@/hooks/api/useCalendar";
import type { CalendarEvent } from "@/lib/api/calendar";
import { cn } from "@/lib/utils";

const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const EVENT_TYPE_COLOR: Record<CalendarEvent["type"], string> = {
  vet_visit: "bg-primary",
  vaccination: "bg-destructive",
  medication: "bg-warning",
  stock_alert: "bg-warning",
  reminder: "bg-warning",
  follow_up: "bg-primary",
};

const LEGEND = [
  { label: "Vet", color: "bg-primary" },
  { label: "Vaccine", color: "bg-destructive" },
  { label: "Meds", color: "bg-warning" },
] as const;

function getMonthRange(year: number, month: number) {
  const start = new Date(year, month, 1).toISOString().slice(0, 10);
  const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);
  return { start, end };
}

export const MiniCalendar = () => {
  const today = new Date();
  const viewYear = today.getFullYear();
  const viewMonth = today.getMonth();

  const { start, end } = getMonthRange(viewYear, viewMonth);
  const { data: events = [] } = useCalendarEvents({ start, end });

  // Build a map of day → first event color (one dot per day)
  const eventColorByDay = new Map<number, string>();
  for (const e of events) {
    const d = new Date(e.start);
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
      const day = d.getDate();
      if (!eventColorByDay.has(day)) {
        eventColorByDay.set(day, EVENT_TYPE_COLOR[e.type] ?? "bg-primary");
      }
    }
  }

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayDay = today.getDate();

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<div key={`empty-${i}`} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === todayDay;
    const dotColor = eventColorByDay.get(d);
    cells.push(
      <div
        key={d}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium relative cursor-pointer transition-colors hover:bg-accent",
          isToday && "bg-primary text-primary-foreground",
        )}
      >
        {d}
        {dotColor && !isToday && (
          <span
            className={cn("absolute bottom-0.5 h-1 w-1 rounded-full", dotColor)}
          />
        )}
      </div>,
    );
  }

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="flex h-8 w-8 items-center justify-center text-[10px] text-muted-foreground font-medium"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">{cells}</div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
        {LEGEND.map((item) => (
          <span key={item.label} className="flex items-center gap-1">
            <span className={cn("h-1.5 w-1.5 rounded-full", item.color)} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};
