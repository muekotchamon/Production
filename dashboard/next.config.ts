import type { NextConfig } from "next";

/** GitHub Pages: https://<user>.github.io/<repo>/ */
const repoSlug = "Production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: `/${repoSlug}`,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
