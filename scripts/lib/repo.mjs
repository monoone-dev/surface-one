// Shared helpers for the repo scripts: where the repo is, how to walk it, read and
// write JSON, and the few facts the scripts read from the docs app.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

/** The repository root (absolute). */
export const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

/** A path relative to the repo root → absolute (absolute paths pass through). */
export const abs = (path) => (isAbsolute(path) ? path : join(root, path));

/** An absolute path → relative to the repo root, with `/` separators. */
export const rel = (path) => relative(root, abs(path)).split("\\").join("/");

/** Reads a UTF-8 file (path relative to the repo root or absolute). */
export const readText = (path) => readFileSync(abs(path), "utf8");

export const readJson = (path) => JSON.parse(readText(path));

/** Writes a file, creating its folder first. */
export function writeText(path, content) {
  const target = abs(path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}

/** Writes `data` as JSON with a trailing newline; `space: 0` writes it compact. */
export function writeJson(path, data, space = 2) {
  writeText(path, JSON.stringify(data, null, space || undefined) + "\n");
}

/**
 * Every file under `dir` (absolute paths, sorted by directory order), skipping
 * `node_modules` and dot-entries. `filter(path, name)` keeps a file when it returns true.
 */
export function walk(dir, filter = () => true) {
  const start = abs(dir);
  if (!existsSync(start)) return [];
  return readdirSync(start).flatMap((name) => {
    if (name === "node_modules" || name.startsWith(".")) return [];
    const path = join(start, name);
    if (statSync(path).isDirectory()) return walk(path, filter);
    return filter(path, name) ? [path] : [];
  });
}

/** The docs app's source folder, relative to the repo root. */
export const DOCS_APP = "apps/docs/src/app";

/** `SITE.url` of apps/docs/src/app/site.config.ts — the production URL, no trailing slash. */
export function siteUrl() {
  const config = readText(`${DOCS_APP}/site.config.ts`);
  const url = /\burl:\s*(["'`])([^"'`]+)\1/.exec(config)?.[2];
  if (!url) throw new Error(`${DOCS_APP}/site.config.ts: no SITE.url`);
  return url.replace(/\/+$/, "");
}

/**
 * The `--name: value;` custom-property declarations of a block of CSS/SCSS source:
 * `{ "--name": "value" }` in source order (values verbatim, whitespace collapsed;
 * a name declared twice keeps its first position and its last value).
 */
export function cssDeclarations(source) {
  const out = {};
  for (const m of source.matchAll(/^\s*(--[a-z0-9_-]+)\s*:\s*([^;]+);/gim)) {
    out[m[1]] = m[2].replace(/\s+/g, " ").trim();
  }
  return out;
}

/**
 * True when a generator should not run again: `SONE_SKIP_GENERATE=1` (set by CI after
 * its one `npm run generate`) and every given output already exists. Logs the skip.
 */
export function skipGenerated(...outputs) {
  if (process.env.SONE_SKIP_GENERATE !== "1") return false;
  if (!outputs.every((o) => existsSync(abs(o)))) return false;
  console.log(
    `generate: skipped (SONE_SKIP_GENERATE=1) → ${outputs.map(rel).join(", ")}`,
  );
  return true;
}
