import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function FinalCtaSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        {/* Gradient border card */}
        <div className="gradient-border-card rounded-3xl overflow-hidden">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Inner glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 70% 80% at 50% 100%, hsl(174 80% 40% / 0.12), transparent)",
              }}
            />
            {/* Dot grid */}
            <div className="hero-grid absolute inset-0 opacity-[0.18]" />

            {/* Content */}
            <div className="relative px-8 py-20 md:py-28 flex flex-col items-center text-center gap-6">
              {/* Glowing paw icon */}
              <div className="relative mb-2">
                <div
                  className="absolute inset-0 blur-2xl rounded-full scale-150"
                  style={{
                    background: "hsl(174 80% 40% / 0.2)",
                  }}
                />
                <div className="relative h-16 w-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center text-3xl">
                  🐾
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight max-w-2xl">
                Start caring better,{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(174 80% 62%) 0%, hsl(174 80% 40%) 60%, hsl(174 80% 30%) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  together
                </span>
              </h2>

              <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                Join households already using FurLog to keep every pet healthy,
                happy, and well-cared for.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Link
                  href="/register"
                  className="cta-shimmer inline-flex items-center gap-2 h-13 px-8 rounded-xl font-bold text-base"
                  style={{ height: "52px" }}
                >
                  Create your free household <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 h-[52px] px-6 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Already have an account →
                </Link>
              </div>

              {/* Bottom trust row */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-muted-foreground">
                {[
                  "Free to get started",
                  "No credit card required",
                  "Invite unlimited members",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1.5 4L3.5 6.5L8.5 1.5"
                        stroke="hsl(174 80% 50%)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
