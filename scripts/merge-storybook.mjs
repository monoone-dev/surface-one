// Publishes the Storybook build under /storybook/ of the docs site, so the docs
// can deep-link into it (`storybookUrl()` in site.config.ts) from the same origin.
import { cpSync, existsSync, rmSync } from "node:fs";
import { abs } from "./lib/repo.mjs";

const from = abs("dist/storybook");
const to = abs("dist/docs/browser/storybook");
if (!existsSync(from))
  throw new Error(
    "dist/storybook is missing — run `npm run build-storybook` first",
  );
rmSync(to, { recursive: true, force: true });
cpSync(from, to, { recursive: true });
console.log("storybook → dist/docs/browser/storybook/");
