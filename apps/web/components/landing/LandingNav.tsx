import { ArrowRight, PawPrint } from "lucide-react";
import Link from "next/link";

export const LandingNav = () => {
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Blur backdrop */}
      <div className="absolute inset-0 backdrop-blur-xl bg-background/75 border-b border-white/[0.06]" />

      <div className="relative container mx-auto flex h-[60px] items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 border border-primary/25 transition-all duration-300 group-hover:bg-primary/22 group-hover:shadow-[0_0_16px_hsl(174_80%_40%/0.25)]">
            <PawPrint className="h-4 w-4 text-primary" />
          </div>
          <span className="text-[15px] font-bold tracking-tight">FurLog</span>
          <span className="hidden sm:inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary tracking-widest uppercase">
            Beta
          </span>
        </Link>

        {/* Center nav (desktop only) */}
        <nav className="hidden lg:flex items-center gap-1">
          {[
            { label: "Features", href: "#features" },
            { label: "How it works", href: "#how-it-works" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/[0.04]"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center h-9 px-4 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/[0.04]"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_24px_hsl(174_80%_40%/0.45)] hover:-translate-y-px active:translate-y-0"
          >
            Get started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
