// `npm run build:twins`: the Vue, React and React Native packages at once. They build from the
// sources (core, packages/angular) and write only their own dist/, so nothing orders them; run
// one after another they were the slowest third of `npm run build`. Output is buffered per
// package and printed when it ends, so the three logs never interleave.
import { spawn } from "node:child_process";

import { root } from "./lib/repo.mjs";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const PACKAGES = ["vue", "react", "react-native"];

const run = (name) =>
  new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(npm, ["run", `build:${name}`], {
      cwd: root,
      shell: process.platform === "win32",
    });
    let log = "";
    child.stdout.on("data", (d) => (log += d));
    child.stderr.on("data", (d) => (log += d));
    child.on("close", (code) => {
      const secs = ((Date.now() - started) / 1000).toFixed(1);
      process.stdout.write(
        `\n── build:${name} (${secs}s, exit ${code}) ──\n${log}`,
      );
      resolve(code);
    });
  });

const codes = await Promise.all(PACKAGES.map(run));
const failed = PACKAGES.filter((_, i) => codes[i] !== 0);
if (failed.length) {
  console.error(`build:twins: ${failed.join(", ")} failed`);
  process.exit(1);
}
