#!/usr/bin/env node
// npx @surface-one/skills add [skill…] [--agent claude|codex|copilot|all] [--global] [--force]
// npx @surface-one/skills list
//
// Copies the Surface One agent skills where each assistant looks for them:
//   Claude Code     → .claude/skills/<name>/      (global: ~/.claude/skills)
//   Codex           → .agents/skills/<name>/      (global: ~/.agents/skills)
//   GitHub Copilot  → .agents/skills/<name>/      (global: ~/.copilot/skills)
// Codex and Copilot share the project's .agents/skills folder, so it is written once.
import { cpSync, existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const SKILLS_DIR = fileURLToPath(new URL("../skills/", import.meta.url));
const AGENTS = ["claude", "codex", "copilot"];

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    agent: { type: "string", multiple: true, short: "a" },
    global: { type: "boolean", short: "g", default: false },
    force: { type: "boolean", short: "f", default: false },
    cwd: { type: "string", default: process.cwd() },
    help: { type: "boolean", short: "h", default: false },
  },
});

const [command = "help", ...requested] = positionals;
const available = readdirSync(SKILLS_DIR).filter((d) =>
  existsSync(join(SKILLS_DIR, d, "SKILL.md")),
);

function describe(name) {
  const md = readFileSync(join(SKILLS_DIR, name, "SKILL.md"), "utf8");
  return /^description:\s*(.+)$/m.exec(md)?.[1].split(". ")[0] ?? "";
}

function targets(agents, global, cwd) {
  const home = homedir();
  const dirs = new Set();
  for (const a of agents) {
    if (a === "claude")
      dirs.add(
        global ? join(home, ".claude/skills") : join(cwd, ".claude/skills"),
      );
    if (a === "codex")
      dirs.add(
        global ? join(home, ".agents/skills") : join(cwd, ".agents/skills"),
      );
    if (a === "copilot")
      dirs.add(
        global ? join(home, ".copilot/skills") : join(cwd, ".agents/skills"),
      );
  }
  return [...dirs];
}

if (command === "list") {
  for (const name of available)
    console.log(`${name.padEnd(26)} ${describe(name)}`);
  process.exit(0);
}

if (command !== "add" || values.help) {
  console.log(`Usage:
  npx @surface-one/skills list
  npx @surface-one/skills add [skill…] [--agent claude|codex|copilot|all]… [--global] [--force]

Without skill names every Surface One skill is installed; without --agent, for all three assistants.`);
  process.exit(command === "help" || values.help ? 0 : 1);
}

const agentArgs = (values.agent ?? ["all"]).flatMap((a) => a.split(","));
const agents = agentArgs.includes("all") ? AGENTS : agentArgs;
const unknownAgent = agents.find((a) => !AGENTS.includes(a));
if (unknownAgent) {
  console.error(
    `Unknown agent "${unknownAgent}". Use: ${AGENTS.join(", ")}, all.`,
  );
  process.exit(1);
}
const skills = requested.length ? requested : available;
const unknownSkill = skills.find((s) => !available.includes(s));
if (unknownSkill) {
  console.error(
    `Unknown skill "${unknownSkill}". Available: ${available.join(", ")}.`,
  );
  process.exit(1);
}

const cwd = resolve(values.cwd);
let installed = 0;
for (const dir of targets(agents, values.global, cwd)) {
  for (const skill of skills) {
    const dest = join(dir, skill);
    const where = values.global ? dest : relative(cwd, dest);
    if (existsSync(dest) && !values.force) {
      console.log(`skip   ${where} (exists — use --force to update)`);
      continue;
    }
    rmSync(dest, { recursive: true, force: true });
    cpSync(join(SKILLS_DIR, skill), dest, { recursive: true });
    console.log(`added  ${where}`);
    installed++;
  }
}
console.log(
  `\n${installed} skill folder(s) written for ${agents.join(", ")}.` +
    `\nTip: also add the MCP server — claude mcp add surface-one-angular -- npx -y @surface-one/angular-mcp@latest`,
);
