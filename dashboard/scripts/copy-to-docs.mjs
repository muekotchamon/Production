import { cpSync, rmSync, mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dashboardRoot = join(__dirname, "..");
const outDir = join(dashboardRoot, "out");
const docsDir = join(dashboardRoot, "..", "docs");

if (!existsSync(outDir)) {
  console.error("Missing dashboard/out — run `npm run build` in dashboard/ first.");
  process.exit(1);
}

rmSync(docsDir, { recursive: true, force: true });
mkdirSync(docsDir, { recursive: true });
cpSync(outDir, docsDir, { recursive: true });
// GitHub Pages runs Jekyll by default; without this, `_next/` is not published.
writeFileSync(join(docsDir, ".nojekyll"), "");
console.log(`Copied static export → ${docsDir} (with .nojekyll)`);
