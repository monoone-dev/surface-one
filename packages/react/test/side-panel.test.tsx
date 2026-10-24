import { fireEvent, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  SoneSidePanel,
  SoneSidePanelActions,
  SoneSidePanelClose,
  SoneSidePanelContent,
  SoneSidePanelHeader,
  SoneSidePanelTitle,
} from "../src/index";

const html = (node: ReactNode): string => {
  const el = document.createElement("div");
  el.innerHTML = renderToString(node);
  return el.innerHTML;
};

const panel = (onClosed?: () => void) => (
  <SoneSidePanel aria-labelledby="t">
    <SoneSidePanelHeader>
      <SoneSidePanelTitle id="t">Details</SoneSidePanelTitle>
      <SoneSidePanelActions>
        <SoneSidePanelClose label="Close details" onClosed={onClosed} />
      </SoneSidePanelActions>
    </SoneSidePanelHeader>
    <SoneSidePanelContent>Body</SoneSidePanelContent>
  </SoneSidePanel>
);

describe("SoneSidePanel", () => {
  it("renders the same markup as the Angular parts", () => {
    const out = html(panel());
    expect(out).toContain(
      '<aside data-slot="side-panel" aria-labelledby="t" class="side-panel">',
    );
    expect(out).toContain(
      '<header data-slot="side-panel-header" class="side-panel-header">',
    );
    expect(out).toContain(
      '<h2 data-slot="side-panel-title" id="t" class="side-panel-title">Details</h2>',
    );
    expect(out).toContain(
      '<div data-slot="side-panel-content" class="side-panel-content">Body</div>',
    );
    expect(out).toContain(
      '<sone-side-panel-close data-slot="side-panel-close">',
    );
    expect(out).toMatch(/<button[^>]*aria-label="Close details"/);
  });

  it("renders a part as another element with `as`", () => {
    expect(html(<SoneSidePanel as="section">x</SoneSidePanel>)).toBe(
      '<section data-slot="side-panel" class="side-panel">x</section>',
    );
  });

  it("calls onClosed from the close button", () => {
    let closed = 0;
    const { container } = render(panel(() => closed++));
    fireEvent.click(container.querySelector("button")!);
    expect(closed).toBe(1);
  });
});
