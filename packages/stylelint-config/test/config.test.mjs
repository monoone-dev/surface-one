// Fixtures for @surface-one/stylelint-config: every forbidden pattern is rejected by the
// rule that owns it (with a message that names the token), and the token form passes.
// If a rule is dropped or loosened, one of these cases fails — the guard cannot quietly
// lose its teeth.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import stylelint from "stylelint";
import config from "../index.js";

async function lint(code, codeFilename = "fixture.css") {
  const { results } = await stylelint.lint({ code, codeFilename, config });
  const [result] = results;
  // stylelint reports a bad disable comment as a warning whose rule starts with "--report-".
  const isDisableReport = (w) => w.rule.startsWith("--report-");
  return {
    warnings: result.warnings.filter((w) => !isDisableReport(w)),
    parseErrors: result.parseErrors,
    disables: result.warnings.filter(isDisableReport).map((w) => w.rule),
  };
}

const rule = (declaration) => `.x {\n  ${declaration}\n}\n`;

/** [declaration, rule that must reject it, a word the message must contain] */
const REJECTED = [
  // Raw colours
  ["color: #fff;", "color-no-hex", "var(--text-primary)"],
  ["background: #1a1a1a80;", "color-no-hex", "token"],
  ["color: red;", "color-named", "token"],
  ["border-color: black;", "color-named", "token"],
  ["color: rgb(0 0 0);", "function-disallowed-list", "rgb()"],
  ["color: rgba(0, 0, 0, 0.5);", "function-disallowed-list", "rgba()"],
  ["color: hsl(210 40% 50%);", "function-disallowed-list", "hsl()"],
  ["color: hsla(210, 40%, 50%, 0.4);", "function-disallowed-list", "hsla()"],
  ["color: oklch(0.7 0.1 250);", "function-disallowed-list", "oklch()"],
  ["--brand: #dd0031;", "color-no-hex", "token"],
  // Raw px on the spacing / radius / shadow / type properties
  ["gap: 8px;", "declaration-property-unit-disallowed-list", "--space-"],
  ["row-gap: 4px;", "declaration-property-unit-disallowed-list", "--space-"],
  [
    "padding: 4px 8px;",
    "declaration-property-unit-disallowed-list",
    "--space-",
  ],
  [
    "padding-inline-start: 12px;",
    "declaration-property-unit-disallowed-list",
    "--space-",
  ],
  [
    "margin: 0 auto 16px;",
    "declaration-property-unit-disallowed-list",
    "--space-",
  ],
  [
    "margin-top: -1px;",
    "declaration-property-unit-disallowed-list",
    "--space-",
  ],
  [
    "border-radius: 6px;",
    "declaration-property-unit-disallowed-list",
    "--radius-",
  ],
  [
    "border-top-left-radius: 4px;",
    "declaration-property-unit-disallowed-list",
    "--radius-",
  ],
  [
    "box-shadow: 0 1px 2px var(--shadow-color);",
    "declaration-property-unit-disallowed-list",
    "--shadow-",
  ],
  [
    "font-size: 14px;",
    "declaration-property-unit-disallowed-list",
    "--font-size-",
  ],
  [
    "letter-spacing: 1px;",
    "declaration-property-unit-disallowed-list",
    "--tracking-",
  ],
  [
    "padding: calc(var(--space-2) + 1px);",
    "declaration-property-unit-disallowed-list",
    "--space-",
  ],
  // z-index off the ladder
  ["z-index: 10;", "declaration-property-value-allowed-list", "--z-"],
  ["z-index: -1;", "declaration-property-value-allowed-list", "--z-"],
  ["z-index: 9999;", "declaration-property-value-allowed-list", "--z-"],
  [
    "z-index: calc(var(--z-modal) + 5);",
    "declaration-property-value-allowed-list",
    "--z-",
  ],
  // The hairline
  [
    "border: 1px solid var(--border);",
    "declaration-property-value-disallowed-list",
    "--border-width-thin",
  ],
  [
    "border-bottom: 1px dashed var(--border);",
    "declaration-property-value-disallowed-list",
    "--border-width-thin",
  ],
  [
    "border-inline-start: 1px solid var(--border);",
    "declaration-property-value-disallowed-list",
    "--border-width-thin",
  ],
  [
    "border-width: 0 0 1px;",
    "declaration-property-value-disallowed-list",
    "--border-width-thin",
  ],
  [
    "border-top-width: 1px;",
    "declaration-property-value-disallowed-list",
    "--border-width-thin",
  ],
  // backdrop-filter outside the scrim
  [
    "backdrop-filter: blur(8px);",
    "declaration-property-value-allowed-list",
    "--scrim-blur",
  ],
  [
    "-webkit-backdrop-filter: blur(12px) saturate(1.4);",
    "declaration-property-value-allowed-list",
    "--scrim-blur",
  ],
  [
    "backdrop-filter: blur(var(--blur-lg));",
    "declaration-property-value-allowed-list",
    "--scrim-blur",
  ],
  // Raw durations
  [
    "transition: color 150ms ease;",
    "declaration-property-unit-disallowed-list",
    "--transition",
  ],
  [
    "transition: opacity 0.2s;",
    "declaration-property-unit-disallowed-list",
    "--transition",
  ],
  [
    "transition-duration: 120ms;",
    "declaration-property-unit-disallowed-list",
    "--duration-",
  ],
  [
    "animation: spin 1s linear infinite;",
    "declaration-property-unit-disallowed-list",
    "--duration-",
  ],
  [
    "animation-duration: 300ms;",
    "declaration-property-unit-disallowed-list",
    "--duration-",
  ],
];

/** The token form of each pattern above, plus what must stay allowed. */
const ACCEPTED = [
  "color: var(--text-primary);",
  "background: color-mix(in oklab, var(--accent) 20%, transparent);",
  "border-color: transparent;",
  "fill: currentColor;",
  "gap: var(--space-2);",
  "gap: 0;",
  "padding: var(--space-1) var(--space-2);",
  "padding: 0;",
  "margin: 0 auto var(--space-4);",
  "margin: calc(var(--space-px) * -1);",
  "border-radius: var(--radius-md);",
  "border-radius: 50%;",
  "box-shadow: var(--shadow-sm);",
  "box-shadow: 0 0 0 var(--border-width-thin) var(--border);",
  "box-shadow: none;",
  "font-size: var(--font-size-sm);",
  "font-size: 0.875rem;",
  "letter-spacing: var(--tracking-tight);",
  "letter-spacing: -0.01em;",
  "z-index: var(--z-modal);",
  "z-index: calc(var(--z-raised) + 1);",
  "z-index: calc(var(--z-behind) - 1);",
  "z-index: 0;",
  "z-index: auto;",
  "border: var(--border-width-thin) solid var(--border);",
  "border-width: 0 0 var(--border-width-thin);",
  "border: 2px solid var(--accent);",
  "border: 0;",
  "backdrop-filter: blur(var(--scrim-blur));",
  "-webkit-backdrop-filter: blur(var(--scrim-blur));",
  "backdrop-filter: none;",
  "transition: color var(--transition);",
  "transition: transform var(--duration-meter) linear;",
  "transition-duration: var(--transition-dur);",
  "animation: spin var(--duration-spin) linear infinite;",
  "animation-delay: calc(var(--i) * 40ms);",
  // Structural sizes keep their px.
  "width: 16px;",
  "height: 1px;",
  "min-width: 320px;",
  "max-height: 480px;",
  "inset: -10px;",
  "top: 4px;",
  "outline-offset: 2px;",
];

describe("rejects every forbidden pattern", () => {
  for (const [declaration, ruleName, hint] of REJECTED) {
    test(declaration, async () => {
      const { warnings } = await lint(rule(declaration));
      const hit = warnings.find((w) => w.rule === ruleName);
      assert.ok(
        hit,
        `${ruleName} should reject \`${declaration}\`; got ${JSON.stringify(warnings.map((w) => w.rule))}`,
      );
      assert.ok(
        hit.text.includes(hint),
        `the message should name the token (${hint}): ${hit.text}`,
      );
    });
  }
});

describe("accepts the token form", () => {
  for (const declaration of ACCEPTED) {
    test(declaration, async () => {
      const { warnings } = await lint(rule(declaration));
      assert.deepEqual(
        warnings.map((w) => `${w.rule}: ${w.text}`),
        [],
        `\`${declaration}\` should pass`,
      );
    });
  }
});

describe("SCSS", () => {
  test("parses Sass sources and still rejects raw values", async () => {
    const code = [
      "// a Sass line comment",
      "$gap: var(--space-2);",
      ".x {",
      "  gap: $gap;",
      "  &:hover { color: #fff; padding: 4px; }",
      "}",
      "",
    ].join("\n");
    const { warnings, parseErrors } = await lint(code, "fixture.scss");
    assert.deepEqual(parseErrors, []);
    assert.deepEqual(warnings.map((w) => w.rule).sort(), [
      "color-no-hex",
      "declaration-property-unit-disallowed-list",
    ]);
  });
});

describe("escape hatches", () => {
  test("a disable without a reason is reported", async () => {
    const { disables } = await lint(
      ".x {\n  /* stylelint-disable-next-line color-no-hex */\n  color: #fff;\n}\n",
    );
    assert.ok(
      disables.length > 0,
      "a descriptionless disable must be reported",
    );
  });

  test("a disable with a reason silences only its line", async () => {
    const { warnings, disables } = await lint(
      [
        ".x {",
        "  /* stylelint-disable-next-line color-no-hex -- a third-party brand colour */",
        "  color: #dd0031;",
        "  background: #fff;",
        "}",
        "",
      ].join("\n"),
    );
    assert.deepEqual(disables, []);
    assert.deepEqual(
      warnings.map((w) => [w.rule, w.line]),
      [["color-no-hex", 4]],
    );
  });

  test("a disable that silences nothing is reported", async () => {
    const { disables } = await lint(
      ".x {\n  /* stylelint-disable-next-line color-no-hex -- stale */\n  color: var(--accent);\n}\n",
    );
    assert.deepEqual(disables, ["--report-needless-disables"]);
  });
});

describe("Vue single-file components", () => {
  test("lints the <style> blocks of a .vue file", async () => {
    const code = [
      '<template><div class="x" /></template>',
      '<script setup lang="ts">const gap = "8px";</script>',
      "<style scoped>",
      ".x {",
      "  gap: var(--space-2);",
      "  color: #fff;",
      "  border: 1px solid var(--border);",
      "}",
      "</style>",
      "",
    ].join("\n");
    const { warnings, parseErrors } = await lint(code, "Fixture.vue");
    assert.deepEqual(parseErrors, []);
    assert.deepEqual(
      warnings.map((w) => [w.rule, w.line]),
      [
        ["color-no-hex", 6],
        ["declaration-property-value-disallowed-list", 7],
      ],
    );
  });
});
