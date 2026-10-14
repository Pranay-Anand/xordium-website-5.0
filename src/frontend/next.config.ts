import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

if (process.env.NODE_ENV === "production") {
  securityHeaders.push({ key: "Strict-Transport-Security", value: "max-age=31536000" });
}

const nextConfig: NextConfig = {
  // Disable webpack's default Node.js console.log patching in production
  // to prevent sensitive data leaks (unless explicitly needed)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Ensure Prisma Client is properly bundled for serverless functions
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/carousel/:file*",
        destination: "/carousel/:file*",
      },
    ];
  },
};

export default nextConfig;