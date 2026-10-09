// Publishes every SurfaceOne package in dependency order, skipping a version
// that is already on the registry (so a re-run after a partial failure is
// safe). Used by .github/workflows/release.yml after the packages are built.
//
//   node scripts/publish-packages.mjs [--registry npm|github] [--dry-run] [--tag next]
//
// --registry npm (default): npmjs.com as @surface-one/*, with provenance.
// --registry github: GitHub Packages (npm.pkg.github.com). GitHub only accepts the
//   scope of the repository owner, so each package is published as
//   @monoone-dev/surface-one-<name> (@surface-one/angular → @monoone-dev/surface-one-angular);
//   consumers alias it back to @surface-one/* (README → Install from GitHub Packages).
//   Auth: NODE_AUTH_TOKEN (GITHUB_TOKEN with packages: write in CI).
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { values } = parseArgs({
  options: {
    registry: { type: "string", default: "npm" },
    "dry-run": { type: "boolean", default: false },
    tag: { type: "string", default: "latest" },
  },
});

const GITHUB_OWNER = "monoone-dev";
const REGISTRIES = {
  npm: { url: "https://registry.npmjs.org", rename: (name) => name },
  github: {
    url: "https://npm.pkg.github.com",
    rename: (name) =>
      name.replace(/^@surface-one\//, `@${GITHUB_OWNER}/surface-one-`),
  },
};
const registry = REGISTRIES[values.registry];
if (!registry) {
  throw new Error(
    `unknown --registry ${values.registry} (expected ${Object.keys(REGISTRIES).join(" or ")})`,
  );
}
const github = values.registry === "github";

// The folder that is published (the Angular package ships its ng-packagr build,
// the Vue package its own dist/ — package.json "files").
const PACKAGES = [
  "packages/tokens",
  "dist/angular",
  "packages/vue",
  "packages/angular-mcp",
  "packages/skills",
];
const REQUIRED = {
  "packages/tokens": "css/index.css",
  "dist/angular": "fesm2022/surface-one-angular-button.mjs",
  "packages/vue": "dist/styles.css",
  "packages/angular-mcp": "data/surface-one-angular.json",
  "packages/skills": "skills/surface-one-angular/references/components.md",
};

// GitHub Packages needs a token even to read; a throwaway userconfig keeps the
// token for npm.pkg.github.com away from the npmjs.com config set up by CI.
let userconfig;
if (github) {
  const dir = mkdtempSync(join(tmpdir(), "surface-one-npmrc-"));
  userconfig = join(dir, ".npmrc");
  writeFileSync(
    userconfig,
    [
      `@${GITHUB_OWNER}:registry=${registry.url}`,
      "//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}",
      "",
    ].join("\n"),
  );
  process.on("exit", () => rmSync(dir, { recursive: true, force: true }));
}

const npm = (args, opts = {}) =>
  execFileSync(
    "npm",
    [
      ...args,
      "--registry",
      registry.url,
      ...(userconfig ? ["--userconfig", userconfig] : []),
    ],
    { encoding: "utf8", ...opts },
  );

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
  const manifestPath = join(path, "package.json");
  const original = readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(original);
  const name = registry.rename(manifest.name);
  const { version } = manifest;
  if (published(name, version)) {
    console.log(`skip     ${name}@${version} (already on ${values.registry})`);
    continue;
  }
  const args = ["publish", "--access", "public", "--tag", values.tag];
  if (values["dry-run"]) args.push("--dry-run");
  // npm provenance is an npmjs.com feature; GitHub Packages rejects it.
  else if (!github) args.push("--provenance");
  console.log(
    `publish  ${name}@${version} → ${registry.url}${values["dry-run"] ? " (dry run)" : ""}`,
  );
  // The rename lives only for the publish; the manifest is restored either way.
  if (name !== manifest.name) {
    manifest.name = name;
    manifest.publishConfig = {
      ...manifest.publishConfig,
      registry: registry.url,
    };
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  try {
    npm(args, { cwd: path, stdio: "inherit" });
  } finally {
    writeFileSync(manifestPath, original);
  }
}
