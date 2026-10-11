import { render } from "@testing-library/react";
import type { ComponentType } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

// The React twins of the docs templates (the "Code" tab of /templates/<slug>, React view).
const TEMPLATES = import.meta.glob<{ default: ComponentType }>(
  "../../../apps/docs/src/app/templates/react/*.tsx",
  { eager: true },
);

const slugOf = (path: string): string =>
  path.slice(path.lastIndexOf("/") + 1, -".tsx".length);

describe("docs templates (React)", () => {
  it("has a React twin for every Angular template", () => {
    // Lazy: only the file names are read, the Angular sources are never loaded.
    const angular = Object.keys(
      import.meta.glob("../../../apps/docs/src/app/templates/*.template.ts"),
    ).map((p) => p.slice(p.lastIndexOf("/") + 1, -".template.ts".length));
    expect(Object.keys(TEMPLATES).map(slugOf).sort()).toEqual(angular.sort());
  });

  for (const [path, mod] of Object.entries(TEMPLATES)) {
    const slug = slugOf(path);
    const Template = mod.default;

    it(`${slug} renders on the server`, () => {
      expect(renderToString(<Template />).length).toBeGreaterThan(200);
    });

    it(`${slug} mounts in the browser`, () => {
      const { container, unmount } = render(<Template />);
      expect(container.innerHTML).not.toBe("");
      unmount();
    });
  }
});
