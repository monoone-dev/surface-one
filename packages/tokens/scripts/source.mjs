// The token stylesheets as one text, straight from the sources: the generated SCSS skins
// compiled in memory, then the plain token files, in css/index.css order. The resolved-value
// tests and the React Native theme generator read it, so neither needs a built css/.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

import { INDEX_IMPORTS } from "./generate.mjs";

const src = join(dirname(fileURLToPath(import.meta.url)), "../src");

export function sourceCss() {
  return INDEX_IMPORTS.map((file) =>
    file === "themes.css"
      ? sass.compile(join(src, "themes/index.scss"), { style: "expanded" }).css
      : readFileSync(
          join(
            src,
            file === "fonts.css" || file === "base.css"
              ? file
              : `tokens/${file}`,
          ),
          "utf8",
        ),
  ).join("\n");
}

/** The theme files in cascade order (themes/index.scss), without the `.theme.scss` suffix. */
export function themeFiles() {
  return [
    ...readFileSync(join(src, "themes/index.scss"), "utf8").matchAll(
      /@use "([a-z.]+)\.theme"/g,
    ),
  ].map(([, name]) => name);
}

/** What css/<skin>.css loads: the Minimalist base layer, that skin, then the shared files. */
export function skinThemeFiles(skin) {
  return themeFiles().filter(
    (n) => n.startsWith("minimalist.") || n.split(".")[0] === skin,
  );
}

/** The stylesheet text of css/<skin>.css, straight from the sources. */
export function skinSourceCss(skin) {
  return [
    ...skinThemeFiles(skin).map(
      (n) =>
        sass.compile(join(src, `themes/${n}.theme.scss`), { style: "expanded" })
          .css,
    ),
    ...INDEX_IMPORTS.filter((f) => f !== "themes.css").map((file) =>
      readFileSync(
        join(
          src,
          file === "fonts.css" || file === "base.css" ? file : `tokens/${file}`,
        ),
        "utf8",
      ),
    ),
  ].join("\n");
}
