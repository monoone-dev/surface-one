// Build-time checks on the token definitions. Each returns a list of problems (empty = pass).
import { cascade, contexts, resolveAll } from "./cascade.mjs";
import { skinBlocks } from "./generate.mjs";

const CONTEXTS = contexts();

function matches(sel, ctx) {
  return sel.conds.every(({ attr, value, negate }) => {
    const v =
      attr === "data-skin"
        ? ctx.skin
        : attr === "data-theme"
          ? ctx.theme
          : ctx.accent;
    const hit = value === null ? v !== null : v === value;
    return negate ? !hit : hit;
  });
}

/** The winning raw value of `prop` in every context, ignoring the rules `skip` rejects. */
function winners(rules, prop, skip) {
  return CONTEXTS.map((ctx) => {
    let best = null;
    let spec = 0;
    for (const r of rules) {
      if (skip(r) || (r.media === "dark" && !ctx.mediaDark)) continue;
      const d = r.decls.find((x) => x.prop === prop);
      if (!d) continue;
      let s = 0;
      for (const sel of r.selectors)
        if (matches(sel, ctx)) s = Math.max(s, sel.spec);
      if (s && s >= spec) {
        spec = s;
        best = d.value;
      }
    }
    return best;
  }).join("\u0000");
}

/**
 * Declarations of the theme layer that change nothing: without them every document state
 * (skin × data-theme × media × accent) still resolves the property to the same value,
 * because the value they would inherit is identical.
 */
export function redundantDeclarations(rules) {
  const problems = [];
  const byProp = new Map();
  for (const r of rules)
    for (const d of r.decls)
      (byProp.get(d.prop) ?? byProp.set(d.prop, []).get(d.prop)).push(r);
  for (const [prop, list] of byProp) {
    const want = winners(list, prop, () => false);
    const origins = new Set(
      list
        .filter((r) => r.origin)
        .map((r) => `${r.origin.skin}.${r.origin.block}`),
    );
    for (const origin of origins) {
      const got = winners(
        list,
        prop,
        (r) => r.origin && `${r.origin.skin}.${r.origin.block}` === origin,
      );
      if (got === want)
        problems.push(
          `${origin} ${prop}: identical to the value it inherits — delete it`,
        );
    }
  }
  return problems;
}

/** A light value ≥4 skins declare alike (and the base does not) belongs in shared.mjs. */
export function sharedCandidates(defs) {
  const problems = [];
  const values = {};
  for (const name of Object.keys(defs.skins)) {
    for (const [prop, value] of Object.entries(defs.skins[name].light ?? {})) {
      ((values[prop] ??= {})[value] ??= []).push(name);
      if (defs.shared.light[prop] === value) {
        problems.push(
          `${name}.light ${prop}: identical to the shared value — delete it`,
        );
      }
    }
  }
  for (const [prop, byValue] of Object.entries(values)) {
    for (const [value, skins] of Object.entries(byValue)) {
      if (skins.length >= 4 && defs.base.light?.[prop] !== value) {
        problems.push(
          `${prop}: ${value} is declared by ${skins.join(", ")} — move it to shared.mjs`,
        );
      }
    }
  }
  return problems;
}

/** Tokens a skin sets for dark mode but never for light (where it would fall back to the base). */
export function darkWithoutLight(defs) {
  const problems = [];
  const base = new Set(
    Object.keys({ ...defs.base.light, ...defs.base.lightAccent }),
  );
  for (const prop of Object.keys({
    ...defs.base.dark,
    ...defs.base.darkAccent,
  })) {
    if (!base.has(prop))
      problems.push(`minimalist: ${prop} has a dark value but no light one`);
  }
  for (const name of Object.keys(defs.skins)) {
    const b = skinBlocks(defs, name);
    const light = new Set([
      ...base,
      ...Object.keys(b.light),
      ...Object.keys(b.lightAccent),
    ]);
    for (const prop of Object.keys({ ...b.dark, ...b.darkAccent })) {
      if (!light.has(prop))
        problems.push(`${name}: ${prop} has a dark value but no light one`);
    }
  }
  return problems;
}

/** var() references, in any document state, to a token nothing defines (and with no fallback). */
export function undefinedReferences(rules) {
  const missing = new Set();
  for (const ctx of CONTEXTS) resolveAll(cascade(rules, ctx), missing);
  return [...missing].map((m) => `undefined var() reference: ${m}`);
}
