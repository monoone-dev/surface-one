export type Rgb = [number, number, number];

export function rgba(c: Rgb, a: number): string {
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}

export function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

let probe: CanvasRenderingContext2D | null | undefined;

function colorProbe(): CanvasRenderingContext2D | null {
  if (probe === undefined) {
    if (typeof document === "undefined") {
      return null;
    }
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    probe = canvas.getContext("2d", { willReadFrequently: true });
  }
  return probe;
}

/** Resolves any CSS colour (oklch, color-mix, hex…) to sRGB through a 1×1 canvas; `fallback` when it cannot. */
export function resolveColor(css: string, fallback: Rgb): Rgb {
  const value = css.trim();
  const ctx = colorProbe();
  if (!value || !ctx) {
    return fallback;
  }
  // A colour the engine cannot parse leaves fillStyle untouched, so two different sentinels expose it.
  ctx.fillStyle = "#000000";
  ctx.fillStyle = value;
  const overBlack = ctx.fillStyle;
  ctx.fillStyle = "#ffffff";
  ctx.fillStyle = value;
  if (overBlack !== ctx.fillStyle) {
    return fallback;
  }
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillRect(0, 0, 1, 1);
  const px = ctx.getImageData(0, 0, 1, 1).data;
  return px[3] === 0 ? fallback : [px[0], px[1], px[2]];
}
