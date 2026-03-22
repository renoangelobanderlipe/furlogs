"use client";

/**
 * Paw-trail loader — four paw prints appear one-by-one in a walking pattern,
 * then fade out together, looping indefinitely.
 *
 * Keyframes (paw-step, paw-dot) are defined in globals.css.
 */

const PAW_POSITIONS = [
  { cx: 28,  cy: 52, r: -15 }, // left front
  { cx: 76,  cy: 36, r:  12 }, // right front
  { cx: 124, cy: 52, r: -15 }, // left rear
  { cx: 172, cy: 36, r:  12 }, // right rear
];

const DURATION = 2.4; // full cycle in seconds
const STEP     = DURATION / PAW_POSITIONS.length;

const DOT_DELAYS = ["0s", "0.4s", "0.8s"];

export function PawLoader({
  size    = 180,
  message = "Loading FurLog",
  detail,
}: {
  size?:    number;
  /** Primary loading headline */
  message?: string;
  /** Optional secondary detail line */
  detail?:  string;
}) {
  // Keep the aspect ratio of viewBox 200 × 80
  const h = Math.round(size * (80 / 200));

  return (
    <div className="flex flex-col items-center gap-5">
      <svg
        width={size}
        height={h}
        viewBox="0 0 200 80"
        fill="none"
        role="status"
        aria-label="Loading"
      >
        {PAW_POSITIONS.map(({ cx, cy, r }, i) => (
          // Outer <g> positions + rotates the paw into its footprint spot.
          // Inner <g> runs the CSS animation; its transform-origin (0,0) is
          // the paw centre after the outer translate, so scale radiates outward.
          <g key={i} transform={`translate(${cx},${cy}) rotate(${r})`}>
            <g
              style={{
                transformOrigin: "0px 0px",
                animation: `paw-step ${DURATION}s ease-in-out ${i * STEP}s infinite`,
              }}
            >
              <g transform="scale(1.3) translate(-12,-12)" fill="hsl(var(--primary))">
                <circle cx="11" cy="4"  r="2" />
                <circle cx="18" cy="8"  r="2" />
                <circle cx="4"  cy="8"  r="2" />
                <circle cx="20" cy="16" r="2" />
                <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
              </g>
            </g>
          </g>
        ))}
      </svg>

      {(message || detail) && (
        <div className="flex flex-col items-center gap-2 text-center">
          {message && (
            <p className="flex items-center gap-px text-base font-semibold tracking-wide text-foreground/90">
              {message}
              {DOT_DELAYS.map((delay, i) => (
                <span
                  key={delay}
                  style={{
                    animation: `paw-dot 1.2s ease-in-out ${delay} infinite`,
                    display: "inline-block",
                    marginLeft: i === 0 ? "1px" : undefined,
                  }}
                >
                  .
                </span>
              ))}
            </p>
          )}
          {detail && (
            <p className="max-w-[220px] text-xs leading-relaxed text-muted-foreground">
              {detail}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
