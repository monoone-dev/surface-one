// @vitest-environment node
// The React templates carry their styles as a `const css = \`…\`` string (the Vue twins have a
// `<style scoped>` block that `npm run lint:styles` reads). Lint those strings with the same
// design-system rules, so a raw colour or spacing value cannot slip in through a .tsx file.
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import stylelint from "stylelint";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const dir = `${root}apps/docs/src/app/templates/react/`;

describe("docs templates (React): styles", () => {
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".tsx"))) {
    it(`${file} uses tokens only`, async () => {
      const source = readFileSync(dir + file, "utf8");
      const css = /const css = `((?:\\[\s\S]|[^`\\])*)`;/.exec(source)?.[1];
      if (css === undefined) return;
      const { results } = await stylelint.lint({
        code: css.replace(/\\([`$\\])/g, "$1"),
        codeFilename: `${dir}${file}.css`,
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
