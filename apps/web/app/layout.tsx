import type { Metadata } from "next";
import {
  DM_Sans,
  Geist,
  Geist_Mono,
  Inter,
  Nunito_Sans,
  Public_Sans,
} from "next/font/google";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import { SITE_URL } from "@/lib/constants";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  preload: false,
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  preload: false,
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "FurLog — Pet Care Management",
  description:
    "FurLog is a multi-user pet care app. Track vet visits, medications, vaccinations, food stock, weight history, and reminders — shared across your whole household.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      nonce={nonce}
      className={`dark ${geistSans.variable} ${geistMono.variable} ${inter.variable} ${publicSans.variable} ${dmSans.variable} ${nunitoSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
            {children}
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
