import type { ReactNode } from "react";

/* ── Rich mock UIs ───────────────────────────────────────── */

function HouseholdVisual() {
  const members = [
    {
      initials: "SR",
      name: "Sarah R.",
      role: "Owner",
      status: "online",
      bg: "bg-primary/20",
      text: "text-primary",
      badge: "border-primary/25 bg-primary/10 text-primary",
    },
    {
      initials: "JR",
      name: "James R.",
      role: "Caretaker",
      status: "online",
      bg: "bg-success/20",
      text: "text-success",
      badge: "border-success/25 bg-success/10 text-success",
    },
    {
      initials: "MT",
      name: "Maya T.",
      role: "Viewer",
      status: "away",
      bg: "bg-warning/20",
      text: "text-warning",
      badge: "border-warning/25 bg-warning/10 text-warning",
    },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Household Members
        </p>
        <span className="text-[10px] rounded-full border border-success/25 bg-success/10 text-success px-2 py-0.5 font-semibold">
          3 active
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {members.map((m) => (
          <div
            key={m.initials}
            className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
          >
            <div className="relative shrink-0">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ${m.bg} ${m.text}`}
              >
                {m.initials}
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${m.status === "online" ? "bg-success" : "bg-muted"}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">{m.name}</p>
            </div>
            <span
              className={`text-[10px] rounded-full border px-2 py-0.5 font-semibold shrink-0 ${m.badge}`}
            >
              {m.role}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl border border-dashed border-white/[0.08] px-3 py-2 flex items-center gap-2">
        <div className="h-8 w-8 rounded-full border border-dashed border-white/20 flex items-center justify-center shrink-0">
          <span className="text-muted-foreground text-lg leading-none">+</span>
        </div>
        <span className="text-xs text-muted-foreground">
          Invite a family member...
        </span>
      </div>
    </div>
  );
}

function SpendingVisual() {
  const bars = [
    { month: "Oct", vet: 42, food: 58 },
    { month: "Nov", vet: 68, food: 52 },
    { month: "Dec", vet: 28, food: 62 },
    { month: "Jan", vet: 88, food: 72 },
    { month: "Feb", vet: 52, food: 60 },
    { month: "Mar", vet: 65, food: 74 },
  ];
  const total = 1847;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-5 shadow-xl">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
            Total Spending
          </p>
          <p
            className="text-2xl font-black"
            style={{
              background:
                "linear-gradient(135deg, hsl(174 80% 58%), hsl(174 80% 40%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ${total.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary inline-block" />
            Vet
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary/30 inline-block" />
            Food
          </span>
        </div>
      </div>
      <p className="text-[11px] text-success font-semibold mb-4">
        ↓ 12% vs last year
      </p>
      <div className="flex items-end gap-1.5 h-24">
        {bars.map((bar) => (
          <div
            key={bar.month}
            className="flex-1 flex flex-col items-center gap-0.5"
          >
            <div className="w-full flex flex-col-reverse gap-px">
              <div
                className="w-full rounded-b-sm bg-primary/25"
                style={{ height: `${bar.food * 0.26}px` }}
              />
              <div
                className="w-full rounded-t-sm bg-primary"
                style={{ height: `${bar.vet * 0.26}px` }}
              />
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">
              {bar.month}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarVisual() {
  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  // March 2026 starts on Sunday
  const dates = Array.from({ length: 35 }, (_, i) => {
    const d = i - 0; // Sunday offset = 0 for March 2026
    return d >= 0 && d < 31 ? d + 1 : null;
  });

  const events: Record<number, { color: string; label: string }> = {
    5: { color: "bg-primary", label: "Vet" },
    12: { color: "bg-success", label: "Vacc" },
    18: { color: "bg-warning", label: "Med" },
    24: { color: "bg-primary", label: "Vet" },
    28: { color: "bg-destructive", label: "Due" },
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold">March 2026</p>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Vet
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Vaccine
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" />
            Meds
          </span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {dayLabels.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] text-muted-foreground font-semibold pb-1.5"
          >
            {d}
          </div>
        ))}
        {dates.map((date, i) => {
          const event = date ? events[date] : null;
          const isToday = date === 22;
          const cellKey = date != null ? `d${date}` : `empty-${i}`;
          return (
            <div
              key={cellKey}
              className={`relative flex flex-col items-center py-1 rounded-lg ${isToday ? "bg-primary/15" : ""}`}
            >
              {date && (
                <>
                  <span
                    className={`text-[11px] leading-none ${isToday ? "text-primary font-bold" : "text-foreground/70"}`}
                  >
                    {date}
                  </span>
                  {event && (
                    <span
                      className={`h-1 w-1 rounded-full mt-0.5 ${event.color}`}
                    />
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Deep-dive row ───────────────────────────────────────── */

interface DeepDiveRowProps {
  label: string;
  heading: string;
  headingAccent: string;
  description: string;
  bullets: string[];
  visual: ReactNode;
  reverse?: boolean;
}

function DeepDiveRow({
  label,
  heading,
  headingAccent,
  description,
  bullets,
  visual,
  reverse = false,
}: DeepDiveRowProps) => {
  return (
    <div
      className={`grid md:grid-cols-2 gap-12 lg:gap-16 items-center ${
        reverse ? "md:[&>*:first-child]:order-last" : ""
      }`}
    >
      {/* Text */}
      <div className="flex flex-col gap-5">
        <p className="text-xs font-bold text-primary uppercase tracking-[0.18em]">
          {label}
        </p>
        <h3 className="text-2xl md:text-[1.9rem] font-bold leading-tight tracking-tight">
          {heading}{" "}
          <span className="text-muted-foreground font-normal">
            {headingAccent}
          </span>
        </h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
        <ul className="flex flex-col gap-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm">
              <div className="h-5 w-5 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 mt-px">
                <svg
                  width="8"
                  height="6"
                  viewBox="0 0 8 6"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 3L3 5L7 1"
                    stroke="hsl(174 80% 50%)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-foreground/80">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Visual */}
      <div>{visual}</div>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────── */

export const FeatureDeepDiveSection = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-24 md:gap-32">
          <DeepDiveRow
            label="Household"
            heading="One household,"
            headingAccent="every pet cared for"
            description="Invite your whole family in seconds. Assign roles — Caretaker or Viewer — and everyone sees the same up-to-date pet data in real time."
            bullets={[
              "Role-based access: Owner, Caretaker, Viewer",
              "All updates sync instantly across devices",
              "No more 'did you give Max his meds?' texts",
            ]}
            visual={<HouseholdVisual />}
          />
          <DeepDiveRow
            label="Spending"
            heading="Know exactly"
            headingAccent="what your pets cost"
            description="Monthly and yearly spending breakdowns by category and per pet. Spot trends before they surprise your budget."
            bullets={[
              "Vet visits vs food — category breakdown",
              "Per-pet spending analysis",
              "Month-over-month trend tracking",
            ]}
            visual={<SpendingVisual />}
            reverse
          />
          <DeepDiveRow
            label="Calendar"
            heading="A unified view"
            headingAccent="of every care event"
            description="One calendar showing vaccinations, vet appointments, medication schedules, and shared reminders across all your pets."
            bullets={[
              "Vet visits, vaccines, and medications together",
              "Reminder events with urgency levels",
              "Filter by pet or event type",
            ]}
            visual={<CalendarVisual />}
          />
        </div>
      </div>
    </section>
  );
};
