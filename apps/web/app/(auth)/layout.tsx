import { Bell, Package, PawPrint, Pill, Stethoscope } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FurLog — Sign In",
  robots: { index: false, follow: false },
};

function PawDecor({
  size,
  opacity,
  rotate = 0,
  flip = false,
}: {
  size: number;
  opacity: number;
  rotate?: number;
  flip?: boolean;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="hsl(174 80% 45%)"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        opacity,
        transform: `rotate(${rotate}deg) scaleX(${flip ? -1 : 1})`,
        display: "block",
      }}
    >
      <circle cx="11" cy="4" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="4" cy="8" r="2" />
      <circle cx="20" cy="16" r="2" />
      <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
    </svg>
  );
}

function ShowcasePanel() {
  return (
    <div className="hidden lg:flex flex-col w-[56%] min-h-dvh sticky top-0 bg-card/40 border-l border-white/[0.05] relative overflow-hidden">
      {/* Ambient bg */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-20 h-72 w-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 hero-grid opacity-[0.02] pointer-events-none" />

      {/* Paw accents */}
      <div className="absolute top-8 right-10 auth-paw-1 pointer-events-none">
        <PawDecor size={80} opacity={0.07} rotate={18} flip />
      </div>
      <div className="absolute bottom-12 left-8 auth-paw-2 pointer-events-none">
        <PawDecor size={100} opacity={0.055} rotate={-20} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full px-12 py-10">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-auto">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
            <PawPrint className="h-[18px] w-[18px] text-primary" />
          </div>
          <span className="text-[15px] font-bold tracking-tight">FurLog</span>
        </div>

        {/* Dashboard mock */}
        <div className="flex-1 flex flex-col justify-center gap-5">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-[0.18em] mb-2">
              Live preview
            </p>
            <h2 className="text-2xl font-bold leading-snug tracking-tight mb-1">
              Everything about your pets,
              <br />
              <span className="text-muted-foreground font-normal">
                always in one place.
              </span>
            </h2>
          </div>

          {/* Mock card */}
          <div
            className="rounded-2xl p-5 max-w-[380px]"
            style={{
              background: "hsl(228 20% 9% / 0.8)",
              boxShadow:
                "0 0 0 1px hsl(174 80% 40% / 0.1), 0 1px 0 0 hsl(0 0% 100% / 0.05) inset, 0 32px 64px hsl(228 24% 4% / 0.6)",
              backdropFilter: "blur(16px)",
            }}
          >
            {/* Pet header */}
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/[0.06]">
              <div className="h-11 w-11 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-xl select-none">
                🐕
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[14px] leading-tight">Luna</p>
                <p className="text-[11px] text-muted-foreground">
                  Golden Retriever · 3 yrs · 28 kg
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
                Healthy
              </div>
            </div>

            {/* Data rows */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Stethoscope className="h-[15px] w-[15px] text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold leading-tight">
                    Annual checkup
                  </p>
                  <p className="text-[11px] text-muted-foreground">Apr 2</p>
                </div>
                <span className="text-[11px] font-bold text-warning shrink-0">
                  In 11 days
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <Pill className="h-[15px] w-[15px] text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold leading-tight">
                    Heartguard Plus
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Dose due today
                  </p>
                </div>
                <span className="text-[11px] font-bold text-primary shrink-0">
                  🔥 21 days
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <Package className="h-[15px] w-[15px] text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold leading-tight">
                    Royal Canin Adult
                  </p>
                  <div className="mt-1.5 h-1 w-full rounded-full bg-white/[0.07]">
                    <div className="h-full w-[14%] rounded-full bg-destructive" />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-destructive shrink-0">
                  3 days
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                  <Bell className="h-[15px] w-[15px] text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold leading-tight">
                    Vaccination due
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Bordetella · Tomorrow
                  </p>
                </div>
                <span className="text-[11px] font-bold text-warning shrink-0">
                  Urgent
                </span>
              </div>
            </div>

            {/* Household members */}
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex -space-x-2">
                {["J", "M", "K"].map((initial) => (
                  <div
                    key={initial}
                    className="h-7 w-7 rounded-full bg-primary/20 border-2 border-[hsl(228_20%_9%)] flex items-center justify-center text-[10px] font-bold text-primary"
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                3 household members
              </p>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 max-w-[380px]">
            {[
              "🏥 Vet visits",
              "💊 Medications",
              "📦 Food stock",
              "🔔 Reminders",
              "📊 Weight trends",
            ].map((f) => (
              <span
                key={f}
                className="text-[11px] font-medium text-muted-foreground bg-white/[0.04] border border-white/[0.07] rounded-full px-2.5 py-1"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Footer quote */}
        <p className="text-[12px] text-muted-foreground/60 mt-auto pt-8 max-w-[340px] leading-relaxed">
          &ldquo;Finally, I don&apos;t have to text my husband to ask if Mochi
          had her meds.&rdquo;
          <span className="block mt-1 text-muted-foreground/40">
            — Sarah M., cat owner
          </span>
        </p>
      </div>
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-background">
      {/* Left — form panel */}
      <div className="relative flex w-full flex-col items-center justify-center min-h-dvh lg:w-[44%] px-6 py-12 overflow-hidden">
        {/* Subtle bg effects for form side */}
        <div className="absolute inset-0 hero-grid opacity-[0.014] pointer-events-none" />
        <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-primary/15 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

        {/* Single large faint paw — bottom-right of form panel */}
        <div className="absolute -bottom-8 -right-8 auth-paw-3 pointer-events-none">
          <PawDecor size={140} opacity={0.04} rotate={-25} flip />
        </div>

        <div className="relative z-10 w-full max-w-sm">{children}</div>
      </div>

      {/* Right — showcase panel */}
      <ShowcasePanel />
    </div>
  );
}
