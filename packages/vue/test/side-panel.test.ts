import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import {
  SoneSidePanel,
  SoneSidePanelActions,
  SoneSidePanelClose,
  SoneSidePanelContent,
  SoneSidePanelHeader,
  SoneSidePanelTitle,
} from "../src/index";

const ssr = async (render: () => unknown): Promise<string> =>
  (await renderToString(createSSRApp({ render }))).replace(
    /<!--\[-->|<!--\]-->|<!---->/g,
    "",
  );

const panel = (onClosed?: () => void) =>
  h(SoneSidePanel, { "aria-labelledby": "t" }, () => [
    h(SoneSidePanelHeader, () => [
      h(SoneSidePanelTitle, { id: "t" }, () => "Details"),
      h(SoneSidePanelActions, () =>
        h(SoneSidePanelClose, { label: "Close details", onClosed }),
      ),
    ]),
    h(SoneSidePanelContent, () => "Body"),
  ]);

describe("SoneSidePanel", () => {
  it("renders the same markup as the Angular parts", async () => {
    const out = await ssr(() => panel());
    expect(out).toContain(
      '<aside class="side-panel" data-slot="side-panel" aria-labelledby="t">',
    );
    expect(out).toContain(
      '<header class="side-panel-header" data-slot="side-panel-header">',
    );
    expect(out).toContain(
      '<h2 class="side-panel-title" data-slot="side-panel-title" id="t">Details</h2>',
    );
    expect(out).toContain(
      '<div class="side-panel-actions" data-slot="side-panel-actions">',
    );
    expect(out).toContain(
      '<div class="side-panel-content" data-slot="side-panel-content">Body</div>',
    );
    expect(out).toContain(
      '<sone-side-panel-close data-slot="side-panel-close">',
    );
    expect(out).toMatch(/<button[^>]*aria-label="Close details"/);
  });

  it("renders a part as another element with `as`", async () => {
    expect(
      await ssr(() => h(SoneSidePanel, { as: "section" }, () => "x")),
    ).toBe('<section class="side-panel" data-slot="side-panel">x</section>');
  });

  it("emits closed from the close button", async () => {
    let closed = 0;
    const wrapper = mount(() => panel(() => closed++), {
      attachTo: document.body,
    });
    await wrapper.find("button").trigger("click");
    expect(closed).toBe(1);
    wrapper.unmount();
  });
});
