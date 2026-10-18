// The SurfaceOne glyphs, read from the @switch of packages/angular/icon/icon.component.html
// (the one source of truth): name → its <svg> markup on one line. The Vue / React icon
// generator (generate-icons.mjs) writes the markup as is; the React Native one
// (generate-native-icons.mjs) turns it into react-native-svg element trees.
import { readFileSync } from "node:fs";

import { abs } from "./repo.mjs";

export const ICON_SOURCE = abs("packages/angular/icon/icon.component.html");

export function readIcons() {
  const html = readFileSync(ICON_SOURCE, "utf8");
  const icons = {};
  const caseRe = /@case \("([^"]+)"\) \{\s*(<svg[\s\S]*?<\/svg>)\s*\}/g;
  for (const [, name, svg] of html.matchAll(caseRe)) {
    if (/\[|\{\{|@if|@for/.test(svg)) {
      throw new Error(
        `icon "${name}" has an Angular binding; it cannot be copied`,
      );
    }
    icons[name] = svg.replace(/\s*\n\s*/g, " ").replace(/\s+\/>/g, "/>");
  }
  if (Object.keys(icons).length < 10) {
    throw new Error(
      `only ${Object.keys(icons).length} icons found in ${ICON_SOURCE}`,
    );
  }
  return icons;
}
