const steps = [
  {
    number: "01",
    title: "Create your household",
    description:
      "Sign up and create a shared household space. Invite your partner, family, or anyone who cares for your pets.",
    detail: "Takes under 2 minutes",
  },
  {
    number: "02",
    title: "Add your pets",
    description:
      "Create rich profiles — species, breed, age, weight, and more. Support for 15+ species from dogs to reptiles.",
    detail: "Unlimited pets",
  },
  {
    number: "03",
    title: "Track everything together",
    description:
      "Log vet visits, medications, food stock, and reminders. Every update syncs instantly across your household.",
    detail: "Real-time sync",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-20 md:py-28 relative overflow-hidden"
    >
      {/* Subtle section bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-transparent" />

      <div className="relative container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-[2.6rem] font-bold leading-tight tracking-tight mb-4">
            Up and running{" "}
            <span className="text-muted-foreground font-normal">
              in minutes
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            No complex setup. No learning curve. Just sign up and start
            tracking.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 relative">
          {/* Connecting line on desktop */}
          <div className="hidden lg:block absolute top-[52px] left-[calc(16.67%+36px)] right-[calc(16.67%+36px)] h-px">
            <div className="h-full bg-gradient-to-r from-primary/30 via-primary/15 to-primary/30" />
          </div>

          {steps.map((step, i) => (
            <div
              key={step.number}
              className="flex flex-col items-center text-center gap-5 animate-fade-in-up"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              {/* Step circle */}
              <div className="relative flex-shrink-0">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border border-primary/15 scale-150" />
                <div className="relative h-[72px] w-[72px] rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center z-10">
                  <span
                    className="text-2xl font-black tracking-tighter"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(174 80% 62%), hsl(174 80% 40%))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {step.number}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-lg leading-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
                  {step.description}
                </p>
                <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1 w-fit mx-auto mt-1">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <span className="text-[11px] font-semibold text-primary">
                    {step.detail}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
