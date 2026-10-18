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
