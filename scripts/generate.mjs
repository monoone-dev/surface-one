// `npm run generate`: every generated file of the repo, once, in dependency order —
//
//   docs:api         apps/docs/src/app/catalog/{api,tokens}.generated.json
//   docs:changelog   apps/docs/src/app/pages/changelog/changelog.generated.json
//   docs:templates   apps/docs/src/app/templates/sources/*.generated.ts
//   ai:build         packages/angular-mcp/data + packages/skills/skills/*/references
//   <workspace>      the `generate` script of every workspace that has one (the Vue and
//                    React icons, host CSS and demo snippets)
//
// `npm ci` (prepare), `npm start` and `npm run build` call it; the inner build, test and
// type-check scripts do not. CI runs it once per job and then sets SONE_SKIP_GENERATE=1,
// which turns this script (and the workspace generators) into a no-op.
import { execFileSync } from "node:child_process";

import { workspaceDirs } from "./lib/packages.mjs";
import { readJson, root } from "./lib/repo.mjs";

if (process.env.SONE_SKIP_GENERATE === "1") {
  console.log("generate: skipped (SONE_SKIP_GENERATE=1)");
  process.exit(0);
}

const node = (script) =>
  execFileSync(process.execPath, [`scripts/${script}`], {
    cwd: root,
    stdio: "inherit",
  });

node("extract-api.mjs");
node("build-changelog.mjs");
node("build-template-sources.mjs");
node("build-ai.mjs");

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
for (const dir of workspaceDirs()) {
  let manifest;
  try {
    manifest = readJson(`${dir}/package.json`);
  } catch {
    continue;
  }
  if (!manifest.scripts?.generate) continue;
  execFileSync(npm, ["run", "-s", "generate"], {
    cwd: `${root}/${dir}`,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
}
