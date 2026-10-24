import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it, vi } from "vitest";

import { SoneAppBar, SoneButton } from "../src/index";

const ssr = async (render: () => unknown): Promise<string> =>
  (await renderToString(createSSRApp({ render }))).replace(
    /<!--\[-->|<!--\]-->|<!---->/g,
    "",
  );

describe("SoneAppBar", () => {
  it("renders the same header as Angular", async () => {
    const out = await ssr(() =>
      h(
        SoneAppBar,
        { title: "Inbox", subtitle: "12 unread", sticky: true, showBack: true },
        { trailing: () => h(SoneButton, null, () => "Search") },
      ),
    );
    expect(out).toContain(
      '<sone-app-bar data-slot="app-bar" data-sticky><header class="app-bar" data-slot="app-bar-header"><button class="btn app-bar-back" data-slot="app-bar-back" data-variant="ghost" data-size="icon" type="button" aria-label="Back">',
    );
    expect(out).toContain(
      '<div class="app-bar-heading" data-slot="app-bar-heading"><h1 class="app-bar-title" data-slot="app-bar-title">Inbox</h1><p class="app-bar-subtitle" data-slot="app-bar-subtitle">12 unread</p></div><div class="app-bar-trailing"><button class="btn"',
    );
  });

  it("takes a heading level, a back link, and shows the back button for a listener", async () => {
    const link = await ssr(() =>
      h(SoneAppBar, { title: "Invoice", level: "2", backHref: "/inbox" }),
    );
    expect(link).toContain('<h2 class="app-bar-title"');
    expect(link).toMatch(/<a class="btn app-bar-back"[^>]* href="\/inbox"/);

    const onBack = vi.fn();
    const wrapper = mount(SoneAppBar, { props: { title: "Inbox", onBack } });
    await wrapper.find("button.app-bar-back").trigger("click");
    expect(onBack).toHaveBeenCalledOnce();
    expect(wrapper.emitted("back")).toHaveLength(1);

    const none = mount(SoneAppBar, { props: { title: "Inbox" } });
    expect(none.find(".app-bar-back").exists()).toBe(false);
  });
});
