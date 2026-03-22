import {
  Bell,
  Package,
  Pill,
  Stethoscope,
  Syringe,
  TrendingUp,
} from "lucide-react";
import type { ElementType, ReactNode } from "react";

/* ── Bento card visual content ──────────────────────────── */

function VetVisitsVisual() {
  const visits = [
    { type: "Annual Checkup", date: "Mar 15", cost: "$85", done: true },
    { type: "Vaccination", date: "Jan 8", cost: "$120", done: true },
    { type: "Follow-up", date: "Apr 2", cost: "$65", done: false },
  ];
  return (
    <div className="flex flex-col gap-1.5 mb-5">
      {visits.map((v) => (
        <div
          key={v.type}
          className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
        >
          <div
            className={`h-1.5 w-1.5 rounded-full shrink-0 ${v.done ? "bg-success" : "bg-warning"}`}
          />
          <span className="text-xs flex-1 font-medium">{v.type}</span>
          <span className="text-[11px] text-muted-foreground">{v.date}</span>
          <span className="text-xs font-bold text-primary">{v.cost}</span>
        </div>
      ))}
    </div>
  );
}

function VaccinationVisual() {
  const vacs = [
    { name: "Rabies", pct: 85, color: "bg-warning" },
    { name: "DHPP", pct: 40, color: "bg-success" },
    { name: "Bordetella", pct: 62, color: "bg-primary" },
    { name: "Leptospirosis", pct: 25, color: "bg-destructive" },
  ];
  return (
    <div className="flex flex-col gap-2.5 mb-5">
      {vacs.map((v) => (
        <div key={v.name} className="flex items-center gap-2.5">
          <span className="text-[11px] text-muted-foreground w-24 shrink-0">
            {v.name}
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full rounded-full ${v.color} transition-all`}
              style={{ width: `${v.pct}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground w-8 shrink-0 text-right">
            {v.pct}%
          </span>
        </div>
      ))}
    </div>
  );
}

function MedicationsVisual() {
  const days = [
    { label: "M", id: "mon", done: true },
    { label: "T", id: "tue", done: true },
    { label: "W", id: "wed", done: true },
    { label: "T", id: "thu", done: true },
    { label: "F", id: "fri", done: true },
    { label: "S", id: "sat", done: false },
    { label: "S", id: "sun", done: false },
  ];
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">This week</span>
        <span className="text-xs text-primary font-bold">🔥 14-day streak</span>
      </div>
      <div className="flex gap-1.5">
        {days.map(({ label, id, done }) => (
          <div key={id} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className={`h-9 w-full rounded-lg flex items-center justify-center text-[11px] font-semibold border ${
                done
                  ? "bg-primary/15 text-primary border-primary/25"
                  : "bg-white/[0.03] text-muted-foreground/50 border-white/[0.05]"
              }`}
            >
              {done ? "✓" : "·"}
            </div>
            <span className="text-[9px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FoodStockVisual() {
  const foods = [
    { name: "Royal Canin Adult", pct: 14, label: "3d", danger: true },
    { name: "Pedigree Treats", pct: 60, label: "21d", danger: false },
    { name: "Hills Science Diet", pct: 82, label: "45d", danger: false },
  ];
  return (
    <div className="flex flex-col gap-3 mb-5">
      {foods.map((f) => (
        <div key={f.name}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium truncate max-w-[180px]">
              {f.name}
            </span>
            <span
              className={`text-[10px] font-bold shrink-0 ml-2 ${
                f.pct < 25
                  ? "text-destructive"
                  : f.pct < 55
                    ? "text-warning"
                    : "text-success"
              }`}
            >
              {f.label} left
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                f.pct < 25
                  ? "bg-destructive"
                  : f.pct < 55
                    ? "bg-warning"
                    : "bg-success"
              }`}
              style={{ width: `${f.pct}%` }}
            />
          </div>
          {f.danger && (
            <p className="text-[10px] text-destructive mt-0.5">
              ⚠ Reorder soon
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function WeightHistoryVisual() {
  const data = [
    { month: "Sep", w: 26.2 },
    { month: "Oct", w: 26.8 },
    { month: "Nov", w: 27.4 },
    { month: "Dec", w: 27.1 },
    { month: "Jan", w: 27.8 },
    { month: "Feb", w: 28.2 },
    { month: "Mar", w: 28.0 },
  ];
  const weights = data.map((d) => d.w);
  const max = Math.max(...weights);
  const min = Math.min(...weights);
  const range = max - min || 1;

  return (
    <div className="mb-5">
      <div className="flex items-end gap-1.5 h-20">
        {data.map(({ month, w }, i) => {
          const heightPct = ((w - min) / range) * 65 + 28;
          return (
            <div
              key={month}
              className="flex-1 flex flex-col items-center justify-end gap-1"
            >
              <span className="text-[9px] text-muted-foreground">{w}</span>
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: `${heightPct}%`,
                  background:
                    i === weights.length - 1
                      ? "linear-gradient(to top, hsl(174 80% 40%), hsl(174 80% 55%))"
                      : "hsl(174 80% 40% / 0.35)",
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5 mt-1.5 border-t border-white/[0.05] pt-1.5">
        {data.map(({ month }) => (
          <div
            key={month}
            className="flex-1 text-center text-[9px] text-muted-foreground"
          >
            {month}
          </div>
        ))}
      </div>
    </div>
  );
}

function RemindersVisual() {
  const reminders = [
    {
      text: "Vaccination due",
      sub: "Tomorrow",
      urgency: "high" as const,
    },
    {
      text: "Flea treatment",
      sub: "In 4 days",
      urgency: "med" as const,
    },
    {
      text: "Dental check",
      sub: "Next week",
      urgency: "low" as const,
    },
  ];

  const styles = {
    high: {
      wrap: "border-destructive/20 bg-destructive/[0.07]",
      dot: "bg-destructive",
      sub: "text-destructive/70",
    },
    med: {
      wrap: "border-warning/20 bg-warning/[0.07]",
      dot: "bg-warning",
      sub: "text-warning/70",
    },
    low: {
      wrap: "border-success/20 bg-success/[0.07]",
      dot: "bg-success",
      sub: "text-success/70",
    },
  };

  return (
    <div className="flex flex-col gap-2 mb-5">
      {reminders.map((r) => {
        const s = styles[r.urgency];
        return (
          <div
            key={r.text}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${s.wrap}`}
          >
            <div className={`h-2 w-2 rounded-full shrink-0 ${s.dot}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-tight">{r.text}</p>
              <p className={`text-[10px] ${s.sub}`}>{r.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Bento card wrapper ──────────────────────────────────── */

interface BentoCardProps {
  icon: ElementType;
  title: string;
  description: string;
  visual: ReactNode;
  className?: string;
}

function BentoCard({
  icon: Icon,
  title,
  description,
  visual,
  className = "",
}: BentoCardProps) {
  return (
    <div
      className={`group relative rounded-2xl border border-white/[0.07] bg-card overflow-hidden transition-all duration-500 hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(0,0,0,0.3),0_0_0_1px_hsl(174_80%_40%/0.08)] p-5 flex flex-col ${className}`}
    >
      {/* Top-edge glow stripe on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-500" />

      {/* Visual area — takes remaining space */}
      <div className="flex-1 min-h-0">{visual}</div>

      {/* Bottom label */}
      <div className="border-t border-white/[0.06] pt-4">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/18">
            <Icon className="h-3.5 w-3.5" />
          </div>
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────── */

export function FeaturesGridSection() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3">
            Features
          </p>
          <h2 className="text-3xl md:text-[2.6rem] font-bold mb-4 leading-tight tracking-tight">
            Everything your pets need,{" "}
            <span className="text-muted-foreground font-normal">
              all in one place
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Eleven modules covering every aspect of pet care, shared across your
            whole household.
          </p>
        </div>

        {/* Bento grid — alternating 2/3 and 1/3 widths */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 auto-rows-fr">
          <BentoCard
            icon={Stethoscope}
            title="Vet Visits"
            description="Log every visit with costs, notes, and file attachments. Never lose a record again."
            visual={<VetVisitsVisual />}
            className="lg:col-span-2"
          />
          <BentoCard
            icon={Syringe}
            title="Vaccinations"
            description="Track schedules and stay ahead of every due date."
            visual={<VaccinationVisual />}
          />
          <BentoCard
            icon={Pill}
            title="Medications"
            description="Administer doses and build adherence streaks to keep treatments on track."
            visual={<MedicationsVisual />}
          />
          <BentoCard
            icon={Package}
            title="Food Stock"
            description="Smart days-remaining alerts so you never run out unexpectedly."
            visual={<FoodStockVisual />}
            className="lg:col-span-2"
          />
          <BentoCard
            icon={TrendingUp}
            title="Weight History"
            description="Visualize weight trends with interactive charts for every pet."
            visual={<WeightHistoryVisual />}
            className="lg:col-span-2"
          />
          <BentoCard
            icon={Bell}
            title="Reminders"
            description="Shared household reminders with urgency levels and due dates."
            visual={<RemindersVisual />}
          />
        </div>
      </div>
    </section>
  );
}
