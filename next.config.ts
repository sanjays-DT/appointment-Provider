import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // helps with deployment stability
  },
};

export default nextConfig;
