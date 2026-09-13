import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      // Google OAuth profile pictures.
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // INTEGRATION POINT: add your S3-compatible bucket's public hostname
      // (or CDN domain in front of it) here once S3_PUBLIC_URL is set.
    ],
  },
};

export default nextConfig;
