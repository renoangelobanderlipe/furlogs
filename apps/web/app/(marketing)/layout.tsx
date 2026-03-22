import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_URL } from "@/lib/constants";

const title = "FurLog — Your household's complete pet care companion";
const description =
  "Track pet health, vet visits, medications, food stock, and more — shared in real time across your whole household.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: "FurLog",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "FurLog — Pet Care Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground antialiased">
      {children}
    </div>
  );
}
