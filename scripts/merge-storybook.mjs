// Publishes the Storybook build under /storybook/ of the docs site, so the docs
// can deep-link into it (`storybookUrl()` in site.config.ts) from the same origin.
import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const from = join(root, "dist/storybook");
const to = join(root, "dist/docs/browser/storybook");
if (!existsSync(from))
  throw new Error(
    "dist/storybook is missing — run `npm run build-storybook` first",
  );
rmSync(to, { recursive: true, force: true });
cpSync(from, to, { recursive: true });
console.log("storybook → dist/docs/browser/storybook/");
