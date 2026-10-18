// Turns a resolved CSS token value (every var() already substituted, see
// packages/tokens/scripts/cascade.mjs) into the value React Native understands, or null
// when it has none (a gradient, a viewport unit, a display keyword):
//
//   colour   oklch() / oklab() / rgb() / hex / color-mix() → "#rrggbb" or "rgba(r, g, b, a)"
//   length   px / rem (16px) / calc() / min() / max() / clamp()  → a number of dp
//   box      a 2–4 value padding shorthand → [top, right, bottom, left]
//   percent  50% → 0.5;  angle  90deg → 90
//   em       a letter spacing in em → { em: n } (the component multiplies by its font size)
//   number   a unitless number (opacity, line-height ratio, font weight) → a number
//   duration ms / s → a number of milliseconds
//   easing   cubic-bezier(…) → [x1, y1, x2, y2] (Easing.bezier)
//   shadow   a box-shadow list → the same list with React Native colours ("" for none)
//   font     a font-family stack → its first family
//   keyword  one identifier (uppercase, none, …) → the string
//
// React Native has no oklch() and no color-mix(), so colours are computed here once, the
// way a browser does (CSS Color 4/5: premultiplied interpolation, shorter hue, sRGB gamut
// clipped), and the components read plain sRGB.

const REM = 16;

// ---------------------------------------------------------------- tokenizing

/** Splits at top-level separators (`,` or whitespace), keeping parentheses together. */
export function splitTop(value, sep) {
  const out = [];
  let depth = 0;
  let cur = "";
  for (const ch of value) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    const hit = sep === " " ? /\s/.test(ch) : ch === sep;
    if (hit && depth === 0) {
      if (cur.trim() !== "") out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim() !== "") out.push(cur.trim());
  return out;
}

/** `name(args)` → { name, args } for a value that is exactly one function call. */
function fn(value) {
  const m = /^([a-z-]+)\((.*)\)$/s.exec(value.trim());
  if (!m) return null;
  // `rgb(…) , rgb(…)` would also match; make sure the outer parens pair up.
  let depth = 0;
  for (let i = m[1].length; i < value.trim().length; i++) {
    const ch = value.trim()[i];
    if (ch === "(") depth++;
    else if (ch === ")") {
      depth--;
      if (depth === 0 && i !== value.trim().length - 1) return null;
    }
  }
  return { name: m[1], args: m[2].trim() };
}

// ---------------------------------------------------------------- colour maths

const clamp01 = (n) => Math.min(1, Math.max(0, n));

function srgbToLinear(c) {
  const a = Math.abs(c);
  return a <= 0.04045
    ? c / 12.92
    : Math.sign(c) * Math.pow((a + 0.055) / 1.055, 2.4);
}
function linearToSrgb(c) {
  const a = Math.abs(c);
  return a <= 0.0031308
    ? c * 12.92
    : Math.sign(c) * (1.055 * Math.pow(a, 1 / 2.4) - 0.055);
}

function oklabToSrgb([L, a, b]) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

function srgbToOklab([r, g, bl]) {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(bl);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const oklchToOklab = ([L, C, H]) => [
  L,
  C * Math.cos((H * Math.PI) / 180),
  C * Math.sin((H * Math.PI) / 180),
];
function oklabToOklch([L, a, b]) {
  const C = Math.hypot(a, b);
  let H = (Math.atan2(b, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  // An achromatic colour has a powerless hue (CSS Color 4 §4.4).
  return [L, C, C < 1e-6 ? NaN : H];
}

/** A colour as { space, coords, alpha }: "srgb" (0–1), "oklab" or "oklch". */
const color = (space, coords, alpha = 1) => ({ space, coords, alpha });

function toSpace(c, space) {
  if (c.space === space) return c;
  let lab;
  if (c.space === "srgb") lab = srgbToOklab(c.coords);
  else if (c.space === "oklch")
    lab = oklchToOklab(c.coords.map((v) => (Number.isNaN(v) ? 0 : v)));
  else lab = c.coords;
  if (space === "oklab") return color("oklab", lab, c.alpha);
  if (space === "oklch") return color("oklch", oklabToOklch(lab), c.alpha);
  return color("srgb", oklabToSrgb(lab), c.alpha);
}

// ---------------------------------------------------------------- colour parsing

const NAMED = {
  transparent: [0, 0, 0, 0],
  white: [255, 255, 255, 1],
  black: [0, 0, 0, 1],
};

/** `50%` → 0.5 of `percentOf`, a bare number as is; NaN for "none". */
function num(token, percentOf = 1) {
  if (token === "none") return NaN;
  if (token.endsWith("%")) return (parseFloat(token) / 100) * percentOf;
  return parseFloat(token);
}

/** The channels and the alpha of `a b c / d` or `a, b, c, d`. */
function channels(args) {
  const [main, alpha] = args.includes("/")
    ? args.split("/").map((s) => s.trim())
    : [args, null];
  const parts = main.includes(",")
    ? main.split(",").map((s) => s.trim())
    : splitTop(main, " ");
  if (parts.length === 4 && alpha === null)
    return [parts.slice(0, 3), parts[3]];
  return [parts, alpha];
}

export function parseColor(value) {
  const v = value.trim().toLowerCase();
  if (v in NAMED) {
    const [r, g, b, a] = NAMED[v];
    return color("srgb", [r / 255, g / 255, b / 255], a);
  }
  if (/^#[0-9a-f]{3,8}$/.test(v)) {
    let hex = v.slice(1);
    if (hex.length === 3 || hex.length === 4)
      hex = [...hex].map((h) => h + h).join("");
    if (hex.length !== 6 && hex.length !== 8) return null;
    const n = (i) => parseInt(hex.slice(i, i + 2), 16) / 255;
    return color("srgb", [n(0), n(2), n(4)], hex.length === 8 ? n(6) : 1);
  }
  const call = fn(v);
  if (!call) return null;
  if (call.name === "rgb" || call.name === "rgba") {
    const [c, a] = channels(call.args);
    if (c.length !== 3) return null;
    return color(
      "srgb",
      c.map((t) => num(t, 255) / 255),
      a === null ? 1 : num(a),
    );
  }
  if (call.name === "oklch" || call.name === "oklab") {
    const [c, a] = channels(call.args);
    if (c.length !== 3) return null;
    const L = num(c[0]);
    const coords =
      call.name === "oklch"
        ? [L, num(c[1], 0.4), parseFloat(c[2])]
        : [L, num(c[1], 0.4), num(c[2], 0.4)];
    return color(call.name, coords, a === null ? 1 : num(a));
  }
  if (call.name === "color-mix") return colorMix(call.args);
  return null;
}

/** CSS Color 5 color-mix(): normalized percentages, premultiplied alpha, shorter hue. */
function colorMix(args) {
  const parts = splitTop(args, ",");
  if (parts.length !== 3) return null;
  const space = /^in\s+([a-z-]+)/.exec(parts[0])?.[1];
  if (!space || !["srgb", "oklab", "oklch"].includes(space)) return null;
  const side = (text) => {
    const tokens = splitTop(text, " ");
    const pct = tokens.find((t) => /^-?[\d.]+%$/.test(t));
    const c = parseColor(tokens.filter((t) => t !== pct).join(" "));
    return { c, p: pct === undefined ? null : parseFloat(pct) / 100 };
  };
  const a = side(parts[1]);
  const b = side(parts[2]);
  if (!a.c || !b.c) return null;
  let p1 = a.p;
  let p2 = b.p;
  if (p1 === null && p2 === null) p1 = p2 = 0.5;
  else if (p1 === null) p1 = 1 - p2;
  else if (p2 === null) p2 = 1 - p1;
  const sum = p1 + p2;
  if (sum <= 0) return null;
  const alphaMult = sum < 1 ? sum : 1;
  p1 /= sum;
  p2 /= sum;
  const c1 = toSpace(a.c, space);
  const c2 = toSpace(b.c, space);
  const alpha = c1.alpha * p1 + c2.alpha * p2;
  const hueIndex = space === "oklch" ? 2 : -1;
  const coords = c1.coords.map((v1, i) => {
    let x = v1;
    let y = c2.coords[i];
    // A powerless (NaN) channel takes the other colour's value.
    if (Number.isNaN(x)) x = y;
    if (Number.isNaN(y)) y = x;
    if (Number.isNaN(x)) return NaN;
    if (i === hueIndex) {
      let d = y - x;
      if (d > 180) x += 360;
      else if (d < -180) y += 360;
      return (x * p1 + y * p2) % 360;
    }
    // Premultiplied interpolation (the hue is never premultiplied).
    const mixed = x * c1.alpha * p1 + y * c2.alpha * p2;
    return alpha === 0 ? 0 : mixed / alpha;
  });
  return color(space, coords, alpha * alphaMult);
}

/** A parsed colour → "#rrggbb" (opaque) or "rgba(r, g, b, a)". */
export function formatColor(c) {
  const rgb = toSpace(c, "srgb").coords.map((v) =>
    Math.round(clamp01(Number.isNaN(v) ? 0 : v) * 255),
  );
  const alpha = Math.round(clamp01(c.alpha) * 1000) / 1000;
  if (alpha === 1)
    return `#${rgb.map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  return `rgba(${rgb.join(", ")}, ${alpha})`;
}

export function toColor(value) {
  const c = parseColor(value);
  return c ? formatColor(c) : null;
}

// ---------------------------------------------------------------- lengths

/** A length with its unit → dp, `{ em }` or null. */
function length(token) {
  const m = /^(-?[\d.]+)(px|rem|em)?$/.exec(token.trim());
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (m[2] === "rem") return { v: n * REM, unit: "px" };
  if (m[2] === "em") return { v: n, unit: "em" };
  return { v: n, unit: m[2] ? "px" : "" };
}

/** Evaluates calc() / min() / max() / clamp() over px / rem / unitless terms. */
function evaluate(expr) {
  const tokens = expr.match(
    /-?[\d.]+(?:px|rem|em|%|[a-z]+)?|[-+*/(),]|[a-z-]+\(/g,
  );
  if (!tokens) return null;
  let i = 0;
  const peek = () => tokens[i];
  const next = () => tokens[i++];
  const combine = (a, b, op) => {
    if (!a || !b) return null;
    if (op === "*" || op === "/") {
      if (op === "/" && b.unit !== "") return null;
      if (a.unit !== "" && b.unit !== "") return null;
      const v = op === "*" ? a.v * b.v : a.v / b.v;
      return { v, unit: a.unit || b.unit };
    }
    const unit = a.unit || b.unit;
    if (a.unit && b.unit && a.unit !== b.unit) return null;
    return { v: op === "+" ? a.v + b.v : a.v - b.v, unit };
  };
  const call = (name) => {
    const args = [];
    if (peek() === ")") {
      next();
      return null;
    }
    for (;;) {
      args.push(sum());
      const t = next();
      if (t === ")") break;
      if (t !== ",") return null;
    }
    if (args.some((a) => a === null)) return null;
    const unit = args.find((a) => a.unit)?.unit ?? "";
    if (args.some((a) => a.unit && a.unit !== unit)) return null;
    const vs = args.map((a) => a.v);
    if (name === "calc(") return args.length === 1 ? args[0] : null;
    if (name === "min(") return { v: Math.min(...vs), unit };
    if (name === "max(") return { v: Math.max(...vs), unit };
    if (name === "clamp(" && vs.length === 3)
      return { v: Math.min(Math.max(vs[1], vs[0]), vs[2]), unit };
    return null;
  };
  const atom = () => {
    const t = next();
    if (t === undefined) return null;
    if (t === "(") {
      const v = sum();
      return next() === ")" ? v : null;
    }
    if (/^[a-z-]+\($/.test(t)) return call(t);
    if (t === "-") {
      const v = atom();
      return v ? { v: -v.v, unit: v.unit } : null;
    }
    return length(t);
  };
  const product = () => {
    let v = atom();
    while (peek() === "*" || peek() === "/") {
      const op = next();
      v = combine(v, atom(), op);
    }
    return v;
  };
  const sum = () => {
    let v = product();
    while (peek() === "+" || peek() === "-") {
      const op = next();
      v = combine(v, product(), op);
    }
    return v;
  };
  const out = sum();
  return i === tokens.length ? out : null;
}

export function toLength(value) {
  const v = value.trim();
  const plain = length(v);
  if (plain) return plain;
  if (!/^(calc|min|max|clamp)\(/.test(v)) return null;
  if (/[\d.](%|vw|vh|vmin|vmax|ch|ex|dvh|svh)/.test(v)) return null;
  return evaluate(v);
}

// ---------------------------------------------------------------- the rest

function toDuration(value) {
  const m = /^(-?[\d.]+)(ms|s)$/.exec(value.trim());
  if (!m) return null;
  return parseFloat(m[1]) * (m[2] === "s" ? 1000 : 1);
}

function toEasing(value) {
  const call = fn(value);
  if (!call || call.name !== "cubic-bezier") return null;
  const n = call.args.split(",").map((s) => parseFloat(s));
  return n.length === 4 && n.every(Number.isFinite) ? n : null;
}

/** A box-shadow list with every colour converted; "" for none, null when one fails. */
function toShadow(value) {
  const v = value.trim();
  if (v === "none") return "";
  const layers = splitTop(v, ",");
  const out = [];
  for (const layer of layers) {
    const parts = splitTop(layer, " ");
    const lengths = [];
    let col = null;
    let inset = false;
    for (const p of parts) {
      if (p === "inset") inset = true;
      else if (toLength(p) && toLength(p).unit !== "em")
        lengths.push(round(toLength(p).v));
      else {
        const c = toColor(p);
        if (c === null) return null;
        col = c;
      }
    }
    if (lengths.length < 2 || lengths.length > 4) return null;
    // A fully transparent layer (`0 0 #0000`, the no-op hook) draws nothing.
    if (col === "rgba(0, 0, 0, 0)") continue;
    out.push(
      [
        inset ? "inset" : null,
        ...lengths.map((n) => `${n}px`),
        col ?? "#000000",
      ]
        .filter(Boolean)
        .join(" "),
    );
  }
  return out.join(", ");
}

/** A 2–4 value padding shorthand → [top, right, bottom, left] in dp. */
function toBox(value) {
  const parts = splitTop(value, " ");
  if (parts.length < 2 || parts.length > 4) return null;
  const n = parts.map((p) => toLength(p));
  if (n.some((x) => !x || x.unit === "em")) return null;
  const [t, r = t, b = t, l = r] = n.map((x) => round(x.v));
  return [t, r, b, l];
}

function toFont(value) {
  const first = splitTop(value, ",")[0];
  if (!first) return null;
  const name = first.replace(/^["']|["']$/g, "");
  return /^[A-Za-z][\w -]*$/.test(name) ? name : null;
}

/**
 * The React Native form of one resolved value, tagged by kind:
 * { kind: "color" | "length" | "em" | "number" | "percent" | "angle" | "box" | "duration" | "easing" | "shadow" | "font" | "keyword", value }.
 * `hint` is the token name: a name decides between overlapping readings (a weight is a
 * number, a family is a font, a `*-shadow` / `--focus-ring` is a shadow).
 */
export function convert(value, hint = "") {
  const v = value.trim();
  if (v === "" || v === "<guaranteed-invalid>") return null;
  const isShadowName =
    /shadow|focus-ring$|-ring$|elevation|^--neu-(raise|inset)/.test(hint) &&
    !/-ring-(width|color)/.test(hint);
  if (
    /^--font-(sans|mono|reading|display|serif|heading)$/.test(hint) ||
    /-font-family$/.test(hint)
  ) {
    const f = toFont(v);
    return f === null ? null : { kind: "font", value: f };
  }
  if (isShadowName) {
    const s = toShadow(v);
    if (s !== null) return { kind: "shadow", value: s };
  }
  const len = toLength(v);
  if (len) {
    if (len.unit === "em") return { kind: "em", value: round(len.v) };
    if (len.unit === "px") return { kind: "length", value: round(len.v) };
    return { kind: "number", value: round(len.v) };
  }
  const pct = /^(-?[\d.]+)%$/.exec(v);
  if (pct) return { kind: "percent", value: round(parseFloat(pct[1]) / 100) };
  const deg = /^(-?[\d.]+)deg$/.exec(v);
  if (deg) return { kind: "angle", value: round(parseFloat(deg[1])) };
  const box = toBox(v);
  if (box) return { kind: "box", value: box };
  const d = toDuration(v);
  if (d !== null) return { kind: "duration", value: d };
  const e = toEasing(v);
  if (e) return { kind: "easing", value: e };
  const c = toColor(v);
  if (c !== null) return { kind: "color", value: c };
  if (/^[a-z][a-z-]*$/.test(v)) return { kind: "keyword", value: v };
  return null;
}

const round = (n) => Math.round(n * 1000) / 1000;
