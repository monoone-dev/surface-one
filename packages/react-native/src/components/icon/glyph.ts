/** An element of a glyph: `[tag, props]` or `[tag, props, children]` (react-native-svg names). */
export type SoneGlyphNode =
  | readonly [SoneGlyphTag, SoneGlyphAttrs]
  | readonly [SoneGlyphTag, SoneGlyphAttrs, readonly SoneGlyphNode[]];

export type SoneGlyphTag =
  "g" | "path" | "circle" | "rect" | "ellipse" | "line";

export type SoneGlyphAttrs = Readonly<Record<string, string | number>>;

/** One SurfaceOne glyph (generated from packages/angular/icon), or your own in the same shape. */
export interface SoneGlyph {
  readonly viewBox: string;
  /** The root `<svg>` props (`fill`, `stroke` …). */
  readonly attrs: SoneGlyphAttrs;
  readonly children: readonly SoneGlyphNode[];
}
