import { mount } from "@vue/test-utils";
import { createSSRApp, type Component } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import { SurfaceOne } from "../src/index";

// The Vue twins of the docs templates (the "Code" tab of /templates/<slug>, Vue view).
const TEMPLATES = import.meta.glob<{ default: Component }>(
  "../../../apps/docs/src/app/templates/vue/*.vue",
  { eager: true },
);

const slugOf = (path: string): string =>
  path.slice(path.lastIndexOf("/") + 1, -".vue".length);

describe("docs templates (Vue)", () => {
  it("has a Vue twin for every Angular template", () => {
    // Lazy: only the file names are read, the Angular sources are never loaded.
    const angular = Object.keys(
      import.meta.glob("../../../apps/docs/src/app/templates/*.template.ts"),
    ).map((p) => p.slice(p.lastIndexOf("/") + 1, -".template.ts".length));
    expect(Object.keys(TEMPLATES).map(slugOf).sort()).toEqual(angular.sort());
  });

  for (const [path, mod] of Object.entries(TEMPLATES)) {
    const slug = slugOf(path);

    it(`${slug} renders on the server`, async () => {
      const app = createSSRApp(mod.default);
      app.use(SurfaceOne);
      const html = await renderToString(app);
      expect(html.length).toBeGreaterThan(200);
    });

    it(`${slug} mounts in the browser`, () => {
      const w = mount(mod.default, {
        attachTo: document.body,
        global: { plugins: [SurfaceOne] },
      });
      expect(w.html()).not.toBe("");
      w.unmount();
    });
  }
});
