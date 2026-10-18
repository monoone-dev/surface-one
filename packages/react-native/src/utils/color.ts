// CSS `color-mix()` and layered backgrounds for the token colours (hex or rgb[a]) —
// React Native has neither, so the few rules that blend tokens compute the result.

type Rgba = readonly [number, number, number, number];

function parse(colour: string): Rgba | null {
  const s = colour.trim().toLowerCase();
  if (s === "transparent") return [0, 0, 0, 0];
  if (s.startsWith("#")) {
    let h = s.slice(1);
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    if (h.length !== 6 && h.length !== 8) return null;
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  const m = /^rgba?\(([^)]+)\)$/.exec(s);
  if (!m) return null;
  const p = m[1]!
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map(parseFloat);
  if (p.length < 3 || p.some(Number.isNaN)) return null;
  return [p[0]!, p[1]!, p[2]!, p[3] ?? 1];
}

function format(r: number, g: number, b: number, a: number): string {
  if (a <= 0) return "rgba(0, 0, 0, 0)";
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${+a.toFixed(3)})`;
}

/** `color-mix(in srgb, a <p>, b)` — `p` a fraction (premultiplied, like CSS). */
export function mix(a: string, b: string, p: number): string {
  const x = parse(a);
  const y = parse(b);
  if (!x || !y) return p >= 0.5 ? a : b;
  const q = 1 - p;
  const alpha = x[3] * p + y[3] * q;
  if (alpha <= 0) return format(0, 0, 0, 0);
  const ch = (i: 0 | 1 | 2) => (x[i] * x[3] * p + y[i] * y[3] * q) / alpha;
  return format(ch(0), ch(1), ch(2), alpha);
}

/** `top` painted over `bottom` (a `background-image` layer over a `background-color`). */
export function over(top: string, bottom: string): string {
  const x = parse(top);
  const y = parse(bottom);
  if (!x || !y) return bottom;
  const alpha = x[3] + y[3] * (1 - x[3]);
  if (alpha <= 0) return format(0, 0, 0, 0);
  const ch = (i: 0 | 1 | 2) => (x[i] * x[3] + y[i] * y[3] * (1 - x[3])) / alpha;
  return format(ch(0), ch(1), ch(2), alpha);
}
