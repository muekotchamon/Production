import type { NextConfig } from "next";

/**
 * `next dev` → no basePath (http://localhost:3000/).
 *
 * `next build` locally → no basePath so `out/` works with any static server at `/`
 * (e.g. `npx serve out`). Otherwise HTML requests `/Production/_next/...` while
 * files live at `out/_next/...` → 404.
 *
 * GitHub Actions sets `GITHUB_PAGES=1`; `GITHUB_REPOSITORY` is `owner/repo` and
 * yields the project Pages path: https://<user>.github.io/<repo>/
 */
const isNextDev =
  process.argv[2] === "dev" || process.env.NEXT_LOCAL_DEV === "1";

const repoSlug = process.env.GITHUB_REPOSITORY?.split("/")[1];
const basePathForGithubPages =
  !isNextDev &&
  process.env.GITHUB_PAGES === "1" &&
  repoSlug &&
  repoSlug.length > 0
    ? `/${repoSlug}`
    : undefined;

const nextConfig: NextConfig = {
  output: "export",
  ...(basePathForGithubPages ? { basePath: basePathForGithubPages } : {}),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
