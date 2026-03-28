import "./env";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  transpilePackages: ["@repo/card-positioning", "@repo/clerk", "@repo/schemas"],
};

export default nextConfig;
