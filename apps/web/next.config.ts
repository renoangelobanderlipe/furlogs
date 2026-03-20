import type { NextConfig } from "next";

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
};

export default nextConfig;
