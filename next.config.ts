import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { createVanillaExtractPlugin } from "@vanilla-extract/next-plugin";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
};

const withVanillaExtract = createVanillaExtractPlugin({
  // Enable Turbopack for the vanilla-extract plugin on Next.js 16+.
  // `auto` only activates Turbopack when Next >= 16, otherwise webpack.
  unstable_turbopack: { mode: "auto" },
});

export default withVanillaExtract(nextConfig);
