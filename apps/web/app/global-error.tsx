"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "hsl(228 24% 7%)",
          color: "hsl(210 40% 96%)",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
          gap: "1.5rem",
        }}
      >
        {/* Inline SVG cat — no Tailwind available at root level */}
        <svg
          width="160"
          height="176"
          viewBox="0 0 200 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{ animation: "float 5s ease-in-out infinite" }}
        >
          <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
          {/* Puffed tail */}
          <path
            d="M115 185 Q130 160 125 130 Q122 115 130 100"
            stroke="hsl(215 16% 62%)"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
          {/* Body */}
          <ellipse
            cx="92"
            cy="162"
            rx="44"
            ry="34"
            fill="hsl(228 20% 13%)"
            stroke="hsl(228 20% 23%)"
            strokeWidth="1.5"
            transform="rotate(-8 92 162)"
          />
          <ellipse
            cx="92"
            cy="166"
            rx="22"
            ry="20"
            fill="hsl(228 20% 18%)"
            transform="rotate(-8 92 166)"
          />
          {/* Head */}
          <ellipse
            cx="94"
            cy="98"
            rx="46"
            ry="44"
            fill="hsl(228 20% 13%)"
            stroke="hsl(228 20% 23%)"
            strokeWidth="1.5"
          />
          {/* Ears */}
          <polygon
            points="62,68 48,34 80,54"
            fill="hsl(228 20% 13%)"
            stroke="hsl(228 20% 23%)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <polygon points="65,66 55,38 78,55" fill="hsl(174 80% 75%)" />
          <polygon
            points="126,68 140,34 110,54"
            fill="hsl(228 20% 13%)"
            stroke="hsl(228 20% 23%)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <polygon points="123,66 135,38 112,55" fill="hsl(174 80% 75%)" />
          {/* Wide eyes */}
          <circle
            cx="78"
            cy="98"
            r="13"
            fill="hsl(228 24% 7%)"
            stroke="hsl(228 20% 23%)"
            strokeWidth="1"
          />
          <circle
            cx="112"
            cy="98"
            r="13"
            fill="hsl(228 24% 7%)"
            stroke="hsl(228 20% 23%)"
            strokeWidth="1"
          />
          <circle cx="78" cy="98" r="9" fill="hsl(210 40% 10%)" />
          <circle cx="112" cy="98" r="9" fill="hsl(210 40% 10%)" />
          <circle cx="74" cy="94" r="3" fill="white" />
          <circle cx="108" cy="94" r="3" fill="white" />
          {/* Nose */}
          <ellipse cx="94" cy="114" rx="4" ry="3" fill="hsl(174 80% 65%)" />
          {/* Shocked mouth */}
          <ellipse
            cx="94"
            cy="120"
            rx="5"
            ry="4"
            fill="none"
            stroke="hsl(215 16% 62%)"
            strokeWidth="1.5"
          />
          {/* Whiskers */}
          <line
            x1="50"
            y1="106"
            x2="86"
            y2="112"
            stroke="hsl(215 16% 62%)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="48"
            y1="114"
            x2="86"
            y2="115"
            stroke="hsl(215 16% 62%)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="138"
            y1="106"
            x2="102"
            y2="112"
            stroke="hsl(215 16% 62%)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="140"
            y1="114"
            x2="102"
            y2="115"
            stroke="hsl(215 16% 62%)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          {/* Paws */}
          <ellipse
            cx="68"
            cy="198"
            rx="16"
            ry="10"
            fill="hsl(228 20% 13%)"
            stroke="hsl(228 20% 23%)"
            strokeWidth="1.5"
          />
          <ellipse
            cx="116"
            cy="196"
            rx="16"
            ry="10"
            fill="hsl(228 20% 13%)"
            stroke="hsl(228 20% 23%)"
            strokeWidth="1.5"
          />
          <circle cx="60" cy="198" r="3" fill="hsl(174 80% 75%)" />
          <circle cx="68" cy="196" r="3.5" fill="hsl(174 80% 75%)" />
          <circle cx="76" cy="198" r="3" fill="hsl(174 80% 75%)" />
          <circle cx="108" cy="196" r="3" fill="hsl(174 80% 75%)" />
          <circle cx="116" cy="194" r="3.5" fill="hsl(174 80% 75%)" />
          <circle cx="124" cy="196" r="3" fill="hsl(174 80% 75%)" />
          <text
            x="148"
            y="52"
            fontSize="22"
            fontWeight="700"
            fill="hsl(0 84% 60%)"
            fontFamily="sans-serif"
          >
            !
          </text>
        </svg>

        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            borderRadius: "9999px",
            border: "1px solid hsl(0 84% 60% / 0.3)",
            background: "hsl(0 84% 60% / 0.1)",
            padding: "0.375rem 1rem",
          }}
        >
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "hsl(0 84% 60%)",
            }}
          >
            Critical Error
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            margin: 0,
            fontSize: "2rem",
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          Something went very wrong
        </h1>

        {/* Subtext */}
        <p
          style={{
            margin: 0,
            maxWidth: "26rem",
            color: "hsl(215 16% 62%)",
            lineHeight: 1.6,
          }}
        >
          The application encountered a critical error. Please reload the page
          or contact support if this persists.
        </p>

        {error.digest && (
          <p
            style={{
              margin: 0,
              fontFamily: "monospace",
              fontSize: "0.75rem",
              background: "hsl(228 20% 13%)",
              border: "1px solid hsl(228 20% 23%)",
              borderRadius: "0.375rem",
              padding: "0.375rem 0.75rem",
              color: "hsl(215 16% 62%)",
            }}
          >
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            onClick={reset}
            style={{
              height: "2.75rem",
              padding: "0 2rem",
              borderRadius: "0.375rem",
              background: "hsl(174 80% 40%)",
              color: "white",
              fontWeight: 600,
              fontSize: "0.875rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              height: "2.75rem",
              padding: "0 2rem",
              borderRadius: "0.375rem",
              background: "transparent",
              color: "hsl(210 40% 96%)",
              fontWeight: 600,
              fontSize: "0.875rem",
              border: "1px solid hsl(228 20% 23%)",
              cursor: "pointer",
            }}
          >
            Go home
          </button>
        </div>
      </body>
    </html>
  );
}
