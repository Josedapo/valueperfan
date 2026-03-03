import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.horizm.com",
        pathname: "/clubs/**",
      },
    ],
  },
};

export default nextConfig;
