"use client";

import Link from "next/link";
import { useEffect } from "react";
import { PawWatermark } from "@/components/ui/paw-watermark";

function StartledCat() {
  return (
    <svg
      width="200"
      height="220"
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="drop-shadow-lg"
      style={{ animation: "float 5s ease-in-out infinite" }}
    >
      {/* Puffed-up tail straight up */}
      <path
        d="M115 185 Q130 160 125 130 Q122 115 130 100"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M115 185 Q128 160 123 130 Q120 115 128 100"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />

      {/* Body — arched/puffed */}
      <ellipse
        cx="92"
        cy="162"
        rx="44"
        ry="34"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
        transform="rotate(-8 92 162)"
      />
      {/* Belly */}
      <ellipse
        cx="92"
        cy="166"
        rx="22"
        ry="20"
        fill="hsl(var(--muted))"
        transform="rotate(-8 92 166)"
      />

      {/* Head */}
      <ellipse
        cx="94"
        cy="98"
        rx="46"
        ry="44"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
      />

      {/* Ears — perked way up (startled) */}
      <polygon
        points="62,68 48,34 80,54"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <polygon points="65,66 55,38 78,55" fill="hsl(174 80% 75%)" />
      <polygon
        points="126,68 140,34 110,54"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <polygon points="123,66 135,38 112,55" fill="hsl(174 80% 75%)" />

      {/* Eyes — wide open / shocked */}
      <circle
        cx="78"
        cy="98"
        r="13"
        fill="hsl(var(--background))"
        stroke="hsl(var(--border))"
        strokeWidth="1"
      />
      <circle
        cx="112"
        cy="98"
        r="13"
        fill="hsl(var(--background))"
        stroke="hsl(var(--border))"
        strokeWidth="1"
      />
      <circle cx="78" cy="98" r="9" fill="hsl(228 24% 10%)" />
      <circle cx="112" cy="98" r="9" fill="hsl(228 24% 10%)" />
      <circle cx="74" cy="94" r="3" fill="white" />
      <circle cx="108" cy="94" r="3" fill="white" />

      {/* Nose */}
      <ellipse cx="94" cy="114" rx="4" ry="3" fill="hsl(174 80% 65%)" />
      {/* Mouth — open O shape (shocked) */}
      <ellipse
        cx="94"
        cy="120"
        rx="5"
        ry="4"
        fill="none"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1.5"
      />

      {/* Whiskers left — pointing outward/startled */}
      <line
        x1="50"
        y1="106"
        x2="86"
        y2="112"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="48"
        y1="114"
        x2="86"
        y2="115"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="52"
        y1="122"
        x2="86"
        y2="118"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Whiskers right */}
      <line
        x1="138"
        y1="106"
        x2="102"
        y2="112"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="140"
        y1="114"
        x2="102"
        y2="115"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="136"
        y1="122"
        x2="102"
        y2="118"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Paws front */}
      <ellipse
        cx="68"
        cy="198"
        rx="16"
        ry="10"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
      />
      <ellipse
        cx="110"
        cy="196"
        rx="16"
        ry="10"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
      />
      <circle cx="60" cy="198" r="3" fill="hsl(174 80% 75%)" />
      <circle cx="68" cy="196" r="3.5" fill="hsl(174 80% 75%)" />
      <circle cx="76" cy="198" r="3" fill="hsl(174 80% 75%)" />
      <circle cx="102" cy="196" r="3" fill="hsl(174 80% 75%)" />
      <circle cx="110" cy="194" r="3.5" fill="hsl(174 80% 75%)" />
      <circle cx="118" cy="196" r="3" fill="hsl(174 80% 75%)" />

      {/* Exclamation sparks */}
      <text
        x="148"
        y="52"
        fontSize="22"
        fontWeight="700"
        fill="hsl(var(--destructive))"
        fontFamily="sans-serif"
      >
        !
      </text>
      <text
        x="22"
        y="60"
        fontSize="16"
        fontWeight="700"
        fill="hsl(var(--warning))"
        fontFamily="sans-serif"
      >
        !
      </text>
    </svg>
  );
}

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">
      {/* Background paw watermarks */}
      <PawWatermark
        size={120}
        opacity={0.04}
        rotate={-20}
        className="top-12 left-8"
      />
      <PawWatermark
        size={80}
        opacity={0.03}
        rotate={15}
        className="top-1/3 left-4"
        flip
      />
      <PawWatermark
        size={96}
        opacity={0.04}
        rotate={30}
        className="bottom-24 left-16"
      />
      <PawWatermark
        size={110}
        opacity={0.04}
        rotate={-10}
        className="top-16 right-8"
        flip
      />
      <PawWatermark
        size={72}
        opacity={0.03}
        rotate={20}
        className="top-2/3 right-6"
      />
      <PawWatermark
        size={88}
        opacity={0.04}
        rotate={-30}
        className="bottom-16 right-20"
        flip
      />

      <div className="relative z-10 flex flex-col items-center gap-6 animate-fade-in-up">
        {/* Cat illustration */}
        <StartledCat />

        {/* Error badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-1.5">
          <span className="text-xs font-semibold uppercase tracking-widest text-destructive">
            Something went wrong
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Our cat knocked something over
        </h1>

        {/* Subtext */}
        <p className="max-w-md text-base leading-relaxed text-muted-foreground">
          An unexpected error occurred. Our team has been notified and the cat
          has been scolded. Please try again.
        </p>

        {/* Error digest for debugging */}
        {error.digest && (
          <p className="rounded-md bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
