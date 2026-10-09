import { resolveColor, type Rgb } from "./scene-color";

/** The colours one frame is painted with, read from the design tokens. */
export interface SceneTheme {
  plot: Rgb;
  ink: Rgb;
  muted: Rgb;
  font: string;
  dark: boolean;
  tones: Record<string, Rgb>;
}

/**
 * A tone is a custom property name, or a comma-separated fallback chain of them
 * (`"--chart-1, --graph-entity"`): the first one the theme defines wins.
 */
export function toneTokens(chain: string): string[] {
  return chain
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.startsWith("--"));
}

/** The CSS colour of a tone chain: `"--a, --b"` → `var(--a, var(--b))`. */
export function toneCss(chain: string): string {
  return toneTokens(chain).reduceRight(
    (fallback, token) =>
      fallback ? `var(${token}, ${fallback})` : `var(${token})`,
    "",
  );
}

export function readSceneTheme(
  el: Element,
  tones: Readonly<Record<string, string>>,
): SceneTheme {
  const cs = getComputedStyle(el);
  const read = (name: string, fallback: Rgb): Rgb =>
    resolveColor(cs.getPropertyValue(name), fallback);
  const ink = read("--graph-ink", [23, 23, 23]);
  const resolved: Record<string, Rgb> = {};
  for (const [tone, chain] of Object.entries(tones)) {
    const token = toneTokens(chain).find(
      (t) => cs.getPropertyValue(t).trim() !== "",
    );
    resolved[tone] = token ? read(token, ink) : ink;
  }
  const plot = read("--graph-plot", [255, 255, 255]);
  return {
    plot,
    ink,
    dark: plot[0] + plot[1] + plot[2] < ink[0] + ink[1] + ink[2],
    muted: read("--text-muted", [115, 115, 115]),
    font: cs.getPropertyValue("--font-sans").trim() || "system-ui, sans-serif",
    tones: resolved,
  };
}
