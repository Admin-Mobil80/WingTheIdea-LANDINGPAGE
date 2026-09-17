import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: the deploy target is S3 + CloudFront, which serves files
  // only. This rules out SSR, ISR, route handlers and the Image Optimization
  // API — switching any of those on means changing the hosting target.
  output: "export",
  images: { unoptimized: true },
  // S3/CloudFront serve /about as /about/index.html.
  trailingSlash: true,
};

export default nextConfig;
