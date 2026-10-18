import { createElement, type ComponentType, type ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";

import { useForeground } from "../../theme/foreground";
import type { SoneGlyph, SoneGlyphNode, SoneGlyphTag } from "./glyph";
import { SONE_GLYPHS, type ShellIcon } from "./glyphs.generated";

export type { ShellIcon };
export { SONE_GLYPHS };

const ELEMENTS: Record<SoneGlyphTag, ComponentType<Record<string, unknown>>> = {
  g: G as ComponentType<Record<string, unknown>>,
  path: Path as ComponentType<Record<string, unknown>>,
  circle: Circle as ComponentType<Record<string, unknown>>,
  rect: Rect as ComponentType<Record<string, unknown>>,
  ellipse: Ellipse as ComponentType<Record<string, unknown>>,
  line: Line as ComponentType<Record<string, unknown>>,
};

function draw(node: SoneGlyphNode, key: number): ReactNode {
  const [tag, attrs, children] = node;
  return createElement(ELEMENTS[tag], { key, ...attrs }, children?.map(draw));
}

export interface SoneIconProps {
  /** A SurfaceOne glyph (the same names as `<sone-icon>`). */
  readonly name?: ShellIcon;
  /** Your own glyph in the same shape, instead of `name`. */
  readonly glyph?: SoneGlyph;
  /** dp; default: the inherited icon size (16 in body text, the control size in a button). */
  readonly size?: number;
  /** default: the inherited ink (`currentColor`). */
  readonly color?: string;
  /** The accessible name; leave it out for a decorative icon next to its text. */
  readonly label?: string | null;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

/** `<sone-icon>` — a SurfaceOne glyph in the inherited ink; decorative unless it has a `label`. */
export function SoneIcon({
  name,
  glyph,
  size,
  color,
  label = null,
  style,
  testID,
}: SoneIconProps) {
  const fg = useForeground();
  const g: SoneGlyph | undefined =
    glyph ?? (name ? SONE_GLYPHS[name] : undefined);
  if (!g) return null;
  const px = size ?? fg.iconSize;
  return (
    <Svg
      {...g.attrs}
      viewBox={g.viewBox}
      width={px}
      height={px}
      color={color ?? fg.color}
      style={style}
      testID={testID}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      {g.children.map(draw)}
    </Svg>
  );
}
