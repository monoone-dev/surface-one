// One version for every published package (they are released together).
//
//   node scripts/release-version.mjs 0.2.0      set the version everywhere
//   node scripts/release-version.mjs --check v0.2.0   CI: fail unless every package is at the tag
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGES = [
  "packages/tokens",
  "packages/angular",
  "packages/angular-mcp",
  "packages/skills",
];
const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

const args = process.argv.slice(2);
const check = args[0] === "--check";
const version = (check ? args[1] : args[0])?.replace(/^v/, "");
if (!version || !SEMVER.test(version)) {
  console.error("Usage: release-version.mjs <x.y.z> | --check <vX.Y.Z>");
  process.exit(1);
}

const pkgPath = (dir) => join(root, dir, "package.json");
const readPkg = (dir) => JSON.parse(readFileSync(pkgPath(dir), "utf8"));

if (check) {
  const wrong = PACKAGES.map((d) => [d, readPkg(d).version]).filter(
    ([, v]) => v !== version,
  );
  if (wrong.length) {
    for (const [d, v] of wrong)
      console.error(`${d} is ${v}, the tag says ${version}`);
    console.error(
      `Run: node scripts/release-version.mjs ${version} — then commit before tagging.`,
    );
    process.exit(1);
  }
  console.log(`every package is at ${version}`);
  process.exit(0);
}

for (const dir of PACKAGES) {
  const pkg = readPkg(dir);
  pkg.version = version;
  if (pkg.peerDependencies?.["@surface-one/tokens"]) {
    pkg.peerDependencies["@surface-one/tokens"] = `^${version}`;
  }
  writeFileSync(pkgPath(dir), JSON.stringify(pkg, null, 2) + "\n");
}

const replaceIn = (file, pattern, replacement) => {
  const path = join(root, file);
  const before = readFileSync(path, "utf8");
  const after = before.replace(pattern, replacement);
  if (after === before) throw new Error(`no version found in ${file}`);
  writeFileSync(path, after);
};
replaceIn(
  "apps/docs/src/app/site.config.ts",
  /version: "[^"]+"/,
  `version: "${version}"`,
);
replaceIn(
  "packages/angular/public-api.ts",
  /VERSION = "[^"]+"/,
  `VERSION = "${version}"`,
);

console.log(`version ${version}: ${PACKAGES.join(", ")}, docs site, VERSION constant.
Next: add the release notes (apps/docs/src/app/pages/release/release.page.ts RELEASES +
release.entries in every locale), commit, merge, then tag: git tag v${version} && git push origin v${version}`);
