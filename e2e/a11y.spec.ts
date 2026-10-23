import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { readdirSync } from "node:fs";

import { CATALOG } from "../apps/docs/src/app/catalog/catalog";
import { en } from "../apps/docs/src/app/i18n/messages/en";

/** Component slugs: the catalogue (a plain module, no JSON or Angular imports). */
const SLUGS = CATALOG.map((e) => e.slug);
/** Guide pages: the English messages, in sidebar order — the routes come from them too. */
const GUIDE = Object.keys(en.guide.pages);
/** Templates: one `<slug>.template.ts` each. */
const TEMPLATES = readdirSync("apps/docs/src/app/templates")
  .filter((f) => f.endsWith(".template.ts"))
  .map((f) => f.slice(0, -".template.ts".length))
  .sort();

/** Every page type in English, plus a sample of other locales (CJK included). */
const PAGES = [
  "/",
  "/components",
  ...SLUGS.map((slug) => `/components/${slug}`),
  ...GUIDE.map((slug) => `/guide/${slug}`),
  "/theme",
  "/templates",
  ...TEMPLATES.map((slug) => `/templates/${slug}`),
  "/changelog",
  "/pl",
  "/pl/components/button",
  "/de/guide/installation",
  "/ja/theme",
  "/zh/templates",
];

const MODES = ["light", "dark"] as const;

/** The site is built for GitHub Pages' sub-path (`baseHref` in angular.json). */
const BASE = "/surface-one";

async function audit(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
      "wcag22aa",
      "best-practice",
    ])
    .analyze();
  // WCAG 1.4.3 exempts text that is part of an inactive (disabled) control from
  // the contrast minimum. axe cannot know that, so a contrast finding is dropped
  // only when its element sits inside a disabled control; every other rule still
  // applies there.
  const result = [];
  for (const v of violations) {
    if (v.id !== "color-contrast") {
      result.push(v);
      continue;
    }
    const nodes = [];
    for (const n of v.nodes) {
      const selector = n.target.join(" ");
      const disabled = await page.evaluate(
        (sel) =>
          !!document
            .querySelector(sel)
            ?.closest(
              '[data-disabled="true"], .is-disabled, [aria-disabled="true"], fieldset:disabled',
            ),
        selector,
      );
      if (!disabled) nodes.push(n);
    }
    if (nodes.length) result.push({ ...v, nodes });
  }
  return { violations: result };
}

for (const mode of MODES) {
  test.describe(`${mode} mode`, () => {
    test.use({ colorScheme: mode });

    for (const path of PAGES) {
      test(`${path} has no axe violations`, async ({ page }) => {
        await page.goto(BASE + path);
        await page.waitForLoadState("networkidle");
        const { violations } = await audit(page);
        const summary = violations.map(
          (v) =>
            `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes
              .map((n) => n.target.join(" "))
              .slice(0, 5)
              .join("\n  ")}`,
        );
        expect(summary, summary.join("\n\n")).toEqual([]);
      });
    }
  });
}

// The framework switch: the Vue code and import views (a component with a Vue twin and
// one without) — the switch happens after hydration, so the page-load audit never sees them.
for (const mode of MODES) {
  test.describe(`${mode} mode, Vue code view`, () => {
    test.use({ colorScheme: mode });

    for (const slug of ["badge", "timeline"]) {
      test(`/components/${slug}?framework=vue has no axe violations`, async ({
        page,
      }) => {
        await page.goto(`${BASE}/components/${slug}?framework=vue`);
        await page.waitForLoadState("networkidle");
        await expect(page.locator("#framework")).toHaveValue("vue");
        await page.locator("#tab-code").click();
        const { violations } = await audit(page);
        const summary = violations.map(
          (v) =>
            `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes
              .map((n) => n.target.join(" "))
              .slice(0, 5)
              .join("\n  ")}`,
        );
        expect(summary, summary.join("\n\n")).toEqual([]);
      });
    }
  });
}

// The template pages' Code tab, in both frameworks (also hidden at page load).
for (const mode of MODES) {
  test.describe(`${mode} mode, template code view`, () => {
    test.use({ colorScheme: mode });

    for (const framework of ["angular", "vue"]) {
      test(`/templates/login?framework=${framework} code tab has no axe violations`, async ({
        page,
      }) => {
        await page.goto(`${BASE}/templates/login?framework=${framework}`);
        await page.waitForLoadState("networkidle");
        await expect(page.locator("#framework")).toHaveValue(framework);
        await page.locator("#tab-code").click();
        const { violations } = await audit(page);
        const summary = violations.map(
          (v) =>
            `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes
              .map((n) => n.target.join(" "))
              .slice(0, 5)
              .join("\n  ")}`,
        );
        expect(summary, summary.join("\n\n")).toEqual([]);
      });
    }
  });
}

// The passes above run the docs' default skin, Surface (a slate canvas, translucent hairlines,
// a slate-ink fill with white or near-black ink). Studio, the previous default, Linen (flat
// warm greys, translucent hairlines, ink buttons, an ember ring on the current row) and Neumorphism
// (one-colour surfaces shaped by shadows) get their own contrast pass in both modes.
for (const skin of ["studio", "linen", "neumorphism"]) {
  for (const mode of MODES) {
    test.describe(`${mode} mode, ${skin} skin`, () => {
      test.use({ colorScheme: mode });

      for (const path of [
        "/",
        "/components/button",
        "/components/input",
        "/theme",
        "/templates/login",
        "/templates/finances",
      ]) {
        test(`${path} (${skin}) has no axe violations`, async ({ page }) => {
          await page.addInitScript((value) => {
            localStorage.setItem("sone-docs-theme", value);
          }, JSON.stringify({ skin }));
          await page.goto(BASE + path);
          await page.waitForLoadState("networkidle");
          await expect(page.locator("html")).toHaveAttribute("data-skin", skin);
          const { violations } = await audit(page);
          const summary = violations.map(
            (v) =>
              `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes
                .map((n) => n.target.join(" "))
                .slice(0, 5)
                .join("\n  ")}`,
          );
          expect(summary, summary.join("\n\n")).toEqual([]);
        });
      }
    });
  }
}

test("every page has one h1, a lang attribute, a title and a description", async ({
  page,
}) => {
  for (const path of [
    "/",
    "/components/dialog",
    "/pl/guide/fonts",
    "/ja/changelog",
  ]) {
    await page.goto(BASE + path);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(await page.getAttribute("html", "lang")).toBeTruthy();
    expect(await page.title()).not.toBe("");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.{20,}/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(
      10,
    );
  }
});

test("the skip link moves focus to the main content", async ({ page }) => {
  await page.goto(`${BASE}/components`);
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});
