const runtimeCaching = require("next-pwa/cache");

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  runtimeCaching,
  buildExcludes: [/middleware-manifest\.json$/],
  scope: "/",
  sw: "service-worker.js",
  skipWaiting: true,
  disable: true, // Disable PWA for mobile build
});

/** @type {import('next').NextConfig} */
module.exports = withPWA({
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  turbopack: {},
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Remove i18n for static export
  // i18n is not compatible with static export
});
