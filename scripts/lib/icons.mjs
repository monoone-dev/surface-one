// The SurfaceOne glyphs, read from packages/angular/icon/icons.ts (the one source of
// truth): name → its <svg> markup on one line. Vue and React import that file through
// @surface-one/core as it is; the React Native generator (generate-native-icons.mjs) turns
// the markup into react-native-svg element trees.
import { readFileSync } from "node:fs";

import { abs } from "./repo.mjs";

export const ICON_SOURCE = abs("packages/angular/icon/icons.ts");

export function readIcons() {
  const ts = readFileSync(ICON_SOURCE, "utf8");
  // The map is a plain object literal of string constants: evaluate it as JavaScript.
  const literal = /SONE_ICONS[^=]*=\s*(\{[\s\S]*?\n\});/.exec(ts)?.[1];
  const icons = literal ? new Function(`return ${literal};`)() : {};
  if (Object.keys(icons).length < 10) {
    throw new Error(
      `only ${Object.keys(icons).length} icons found in ${ICON_SOURCE}`,
    );
  }
  return icons;
}
