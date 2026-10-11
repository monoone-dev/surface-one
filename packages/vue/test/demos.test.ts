import { mount } from "@vue/test-utils";
import { createSSRApp, type Component } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import { SurfaceOne } from "../src/index";

// The Vue twins of the docs demos (the "Code" tab of /components/<slug>, Vue view):
// apps/docs/src/app/demos/vue/<slug>.vue, shown on the site byte for byte. Importing them
// compiles each SFC, so a snippet a reader copies always compiles, renders and mounts.
const DEMOS = import.meta.glob<{ default: Component }>(
  "../../../apps/docs/src/app/demos/vue/*.vue",
  { eager: true },
);

const slugOf = (path: string): string =>
  path.slice(path.lastIndexOf("/") + 1, -".vue".length);

describe("docs demos (Vue)", () => {
  it("has an Angular demo for every Vue twin", () => {
    // Lazy: only the file names are read, the Angular sources are never loaded.
    const angular = Object.keys(
      import.meta.glob("../../../apps/docs/src/app/demos/*.demo.ts"),
    ).map((p) => p.slice(p.lastIndexOf("/") + 1, -".demo.ts".length));
    expect(Object.keys(DEMOS).length).toBeGreaterThan(0);
    for (const slug of Object.keys(DEMOS).map(slugOf)) {
      expect(angular).toContain(slug);
    }
  });

  for (const [path, mod] of Object.entries(DEMOS)) {
    const slug = slugOf(path);

    it(`${slug} renders on the server without warnings`, async () => {
      const warnings: string[] = [];
      const app = createSSRApp(mod.default);
      app.config.warnHandler = (msg) => void warnings.push(msg);
      app.use(SurfaceOne);
      const html = await renderToString(app);
      expect(html.length).toBeGreaterThan(20);
      // An unknown component or a missing prop renders silently; a warning catches it.
      expect(warnings).toEqual([]);
    });

    it(`${slug} mounts in the browser without warnings`, () => {
      const warnings: string[] = [];
      const w = mount(mod.default, {
        attachTo: document.body,
        global: {
          plugins: [SurfaceOne],
          config: { warnHandler: (msg) => void warnings.push(msg) },
        },
      });
      expect(w.html()).not.toBe("");
      w.unmount();
      expect(warnings).toEqual([]);
    });
  }
});
