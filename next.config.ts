import type { NextConfig } from "next";
import { existsSync } from "fs";
import { join } from "path";
import { withContentCollections } from "@content-collections/next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["mermaid"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.vercel.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "d2vwwcvoksz7ty.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-4a8739a12755457e8a9e7439e0b386a3.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

// Skip content-collections esbuild step if generated files already exist
// Workaround for esbuild hang on Node 24 + Turbopack
const generatedIndex = join(process.cwd(), ".content-collections/generated/index.js");
const skipCC = existsSync(generatedIndex) && process.env.SKIP_CONTENT_COLLECTIONS !== "false";

export default skipCC ? nextConfig : withContentCollections(nextConfig);
