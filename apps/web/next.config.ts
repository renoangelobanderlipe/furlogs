import type { NextConfig } from "next";

if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL must be set in production. Got undefined.",
  );
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      // Local dev — Laravel storage
      { protocol: "http", hostname: "localhost", port: "8000" },
      // Production — Laravel Cloud storage
      { protocol: "https", hostname: "api.furlogs.reno-is.dev" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
          // Content-Security-Policy is set dynamically per-request in proxy.ts
          // using a per-request nonce to eliminate unsafe-inline for scripts.
        ],
      },
    ];
  },
};

export default nextConfig;
