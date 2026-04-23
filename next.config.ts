import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow loading MediaPipe WASM and model files from CDN
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },

  // Turbopack (default in Next.js 16)
  turbopack: {},
};

export default nextConfig;
