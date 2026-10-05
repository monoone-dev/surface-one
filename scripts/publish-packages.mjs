// Publishes every Surface One package to npm in dependency order, skipping a
// version that is already on the registry (so a re-run after a partial failure
// is safe). Used by .github/workflows/release.yml after the packages are built.
//
//   node scripts/publish-packages.mjs [--dry-run] [--tag next]
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { values } = parseArgs({
  options: {
    "dry-run": { type: "boolean", default: false },
    tag: { type: "string", default: "latest" },
  },
});

// The folder that is published (the Angular package ships its ng-packagr build).
const PACKAGES = [
  "packages/tokens",
  "dist/angular",
  "packages/angular-mcp",
  "packages/skills",
];
const REQUIRED = {
  "packages/tokens": "css/index.css",
  "dist/angular": "fesm2022/surface-one-angular-button.mjs",
  "packages/angular-mcp": "data/surface-one-angular.json",
  "packages/skills": "skills/surface-one-angular/references/components.md",
};

const npm = (args, opts = {}) =>
  execFileSync("npm", args, { encoding: "utf8", ...opts });

function published(name, version) {
  try {
    return (
      npm(["view", `${name}@${version}`, "version"], {
        stdio: ["ignore", "pipe", "ignore"],
      }).trim() === version
    );
  } catch {
    return false;
  }
}

for (const dir of PACKAGES) {
  const path = join(root, dir);
  if (!existsSync(join(path, REQUIRED[dir]))) {
    throw new Error(
      `${dir} is not built (${REQUIRED[dir]} missing) — run npm run build first`,
    );
  }
  const { name, version } = JSON.parse(
    readFileSync(join(path, "package.json"), "utf8"),
  );
  if (published(name, version)) {
    console.log(`skip     ${name}@${version} (already on npm)`);
    continue;
  }
  const args = ["publish", "--access", "public", "--tag", values.tag];
  if (values["dry-run"]) args.push("--dry-run");
  else args.push("--provenance");
  console.log(
    `publish  ${name}@${version}${values["dry-run"] ? " (dry run)" : ""}`,
  );
  npm(args, { cwd: path, stdio: "inherit" });
}
