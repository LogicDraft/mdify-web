import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence the Turbopack+webpack config warning
  turbopack: {},
  // Allow cross-origin requests for PDF.js worker
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
