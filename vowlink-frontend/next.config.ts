import type { NextConfig } from "next";

const backendOrigin =
  process.env.VOWLINK_BACKEND_ORIGIN ?? "http://127.0.0.1:5000";

const extraDevOrigins =
  process.env.ALLOWED_DEV_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const nextConfig: NextConfig = {
  /**
   * When you open the dev server via LAN IP (e.g. http://10.x.x.x:3000), Next.js
   * may block HMR WebSockets unless the host is listed here.
   * Set ALLOWED_DEV_ORIGINS in .env.local (comma-separated hostnames, no protocol).
   */
  allowedDevOrigins: extraDevOrigins.length > 0 ? extraDevOrigins : undefined,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
