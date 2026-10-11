import { render } from "@testing-library/react";
import type { ComponentType } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

// The React twins of the docs demos (the "Code" tab of /components/<slug>, React view):
// apps/docs/src/app/demos/react/<slug>.tsx, shown on the site byte for byte.
const DEMOS = import.meta.glob<{ default: ComponentType }>(
  "../../../apps/docs/src/app/demos/react/*.tsx",
  { eager: true },
);

const slugOf = (path: string): string =>
  path.slice(path.lastIndexOf("/") + 1, -".tsx".length);

describe("docs demos (React)", () => {
  it("has an Angular demo for every React twin", () => {
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
    const Demo = mod.default;

    it(`${slug} default-exports a component`, () => {
      expect(typeof Demo).toBe("function");
    });

    it(`${slug} renders on the server`, () => {
      expect(renderToString(<Demo />).length).toBeGreaterThan(20);
    });

    it(`${slug} mounts in the browser`, () => {
      const { container, unmount } = render(<Demo />);
      expect(container.innerHTML).not.toBe("");
      unmount();
    });
  }
});
