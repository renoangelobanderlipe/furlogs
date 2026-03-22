import Link from "next/link";
import { PawWatermark } from "@/components/ui/paw-watermark";

function CuriousCat() {
  return (
    <svg
      width="200"
      height="220"
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="drop-shadow-lg"
      style={{ animation: "float 4s ease-in-out infinite" }}
    >
      {/* Tail */}
      <path
        d="M100 190 Q60 200 50 175 Q40 155 65 150 Q80 148 85 165"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Body */}
      <ellipse
        cx="100"
        cy="165"
        rx="42"
        ry="38"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
      />
      {/* Belly */}
      <ellipse cx="100" cy="170" rx="22" ry="24" fill="hsl(var(--muted))" />
      {/* Head */}
      <ellipse
        cx="100"
        cy="100"
        rx="44"
        ry="42"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
      />
      {/* Left ear */}
      <polygon
        points="64,72 56,46 82,62"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <polygon points="67,70 61,52 79,63" fill="hsl(174 80% 75%)" />
      {/* Right ear */}
      <polygon
        points="136,72 144,46 118,62"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <polygon points="133,70 139,52 121,63" fill="hsl(174 80% 75%)" />
      {/* Eyes — wide curious look */}
      <circle
        cx="84"
        cy="98"
        r="10"
        fill="hsl(var(--background))"
        stroke="hsl(var(--border))"
        strokeWidth="1"
      />
      <circle
        cx="116"
        cy="98"
        r="10"
        fill="hsl(var(--background))"
        stroke="hsl(var(--border))"
        strokeWidth="1"
      />
      <circle cx="86" cy="97" r="6" fill="hsl(228 24% 10%)" />
      <circle cx="118" cy="97" r="6" fill="hsl(228 24% 10%)" />
      <circle cx="88" cy="95" r="2" fill="white" />
      <circle cx="120" cy="95" r="2" fill="white" />
      {/* Nose */}
      <ellipse cx="100" cy="110" rx="4" ry="3" fill="hsl(174 80% 65%)" />
      {/* Mouth */}
      <path
        d="M96 113 Q100 117 104 113"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Whiskers left */}
      <line
        x1="58"
        y1="108"
        x2="92"
        y2="111"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="56"
        y1="113"
        x2="92"
        y2="113"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Whiskers right */}
      <line
        x1="142"
        y1="108"
        x2="108"
        y2="111"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="144"
        y1="113"
        x2="108"
        y2="113"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Paws */}
      <ellipse
        cx="76"
        cy="200"
        rx="16"
        ry="10"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
      />
      <ellipse
        cx="124"
        cy="200"
        rx="16"
        ry="10"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
      />
      {/* Toe beans left */}
      <circle cx="68" cy="200" r="3" fill="hsl(174 80% 75%)" />
      <circle cx="76" cy="198" r="3.5" fill="hsl(174 80% 75%)" />
      <circle cx="84" cy="200" r="3" fill="hsl(174 80% 75%)" />
      {/* Toe beans right */}
      <circle cx="116" cy="200" r="3" fill="hsl(174 80% 75%)" />
      <circle cx="124" cy="198" r="3.5" fill="hsl(174 80% 75%)" />
      <circle cx="132" cy="200" r="3" fill="hsl(174 80% 75%)" />
      {/* Question mark above head */}
      <text
        x="148"
        y="70"
        fontSize="28"
        fontWeight="700"
        fill="hsl(var(--primary))"
        fontFamily="sans-serif"
      >
        ?
      </text>
    </svg>
  );
}

export default function NotFound() {
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
        <CuriousCat />

        {/* Error badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            404 — Not Found
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          This page wandered off
        </h1>

        {/* Subtext */}
        <p className="max-w-md text-base leading-relaxed text-muted-foreground">
          Even our cats couldn&apos;t sniff it out. The page you&apos;re looking
          for may have moved, been deleted, or never existed.
        </p>

        {/* Actions */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Go to dashboard
          </Link>
          <Link
            href="/pets"
            className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            View my pets
          </Link>
        </div>
      </div>
    </main>
  );
}
