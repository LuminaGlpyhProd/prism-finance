import type { NextConfig } from "next";

const isStaticPackaging =
  process.env.BUILD_STATIC === "1" || process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // Relative assets so Electron (file://) and Capacitor load JS/CSS correctly
  assetPrefix: isStaticPackaging ? "./" : undefined,
};

export default nextConfig;
