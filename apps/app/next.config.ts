import "./env";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  transpilePackages: ["@repo/clerk", "@repo/schemas"],
};

export default nextConfig;
