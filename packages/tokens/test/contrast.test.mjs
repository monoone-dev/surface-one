// WCAG 2.2 AA contrast of the token pairs components actually draw, in every skin × light/dark
// × accent: 4.5:1 for text (1.4.3), 3:1 for control boundaries and focus indicators (1.4.11).
// Translucent tokens are composited over what sits behind them before the ratio is taken.
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseColor, formatColor } from "../../../scripts/lib/css-native.mjs";
import {
  ACCENTS,
  contexts,
  INVALID,
  resolveContexts,
  SKINS,
} from "../scripts/cascade.mjs";
import { sourceCss } from "../scripts/source.mjs";

const TEXT = 4.5;
const UI = 3;

/** [foreground, background stack (top first, over --surface-base), minimum ratio]. */
const PAIRS = [
  ["--text-primary", ["--surface-base"], TEXT],
  ["--text-primary", ["--surface-raised"], TEXT],
  ["--text-secondary", ["--surface-base"], TEXT],
  ["--text-secondary", ["--surface-raised"], TEXT],
  ["--text-muted", ["--surface-base"], TEXT],
  ["--text-muted", ["--surface-raised"], TEXT],
  ["--text-muted", ["--surface-hover"], TEXT],
  ["--text-secondary", ["--surface-hover"], TEXT],
  ["--tabs-trigger-fg", ["--tabs-list-bg"], TEXT],
  ["--text-on-accent", ["--accent"], TEXT],
  ["--accent-text", ["--surface-base"], TEXT],
  ["--accent-text", ["--surface-raised"], TEXT],
  ["--accent-text", ["--accent-soft"], TEXT],
  ["--btn-default-fg", ["--btn-default-bg"], TEXT],
  ["--btn-secondary-fg", ["--btn-secondary-bg"], TEXT],
  ["--danger-text", ["--surface-base"], TEXT],
  ["--danger-text", ["--danger-soft"], TEXT],
  ["--success-text", ["--success-soft"], TEXT],
  ["--warning-text", ["--warning-soft"], TEXT],
  ["--prose-link-fg", ["--surface-base"], TEXT],
  ["--checkbox-border", ["--surface-base"], UI],
  ["--switch-track-off", ["--surface-base"], UI],
  ["--focus-ring-color", ["--surface-base"], UI],
  ["--focus-ring-color", ["--surface-raised"], UI],
  ["--accent-edge", ["--surface-base"], UI],
  ["--accent", ["--surface-base"], UI],
  ["--danger", ["--surface-base"], UI],
  ["--calendar-selected-fg", ["--calendar-selected-bg"], TEXT],
  ["--calendar-range-fg", ["--calendar-range-bg"], TEXT],
  ["--calendar-weekday-fg", ["--surface-overlay"], TEXT],
  ["--calendar-outside-fg", ["--surface-overlay"], TEXT],
];

/**
 * A text field is identified by its border or by its fill — whichever stands out more from the
 * page (Studio and Neumorphism draw filled fields with no border).
 */
const BOUNDARIES = [["--input-border", "--surface-input"]];

const rgba = (value) => {
  const c = parseColor(value);
  if (!c) return null;
  const f = formatColor(c);
  if (f.startsWith("#"))
    return [1, 3, 5]
      .map((i) => parseInt(f.slice(i, i + 2), 16) / 255)
      .concat(1);
  const m = /rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/.exec(f);
  return [m[1] / 255, m[2] / 255, m[3] / 255, +m[4]];
};
const over = (fg, bg) =>
  [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3])).concat(1);
const luminance = (c) => {
  const [r, g, b] = c
    .slice(0, 3)
    .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// light and dark as a page shows them: data-theme set and the media query agreeing with it.
const states = contexts().filter(
  (c) =>
    SKINS.includes(c.skin) &&
    ACCENTS.includes(c.accent) &&
    (c.theme === "light" || c.theme === "dark") &&
    c.mediaDark === (c.theme === "dark"),
);
const resolved = resolveContexts(sourceCss());
const set = (v) => v !== undefined && v !== INVALID;

/** The colour behind a stack of (possibly translucent) layers on the page. */
function backdrop(tokens, stack) {
  let bg = rgba(tokens["--surface-base"]);
  for (const name of [...stack].reverse()) {
    if (name === "--surface-base") continue;
    bg = over(rgba(tokens[name]), bg);
  }
  return bg;
}

const label = (c) =>
  `${c.skin ?? "minimalist"}/${c.theme}/${c.accent ?? "default accent"}`;

test("text and control colours meet WCAG 2.2 AA contrast in every skin, mode and accent", () => {
  const fails = [];
  for (const c of states) {
    const tokens = resolved[c.id];
    for (const [fg, stack, min] of PAIRS) {
      if (!set(tokens[fg]) || stack.some((s) => !set(tokens[s]))) continue;
      const bg = backdrop(tokens, stack);
      const r = ratio(over(rgba(tokens[fg]), bg), bg);
      if (r < min)
        fails.push(
          `${label(c)}: ${fg} on ${stack.join(" over ")} = ${r.toFixed(2)} (< ${min})`,
        );
    }
    for (const [border, fill] of BOUNDARIES) {
      const page = backdrop(tokens, ["--surface-base"]);
      const r = Math.max(
        ratio(over(rgba(tokens[border]), page), page),
        ratio(over(rgba(tokens[fill]), page), page),
      );
      if (r < UI)
        fails.push(
          `${label(c)}: ${border} / ${fill} against the page = ${r.toFixed(2)} (< ${UI})`,
        );
    }
  }
  assert.equal(
    fails.length,
    0,
    `${fails.length} contrast failure(s):\n  ${fails.join("\n  ")}`,
  );
});
