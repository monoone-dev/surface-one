// A small model of the CSS cascade for the token stylesheets: every rule they hold is a
// `:root` compound selector (attribute and `:not([attr])` conditions only), optionally inside
// `@media (prefers-color-scheme: dark)`. For one document state — data-skin × data-theme ×
// the colour-scheme media query × data-accent — it picks the winning declaration of every
// property by specificity, then source order, and resolves the var() references the way a
// browser computes a custom property. The tests, the build checks and dist/tokens.json all
// read the stylesheets through it, so "the same tokens" is checked, not assumed.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import postcss from "postcss";

export const SKINS = [
  null,
  "minimalist",
  "studio",
  "paper",
  "neumorphism",
  "material",
  "surface",
  "airy",
];
export const THEMES = [null, "light", "dark", "system"];
export const ACCENTS = [null, "blue", "teal", "green", "orange", "pink"];

/** Every document state a page can be in: 8 skins × 4 data-theme × 2 media × 6 accents. */
export function contexts() {
  const out = [];
  for (const skin of SKINS)
    for (const theme of THEMES)
      for (const mediaDark of [false, true])
        for (const accent of ACCENTS)
          out.push({
            skin,
            theme,
            mediaDark,
            accent,
            id: [
              `skin=${skin ?? "-"}`,
              `theme=${theme ?? "-"}`,
              `media=${mediaDark ? "dark" : "light"}`,
              `accent=${accent ?? "-"}`,
            ].join(" "),
          });
  return out;
}

/** One-line form of a value, so formatting (line breaks, indentation) never counts as a change. */
export function normalize(value) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s*,\s*/g, ", ")
    .trim();
}

// Sass drops the quotes of a simple attribute value (`[data-theme=dark]`), so both forms parse.
const COND =
  /^(?::not\(\[([a-z-]+)(?:="?([^"\]]*)"?)?\]\)|\[([a-z-]+)(?:="?([^"\]]*)"?)?\])/;

/** `:root[a="b"]:not([c])` → { spec, conds: [{ attr, value, negate }] }; null for any other selector. */
export function parseSelector(selector) {
  let rest = selector.trim();
  if (!rest.startsWith(":root")) return null;
  rest = rest.slice(5);
  const conds = [];
  while (rest) {
    const m = rest.match(COND);
    if (!m)
      throw new Error(`cascade: unsupported :root selector "${selector}"`);
    conds.push(
      m[1]
        ? { attr: m[1], value: m[2] ?? null, negate: true }
        : { attr: m[3], value: m[4] ?? null, negate: false },
    );
    rest = rest.slice(m[0].length);
  }
  return { spec: 1 + conds.length, conds };
}

/** Parses stylesheet text into the :root rules the cascade can see, in source order. */
export function parseRules(css, from = "tokens.css") {
  const rules = [];
  postcss.parse(css, { from }).walkRules((rule) => {
    let media = null;
    for (let p = rule.parent; p && p.type !== "root"; p = p.parent) {
      if (p.type === "atrule" && p.name === "media") {
        if (normalize(p.params) !== "(prefers-color-scheme: dark)")
          media = "other";
        else media = "dark";
      } else if (p.type === "atrule" && p.name !== "media") media = "other";
    }
    const selectors = rule.selectors.map(parseSelector);
    if (selectors.every((s) => s === null)) return;
    if (selectors.some((s) => s === null))
      throw new Error(
        `cascade: a rule mixes :root and other selectors: ${rule.selector}`,
      );
    if (media === "other")
      throw new Error(
        `cascade: :root rule under an unsupported at-rule: ${rule.selector}`,
      );
    const decls = [];
    rule.each((node) => {
      if (node.type !== "decl") return;
      if (node.important)
        throw new Error(`cascade: !important is not modelled (${node.prop})`);
      decls.push({ prop: node.prop, value: normalize(node.value) });
    });
    rules.push({
      selector: rule.selector,
      selectors,
      media,
      decls,
      order: rules.length,
    });
  });
  return rules;
}

/** The stylesheet text of css/index.css with its @imports inlined, in load order. */
export function readIndex(indexFile) {
  const dir = dirname(indexFile);
  const out = [];
  for (const m of readFileSync(indexFile, "utf8").matchAll(
    /@import\s+"([^"]+)"/g,
  )) {
    out.push(readFileSync(join(dir, m[1]), "utf8"));
  }
  return out.join("\n");
}

function attr(ctx, name) {
  if (name === "data-skin") return ctx.skin;
  if (name === "data-theme") return ctx.theme;
  if (name === "data-accent") return ctx.accent;
  throw new Error(`cascade: unknown attribute ${name}`);
}

function matches(sel, ctx) {
  return sel.conds.every(({ attr: a, value, negate }) => {
    const v = attr(ctx, a);
    const hit = value === null ? v !== null : v === value;
    return negate ? !hit : hit;
  });
}

/** prop → { value, rule } of the winning declaration in one document state. */
export function cascade(rules, ctx) {
  const win = new Map();
  for (const rule of rules) {
    if (rule.media === "dark" && !ctx.mediaDark) continue;
    let spec = 0;
    for (const sel of rule.selectors)
      if (matches(sel, ctx)) spec = Math.max(spec, sel.spec);
    if (!spec) continue;
    for (const d of rule.decls) {
      const prev = win.get(d.prop);
      // Later rules come later in the loop, so ">=" lets source order break a specificity tie.
      if (!prev || spec >= prev.spec)
        win.set(d.prop, { value: d.value, spec, rule });
    }
  }
  return win;
}

/** Splits `--name, fallback` at its first top-level comma. */
function splitVar(args) {
  let depth = 0;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "(") depth++;
    else if (args[i] === ")") depth--;
    else if (args[i] === "," && depth === 0)
      return [args.slice(0, i).trim(), args.slice(i + 1).trim()];
  }
  return [args.trim(), null];
}

export const INVALID = "<guaranteed-invalid>";

/**
 * Substitutes every var() the way computed custom properties do: an undefined reference
 * takes its fallback, or makes the whole value invalid; a cycle makes every member invalid.
 * `missing` collects the undefined references that had no fallback.
 */
export function resolveAll(win, missing = null) {
  const done = new Map();
  const stack = new Set();
  const resolve = (prop) => {
    if (done.has(prop)) return done.get(prop);
    if (!win.has(prop)) return undefined;
    if (stack.has(prop)) return INVALID;
    stack.add(prop);
    const out = substitute(win.get(prop).value, prop);
    stack.delete(prop);
    done.set(prop, out);
    return out;
  };
  const substitute = (value, owner) => {
    let out = "";
    let i = 0;
    while (i < value.length) {
      const at = value.indexOf("var(", i);
      if (at < 0) {
        out += value.slice(i);
        break;
      }
      out += value.slice(i, at);
      let depth = 1;
      let j = at + 4;
      for (; j < value.length && depth; j++) {
        if (value[j] === "(") depth++;
        else if (value[j] === ")") depth--;
      }
      const [name, fallback] = splitVar(value.slice(at + 4, j - 1));
      let sub = resolve(name);
      if (sub === undefined || sub === INVALID) {
        if (fallback !== null) sub = substitute(fallback, owner);
        else {
          if (sub === undefined && missing) missing.add(`${owner} → ${name}`);
          return INVALID;
        }
      }
      if (sub === INVALID) return INVALID;
      out += sub;
      i = j;
    }
    return normalize(out);
  };
  const result = {};
  for (const prop of [...win.keys()].sort()) result[prop] = resolve(prop);
  return result;
}

/** contextId → { prop: resolved value } for every document state. */
export function resolveContexts(css) {
  const rules = parseRules(css);
  const out = {};
  for (const ctx of contexts()) out[ctx.id] = resolveAll(cascade(rules, ctx));
  return out;
}
