import { render } from "@testing-library/react";
import type { ComponentType } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

// The React twins of the docs demos (the "Code" tab of /components/<slug>, React view),
// extracted by scripts/extract-demos.mjs.
const DEMOS = import.meta.glob<{ default: ComponentType }>(
  "./demos/*.generated.tsx",
  { eager: true },
);

const slugOf = (path: string): string =>
  path.slice(path.lastIndexOf("/") + 1, -".generated.tsx".length);

describe("docs demos (React)", () => {
  for (const [path, mod] of Object.entries(DEMOS)) {
    const slug = slugOf(path);
    const Demo = mod.default;

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
