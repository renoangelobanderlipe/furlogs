import {
  ArrowRight,
  Bell,
  Home,
  Package,
  PawPrint,
  Pill,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";

function MockAppWindow() {
  return (
    <div className="relative">
      {/* Soft glow halo behind the window */}
      <div
        className="absolute -inset-12 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(174 80% 40% / 0.12), transparent 70%)",
        }}
      />

      {/* App window frame */}
      <div className="relative rounded-[20px] border border-white/[0.09] bg-[hsl(228_24%_9%/0.85)] backdrop-blur-2xl shadow-[0_40px_80px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-black/15">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#ff5f57] opacity-80" />
            <div className="h-3 w-3 rounded-full bg-[#ffbd2e] opacity-80" />
            <div className="h-3 w-3 rounded-full bg-[#28ca41] opacity-80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.05] border border-white/[0.07] px-3 py-1 w-44">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse-dot shrink-0" />
              <span className="text-[11px] text-muted-foreground truncate">
                furlogs.reno-is.dev
              </span>
            </div>
          </div>
          <div className="w-14" />
        </div>

        {/* App layout */}
        <div className="flex" style={{ height: "360px" }}>
          {/* Sidebar */}
          <div className="w-[54px] border-r border-white/[0.05] flex flex-col items-center py-4 gap-2.5 bg-black/20 shrink-0">
            <div className="h-8 w-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-1">
              <span className="text-base leading-none">🐕</span>
            </div>
            {[Home, Stethoscope, Pill, Package, Bell].map((Icon, i) => (
              <div
                key={Icon.displayName ?? i}
                className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
                  i === 0
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground/40"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
            ))}
          </div>

          {/* Main content area */}
          <div className="flex-1 p-4 overflow-hidden">
            {/* Pet header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl leading-none shrink-0">
                🐕
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">Luna</p>
                <p className="text-[11px] text-muted-foreground">
                  Golden Retriever · 3 years
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-2.5 py-1 shrink-0">
                <div className="h-1.5 w-1.5 rounded-full bg-success" />
                <span className="text-[10px] text-success font-semibold">
                  Healthy
                </span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: "Vet Visits", value: "12" },
                { label: "Weight", value: "28 kg" },
                { label: "Next Shot", value: "Apr 2" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5"
                >
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">
                    {s.label}
                  </p>
                  <p className="text-sm font-bold text-primary leading-none">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Medication streak */}
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 mb-2.5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-medium">Medication streak</p>
                <span className="text-[11px] text-primary font-semibold">
                  🔥 14 days
                </span>
              </div>
              <div className="flex gap-[3px]">
                {[
                  "s1",
                  "s2",
                  "s3",
                  "s4",
                  "s5",
                  "s6",
                  "s7",
                  "s8",
                  "s9",
                  "s10",
                  "s11",
                  "s12",
                  "s13",
                  "s14",
                ].map((id) => (
                  <div
                    key={id}
                    className="h-1.5 flex-1 rounded-full bg-primary"
                  />
                ))}
                {["e1", "e2", "e3"].map((id) => (
                  <div
                    key={id}
                    className="h-1.5 flex-1 rounded-full bg-white/10"
                  />
                ))}
              </div>
            </div>

            {/* Upcoming reminder */}
            <div className="rounded-xl border border-warning/20 bg-warning/[0.07] p-2.5 flex items-center gap-2.5">
              <Bell className="h-3.5 w-3.5 text-warning shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium">Rabies booster due</p>
                <p className="text-[10px] text-muted-foreground">
                  Tomorrow · Dr. Chen&apos;s Clinic
                </p>
              </div>
              <div className="h-5 rounded-full border border-warning/30 bg-warning/15 px-2 flex items-center shrink-0">
                <span className="text-[9px] text-warning font-semibold">
                  Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Deep layered background */}
      <div className="absolute inset-0 bg-background" />

      {/* Teal orb — top left */}
      <div
        className="absolute -top-48 -left-48 h-[700px] w-[700px] rounded-full pointer-events-none orb-animate"
        style={{
          background:
            "radial-gradient(circle, hsl(174 80% 40% / 0.18) 0%, transparent 65%)",
        }}
      />

      {/* Secondary orb — bottom right */}
      <div
        className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full pointer-events-none orb-animate-slow"
        style={{
          background:
            "radial-gradient(circle, hsl(217 91% 60% / 0.1) 0%, transparent 65%)",
        }}
      />

      {/* Subtle center glow */}
      <div
        className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(174 80% 40% / 0.06) 0%, transparent 60%)",
        }}
      />

      {/* Dot grid */}
      <div className="hero-grid absolute inset-0 opacity-[0.28]" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 xl:gap-20 items-center min-h-[93vh] py-20 lg:py-0">
          {/* Left — text */}
          <div className="flex flex-col gap-7 animate-fade-in-up lg:py-20">
            {/* Live badge */}
            <div className="flex items-center gap-2.5 w-fit rounded-full border border-primary/25 bg-primary/[0.08] px-3.5 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
              <span className="text-xs font-semibold text-primary tracking-wide">
                Now in early access
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[2.9rem] sm:text-[3.5rem] lg:text-[3.8rem] xl:text-[4.25rem] font-bold leading-[1.04] tracking-[-0.03em]">
              The pet care app{" "}
              <span className="block">
                your whole{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(174 80% 62%) 0%, hsl(174 80% 44%) 50%, hsl(174 80% 33%) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  household
                </span>
              </span>
              <span className="block text-foreground/85">
                will actually use.
              </span>
            </h1>

            {/* Sub */}
            <p className="text-lg text-muted-foreground leading-relaxed max-w-[440px]">
              Track vet visits, medications, food stock, and more — all shared
              in real time with everyone who cares for your pets.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="cta-shimmer inline-flex items-center gap-2 h-12 px-7 rounded-xl font-semibold text-[15px]"
              >
                Start for free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-xl border border-white/[0.10] bg-white/[0.04] text-[15px] font-medium text-foreground/80 transition-all duration-300 hover:bg-white/[0.07] hover:border-white/[0.18] hover:text-foreground"
              >
                Sign in
              </Link>
            </div>

            {/* Social proof avatars */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex -space-x-2">
                {(["SR", "MK", "PL", "TW"] as const).map((initials, i) => (
                  <div
                    key={initials}
                    className="h-7 w-7 rounded-full border-2 border-background bg-primary/25 flex items-center justify-center text-[9px] font-bold text-primary"
                    style={{ zIndex: 4 - i }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Trusted by{" "}
                <span className="text-foreground font-medium">
                  pet-loving households
                </span>
              </p>
            </div>

            {/* Pet species marquee row */}
            <div className="flex items-center gap-3 pt-1">
              <PawPrint className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
              <div className="flex items-center gap-2.5">
                {["🐕", "🐈", "🦜", "🐇", "🐟", "🐹", "🦎"].map((emoji) => (
                  <span
                    key={emoji}
                    className="text-xl leading-none opacity-60 hover:opacity-100 transition-opacity"
                  >
                    {emoji}
                  </span>
                ))}
              </div>
              <span className="text-xs text-muted-foreground/50">
                15+ species
              </span>
            </div>
          </div>

          {/* Right — app mock */}
          <div
            className="hidden lg:block animate-fade-in-up"
            style={{ animationDelay: "180ms" }}
          >
            <MockAppWindow />
          </div>
        </div>
      </div>
    </section>
  );
};
