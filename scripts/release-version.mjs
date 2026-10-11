// One version for every published package (they are released together).
// release-please bumps the root package.json and CHANGELOG.md in its release PR;
// .github/workflows/release.yml then runs this script on that PR to carry the
// version into every package, the lockfile, the docs site and the VERSION constant.
//
//   node scripts/release-version.mjs 0.2.0            set the version everywhere
//   node scripts/release-version.mjs --check v0.2.0   CI: fail unless every package is at the tag
import { publicPackages } from "./lib/packages.mjs";
import { readJson, readText, writeJson, writeText } from "./lib/repo.mjs";

// The public workspaces (a `"private": true` one keeps its own version).
const PUBLIC = publicPackages();
const PACKAGES = PUBLIC.map((p) => p.dir);
const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

const args = process.argv.slice(2);
const check = args[0] === "--check";
const version = (check ? args[1] : args[0])?.replace(/^v/, "");
if (!version || !SEMVER.test(version)) {
  console.error("Usage: release-version.mjs <x.y.z> | --check <vX.Y.Z>");
  process.exit(1);
}

const pkgPath = (dir) => `${dir}/package.json`;
const readPkg = (dir) => readJson(pkgPath(dir));

if (check) {
  const wrong = [".", ...PACKAGES]
    .map((d) => [d, readPkg(d).version])
    .filter(([, v]) => v !== version);
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

const setVersion = (pkg) => {
  pkg.version = version;
  if (pkg.peerDependencies?.["@surface-one/tokens"]) {
    pkg.peerDependencies["@surface-one/tokens"] = `^${version}`;
  }
};

for (const dir of [".", ...PACKAGES]) {
  const pkg = readPkg(dir);
  setVersion(pkg);
  writeJson(pkgPath(dir), pkg);
}

// The lockfile mirrors every workspace's version and peer range; npm ci wants them in step.
const lockPath = "package-lock.json";
const lock = readJson(lockPath);
lock.version = version;
for (const key of ["", ...PACKAGES]) {
  if (lock.packages?.[key]) setVersion(lock.packages[key]);
}
writeJson(lockPath, lock);

const replaceIn = (file, pattern, replacement) => {
  const before = readText(file);
  if (!pattern.test(before)) throw new Error(`no version found in ${file}`);
  writeText(file, before.replace(pattern, replacement));
};
replaceIn(
  "apps/docs/src/app/site.config.ts",
  /version: "[^"]+"/,
  `version: "${version}"`,
);
// Each package's `export const VERSION = "x.y.z"` (PACKAGE_TABLE.versionFile).
for (const { versionFile } of PUBLIC) {
  if (versionFile)
    replaceIn(versionFile, /VERSION = "[^"]+"/, `VERSION = "${version}"`);
}

console.log(
  `version ${version}: root, ${PACKAGES.join(", ")}, package-lock.json, docs site, VERSION constant.`,
);
