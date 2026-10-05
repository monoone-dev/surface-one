// Compiles the SCSS skins into plain CSS so a consumer on any framework (Angular
// today, Vue and React next) can load the foundation without a Sass toolchain.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, "css");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const themes = sass.compile(join(root, "src/themes/index.scss"), {
  style: "expanded",
});
writeFileSync(join(out, "themes.css"), themes.css + "\n");
cpSync(join(root, "src/tokens"), out, { recursive: true });
for (const file of ["fonts.css", "base.css"]) {
  cpSync(join(root, "src", file), join(out, file));
}
writeFileSync(
  join(out, "index.css"),
  [
    "/* @surface-one/tokens — skins first, then the shared token files, then accents",
    "   (a chosen palette must beat a skin's default accent), then fonts and defaults. */",
    '@import "./themes.css";',
    '@import "./typography.css";',
    '@import "./layout.css";',
    '@import "./scale.css";',
    '@import "./accents.css";',
    '@import "./fonts.css";',
    '@import "./base.css";',
    "",
  ].join("\n"),
);
console.log("tokens → css/");
