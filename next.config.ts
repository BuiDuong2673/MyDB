import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  /** Hides the dev-only indicator menu (Route, Turbopack, etc.) that overlaps the bottom of the UI. */
  devIndicators: false,
};

export default nextConfig;
