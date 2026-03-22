import { Star } from "lucide-react";

interface TestimonialProps {
  quote: string;
  name: string;
  role: string;
  initials: string;
  accentClass: string;
}

const testimonials: TestimonialProps[] = [
  {
    quote:
      "Finally I don't have to text my husband to ask if Mochi had her meds. We both see it instantly in FurLog.",
    name: "Sarah M.",
    role: "Cat owner · 2 pets",
    initials: "SM",
    accentClass: "bg-primary/20 text-primary",
  },
  {
    quote:
      "The food stock alerts saved us twice already. Just got a notification that Luna's food was running low — ordered same day.",
    name: "Marcus T.",
    role: "Dog + Rabbit owner",
    initials: "MT",
    accentClass: "bg-success/20 text-success",
  },
  {
    quote:
      "The spending breakdown was eye-opening. I never realized how much we spent on vet visits until I saw the yearly chart.",
    name: "Priya K.",
    role: "Multi-pet household · 4 pets",
    initials: "PK",
    accentClass: "bg-warning/20 text-warning",
  },
];

function TestimonialCard({
  quote,
  name,
  role,
  initials,
  accentClass,
}: TestimonialProps) {
  return (
    <div className="group relative rounded-2xl border border-white/[0.07] bg-card p-6 flex flex-col gap-5 transition-all duration-300 hover:border-white/[0.13] hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
      {/* Decorative quote mark */}
      <div
        className="absolute top-4 right-5 text-[72px] font-black leading-none select-none pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(135deg, hsl(174 80% 40% / 0.12), hsl(174 80% 40% / 0.04))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 0.8,
        }}
      >
        &ldquo;
      </div>

      {/* Stars */}
      <div className="flex gap-0.5 text-warning">
        {Array.from({ length: 5 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static star row
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-sm text-foreground/75 leading-relaxed flex-1 relative z-10">
        &ldquo;{quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-1 border-t border-white/[0.06]">
        <div
          className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${accentClass}`}
        >
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-transparent" />
      <div className="relative container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-[2.6rem] font-bold leading-tight tracking-tight mb-4">
            Loved by{" "}
            <span className="text-muted-foreground font-normal">
              pet households
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Families using FurLog never go back to sticky notes and group chats.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}
