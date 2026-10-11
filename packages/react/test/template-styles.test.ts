// @vitest-environment node
// The React templates import their styles as a generated `css` string: the shared
// apps/docs/src/app/templates/styles/<slug>.css (+ <slug>.twins.css) with every selector
// prefixed by `.tpl-<slug>` (scripts/build-template-sources.mjs, run by `npm run generate`).
// `npm run lint:styles` reads the .css files; lint the generated strings too, with the same
// design-system rules, so the prefixing can never let a raw value through.
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import stylelint from "stylelint";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const templates = `${root}apps/docs/src/app/templates/`;
const scoped = `${templates}styles/scoped/`;

describe("docs templates (React): styles", () => {
  it("has a generated stylesheet for every React template that imports one", () => {
    for (const file of readdirSync(`${templates}react/`)) {
      const m = /from "\.\.\/styles\/scoped\/([\w-]+)\.generated"/.exec(
        readFileSync(`${templates}react/${file}`, "utf8"),
      );
      if (m) expect(readdirSync(scoped)).toContain(`${m[1]}.generated.ts`);
    }
  });

  for (const file of readdirSync(scoped).filter((f) => f.endsWith(".ts"))) {
    it(`${file} uses tokens only`, async () => {
      const source = readFileSync(scoped + file, "utf8");
      const css = JSON.parse(/export const css = (".*");/.exec(source)![1]!);
      expect(css).toContain(".tpl-");
      const { results } = await stylelint.lint({
        code: css,
        codeFilename: `${scoped}${file}.css`,
        configBasedir: root,
        config: (await import(`${root}stylelint.config.mjs`)).default,
      });
      const problems = results.flatMap((r) =>
        r.warnings.map((w) => `${w.line}:${w.column} ${w.text}`),
      );
      expect(problems).toEqual([]);
    });
  }
});
