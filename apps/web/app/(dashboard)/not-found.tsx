import Link from "next/link";
import { PawWatermark } from "@/components/ui/paw-watermark";

function SearchingCat() {
  return (
    <svg
      width="200"
      height="210"
      viewBox="0 0 200 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="drop-shadow-lg"
      style={{ animation: "float 4s ease-in-out infinite" }}
    >
      {/* Tail curled up */}
      <path
        d="M115 190 Q155 195 162 170 Q168 148 148 145 Q135 143 130 158"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Body */}
      <ellipse
        cx="98"
        cy="163"
        rx="42"
        ry="36"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
      />
      {/* Belly */}
      <ellipse cx="98" cy="168" rx="22" ry="22" fill="hsl(var(--muted))" />
      {/* Head slightly tilted right */}
      <ellipse
        cx="105"
        cy="98"
        rx="44"
        ry="42"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
      />
      {/* Left ear */}
      <polygon
        points="70,73 62,46 88,63"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <polygon points="73,71 67,53 86,64" fill="hsl(174 80% 75%)" />
      {/* Right ear */}
      <polygon
        points="140,73 150,47 124,63"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <polygon points="137,71 145,53 127,64" fill="hsl(174 80% 75%)" />
      {/* Eyes — one squinting (searching) */}
      <circle
        cx="90"
        cy="97"
        r="10"
        fill="hsl(var(--background))"
        stroke="hsl(var(--border))"
        strokeWidth="1"
      />
      <circle
        cx="122"
        cy="96"
        r="10"
        fill="hsl(var(--background))"
        stroke="hsl(var(--border))"
        strokeWidth="1"
      />
      <circle cx="92" cy="97" r="6" fill="hsl(228 24% 10%)" />
      {/* Right eye squinting */}
      <ellipse cx="122" cy="96" rx="6" ry="3.5" fill="hsl(228 24% 10%)" />
      <circle cx="93" cy="95" r="2" fill="white" />
      <circle cx="123" cy="95" r="1.5" fill="white" />
      {/* Nose */}
      <ellipse cx="105" cy="110" rx="4" ry="3" fill="hsl(174 80% 65%)" />
      {/* Mouth */}
      <path
        d="M101 113 Q105 117 109 113"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Whiskers left */}
      <line
        x1="62"
        y1="108"
        x2="97"
        y2="111"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="60"
        y1="113"
        x2="97"
        y2="113"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Whiskers right */}
      <line
        x1="148"
        y1="108"
        x2="113"
        y2="111"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="150"
        y1="113"
        x2="113"
        y2="113"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Magnifying glass held by paw */}
      <circle
        cx="152"
        cy="60"
        r="18"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        fill="hsl(var(--primary)/0.1)"
      />
      <line
        x1="164"
        y1="73"
        x2="174"
        y2="85"
        stroke="hsl(var(--primary))"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Paw holding glass */}
      <path
        d="M130 130 Q138 100 148 78"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse
        cx="130"
        cy="132"
        rx="12"
        ry="9"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
      />
      {/* Left front paw (sitting) */}
      <ellipse
        cx="70"
        cy="196"
        rx="16"
        ry="10"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
      />
      <circle cx="62" cy="196" r="3" fill="hsl(174 80% 75%)" />
      <circle cx="70" cy="194" r="3.5" fill="hsl(174 80% 75%)" />
      <circle cx="78" cy="196" r="3" fill="hsl(174 80% 75%)" />
    </svg>
  );
}

export default function DashboardNotFound() {
  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Background paw watermarks */}
      <PawWatermark
        size={100}
        opacity={0.04}
        rotate={-15}
        className="top-8 left-6"
      />
      <PawWatermark
        size={72}
        opacity={0.03}
        rotate={20}
        className="top-1/2 left-4"
        flip
      />
      <PawWatermark
        size={88}
        opacity={0.04}
        rotate={-30}
        className="bottom-12 left-12"
      />
      <PawWatermark
        size={96}
        opacity={0.04}
        rotate={10}
        className="top-6 right-8"
        flip
      />
      <PawWatermark
        size={64}
        opacity={0.03}
        rotate={25}
        className="top-2/3 right-4"
      />
      <PawWatermark
        size={80}
        opacity={0.04}
        rotate={-20}
        className="bottom-10 right-16"
        flip
      />

      <div className="relative z-10 flex flex-col items-center gap-6 animate-fade-in-up">
        {/* Cat illustration */}
        <SearchingCat />

        {/* Error badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            404 — Not Found
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Page gone on a cat nap
        </h1>

        {/* Subtext */}
        <p className="max-w-md text-base leading-relaxed text-muted-foreground">
          We looked everywhere but couldn&apos;t find this page. It may have
          moved or the link might be wrong.
        </p>

        {/* Actions */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Back to dashboard
          </Link>
          <Link
            href="/pets"
            className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            View my pets
          </Link>
        </div>
      </div>
    </div>
  );
}
