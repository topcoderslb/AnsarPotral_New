import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow larger file uploads (5MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

export default nextConfig;
