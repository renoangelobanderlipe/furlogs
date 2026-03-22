import { PawPrint } from "lucide-react";
import Link from "next/link";

export const LandingFooter = () => {
  return (
    <footer className="border-t border-white/[0.06] bg-background">
      {/* Subtle top gradient glow */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(174 80% 40% / 0.3), transparent)",
        }}
      />

      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 border border-primary/20">
                <PawPrint className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-bold">FurLog</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
              Your household&apos;s complete pet care companion.
            </p>
          </div>

          {/* Nav */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link
              href="/login"
              className="hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="hover:text-foreground transition-colors"
            >
              Get Started
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground/60">
            © 2026 FurLog. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
