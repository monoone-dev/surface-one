// Conventional Commits for commit messages and PR titles (see .agents/skills/pr-description).
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const TYPES = [
  "feat",
  "fix",
  "refactor",
  "chore",
  "docs",
  "test",
  "perf",
  "ci",
  "build",
  "style",
  "revert",
];

/** The sub-folders of a repo folder (none when it does not exist). */
const folders = (dir) =>
  existsSync(join(root, dir))
    ? readdirSync(join(root, dir), { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith("."))
        .map((d) => d.name)
    : [];

// Scopes: every package (angular, vue, react, tokens, angular-mcp, skills, core, …), every
// app, every @surface-one/angular entry point (button, dialog, graph-layout, …) — read
// from the folders, so a new one needs no change here — plus the repo-wide areas below.
const AREAS = [
  "a11y",
  "ai",
  "api",
  "changelog",
  "ci",
  "commitlint",
  "demos",
  "deps",
  "docs",
  "e2e",
  "hooks",
  "i18n",
  "lint",
  "mcp",
  "nuxt",
  "playground",
  "readme",
  "release",
  "repo",
  "scripts",
  "storybook",
  "stylelint",
  "templates",
  "theming",
];
const SCOPES = [
  ...new Set([
    ...AREAS,
    ...folders("packages"),
    ...folders("apps"),
    ...folders("packages/angular"),
  ]),
].sort();

// No AI attribution of any kind: co-author trailers, "generated with" footers, tool names as authors.
const AI_ATTRIBUTION =
  /co-authored-by:.*(claude|anthropic|codex|openai|copilot|gpt|gemini)|generated (with|by) .*(claude|codex|copilot|chatgpt|ai)/i;

export default {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "no-ai-attribution": ({ raw }) => [
          !AI_ATTRIBUTION.test(raw ?? ""),
          'remove the AI attribution (co-author trailer or "generated with" footer)',
        ],
      },
    },
  ],
  rules: {
    "type-enum": [2, "always", TYPES],
    "scope-enum": [2, "always", SCOPES],
    "header-max-length": [2, "always", 100],
    "subject-case": [2, "always", "lower-case"],
    "no-ai-attribution": [2, "always"],
  },
};
