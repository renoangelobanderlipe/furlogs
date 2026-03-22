import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "FurLog — Your household's complete pet care companion",
  description:
    "Track pet health, vet visits, medications, food stock, and more — shared across your whole household.",
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground antialiased">
      {children}
    </div>
  );
}
