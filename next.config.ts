import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Read backend URL from environment; fall back to localhost for development
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";

    // Proxy every API call to the Express backend
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  // Disable webpack's default Node.js console.log patching in production
  // to prevent sensitive data leaks (unless explicitly needed)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
