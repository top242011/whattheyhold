import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import path from "path";

// Ensure the API URL always has a protocol prefix
const rawApiUrl = process.env.API_URL || "http://127.0.0.1:8000";
const apiUrl = rawApiUrl.startsWith("http") ? rawApiUrl : `https://${rawApiUrl}`;

const nextConfig: NextConfig = {
  // Resolve @payload-config → payload.config.ts
  // Turbopack uses relative paths; Webpack uses absolute paths
  turbopack: {
    resolveAlias: {
      "@payload-config": "./payload.config.ts",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@payload-config": path.resolve(process.cwd(), "payload.config.ts"),
    };
    return config;
  },
  async rewrites() {
    return [
      {
        // Proxy Flask backend API — Payload's REST API is at /cms-api (not /api)
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default withPayload(nextConfig);
