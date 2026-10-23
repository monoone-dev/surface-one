// The @surface-one/react-native theme: every token of @surface-one/tokens, resolved per
// skin × light/dark × accent by the same cascade model the token tests use
// (packages/tokens/scripts/cascade.mjs) and converted to React Native values
// (scripts/lib/css-native.mjs — React Native has no var(), oklch() or color-mix()).
// Never edit the output by hand; run from packages/react-native:
//
//   node ../../scripts/generate-native-theme.mjs src/theme/generated
//
// It writes, into the given folder:
//   tokens.ts      the `SoneTokens` interface (token → its React Native type)
//   <skin>.ts      one module per skin — `light` in full, then only what `dark` and each
//                  accent change — so an app bundles just the skins it imports.
// A token joins the theme only when every state converts it to the same kind; the rest
// (gradients, viewport sizes, display keywords) have no React Native meaning.
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import {
  ACCENTS,
  cascade,
  parseRules,
  resolveAll,
} from "../packages/tokens/scripts/cascade.mjs";
import { sourceCss } from "../packages/tokens/scripts/source.mjs";
import { convert } from "./lib/css-native.mjs";
import { skipGenerated } from "./lib/repo.mjs";

if (!process.argv[2])
  throw new Error("usage: generate-native-theme.mjs <target folder>");
const target = resolve(process.argv[2]);
if (skipGenerated(join(target, "tokens.ts"))) process.exit(0);

/** The skins in their docs order; `null` is the base layer (Minimalist). */
const SKINS = [
  ["minimalist", null],
  ["studio", "studio"],
  ["paper", "paper"],
  ["neumorphism", "neumorphism"],
  ["surface", "surface"],
  ["linen", "linen"],
];
const MODES = ["light", "dark"];
const HUES = ACCENTS.filter((a) => a !== null);

/** `--btn-default-bg` → `btnDefaultBg`, `--font-size-2xl` → `fontSize2xl`. */
export const camel = (prop) =>
  prop.slice(2).replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

const rules = parseRules(sourceCss());

/** state key → { prop: resolved css value } */
const resolved = {};
const key = (skin, mode, accent) => `${skin}|${mode}|${accent ?? "-"}`;
for (const [name, skin] of SKINS)
  for (const mode of MODES)
    for (const accent of ACCENTS) {
      const ctx = { skin, theme: mode, mediaDark: false, accent };
      resolved[key(name, mode, accent)] = resolveAll(cascade(rules, ctx));
    }

const states = Object.keys(resolved);
const props = [
  ...new Set(states.flatMap((s) => Object.keys(resolved[s]))),
].filter((p) => p.startsWith("--"));

/** prop → kind, for the props every state converts the same way. */
const kinds = {};
/** state → { camelName: value } */
const values = Object.fromEntries(states.map((s) => [s, {}]));
const dropped = [];
for (const prop of props.sort()) {
  const converted = states.map((s) =>
    resolved[s][prop] === undefined ? null : convert(resolved[s][prop], prop),
  );
  // A token some states never set (`--btn-radius-pressed`) is optional.
  const unset = states.map((s) => resolved[s][prop] === undefined);
  if (converted.some((c, i) => c === null && !unset[i])) {
    dropped.push(prop);
    continue;
  }
  const optional = unset.some(Boolean);
  const present = converted.filter((c) => c !== null);
  const kindsOf = () => new Set(present.map((c) => c.kind));
  let set = kindsOf();
  // A bare 0 reads as a number; next to lengths (or em) it is one of them.
  if (set.has("number") && (set.has("length") || set.has("em"))) {
    if (present.every((c) => c.kind !== "number" || c.value === 0))
      for (const c of present)
        if (c.kind === "number") c.kind = set.has("em") ? "em" : "length";
    set = kindsOf();
  }
  // A letter spacing in em in one skin and in px in another: both stay, `em()` reads either.
  if (set.has("em") && set.has("length") && set.size === 2) {
    for (const c of present) if (c.kind === "length") c.kind = "em-px";
    set = new Set(["em"]);
  }
  // A one-value padding next to a shorthand.
  if (set.has("box") && set.has("length") && set.size === 2) {
    for (const c of present)
      if (c.kind === "length") {
        c.kind = "box";
        c.value = [c.value, c.value, c.value, c.value];
      }
    set = kindsOf();
  }
  if (set.size !== 1) {
    dropped.push(prop);
    continue;
  }
  const kind = [...set][0];
  const name = camel(prop);
  if (Object.values(kinds).some((k) => k.name === name))
    throw new Error(`native theme: two tokens map to ${name}`);
  kinds[prop] = { name, kind, optional };
  states.forEach((s, i) => {
    const c = converted[i];
    if (c === null) return;
    // `em-px`: a px letter spacing among em ones, kept as a plain number.
    values[s][name] = c.kind === "em" ? { em: c.value } : c.value;
  });
}

const TS_TYPE = {
  color: "string",
  length: "number",
  em: "number | { readonly em: number }",
  number: "number",
  duration: "number",
  easing: "readonly [number, number, number, number]",
  shadow: "string",
  font: "string",
  keyword: "string",
  percent: "number",
  angle: "number",
  box: "readonly [number, number, number, number]",
};
const DOC = {
  color: "colour",
  length: "dp",
  em: "em (× the font size) or dp — read it with em()",
  number: "number",
  duration: "ms",
  easing: "cubic-bezier",
  shadow: "boxShadow",
  font: "font family",
  keyword: "keyword",
  percent: "fraction (50% → 0.5)",
  angle: "degrees",
  box: "[top, right, bottom, left] dp",
};

const HEADER =
  "// GENERATED by scripts/generate-native-theme.mjs from @surface-one/tokens — do not edit.\n";

mkdirSync(target, { recursive: true });

writeFileSync(
  join(target, "tokens.ts"),
  `${HEADER}
/** Every SurfaceOne token React Native can use, by its CSS name in camelCase (\`--btn-default-bg\` → \`btnDefaultBg\`). */
export interface SoneTokens {
${Object.entries(kinds)
  .map(
    ([prop, { name, kind, optional }]) =>
      `  /** \`${prop}\` — ${DOC[kind]}${optional ? " (only some skins set it)" : ""} */\n  readonly ${name}${optional ? "?" : ""}: ${TS_TYPE[kind]};`,
  )
  .join("\n")}
}

export type SoneTokenName = keyof SoneTokens;

/** The accent palettes a skin can switch to (\`data-accent\` on the web). */
export const SONE_ACCENTS = ${JSON.stringify(HUES)} as const;
export type SoneAccent = (typeof SONE_ACCENTS)[number];
`,
);

const diff = (from, to) =>
  Object.fromEntries(
    Object.entries(to).filter(
      ([k, v]) => JSON.stringify(from[k]) !== JSON.stringify(v),
    ),
  );
const lit = (obj) => JSON.stringify(obj, null, 2).replace(/\n/g, "\n  ");

for (const [name] of SKINS) {
  const light = values[key(name, "light", null)];
  const dark = diff(light, values[key(name, "dark", null)]);
  const accents = Object.fromEntries(
    HUES.map((hue) => [
      hue,
      {
        light: diff(light, values[key(name, "light", hue)]),
        dark: diff({ ...light, ...dark }, values[key(name, "dark", hue)]),
      },
    ]),
  );
  writeFileSync(
    join(target, `${name}.ts`),
    `${HEADER}import type { SoneSkin } from "../skin";

/** The ${name[0].toUpperCase() + name.slice(1)} skin. */
export const ${name}: SoneSkin = {
  name: ${JSON.stringify(name)},
  light: ${lit(light)},
  dark: ${lit(dark)},
  accents: ${lit(accents)},
};
`,
  );
}

console.log(
  `native theme: ${Object.keys(kinds).length} tokens × ${SKINS.length} skins → ${target} (${dropped.length} with no React Native value)`,
);
